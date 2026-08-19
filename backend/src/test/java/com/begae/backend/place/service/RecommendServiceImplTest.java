package com.begae.backend.place.service;

import com.begae.backend.global.exception.CustomException;
import com.begae.backend.place.client.WellnessApiClient;
import com.begae.backend.place.component.*;
import com.begae.backend.place.dto.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class RecommendServiceImplTest {

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
                .transportTime(60)
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
        plan.setReasoning("몸을 데운 뒤 조용히 마무리하는 흐름");
        aiResponse.setTravelPlan(plan);

        // callAi를 spy로 가로채므로 promptRegistry의 프롬프트가 비어 있어도 무방하다
        service = spy(new RecommendServiceImpl(
                new SurveySearchPolicy(),
                wellnessApiClient,
                new WellnessMatcher(),
                new CandidateMerger(),
                new AiSelectionValidator(),
                placeService,
                new PromptRegistry(),
                new ObjectMapper()));

        when(placeService.searchRawByKeyword(anyString(), anyDouble(), anyDouble(), anyInt()))
                .thenReturn(List.of(kakaoDoc("K1", "카페", "127.0", "37.5")));
        when(placeService.enrichAndUpsert(any(), any())).thenReturn(
                SearchPlaceResponseDto.builder()
                        .placeId(1).placeName("카페").categoryName("음식점 · 카페")
                        .x(127.0).y(37.5).build());
    }

    private void stubAi(List<AiSelectionDto.Selection> selections) {
        aiResponse.setSelections(selections);
        doReturn(aiResponse).when(service).callAi(anyString(), anyString());
    }

    private AiSelectionDto.Selection sel(int index, int order) {
        AiSelectionDto.Selection s = new AiSelectionDto.Selection();
        s.setIndex(index);
        s.setOrder(order);
        s.setStayMinutes(60);
        s.setReason("이유");
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

        verify(service, times(1)).callAi(anyString(), anyString());
    }
}
