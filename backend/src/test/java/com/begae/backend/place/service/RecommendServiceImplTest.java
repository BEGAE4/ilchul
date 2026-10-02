package com.begae.backend.place.service;

import com.begae.backend.global.exception.CustomException;
import com.begae.backend.place.client.AnthropicRecommendationClient;
import com.begae.backend.place.client.WellnessApiClient;
import com.begae.backend.place.component.*;
import com.begae.backend.place.dto.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class RecommendServiceImplTest {
    @Test void 잘못된_JSON_응답은_한번만_교정한다() {
        when(wellnessApiClient.findNearby(anyDouble(), anyDouble(), anyInt())).thenReturn(List.of());
        aiResponse.setSelections(List.of(sel(0, 1)));
        doThrow(new CustomException(com.begae.backend.place.exception.PlaceErrorCode.RECOMMENDATION_INVALID_RESPONSE))
                .doReturn(aiResponse).when(service).callAi(anyString(), anyString(), any(Duration.class));
        assertThat(service.recommend(survey()).getItems()).hasSize(1);
        var timeouts = org.mockito.ArgumentCaptor.forClass(Duration.class);
        verify(service, times(2)).callAi(anyString(), anyString(), timeouts.capture());
        assertThat(timeouts.getAllValues().get(1)).isLessThanOrEqualTo(timeouts.getAllValues().getFirst());
    }
    @Test void 귀환을_포함해_이동한도를_넘으면_한번_교정하고_코스를_줄인다() {
        when(wellnessApiClient.findNearby(anyDouble(), anyDouble(), anyInt())).thenReturn(List.of());
        when(placeService.searchRawByKeyword(anyString(), anyDouble(), anyDouble(), anyInt()))
                .thenReturn(List.of(kakaoDoc("A", "카페 A", "127.004", "37.5"), kakaoDoc("B", "카페 B", "126.996", "37.5")));
        stubAi(List.of(sel(0, 1), sel(1, 2)));
        var input = survey(); input.setTransportTime("20분");
        var result = service.recommend(input);
        assertThat(result.getItems()).hasSize(1);
        assertThat(result.getTimeSummary().travelMinutes()).isLessThanOrEqualTo(20);
        assertThat(result.getTimeSummary().returnMinutes()).isPositive();
        assertThat(result.getPlan().getReasoning()).contains("돌아오는").endsWith("요.");
        verify(service, times(2)).callAi(anyString(), anyString(), any(Duration.class));
    }

    @Test void 가까운_다른_상호에_웰니스_인증을_붙이지_않는다() {
        when(wellnessApiClient.findNearby(anyDouble(), anyDouble(), anyInt()))
                .thenReturn(List.of(new WellnessPlaceDto("123", "공식온천", 127.0, 37.5)));
        when(placeService.searchRawByKeyword(eq("공식온천"), anyDouble(), anyDouble(), anyInt()))
                .thenReturn(List.of(kakaoDoc("NEIGHBOR", "옆집카페", "127.0", "37.5")));
        stubAi(List.of(sel(0, 1)));
        assertThat(service.recommend(survey()).getItems()).allSatisfy(i -> assertThat(i.isWellnessCertified()).isFalse());
    }

    private WellnessApiClient wellnessApiClient;
    private PlaceService placeService;
    private RecommendServiceImpl service;
    private AiSelectionDto aiResponse;

    private SurveyResultDto survey() {
        return SurveyResultDto.builder()
                .emotion("마음이 좀 울적하고 속상해요")
                .startTime("2026-08-20 15:00")
                .endTime("2026-08-20 22:00")
                .transport("도보")
                .transportTime("1시간 이내")
                .location(SurveyResultDto.Location.builder().x(127.0).y(37.5).build())
                .build();
    }

    private KakaoPlaceResponseDto.Document kakaoDoc(String id, String name, String x, String y) {
        KakaoPlaceResponseDto.Document d = new KakaoPlaceResponseDto.Document();
        d.setId(id);
        d.setPlaceName(name);
        d.setCategoryName("음식점 > 카페");
        d.setRoadAddressName("서울 어딘가 1");
        d.setX(x);
        d.setY(y);
        return d;
    }

    @BeforeEach
    void setUp() {
        wellnessApiClient = mock(WellnessApiClient.class);
        placeService = mock(PlaceService.class);

        aiResponse = new AiSelectionDto();
        AiSelectionDto.TravelPlan plan = new AiSelectionDto.TravelPlan();
        plan.setTotalHours(7);
        plan.setEstimatedPlaceCount(2);
        plan.setReasoning("시간에 맞춰 카페에 들러 잠시 쉬어가보세요.");
        aiResponse.setTravelPlan(plan);

        service = spy(new RecommendServiceImpl(
                new SurveySearchPolicy(),
                wellnessApiClient,
                new WellnessMatcher(),
                new CandidateMerger(),
                new AiSelectionValidator(),
                placeService,
                new ObjectMapper(),
                mock(AnthropicRecommendationClient.class),
                new com.begae.backend.trip.TripRouteCalculator(mock(org.springframework.web.reactive.function.client.WebClient.class))));

        when(placeService.searchRawByKeyword(anyString(), anyDouble(), anyDouble(), anyInt()))
                .thenReturn(List.of(kakaoDoc("K1", "카페", "127.0", "37.5")));
        when(placeService.enrichAndUpsert(any(), any())).thenReturn(
                SearchPlaceResponseDto.builder()
                        .placeId(1).placeName("카페").categoryName("음식점 · 카페")
                        .x(127.0).y(37.5).build());
    }

    private void stubAi(List<AiSelectionDto.Selection> selections) {
        aiResponse.setSelections(selections);
        doReturn(aiResponse).when(service).callAi(anyString(), anyString(), any(Duration.class));
    }

    private AiSelectionDto.Selection sel(int index, int order) {
        AiSelectionDto.Selection s = new AiSelectionDto.Selection();
        s.setIndex(index);
        s.setOrder(order);
        s.setStayMinutes(60);
        s.setReason("잠시 쉬어가고 싶을 때 카페에 들러보세요.");
        s.setTags(List.of("#태그"));
        return s;
    }

    @Test
    void 웰니스가_0건이어도_카카오만으로_추천을_완성한다() {
        when(wellnessApiClient.findNearby(anyDouble(), anyDouble(), anyInt())).thenReturn(List.of());
        stubAi(List.of(sel(0, 1)));

        RecommendResponseDto result = service.recommend(survey());

        assertThat(result.getCandidateCount().getWellness()).isZero();
        assertThat(result.getItems()).hasSize(1);
        assertThat(result.getItems().get(0).isWellnessCertified()).isFalse();
    }

    @Test
    void 웰니스_매칭에_성공하면_배지가_붙는다() {
        when(wellnessApiClient.findNearby(anyDouble(), anyDouble(), anyInt()))
                .thenReturn(List.of(new WellnessPlaceDto("2932122", "우리유황온천", 127.0, 37.5)));
        when(placeService.searchRawByKeyword(eq("우리유황온천"), anyDouble(), anyDouble(), anyInt()))
                .thenReturn(List.of(kakaoDoc("W1", "우리유황온천", "127.0", "37.5")));
        stubAi(List.of(sel(0, 1)));

        RecommendResponseDto result = service.recommend(survey());

        assertThat(result.getCandidateCount().getWellness()).isEqualTo(1);
        assertThat(result.getItems().get(0).isWellnessCertified()).isTrue();
    }

    @Test
    void 웰니스_좌표_매칭에_실패하면_그_장소는_후보에서_빠진다() {
        when(wellnessApiClient.findNearby(anyDouble(), anyDouble(), anyInt()))
                .thenReturn(List.of(new WellnessPlaceDto("2932122", "먼곳", 127.0, 37.5)));
        when(placeService.searchRawByKeyword(eq("먼곳"), anyDouble(), anyDouble(), anyInt()))
                .thenReturn(List.of(kakaoDoc("FAR", "먼곳", "127.0", "37.6")));  // 약 11km
        stubAi(List.of(sel(0, 1)));

        RecommendResponseDto result = service.recommend(survey());

        assertThat(result.getItems()).allSatisfy(i -> assertThat(i.isWellnessCertified()).isFalse());
        assertThat(result.getCandidateCount().getWellness()).isEqualTo(1);
    }

    @Test
    void 유효한_선택이_하나도_없으면_422를_던진다() {
        when(wellnessApiClient.findNearby(anyDouble(), anyDouble(), anyInt())).thenReturn(List.of());
        stubAi(List.of(sel(999, 1)));

        assertThatThrownBy(() -> service.recommend(survey()))
                .isInstanceOf(CustomException.class)
                .hasMessageContaining("추천할 만한 장소");
    }

    @Test
    void AI는_요청당_한_번만_호출한다() {
        when(wellnessApiClient.findNearby(anyDouble(), anyDouble(), anyInt())).thenReturn(List.of());
        stubAi(List.of(sel(0, 1)));

        service.recommend(survey());

        verify(service, times(1)).callAi(anyString(), anyString(), any(Duration.class));
    }

    @Test
    void 응답의_총시간은_AI가_아니라_설문_시간으로_계산한다() {
        when(wellnessApiClient.findNearby(anyDouble(), anyDouble(), anyInt())).thenReturn(List.of());
        aiResponse.getTravelPlan().setTotalHours(99);
        stubAi(List.of(sel(0, 1)));

        RecommendResponseDto result = service.recommend(survey());

        assertThat(result.getPlan().getTotalHours()).isEqualTo(7);
    }

    @Test
    void 시작시간이_종료시간보다_늦으면_400_예외다() {
        SurveyResultDto invalid = survey();
        invalid.setEndTime("2026-08-20 14:00");

        assertThatThrownBy(() -> service.recommend(invalid))
                .isInstanceOf(CustomException.class)
                .hasMessageContaining("잘못된 입력값");
        verify(service, never()).callAi(anyString(), anyString(), any(Duration.class));
    }

    @Test
    void 일정이_24시간을_넘으면_400_예외다() {
        SurveyResultDto invalid = survey();
        invalid.setEndTime("2026-08-22 15:01");

        assertThatThrownBy(() -> service.recommend(invalid))
                .isInstanceOf(CustomException.class)
                .hasMessageContaining("잘못된 입력값");
    }

    @Test
    void 시간_형식이_잘못되면_400_예외다() {
        SurveyResultDto invalid = survey();
        invalid.setStartTime("2026/08/20 15:00");

        assertThatThrownBy(() -> service.recommend(invalid))
                .isInstanceOf(CustomException.class)
                .hasMessageContaining("잘못된 입력값");
    }

    @Test
    void 존재하지_않는_날짜면_400_예외다() {
        SurveyResultDto invalid = survey();
        invalid.setStartTime("2026-02-30 15:00");

        assertThatThrownBy(() -> service.recommend(invalid))
                .isInstanceOf(CustomException.class)
                .hasMessageContaining("잘못된 입력값");
    }

    @Test
    void 카카오_일반검색이_전부_실패하면_500_예외다() {
        when(wellnessApiClient.findNearby(anyDouble(), anyDouble(), anyInt())).thenReturn(List.of());
        when(placeService.searchRawByKeyword(anyString(), anyDouble(), anyDouble(), anyInt()))
                .thenThrow(new IllegalStateException("kakao unavailable"));

        assertThatThrownBy(() -> service.recommend(survey()))
                .isInstanceOf(CustomException.class)
                .hasMessageContaining("알 수 없는 문제");
        verify(service, never()).callAi(anyString(), anyString(), any(Duration.class));
    }

    @Test
    void 카카오_일반검색이_일부_실패하면_성공한_후보로_계속한다() {
        when(wellnessApiClient.findNearby(anyDouble(), anyDouble(), anyInt())).thenReturn(List.of());
        AtomicInteger calls = new AtomicInteger();
        when(placeService.searchRawByKeyword(anyString(), anyDouble(), anyDouble(), anyInt()))
                .thenAnswer(invocation -> {
                    if (calls.incrementAndGet() == 1) {
                        throw new IllegalStateException("one keyword failed");
                    }
                    return List.of(kakaoDoc("K1", "카페", "127.0", "37.5"));
                });
        stubAi(List.of(sel(0, 1)));

        RecommendResponseDto result = service.recommend(survey());

        assertThat(result.getItems()).hasSize(1);
        assertThat(calls).hasValue(4);
    }

    @Test
    void 카카오_키워드_검색은_동시에_시작한다() throws Exception {
        when(wellnessApiClient.findNearby(anyDouble(), anyDouble(), anyInt())).thenReturn(List.of());
        CountDownLatch started = new CountDownLatch(4);
        CountDownLatch release = new CountDownLatch(1);
        when(placeService.searchRawByKeyword(anyString(), anyDouble(), anyDouble(), anyInt()))
                .thenAnswer(invocation -> {
                    started.countDown();
                    if (!release.await(2, TimeUnit.SECONDS)) {
                        throw new IllegalStateException("test release timeout");
                    }
                    return List.of(kakaoDoc("K1", "카페", "127.0", "37.5"));
                });
        stubAi(List.of(sel(0, 1)));

        CompletableFuture<RecommendResponseDto> future =
                CompletableFuture.supplyAsync(() -> service.recommend(survey()));
        boolean allStarted;
        try {
            allStarted = started.await(2, TimeUnit.SECONDS);
        } finally {
            release.countDown();
        }

        assertThat(future.get(5, TimeUnit.SECONDS).getItems()).hasSize(1);
        assertThat(allStarted).isTrue();
    }

    @Test
    void 후보가_정상적으로_0건이면_AI를_부르지_않고_422다() {
        when(wellnessApiClient.findNearby(anyDouble(), anyDouble(), anyInt())).thenReturn(List.of());
        when(placeService.searchRawByKeyword(anyString(), anyDouble(), anyDouble(), anyInt()))
                .thenReturn(List.of());

        assertThatThrownBy(() -> service.recommend(survey()))
                .isInstanceOf(CustomException.class)
                .hasMessageContaining("추천할 만한 장소");
        verify(service, never()).callAi(anyString(), anyString(), any(Duration.class));
    }

    @Test
    void 웰니스_중복_매칭에도_후보수는_음수가_되지_않는다() {
        when(wellnessApiClient.findNearby(anyDouble(), anyDouble(), anyInt())).thenReturn(List.of(
                new WellnessPlaceDto("W1", "같은 장소", 127.0, 37.5),
                new WellnessPlaceDto("W2", "같은 장소", 127.0, 37.5)));
        when(placeService.searchRawByKeyword(anyString(), anyDouble(), anyDouble(), anyInt()))
                .thenReturn(List.of(kakaoDoc("SAME", "같은 장소", "127.0", "37.5")));
        stubAi(List.of(sel(0, 1)));

        RecommendResponseDto result = service.recommend(survey());

        assertThat(result.getCandidateCount().getWellness()).isEqualTo(2);
        assertThat(result.getCandidateCount().getKakao()).isZero();
    }
}
