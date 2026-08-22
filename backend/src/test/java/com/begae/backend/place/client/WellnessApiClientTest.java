package com.begae.backend.place.client;

import com.begae.backend.place.dto.WellnessPlaceDto;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import okhttp3.mockwebserver.RecordedRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class WellnessApiClientTest {

    private MockWebServer server;
    private WellnessApiClient client;

    @BeforeEach
    void setUp() throws Exception {
        server = new MockWebServer();
        server.start();
        WebClient webClient = WebClient.builder().baseUrl(server.url("/").toString()).build();
        client = new WellnessApiClient(webClient, "test-key");
    }

    @AfterEach
    void tearDown() throws Exception {
        server.shutdown();
    }

    private void enqueueJson(String body) {
        server.enqueue(new MockResponse()
                .setResponseCode(200)
                .setHeader("Content-Type", "application/json")
                .setBody(body));
    }

    @Test
    void 정상_응답에서_필요한_네_필드만_뽑는다() {
        enqueueJson("""
            {"response":{"header":{"resultCode":"0000","resultMsg":"OK"},
             "body":{"items":{"item":[
               {"contentId":"2932122","title":"후암별채","mapX":"126.9761522655","mapY":"37.5497617088",
                "baseAddr":"서울특별시 용산구 후암로35길 39","wellnessThemaCd":"EX050400"}
             ]},"numOfRows":10,"pageNo":1,"totalCount":1}}}
            """);

        List<WellnessPlaceDto> result = client.findNearby(126.978, 37.5665, 5000);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getContentId()).isEqualTo("2932122");
        assertThat(result.get(0).getTitle()).isEqualTo("후암별채");
        assertThat(result.get(0).getX()).isEqualTo(126.9761522655);
        assertThat(result.get(0).getY()).isEqualTo(37.5497617088);
    }

    @Test
    void 필수_파라미터를_모두_실어_보낸다() throws Exception {
        enqueueJson("""
            {"response":{"header":{"resultCode":"0000","resultMsg":"OK"},
             "body":{"items":"","numOfRows":0,"pageNo":1,"totalCount":0}}}
            """);

        client.findNearby(126.978, 37.5665, 5000);

        RecordedRequest request = server.takeRequest();
        String path = request.getPath();
        assertThat(path).contains("/locationBasedList");
        assertThat(path).contains("langDivCd=KOR");
        assertThat(path).contains("serviceKey=test-key");
        assertThat(path).contains("mapX=126.978");
        assertThat(path).contains("mapY=37.5665");
        assertThat(path).contains("radius=5000");
        assertThat(path).contains("_type=json");
    }

    @Test
    void 결과가_0건이면_items가_빈_문자열로_오는데_빈_리스트를_돌려준다() {
        enqueueJson("""
            {"response":{"header":{"resultCode":"0000","resultMsg":"OK"},
             "body":{"items":"","numOfRows":0,"pageNo":1,"totalCount":0}}}
            """);

        assertThat(client.findNearby(131.0, 37.0, 1000)).isEmpty();
    }

    @Test
    void resultCode가_정상이_아니면_빈_리스트를_돌려준다() {
        enqueueJson("""
            {"responseTime":"2026-08-19T09:52:03.892","resultCode":"11",
             "resultMsg":"NO_MANDATORY_REQUEST_PARAMETERS_ERROR1(langDivCd)"}
            """);

        assertThat(client.findNearby(126.978, 37.5665, 5000)).isEmpty();
    }

    @Test
    void 서버_오류에도_예외를_던지지_않고_빈_리스트로_degrade한다() {
        server.enqueue(new MockResponse().setResponseCode(500));

        assertThat(client.findNearby(126.978, 37.5665, 5000)).isEmpty();
    }

    @Test
    void 좌표가_숫자가_아닌_항목은_건너뛴다() {
        enqueueJson("""
            {"response":{"header":{"resultCode":"0000","resultMsg":"OK"},
             "body":{"items":{"item":[
               {"contentId":"1","title":"깨진좌표","mapX":"","mapY":""},
               {"contentId":"2","title":"정상","mapX":"127.0","mapY":"37.0"}
             ]},"numOfRows":10,"pageNo":1,"totalCount":2}}}
            """);

        List<WellnessPlaceDto> result = client.findNearby(127.0, 37.0, 5000);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getContentId()).isEqualTo("2");
    }
}
