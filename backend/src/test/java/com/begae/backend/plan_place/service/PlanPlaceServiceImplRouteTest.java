package com.begae.backend.plan_place.service;

import com.begae.backend.place.domain.Place;
import com.begae.backend.place.repository.PlaceRepository;
import com.begae.backend.plan.dto.DeparturePointDto;
import com.begae.backend.plan.repository.PlanRepository;
import com.begae.backend.plan.service.PlanService;
import com.begae.backend.plan_place.dto.CreatePlanPreviewRequestDto;
import com.begae.backend.plan_place.dto.CreatePlanPreviewResponseDto;
import com.begae.backend.plan_place.repository.PlanPlaceImageRepository;
import com.begae.backend.plan_place.repository.PlanPlaceRepository;
import com.begae.backend.storage.service.ImageFileCleaner;
import com.begae.backend.storage.service.ImageStorageService;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class PlanPlaceServiceImplRouteTest {

    private MockWebServer naviServer;
    private PlaceRepository placeRepository;
    private PlanPlaceServiceImpl service;

    @BeforeEach
    void setUp() throws Exception {
        naviServer = new MockWebServer();
        naviServer.start();
        placeRepository = mock(PlaceRepository.class);
        service = new PlanPlaceServiceImpl(
                mock(PlanPlaceRepository.class),
                mock(PlanRepository.class),
                placeRepository,
                mock(PlanPlaceImageRepository.class),
                mock(PlanService.class),
                mock(ImageStorageService.class),
                mock(ImageFileCleaner.class),
                WebClient.builder().baseUrl(naviServer.url("/").toString()).build(),
                mock(WebClient.class)
        );
    }

    @AfterEach
    void tearDown() throws Exception {
        naviServer.shutdown();
    }

    @Test
    void 카카오가_경로를_찾지_못해도_소요시간_0으로_미리보기를_만든다() {
        Place place = Place.builder().placeName("서울역").x(126.97).y(37.55).build();
        ReflectionTestUtils.setField(place, "placeId", 1);
        when(placeRepository.findAllById(anyList())).thenReturn(List.of(place));
        naviServer.enqueue(new MockResponse()
                .setHeader("Content-Type", "application/json")
                .setBody("""
                        {"trans_id":"t1","routes":[{"result_code":104,
                        "result_msg":"출발지와 도착지가 5 m 이내로 설정된 경우 경로를 탐색할 수 없음"}]}
                        """));

        CreatePlanPreviewResponseDto preview = service.createPlanPreview(previewRequest());

        assertThat(preview.getRequiredTime()).isZero();
        assertThat(preview.getTotalDistance()).isZero();
        assertThat(preview.getPlaces()).singleElement()
                .satisfies(stop -> assertThat(stop.getDuration()).isZero());
    }

    private CreatePlanPreviewRequestDto previewRequest() {
        CreatePlanPreviewRequestDto.Place stop = new CreatePlanPreviewRequestDto.Place();
        stop.setPlaceId(1);
        stop.setOrder(1);

        CreatePlanPreviewRequestDto request = new CreatePlanPreviewRequestDto();
        request.setPlanTitle("테스트");
        request.setDeparturePoint(new DeparturePointDto("서울역", "서울 중구", 126.97, 37.55));
        request.setPlaces(List.of(stop));
        return request;
    }
}
