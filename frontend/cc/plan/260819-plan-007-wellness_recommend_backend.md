# 웰니스 우선 장소 추천 개편 — 백엔드 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `POST /api/place/recommend`를 "AI가 키워드 생성 → 카카오 검색" 구조에서 "웰니스 공공 API + 카카오에서 후보 수집 → AI가 선택·순서·이유 결정" 구조로 바꾼다.

**Architecture:** 웰니스 API로 반경 내 인증 장소를 조회해 카카오로 되찾아 후보 풀에 우선 편입하고, 감정별 검색어(표 C)로 모은 카카오 후보와 병합한 뒤, AI 1콜로 선택·순서·이유를 받는다. 선택된 장소만 Google 사진을 붙여 `place`에 upsert하며, 웰니스 매칭 건은 `wellness_content_id`(식별자만)를 함께 저장해 배지 근거로 쓴다. 추천 오케스트레이션은 이미 366줄인 `PlaceServiceImpl`에서 분리해 `RecommendService`에 둔다.

**Tech Stack:** Java 21, Spring Boot 3.5.3, Spring WebFlux `WebClient`, JPA/Hibernate, Flyway, Lombok, `com.anthropic:anthropic-java:2.11.1`, JUnit 5 + Mockito + AssertJ (`spring-boot-starter-test`), MockWebServer(신규 추가)

**Spec:** [../api/v2/place.md](../api/v2/place.md)

## Global Constraints

- 웰니스 엔드포인트는 `https://apis.data.go.kr/B551011/WellnessTursmService/locationBasedList` 이며 `langDivCd=KOR`가 필수다. 오퍼레이션명에 숫자가 붙지 않는다.
- `radius` 최대값은 `20000`(m)이다.
- **웰니스 데이터는 `contentId`만 저장한다.** `title`·주소·이미지·`wellnessThemaCd`를 DB에 적재하지 않는다. (공공데이터 이용 정책, `cpyrhtDivCd` Type3가 111/169건)
- **웰니스 API 실패·타임아웃은 500이 아니다.** 빈 후보로 degrade하고 카카오만으로 추천을 완성한다.
- 결과 0건일 때 `response.body.items`가 **빈 문자열 `""`** 로 온다. 객체로 매핑하면 역직렬화 예외가 난다.
- AI 호출은 요청당 **1회**다.
- 응답 최상위는 객체다. `source` / `fallback` 필드를 두지 않는다.
- `wellnessCertified`는 프론트의 `isVerified`(방문 사진 인증)와 **별개 개념**이다. 재사용 금지.
- 응답의 `stayMinutes`는 문자열이 아니라 **숫자**다.
- 커밋 메시지에 `Co-Authored-By` 트레일러를 넣지 않는다.
- 기존 `BackendApplicationTests`는 `@SpringBootTest`라 MySQL·Redis 없이는 실패한다. **이 계획의 모든 신규 테스트는 Spring 컨텍스트를 띄우지 않는 순수 단위 테스트로 작성하고**, 실행은 `./gradlew test --tests '<클래스명>'` 으로 개별 지정한다.

---

## File Structure

**신규**

| 경로 | 책임 |
|---|---|
| `place/component/SurveySearchPolicy.java` | 설문 → 카카오 검색 파라미터 (표 C 검색어, transport별 반경) |
| `place/component/WellnessMatcher.java` | 좌표 거리 계산, 웰니스↔카카오 최근접 매칭 |
| `place/component/CandidateMerger.java` | 후보 병합·중복 제거·웰니스 우선 정렬 |
| `place/component/AiSelectionValidator.java` | AI 응답 검증 (범위 밖 인덱스 drop, order 재부여) |
| `place/client/WellnessApiClient.java` | 웰니스 API 호출 + degrade |
| `place/dto/WellnessPlaceDto.java` | 웰니스 응답 중 사용하는 4개 필드 |
| `place/dto/PlaceCandidate.java` | 병합된 후보 1건 |
| `place/dto/AiSelectionDto.java` | AI 응답 파싱 |
| `place/dto/PlaceUpsertCommand.java` | 출처 중립 upsert 입력 |
| `place/dto/RecommendResponseDto.java` | v2 응답 |
| `place/service/RecommendService.java` / `RecommendServiceImpl.java` | 추천 오케스트레이션 |
| `db/migration/V260819HHMMSS__add_place_source_and_wellness.sql` | 스키마 변경 |

**수정**

| 경로 | 변경 |
|---|---|
| `build.gradle` | MockWebServer 테스트 의존성 |
| `config/WebClientConfig.java` | `tourWebClient` 빈 |
| `application.yml` | `tour-api.service-key` |
| `place/dto/SurveyResultDto.java` | `transportTime` 추가 |
| `place/domain/Place.java` | `source`, `wellnessContentId` 필드 / `mergeFrom` 시그니처 |
| `place/exception/PlaceErrorCode.java` | `RECOMMEND_NO_RESULT` |
| `place/service/PlaceService.java` / `PlaceServiceImpl.java` | upsert 출처 중립화, `generateKeyword` 제거 |
| `place/controller/PlaceController.java` | `recommendPlace` 교체 |
| `prompts/SystemPrompt.txt` / `UserTemplate.txt` | 키워드 생성 → 후보 선별 |

**삭제**: `place/dto/RecommendKeywordDto.java` (Task 8)

---

### Task 1: 설문 → 검색 파라미터 정책

표 C 검색어와 transport별 반경을 한 곳에서 결정한다. 외부 의존이 없는 순수 로직이다.

**Files:**
- Create: `backend/src/main/java/com/begae/backend/place/component/SurveySearchPolicy.java`
- Test: `backend/src/test/java/com/begae/backend/place/component/SurveySearchPolicyTest.java`

**Interfaces:**
- Consumes: 없음
- Produces: `SurveySearchPolicy#keywordsFor(String emotion) -> List<String>`, `SurveySearchPolicy#radiusMeters(String transport, int totalHours) -> int`

- [ ] **Step 1: Write the failing test**

```java
package com.begae.backend.place.component;

import org.junit.jupiter.api.Test;
import java.util.List;
import static org.assertj.core.api.Assertions.assertThat;

class SurveySearchPolicyTest {

    private final SurveySearchPolicy policy = new SurveySearchPolicy();

    @Test
    void 감정에_해당하는_검색어_4개를_돌려준다() {
        List<String> keywords = policy.keywordsFor("생각이 많아졌어요, 정리가 필요해요");
        assertThat(keywords).containsExactly("서점", "북카페", "사찰", "도서관");
    }

    @Test
    void 표에_없는_감정이면_기본행을_쓴다() {
        assertThat(policy.keywordsFor("배고파요"))
                .isEqualTo(policy.keywordsFor("아무 감정도 없이 멍한 느낌이에요"));
    }

    @Test
    void null_감정도_기본행으로_처리한다() {
        assertThat(policy.keywordsFor(null)).hasSize(4);
    }

    @Test
    void 도보는_시간에_비례해_500에서_2000까지_넓어진다() {
        assertThat(policy.radiusMeters("도보", 1)).isEqualTo(500);
        assertThat(policy.radiusMeters("도보", 12)).isEqualTo(2000);
    }

    @Test
    void 자가용은_5000에서_시작한다() {
        assertThat(policy.radiusMeters("자가용", 1)).isEqualTo(5000);
        assertThat(policy.radiusMeters("자가용", 12)).isEqualTo(15000);
    }

    @Test
    void 반경은_API상한_20000을_넘지_않는다() {
        assertThat(policy.radiusMeters("자가용", 999)).isLessThanOrEqualTo(20000);
    }

    @Test
    void 모르는_이동수단은_대중교통으로_본다() {
        assertThat(policy.radiusMeters("헬리콥터", 1))
                .isEqualTo(policy.radiusMeters("대중교통", 1));
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && ./gradlew test --tests 'com.begae.backend.place.component.SurveySearchPolicyTest'`
Expected: 컴파일 실패 — `SurveySearchPolicy` 클래스 없음

- [ ] **Step 3: Write minimal implementation**

```java
package com.begae.backend.place.component;

import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

/**
 * 설문 응답을 카카오 로컬 검색 파라미터로 바꾼다.
 *
 * 검색어 표(표 C)는 기획 확정값이며 cc/api/v2/place.md 5절과 동기화된다.
 * v1처럼 AI가 키워드를 생성하지 않으므로 AI 호출이 요청당 1회로 유지된다.
 */
@Component
public class SurveySearchPolicy {

    private static final String DEFAULT_EMOTION = "아무 감정도 없이 멍한 느낌이에요";

    private static final Map<String, List<String>> KEYWORDS = Map.of(
            "그냥 기운이 없고 지쳤어요",        List.of("온천", "사우나", "브런치카페", "공원"),
            "마음이 좀 울적하고 속상해요",      List.of("카페", "산책로", "서점", "전망대"),
            "답답하고 짜증이 많아졌어요",       List.of("등산로", "하천", "방탈출", "클라이밍"),
            "무기력하고 재미가 없어요",         List.of("전시회", "체험공방", "보드게임카페", "시장"),
            "기분이 좋아요, 뭔가 하고 싶어요",  List.of("맛집", "전시회", "산책로", "사진스팟"),
            "생각이 많아졌어요, 정리가 필요해요", List.of("서점", "북카페", "사찰", "도서관"),
            DEFAULT_EMOTION,                    List.of("수목원", "미술관", "카페", "강변")
    );

    /** 카카오 radius 상한 */
    private static final int MAX_RADIUS_M = 20000;
    private static final int MIN_HOURS = 1;
    private static final int MAX_HOURS = 12;

    private record RadiusRange(int min, int max) {}

    private static final Map<String, RadiusRange> RADIUS = Map.of(
            "도보",     new RadiusRange(500, 2000),
            "대중교통", new RadiusRange(2000, 5000),
            "자가용",   new RadiusRange(5000, 15000)
    );

    private static final RadiusRange DEFAULT_RADIUS = RADIUS.get("대중교통");

    public List<String> keywordsFor(String emotion) {
        return KEYWORDS.getOrDefault(emotion, KEYWORDS.get(DEFAULT_EMOTION));
    }

    public int radiusMeters(String transport, int totalHours) {
        RadiusRange range = RADIUS.getOrDefault(transport, DEFAULT_RADIUS);
        int clamped = Math.max(MIN_HOURS, Math.min(MAX_HOURS, totalHours));
        double ratio = (double) (clamped - MIN_HOURS) / (MAX_HOURS - MIN_HOURS);
        int radius = (int) Math.round(range.min() + (range.max() - range.min()) * ratio);
        return Math.min(radius, MAX_RADIUS_M);
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && ./gradlew test --tests 'com.begae.backend.place.component.SurveySearchPolicyTest'`
Expected: PASS (7 tests)

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java/com/begae/backend/place/component/SurveySearchPolicy.java \
        backend/src/test/java/com/begae/backend/place/component/SurveySearchPolicyTest.java
git commit -m "feat: 설문 기반 카카오 검색어·반경 정책 추가"
```

---

### Task 2: 웰니스↔카카오 좌표 매칭

웰니스 장소를 카카오 POI로 되찾을 때 "같은 장소인가"를 판정한다. 순수 로직이다.

**Files:**
- Create: `backend/src/main/java/com/begae/backend/place/component/WellnessMatcher.java`
- Test: `backend/src/test/java/com/begae/backend/place/component/WellnessMatcherTest.java`

**Interfaces:**
- Consumes: `KakaoPlaceResponseDto.Document`(기존)
- Produces: `WellnessMatcher#distanceMeters(double x1, double y1, double x2, double y2) -> double`, `WellnessMatcher#nearest(double x, double y, List<KakaoPlaceResponseDto.Document>) -> Optional<KakaoPlaceResponseDto.Document>`
- 인자 순서는 항상 `(경도 x, 위도 y)`다. 카카오·웰니스 응답이 모두 문자열 `x`/`y`, `mapX`/`mapY`이므로 호출부에서 파싱해 넘긴다.

- [ ] **Step 1: Write the failing test**

```java
package com.begae.backend.place.component;

import com.begae.backend.place.dto.KakaoPlaceResponseDto;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

class WellnessMatcherTest {

    private final WellnessMatcher matcher = new WellnessMatcher();

    private KakaoPlaceResponseDto.Document doc(String id, String x, String y) {
        KakaoPlaceResponseDto.Document d = new KakaoPlaceResponseDto.Document();
        d.setId(id);
        d.setX(x);
        d.setY(y);
        return d;
    }

    @Test
    void 위도_0_01도_차이는_약_1112미터다() {
        double d = matcher.distanceMeters(127.0, 37.0, 127.0, 37.01);
        assertThat(d).isCloseTo(1112.0, within(5.0));
    }

    @Test
    void 같은_좌표면_0미터다() {
        assertThat(matcher.distanceMeters(127.0, 37.0, 127.0, 37.0)).isCloseTo(0.0, within(0.01));
    }

    @Test
    void 임계값_안에서_가장_가까운_한_건을_고른다() {
        List<KakaoPlaceResponseDto.Document> docs = List.of(
                doc("far", "127.0", "37.0100"),   // 약 1112m
                doc("near", "127.0", "37.0005"),  // 약 56m
                doc("mid", "127.0", "37.0010")    // 약 111m
        );
        Optional<KakaoPlaceResponseDto.Document> found = matcher.nearest(127.0, 37.0, docs);
        assertThat(found).isPresent();
        assertThat(found.get().getId()).isEqualTo("near");
    }

    @Test
    void 임계값_150미터_밖만_있으면_비어있다() {
        List<KakaoPlaceResponseDto.Document> docs = List.of(doc("far", "127.0", "37.0100"));
        assertThat(matcher.nearest(127.0, 37.0, docs)).isEmpty();
    }

    @Test
    void 후보가_비면_비어있다() {
        assertThat(matcher.nearest(127.0, 37.0, List.of())).isEmpty();
    }

    @Test
    void 좌표가_깨진_후보는_건너뛴다() {
        List<KakaoPlaceResponseDto.Document> docs = List.of(
                doc("broken", "", null),
                doc("near", "127.0", "37.0005")
        );
        assertThat(matcher.nearest(127.0, 37.0, docs))
                .map(KakaoPlaceResponseDto.Document::getId)
                .contains("near");
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && ./gradlew test --tests 'com.begae.backend.place.component.WellnessMatcherTest'`
Expected: 컴파일 실패 — `WellnessMatcher` 없음

- [ ] **Step 3: Write minimal implementation**

```java
package com.begae.backend.place.component;

import com.begae.backend.place.dto.KakaoPlaceResponseDto;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

/**
 * 웰니스 공공 API 장소를 카카오 POI로 되찾을 때 동일 장소인지 판정한다.
 *
 * 웰니스 콘텐츠는 DB에 적재할 수 없으므로(정책) place 행은 카카오 출처로 채워야 하고,
 * 그 연결 고리가 이 좌표 매칭이다.
 */
@Component
public class WellnessMatcher {

    /** 동일 장소로 인정할 최대 거리. 실측 데이터가 없어 운영 로그를 보고 조정한다. */
    public static final double MATCH_THRESHOLD_M = 150.0;

    private static final double EARTH_RADIUS_M = 6_371_000.0;

    public double distanceMeters(double x1, double y1, double x2, double y2) {
        double lat1 = Math.toRadians(y1);
        double lat2 = Math.toRadians(y2);
        double dLat = lat2 - lat1;
        double dLon = Math.toRadians(x2 - x1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1.0, Math.sqrt(a)));
    }

    public Optional<KakaoPlaceResponseDto.Document> nearest(
            double x, double y, List<KakaoPlaceResponseDto.Document> documents) {

        if (documents == null || documents.isEmpty()) return Optional.empty();

        return documents.stream()
                .filter(this::hasCoordinates)
                .filter(d -> distanceTo(x, y, d) <= MATCH_THRESHOLD_M)
                .min(Comparator.comparingDouble(d -> distanceTo(x, y, d)));
    }

    private boolean hasCoordinates(KakaoPlaceResponseDto.Document d) {
        return d.getX() != null && !d.getX().isBlank()
                && d.getY() != null && !d.getY().isBlank();
    }

    private double distanceTo(double x, double y, KakaoPlaceResponseDto.Document d) {
        return distanceMeters(x, y, Double.parseDouble(d.getX()), Double.parseDouble(d.getY()));
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && ./gradlew test --tests 'com.begae.backend.place.component.WellnessMatcherTest'`
Expected: PASS (6 tests)

> `KakaoPlaceResponseDto.Document`에 setter가 없으면 테스트가 컴파일되지 않는다. 현재 `@Data`가 붙어 있어 setter가 생성되지만, 확인 후 없으면 `@Data`를 유지한 채 진행한다. `KakaoPlaceResponseDto`의 클래스 레벨 `@Builder`는 `Document`에는 적용되지 않는다.

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java/com/begae/backend/place/component/WellnessMatcher.java \
        backend/src/test/java/com/begae/backend/place/component/WellnessMatcherTest.java
git commit -m "feat: 웰니스-카카오 좌표 매칭 컴포넌트 추가"
```

---

### Task 3: 웰니스 공공 API 클라이언트

외부 호출을 한 클래스에 가둔다. 응답 스키마 변덕(0건일 때 `items`가 `""`)과 장애 degrade를 여기서 흡수한다.

**Files:**
- Modify: `backend/build.gradle`
- Modify: `backend/src/main/java/com/begae/backend/config/WebClientConfig.java`
- Modify: `backend/src/main/resources/application.yml`
- Modify: `.env` (리포 루트)
- Create: `backend/src/main/java/com/begae/backend/place/dto/WellnessPlaceDto.java`
- Create: `backend/src/main/java/com/begae/backend/place/client/WellnessApiClient.java`
- Test: `backend/src/test/java/com/begae/backend/place/client/WellnessApiClientTest.java`

**Interfaces:**
- Consumes: `tourWebClient` (Spring 빈, `@Qualifier("tourWebClient")`)
- Produces: `WellnessApiClient#findNearby(double x, double y, int radiusM) -> List<WellnessPlaceDto>`, `WellnessPlaceDto{ String contentId, String title, double x, double y }`

- [ ] **Step 1: 환경 설정과 의존성 먼저 넣는다**

`backend/build.gradle`의 `dependencies` 블록에 추가:

```groovy
	testImplementation 'com.squareup.okhttp3:mockwebserver:4.12.0'
```

리포 루트 `.env`의 `# External APIs` 섹션에 추가한다. 값은 리포 루트 `.tour-api` 파일의 내용을 그대로 옮긴다(64자 hex, 개행 없음).

```
TOUR_API_KEY=<.tour-api 파일 내용>
```

`backend/src/main/resources/application.yml`에서 `google:` 블록 아래에 추가:

```yaml
tour-api:
  service-key: ${TOUR_API_KEY}
```

`backend/src/main/java/com/begae/backend/config/WebClientConfig.java`에 필드와 빈을 추가한다. 기존 `googleWebClient` 빈 바로 아래에 둔다.

```java
    @Value("${tour-api.service-key}")
    private String TOUR_API_KEY;

    @Bean("tourWebClient")
    public WebClient tourWebClient(WebClient.Builder builder) {
        return builder
                .baseUrl("https://apis.data.go.kr/B551011/WellnessTursmService")
                .codecs(clientCodecConfigurer ->
                        clientCodecConfigurer.defaultCodecs().maxInMemorySize(2 * 1024 * 1024))
                .clientConnector(new ReactorClientHttpConnector(
                        HttpClient.create().responseTimeout(Duration.ofSeconds(5))))
                .build();
    }
```

> 타임아웃이 카카오·구글(5분)보다 훨씬 짧다. 웰니스는 부가 소스이므로 느리면 포기하고 카카오만으로 진행하는 편이 낫다.

- [ ] **Step 2: Write the failing test**

```java
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
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd backend && ./gradlew test --tests 'com.begae.backend.place.client.WellnessApiClientTest'`
Expected: 컴파일 실패 — `WellnessApiClient`, `WellnessPlaceDto` 없음

- [ ] **Step 4: Write the DTO**

```java
package com.begae.backend.place.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 웰니스 공공 API 응답 중 실제로 사용하는 값만 담는다.
 *
 * 정책상 웰니스 콘텐츠는 DB에 적재할 수 없다. title/x/y는 카카오로 같은 장소를 되찾기
 * 위한 조회 키로만 쓰이고 저장되지 않으며, 저장되는 것은 contentId 하나뿐이다.
 */
@Getter
@AllArgsConstructor
public class WellnessPlaceDto {
    private final String contentId;
    private final String title;
    private final double x;
    private final double y;
}
```

- [ ] **Step 5: Write the client**

```java
package com.begae.backend.place.client;

import com.begae.backend.place.dto.WellnessPlaceDto;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

/**
 * 한국관광공사 웰니스관광정보 API 클라이언트.
 *
 * DTO 대신 JsonNode로 받아 직접 매핑한다. 결과가 0건일 때 response.body.items가
 * 객체가 아니라 빈 문자열("")로 오기 때문에, 고정 DTO로 매핑하면 역직렬화 예외가 난다.
 *
 * 이 API는 부가 소스다. 어떤 실패도 예외로 전파하지 않고 빈 리스트로 degrade한다.
 */
@Slf4j
@Component
public class WellnessApiClient {

    private static final String PATH = "/locationBasedList";
    private static final String OK = "0000";
    private static final int MAX_ROWS = 30;

    private final WebClient tourWebClient;
    private final String serviceKey;

    public WellnessApiClient(@Qualifier("tourWebClient") WebClient tourWebClient,
                             @Value("${tour-api.service-key}") String serviceKey) {
        this.tourWebClient = tourWebClient;
        this.serviceKey = serviceKey;
    }

    public List<WellnessPlaceDto> findNearby(double x, double y, int radiusM) {
        try {
            JsonNode root = tourWebClient.get()
                    .uri(builder -> builder
                            .path(PATH)
                            .queryParam("serviceKey", serviceKey)
                            .queryParam("MobileOS", "ETC")
                            .queryParam("MobileApp", "ilchul")
                            .queryParam("_type", "json")
                            .queryParam("langDivCd", "KOR")
                            .queryParam("numOfRows", MAX_ROWS)
                            .queryParam("pageNo", 1)
                            .queryParam("mapX", x)
                            .queryParam("mapY", y)
                            .queryParam("radius", radiusM)
                            .build())
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .timeout(Duration.ofSeconds(5))
                    .block();

            return parse(root);
        } catch (Exception e) {
            log.warn("웰니스 API 호출 실패 - 카카오 후보만으로 진행한다", e);
            return List.of();
        }
    }

    private List<WellnessPlaceDto> parse(JsonNode root) {
        if (root == null) return List.of();

        JsonNode header = root.path("response").path("header");
        if (!OK.equals(header.path("resultCode").asText())) {
            log.warn("웰니스 API 비정상 응답: {}", root.toString());
            return List.of();
        }

        // 0건이면 items가 빈 문자열이라 path("item")이 MissingNode가 된다
        JsonNode items = root.path("response").path("body").path("items").path("item");
        if (!items.isArray()) return List.of();

        List<WellnessPlaceDto> result = new ArrayList<>();
        for (JsonNode item : items) {
            String contentId = item.path("contentId").asText(null);
            String title = item.path("title").asText(null);
            String mapX = item.path("mapX").asText("");
            String mapY = item.path("mapY").asText("");
            if (contentId == null || title == null || mapX.isBlank() || mapY.isBlank()) continue;
            try {
                result.add(new WellnessPlaceDto(contentId, title,
                        Double.parseDouble(mapX), Double.parseDouble(mapY)));
            } catch (NumberFormatException ignored) {
                log.debug("웰니스 좌표 파싱 실패 contentId={}", contentId);
            }
        }
        return result;
    }
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `cd backend && ./gradlew test --tests 'com.begae.backend.place.client.WellnessApiClientTest'`
Expected: PASS (6 tests)

- [ ] **Step 7: Commit**

```bash
git add backend/build.gradle backend/src/main/resources/application.yml \
        backend/src/main/java/com/begae/backend/config/WebClientConfig.java \
        backend/src/main/java/com/begae/backend/place/dto/WellnessPlaceDto.java \
        backend/src/main/java/com/begae/backend/place/client/WellnessApiClient.java \
        backend/src/test/java/com/begae/backend/place/client/WellnessApiClientTest.java
git commit -m "feat: 웰니스 공공 API 클라이언트 추가"
```

> `.env`는 gitignore 대상이라 커밋되지 않는다. 배포 환경 변수에 `TOUR_API_KEY`를 별도로 등록해야 한다.

---

### Task 4: 후보 병합

웰니스 되찾기 결과와 표 C 검색 결과를 하나의 후보 풀로 만든다. 중복은 카카오 place id로 제거하고 웰니스 쪽을 남긴다.

**Files:**
- Create: `backend/src/main/java/com/begae/backend/place/dto/PlaceCandidate.java`
- Create: `backend/src/main/java/com/begae/backend/place/component/CandidateMerger.java`
- Test: `backend/src/test/java/com/begae/backend/place/component/CandidateMergerTest.java`

**Interfaces:**
- Consumes: `KakaoPlaceResponseDto.Document`
- Produces: `PlaceCandidate{ KakaoPlaceResponseDto.Document document, String wellnessContentId }` — `wellnessContentId`가 `null`이 아니면 웰니스 매칭 건이다. `PlaceCandidate#isWellness() -> boolean`, `PlaceCandidate#getKakaoId() -> String`
- Produces: `CandidateMerger#merge(List<PlaceCandidate> wellness, List<PlaceCandidate> kakao) -> List<PlaceCandidate>` — 웰니스가 앞, 카카오가 뒤, 카카오 id 기준 중복 제거

- [ ] **Step 1: Write the failing test**

```java
package com.begae.backend.place.component;

import com.begae.backend.place.dto.KakaoPlaceResponseDto;
import com.begae.backend.place.dto.PlaceCandidate;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class CandidateMergerTest {

    private final CandidateMerger merger = new CandidateMerger();

    private PlaceCandidate candidate(String kakaoId, String wellnessContentId) {
        KakaoPlaceResponseDto.Document d = new KakaoPlaceResponseDto.Document();
        d.setId(kakaoId);
        d.setPlaceName("place-" + kakaoId);
        return new PlaceCandidate(d, wellnessContentId);
    }

    @Test
    void 웰니스_후보가_카카오_후보보다_앞에_온다() {
        List<PlaceCandidate> merged = merger.merge(
                List.of(candidate("W1", "1001")),
                List.of(candidate("K1", null), candidate("K2", null)));

        assertThat(merged).extracting(PlaceCandidate::getKakaoId)
                .containsExactly("W1", "K1", "K2");
    }

    @Test
    void 같은_카카오_id면_웰니스_쪽을_남긴다() {
        List<PlaceCandidate> merged = merger.merge(
                List.of(candidate("SAME", "1001")),
                List.of(candidate("SAME", null), candidate("K2", null)));

        assertThat(merged).hasSize(2);
        assertThat(merged.get(0).getKakaoId()).isEqualTo("SAME");
        assertThat(merged.get(0).getWellnessContentId()).isEqualTo("1001");
        assertThat(merged.get(0).isWellness()).isTrue();
    }

    @Test
    void 카카오_후보끼리의_중복도_제거한다() {
        List<PlaceCandidate> merged = merger.merge(
                List.of(),
                List.of(candidate("K1", null), candidate("K1", null), candidate("K2", null)));

        assertThat(merged).extracting(PlaceCandidate::getKakaoId).containsExactly("K1", "K2");
    }

    @Test
    void 웰니스가_없어도_카카오만으로_동작한다() {
        List<PlaceCandidate> merged = merger.merge(List.of(), List.of(candidate("K1", null)));

        assertThat(merged).hasSize(1);
        assertThat(merged.get(0).isWellness()).isFalse();
    }

    @Test
    void 양쪽_모두_비면_빈_리스트다() {
        assertThat(merger.merge(List.of(), List.of())).isEmpty();
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && ./gradlew test --tests 'com.begae.backend.place.component.CandidateMergerTest'`
Expected: 컴파일 실패

- [ ] **Step 3: Write PlaceCandidate**

```java
package com.begae.backend.place.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * AI에게 넘길 후보 1건.
 *
 * 장소 데이터는 전부 카카오 출처(document)이고, 웰니스는 식별자만 붙는다.
 * wellnessContentId가 null이 아니면 힐링 인증 배지 대상이다.
 */
@Getter
@AllArgsConstructor
public class PlaceCandidate {

    private final KakaoPlaceResponseDto.Document document;
    private final String wellnessContentId;

    public boolean isWellness() {
        return wellnessContentId != null;
    }

    public String getKakaoId() {
        return document.getId();
    }
}
```

- [ ] **Step 4: Write CandidateMerger**

```java
package com.begae.backend.place.component;

import com.begae.backend.place.dto.PlaceCandidate;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * 웰니스 후보를 앞에, 카카오 후보를 뒤에 놓고 카카오 place id로 중복을 제거한다.
 *
 * 순서가 곧 AI에게 제시되는 순서이고, 웰니스를 앞에 두는 것이 우선 편입의 실체다.
 */
@Component
public class CandidateMerger {

    public List<PlaceCandidate> merge(List<PlaceCandidate> wellness, List<PlaceCandidate> kakao) {
        List<PlaceCandidate> merged = new ArrayList<>();
        Set<String> seen = new HashSet<>();

        for (PlaceCandidate c : wellness) {
            if (c.getKakaoId() != null && seen.add(c.getKakaoId())) merged.add(c);
        }
        for (PlaceCandidate c : kakao) {
            if (c.getKakaoId() != null && seen.add(c.getKakaoId())) merged.add(c);
        }
        return merged;
    }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd backend && ./gradlew test --tests 'com.begae.backend.place.component.CandidateMergerTest'`
Expected: PASS (5 tests)

- [ ] **Step 6: Commit**

```bash
git add backend/src/main/java/com/begae/backend/place/dto/PlaceCandidate.java \
        backend/src/main/java/com/begae/backend/place/component/CandidateMerger.java \
        backend/src/test/java/com/begae/backend/place/component/CandidateMergerTest.java
git commit -m "feat: 웰니스 우선 후보 병합 컴포넌트 추가"
```

---

### Task 5: AI 응답 계약 교체와 검증

프롬프트를 "키워드 생성"에서 "후보 선별"로 바꾸고, 모델이 후보 밖 인덱스를 반환하는 경우를 방어한다.

**Files:**
- Modify: `backend/src/main/java/com/begae/backend/place/dto/SurveyResultDto.java`
- Modify: `backend/src/main/resources/prompts/SystemPrompt.txt`
- Modify: `backend/src/main/resources/prompts/UserTemplate.txt`
- Create: `backend/src/main/java/com/begae/backend/place/dto/AiSelectionDto.java`
- Create: `backend/src/main/java/com/begae/backend/place/component/AiSelectionValidator.java`
- Test: `backend/src/test/java/com/begae/backend/place/component/AiSelectionValidatorTest.java`

**Interfaces:**
- Produces: `AiSelectionDto{ TravelPlan travelPlan, List<Selection> selections }`, `AiSelectionDto.TravelPlan{ int totalHours, int estimatedPlaceCount, String reasoning }`, `AiSelectionDto.Selection{ int index, int order, int stayMinutes, String reason, List<String> tags }`
- Produces: `AiSelectionValidator#validate(AiSelectionDto, int candidateCount) -> List<AiSelectionDto.Selection>` — 정렬·정제된 selection. 유효 건이 0이면 빈 리스트를 돌려준다(422 판단은 호출부).

- [ ] **Step 1: `SurveyResultDto`에 `transportTime`을 추가한다**

v1 명세에는 있는데 DTO에 없던 필드다. 기존 필드 사이, `transport` 바로 아래에 넣는다.

```java
    String transport;
    String transportTime;
```

- [ ] **Step 2: Write the failing test**

```java
package com.begae.backend.place.component;

import com.begae.backend.place.dto.AiSelectionDto;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class AiSelectionValidatorTest {

    private final AiSelectionValidator validator = new AiSelectionValidator();

    private AiSelectionDto.Selection selection(int index, int order) {
        AiSelectionDto.Selection s = new AiSelectionDto.Selection();
        s.setIndex(index);
        s.setOrder(order);
        s.setStayMinutes(60);
        s.setReason("이유");
        s.setTags(List.of("#태그"));
        return s;
    }

    private AiSelectionDto dto(List<AiSelectionDto.Selection> selections) {
        AiSelectionDto d = new AiSelectionDto();
        d.setSelections(selections);
        return d;
    }

    @Test
    void order대로_정렬하고_1부터_다시_번호를_매긴다() {
        List<AiSelectionDto.Selection> result = validator.validate(
                dto(List.of(selection(2, 7), selection(0, 3))), 5);

        assertThat(result).extracting(AiSelectionDto.Selection::getIndex).containsExactly(0, 2);
        assertThat(result).extracting(AiSelectionDto.Selection::getOrder).containsExactly(1, 2);
    }

    @Test
    void 후보_범위를_벗어난_인덱스는_버린다() {
        List<AiSelectionDto.Selection> result = validator.validate(
                dto(List.of(selection(0, 1), selection(99, 2), selection(-1, 3))), 5);

        assertThat(result).extracting(AiSelectionDto.Selection::getIndex).containsExactly(0);
    }

    @Test
    void 같은_인덱스를_두_번_고르면_먼저_것만_남긴다() {
        List<AiSelectionDto.Selection> result = validator.validate(
                dto(List.of(selection(1, 1), selection(1, 2))), 5);

        assertThat(result).hasSize(1);
    }

    @Test
    void 체류시간이_비정상이면_기본값_60분으로_보정한다() {
        AiSelectionDto.Selection zero = selection(0, 1);
        zero.setStayMinutes(0);
        AiSelectionDto.Selection huge = selection(1, 2);
        huge.setStayMinutes(9999);

        List<AiSelectionDto.Selection> result = validator.validate(dto(List.of(zero, huge)), 5);

        assertThat(result.get(0).getStayMinutes()).isEqualTo(60);
        assertThat(result.get(1).getStayMinutes()).isEqualTo(60);
    }

    @Test
    void selections가_null이면_빈_리스트다() {
        assertThat(validator.validate(dto(null), 5)).isEmpty();
    }

    @Test
    void 전부_무효하면_빈_리스트다() {
        assertThat(validator.validate(dto(List.of(selection(99, 1))), 5)).isEmpty();
    }
}
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd backend && ./gradlew test --tests 'com.begae.backend.place.component.AiSelectionValidatorTest'`
Expected: 컴파일 실패

- [ ] **Step 4: Write AiSelectionDto**

기존 `RecommendKeywordDto`와 같은 스네이크케이스 매핑 방식을 따른다.

```java
package com.begae.backend.place.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class AiSelectionDto {

    @JsonAlias("travel_plan")
    private TravelPlan travelPlan;

    private List<Selection> selections;

    @Data
    @NoArgsConstructor
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    public static class TravelPlan {
        private int totalHours;
        private int estimatedPlaceCount;
        private String reasoning;
    }

    @Data
    @NoArgsConstructor
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    public static class Selection {
        /** 후보 리스트에서의 0-based 위치. 모델이 범위 밖을 반환할 수 있어 검증 대상이다. */
        private int index;
        private int order;
        private int stayMinutes;
        private String reason;
        private List<String> tags;
    }
}
```

- [ ] **Step 5: Write AiSelectionValidator**

```java
package com.begae.backend.place.component;

import com.begae.backend.place.dto.AiSelectionDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * AI 선택 결과를 신뢰하지 않고 검증한다.
 *
 * 모델은 후보에 없는 인덱스, 중복 인덱스, 비현실적인 체류시간을 반환할 수 있다.
 * 잘못된 항목은 버리고 나머지로 진행한다. 전부 버려지면 호출부가 422로 응답한다.
 */
@Slf4j
@Component
public class AiSelectionValidator {

    private static final int DEFAULT_STAY_MINUTES = 60;
    private static final int MIN_STAY_MINUTES = 15;
    private static final int MAX_STAY_MINUTES = 240;

    public List<AiSelectionDto.Selection> validate(AiSelectionDto dto, int candidateCount) {
        if (dto == null || dto.getSelections() == null) return List.of();

        List<AiSelectionDto.Selection> sorted = new ArrayList<>(dto.getSelections());
        sorted.sort(Comparator.comparingInt(AiSelectionDto.Selection::getOrder));

        List<AiSelectionDto.Selection> valid = new ArrayList<>();
        Set<Integer> seen = new HashSet<>();

        for (AiSelectionDto.Selection s : sorted) {
            if (s.getIndex() < 0 || s.getIndex() >= candidateCount) {
                log.warn("AI가 후보 범위 밖 인덱스를 반환해 버린다: index={}, candidateCount={}",
                        s.getIndex(), candidateCount);
                continue;
            }
            if (!seen.add(s.getIndex())) {
                log.warn("AI가 같은 후보를 중복 선택해 버린다: index={}", s.getIndex());
                continue;
            }
            if (s.getStayMinutes() < MIN_STAY_MINUTES || s.getStayMinutes() > MAX_STAY_MINUTES) {
                s.setStayMinutes(DEFAULT_STAY_MINUTES);
            }
            if (s.getTags() == null) {
                s.setTags(List.of());
            }
            s.setOrder(valid.size() + 1);
            valid.add(s);
        }
        return valid;
    }
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `cd backend && ./gradlew test --tests 'com.begae.backend.place.component.AiSelectionValidatorTest'`
Expected: PASS (6 tests)

- [ ] **Step 7: 프롬프트를 교체한다**

`backend/src/main/resources/prompts/SystemPrompt.txt` 전체를 아래로 바꾼다.

```
You are a healing-trip course planner.

You are given a list of candidate places near the user, and the user's survey answers.
Your job is to SELECT a subset of those candidates, put them in visiting order, and explain why.

Hard rules:
- Output ONLY valid JSON. No extra text, no markdown code fences.
- Follow the exact response schema provided by the user message.
- You may ONLY select places by their given index. Never invent a place.
- Candidates marked [WELLNESS] are nationally certified wellness destinations.
  Prefer them: if a [WELLNESS] candidate is a reasonable fit, include it and place it early in the order.
- Select 3 to 5 places. Fewer is fine if the available time is short.
- The total of stay_minutes plus travel time must fit within the user's available hours.
- reason must be 1 sentence in Korean, max 40 characters, addressed to the user's emotion.
- tags: 0~3 short Korean tags, each starting with '#'.
- If the input is ambiguous, make reasonable assumptions but do not ask questions.
```

`backend/src/main/resources/prompts/UserTemplate.txt` 전체를 아래로 바꾼다.

```
아래 후보 목록에서 즉흥여행 코스를 골라줘.

[추론 순서 - 반드시 이 순서대로 처리]
1. start_time ~ end_time으로 총 가용 시간을 계산해.
2. emotion을 최우선으로 고려해서 어떤 성격의 장소가 필요한지 정해.
3. [WELLNESS] 표시가 있는 후보를 먼저 검토해. 감정에 맞으면 반드시 포함하고 앞 순서에 배치해.
4. 장소당 체류 30~90분 + 이동 시간을 고려해 3~5곳을 골라.
5. 각 장소를 왜 골랐는지 사용자의 감정에 답하는 방식으로 1문장씩 써.

[출력 규칙]
- JSON만 출력. 마크다운 코드블록이나 설명 텍스트 없음.
- index는 반드시 후보 목록에 있는 번호여야 해. 목록에 없는 번호를 쓰면 안 돼.
- order는 1부터 시작하는 방문 순서.

Response schema:
{
  "travel_plan": {
    "total_hours": number,
    "estimated_place_count": number,
    "reasoning": "string"
  },
  "selections": [
    {
      "index": number,
      "order": number,
      "stay_minutes": number,
      "reason": "string",
      "tags": ["string"]
    }
  ]
}

Survey JSON:
{{SURVEY_JSON}}

후보 목록:
{{CANDIDATES}}
```

- [ ] **Step 8: Commit**

```bash
git add backend/src/main/java/com/begae/backend/place/dto/SurveyResultDto.java \
        backend/src/main/java/com/begae/backend/place/dto/AiSelectionDto.java \
        backend/src/main/java/com/begae/backend/place/component/AiSelectionValidator.java \
        backend/src/test/java/com/begae/backend/place/component/AiSelectionValidatorTest.java \
        backend/src/main/resources/prompts/SystemPrompt.txt \
        backend/src/main/resources/prompts/UserTemplate.txt
git commit -m "feat: AI 역할을 키워드 생성에서 후보 선별로 교체"
```

---

### Task 6: 스키마 변경과 upsert 출처 중립화

`place`에 출처 구분과 웰니스 식별자를 추가하고, upsert가 카카오 DTO에 직접 묶여 있는 구조를 푼다.

**Files:**
- Create: `backend/src/main/resources/db/migration/V260819HHMMSS__add_place_source_and_wellness.sql`
- Modify: `backend/src/main/java/com/begae/backend/place/domain/Place.java`
- Create: `backend/src/main/java/com/begae/backend/place/dto/PlaceUpsertCommand.java`
- Modify: `backend/src/main/java/com/begae/backend/place/service/PlaceService.java`
- Modify: `backend/src/main/java/com/begae/backend/place/service/PlaceServiceImpl.java`
- Test: `backend/src/test/java/com/begae/backend/place/dto/PlaceUpsertCommandTest.java`

**Interfaces:**
- Produces: `PlaceUpsertCommand{ String source, String sourceId, String placeName, String addressName, String roadAddressName, String categoryName, String phone, String placeUrl, String placeImageUrl, Double x, Double y, String wellnessContentId }` + `PlaceUpsertCommand#fromKakao(KakaoPlaceResponseDto.Document, PlaceSummaryDto, String wellnessContentId)`
- Produces: `PlaceService#upsertPlace(PlaceUpsertCommand) -> int` (기존 `upsertPlaceFrom` 대체)
- Produces: `Place#getWellnessContentId() -> String`, `Place#mergeFrom(PlaceUpsertCommand)`

- [ ] **Step 1: 마이그레이션 파일을 만든다**

파일명의 `HHMMSS`는 작성 시각으로 채운다. 기존 규칙은 `V{YYMMDDHHMMSS}__설명.sql`이다 (예: `V260710214733__refactor_plan.sql`).

```sql
-- place 출처 구분과 웰니스 식별자 추가
-- 웰니스 콘텐츠(이름/주소/이미지/테마)는 정책상 저장하지 않는다. contentId만 보관한다.

ALTER TABLE `place` ADD COLUMN `source` VARCHAR(20) NOT NULL DEFAULT 'KAKAO';

ALTER TABLE `place` DROP INDEX `uk_place_source`;
ALTER TABLE `place` ADD UNIQUE KEY `uk_place_source` (`source`, `source_id`);

ALTER TABLE `place` ADD COLUMN `wellness_content_id` VARCHAR(20) NULL;
ALTER TABLE `place` ADD INDEX `idx_place_wellness` (`wellness_content_id`);
```

- [ ] **Step 2: Write the failing test**

`PlaceUpsertCommand`의 변환만 검증한다. DB가 필요한 upsert 자체는 Spring 컨텍스트 없이 테스트할 수 없으므로 이 계획의 범위에서 제외하고, Task 8의 수동 검증으로 확인한다.

```java
package com.begae.backend.place.dto;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class PlaceUpsertCommandTest {

    private KakaoPlaceResponseDto.Document doc() {
        KakaoPlaceResponseDto.Document d = new KakaoPlaceResponseDto.Document();
        d.setId("12345");
        d.setPlaceName("우리유황온천");
        d.setAddressName("서울 광진구 자양동 12-3");
        d.setRoadAddressName("서울 광진구 자양로5길 33");
        d.setCategoryName("관광,명소 > 온천,사우나");
        d.setPhone("02-000-0000");
        d.setPlaceUrl("http://place.map.kakao.com/12345");
        d.setX("127.0812");
        d.setY("37.5372");
        return d;
    }

    @Test
    void 카카오_문서를_출처가_KAKAO인_명령으로_바꾼다() {
        PlaceUpsertCommand cmd = PlaceUpsertCommand.fromKakao(doc(), null, null);

        assertThat(cmd.getSource()).isEqualTo("KAKAO");
        assertThat(cmd.getSourceId()).isEqualTo("12345");
        assertThat(cmd.getPlaceName()).isEqualTo("우리유황온천");
        assertThat(cmd.getX()).isEqualTo(127.0812);
        assertThat(cmd.getY()).isEqualTo(37.5372);
        assertThat(cmd.getWellnessContentId()).isNull();
    }

    @Test
    void 웰니스_식별자가_있으면_그대로_실린다() {
        PlaceUpsertCommand cmd = PlaceUpsertCommand.fromKakao(doc(), null, "2932122");

        assertThat(cmd.getWellnessContentId()).isEqualTo("2932122");
        assertThat(cmd.getSource()).isEqualTo("KAKAO");
    }

    @Test
    void 요약정보가_있으면_카테고리와_이미지를_요약값으로_덮는다() {
        PlaceSummaryDto summary = PlaceSummaryDto.builder()
                .categoryName("관광,명소· 온천,사우나")
                .placeName("우리유황온천")
                .placeImageUrl("https://example.com/photo.jpg")
                .x("127.0812")
                .y("37.5372")
                .build();

        PlaceUpsertCommand cmd = PlaceUpsertCommand.fromKakao(doc(), summary, null);

        assertThat(cmd.getCategoryName()).isEqualTo("관광,명소· 온천,사우나");
        assertThat(cmd.getPlaceImageUrl()).isEqualTo("https://example.com/photo.jpg");
    }
}
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd backend && ./gradlew test --tests 'com.begae.backend.place.dto.PlaceUpsertCommandTest'`
Expected: 컴파일 실패

- [ ] **Step 4: Write PlaceUpsertCommand**

```java
package com.begae.backend.place.dto;

import lombok.Builder;
import lombok.Getter;

/**
 * place 테이블 upsert 입력. 특정 외부 API DTO에 묶이지 않는다.
 *
 * 기존 upsertPlaceFrom은 KakaoPlaceResponseDto.Document를 직접 받아 출처가 늘어날 때마다
 * 시그니처가 흔들렸다. 출처 중립 명령 객체로 그 결합을 끊는다.
 */
@Getter
@Builder
public class PlaceUpsertCommand {

    public static final String SOURCE_KAKAO = "KAKAO";

    private final String source;
    private final String sourceId;
    private final String placeName;
    private final String addressName;
    private final String roadAddressName;
    private final String categoryName;
    private final String phone;
    private final String placeUrl;
    private final String placeImageUrl;
    private final Double x;
    private final Double y;
    /** 웰니스 인증 장소일 때만 채운다. 배지 판정 근거이자 저장하는 유일한 웰니스 데이터다. */
    private final String wellnessContentId;

    public static PlaceUpsertCommand fromKakao(KakaoPlaceResponseDto.Document doc,
                                               PlaceSummaryDto summary,
                                               String wellnessContentId) {
        return PlaceUpsertCommand.builder()
                .source(SOURCE_KAKAO)
                .sourceId(doc.getId())
                .placeName(doc.getPlaceName())
                .addressName(doc.getAddressName())
                .roadAddressName(doc.getRoadAddressName())
                .categoryName(summary != null && summary.getCategoryName() != null
                        ? summary.getCategoryName() : doc.getCategoryName())
                .phone(doc.getPhone())
                .placeUrl(doc.getPlaceUrl())
                .placeImageUrl(summary != null ? summary.getPlaceImageUrl() : null)
                .x(parse(doc.getX()))
                .y(parse(doc.getY()))
                .wellnessContentId(wellnessContentId)
                .build();
    }

    private static Double parse(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return Double.parseDouble(value);
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd backend && ./gradlew test --tests 'com.begae.backend.place.dto.PlaceUpsertCommandTest'`
Expected: PASS (3 tests)

- [ ] **Step 6: `Place` 엔티티에 필드를 추가한다**

`likeCount` 필드 위에 컬럼 두 개를 추가한다.

```java
    @Column(name = "source", length = 20)
    private String source;

    @Column(name = "wellness_content_id", length = 20)
    private String wellnessContentId;
```

`@Builder` 생성자 파라미터에 `String source`, `String wellnessContentId`를 추가하고 본문에서 대입한다.

기존 `mergeFrom(KakaoPlaceResponseDto.Document doc, PlaceSummaryDto dto)`를 아래로 교체한다.

```java
    public void mergeFrom(PlaceUpsertCommand cmd) {
        if (hasText(cmd.getAddressName())) this.addressName = cmd.getAddressName();
        if (hasText(cmd.getRoadAddressName())) this.roadAddressName = cmd.getRoadAddressName();
        if (hasText(cmd.getCategoryName())) this.categoryName = cmd.getCategoryName();
        if (hasText(cmd.getPhone())) this.phone = cmd.getPhone();
        if (hasText(cmd.getPlaceName())) this.placeName = cmd.getPlaceName();
        if (hasText(cmd.getPlaceUrl())) this.placeUrl = cmd.getPlaceUrl();
        if (cmd.getX() != null) this.x = cmd.getX();
        if (cmd.getY() != null) this.y = cmd.getY();
        if (hasText(cmd.getPlaceImageUrl())) this.placeImageUrl = cmd.getPlaceImageUrl();

        // 한 번 붙은 웰니스 식별자는 지우지 않는다. 이번 조회에서 안 걸렸을 뿐일 수 있다.
        if (hasText(cmd.getWellnessContentId())) this.wellnessContentId = cmd.getWellnessContentId();

        this.lastFetchedAt = java.time.LocalDateTime.now();
    }
```

`KakaoPlaceResponseDto` import가 더 이상 필요 없으면 제거한다.

- [ ] **Step 7: `PlaceServiceImpl.upsertPlaceFrom`을 `upsertPlace`로 교체한다**

`PlaceService` 인터페이스의 `int upsertPlaceFrom(KakaoPlaceResponseDto.Document, PlaceSummaryDto)`를 `int upsertPlace(PlaceUpsertCommand command)`로 바꾼다.

`PlaceServiceImpl`의 구현에서 `document`/`dto` 참조를 `command`로 바꾼다. 핵심 변경점만 적는다.

```java
    @Override
    public int upsertPlace(PlaceUpsertCommand command) {
        final String sourceId = command.getSourceId();
        LocalDateTime now = LocalDateTime.now();

        Optional<Place> existing =
                placeRepository.findPlaceBySourceAndSourceId(command.getSource(), sourceId);

        if (existing.isEmpty()) {
            Place newPlace = Place.builder()
                    .source(command.getSource())
                    .sourceId(sourceId)
                    .addressName(command.getAddressName())
                    .roadAddressName(command.getRoadAddressName())
                    .categoryName(command.getCategoryName())
                    .phone(command.getPhone())
                    .placeName(command.getPlaceName())
                    .placeUrl(command.getPlaceUrl())
                    .placeImageUrl(command.getPlaceImageUrl())
                    .wellnessContentId(command.getWellnessContentId())
                    .x(command.getX())
                    .y(command.getY())
                    .lastFetchedAt(now)
                    .lastSeenAt(now)
                    .build();
            try {
                placeRepository.save(newPlace);
                return newPlace.getPlaceId();
            } catch (org.springframework.dao.DataIntegrityViolationException e) {
                return placeRepository.findPlaceBySourceAndSourceId(command.getSource(), sourceId)
                        .map(Place::getPlaceId)
                        .orElseThrow(() -> e);
            }
        }

        Place place = existing.get();

        if (place.getLastSeenAt() == null || place.getLastSeenAt().isBefore(now.minusHours(6))) {
            place.markSeen();
        }

        boolean stale = place.getLastFetchedAt() == null
                || place.getLastFetchedAt().isBefore(now.minusDays(7));

        // 웰니스 식별자가 새로 붙는 경우는 stale 여부와 무관하게 반영해야 한다
        boolean needsWellnessLink = command.getWellnessContentId() != null
                && place.getWellnessContentId() == null;

        if (!stale && !needsWellnessLink) {
            return place.getPlaceId();
        }

        place.mergeFrom(command);
        placeRepository.save(place);
        return place.getPlaceId();
    }
```

`PlaceRepository`에 조회 메서드를 추가한다. 기존 `findPlaceBySourceId`는 다른 호출부가 없으면 제거한다.

```java
    Optional<Place> findPlaceBySourceAndSourceId(String source, String sourceId);
```

`toPlaceSummary`의 마지막 블록에서 `upsertPlaceFrom(document, placeSummaryDto)` 호출을 아래로 바꾼다.

```java
                Mono.fromCallable(() -> upsertPlace(
                                PlaceUpsertCommand.fromKakao(document, placeSummaryDto, null)))
```

- [ ] **Step 8: 전체 컴파일을 확인한다**

Run: `cd backend && ./gradlew compileJava compileTestJava`
Expected: BUILD SUCCESSFUL. 실패하면 `upsertPlaceFrom` / `mergeFrom` / `findPlaceBySourceId`의 남은 호출부를 모두 고친다.

- [ ] **Step 9: Commit**

```bash
git add backend/src/main/resources/db/migration/ \
        backend/src/main/java/com/begae/backend/place/domain/Place.java \
        backend/src/main/java/com/begae/backend/place/dto/PlaceUpsertCommand.java \
        backend/src/main/java/com/begae/backend/place/repository/PlaceRepository.java \
        backend/src/main/java/com/begae/backend/place/service/PlaceService.java \
        backend/src/main/java/com/begae/backend/place/service/PlaceServiceImpl.java \
        backend/src/test/java/com/begae/backend/place/dto/PlaceUpsertCommandTest.java
git commit -m "feat: place 출처 구분·웰니스 식별자 컬럼 추가 및 upsert 출처 중립화"
```

---

### Task 7: 추천 오케스트레이션

지금까지의 조각을 하나의 흐름으로 엮는다. `PlaceServiceImpl`이 이미 366줄이므로 새 서비스로 분리한다.

**Files:**
- Create: `backend/src/main/java/com/begae/backend/place/service/RecommendService.java`
- Create: `backend/src/main/java/com/begae/backend/place/service/RecommendServiceImpl.java`
- Test: `backend/src/test/java/com/begae/backend/place/service/RecommendServiceImplTest.java`

**Interfaces:**
- Consumes: `SurveySearchPolicy`, `WellnessApiClient`, `WellnessMatcher`, `CandidateMerger`, `AiSelectionValidator`, `PlaceService`, `PromptRegistry`, 카카오 검색
- Produces: `RecommendService#recommend(SurveyResultDto) -> RecommendResponseDto` (응답 DTO는 Task 8에서 만든다. 이 태스크에서는 먼저 만들고 Task 8에서 컨트롤러에 연결한다)

- [ ] **Step 1: 응답 DTO를 먼저 만든다**

`backend/src/main/java/com/begae/backend/place/dto/RecommendResponseDto.java`

```java
package com.begae.backend.place.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

/**
 * PLACE-16 v2 응답. 최상위가 객체인 이유는 plan·candidateCount처럼
 * 항목 리스트 바깥에 속하는 정보를 실을 자리가 필요하기 때문이다.
 *
 * source/fallback 필드는 두지 않는다. 웰니스와 카카오를 병합하는 구조에서는
 * "웰니스 경로 vs 폴백 경로"라는 이분법이 성립하지 않는다.
 */
@Getter
@Builder
public class RecommendResponseDto {

    private final String recommendId;
    private final CandidateCount candidateCount;
    private final Plan plan;
    private final List<Item> items;

    @Getter
    @Builder
    public static class CandidateCount {
        private final int wellness;
        private final int kakao;
    }

    @Getter
    @Builder
    public static class Plan {
        private final int totalHours;
        private final int estimatedPlaceCount;
        private final String reasoning;
    }

    @Getter
    @Builder
    public static class Item {
        private final int order;
        private final int placeId;
        private final String placeName;
        private final String categoryName;
        private final String placeImageUrl;
        private final String roadAddressName;
        private final double x;
        private final double y;
        private final int stayMinutes;
        private final String reason;
        private final List<String> tags;
        /** 프론트의 isVerified(방문 사진 인증)와 다른 개념이다. 출처가 웰니스 인증 장소인지를 뜻한다. */
        private final boolean wellnessCertified;
    }
}
```

- [ ] **Step 2: 422용 에러코드를 추가한다**

`PlaceErrorCode`에 항목을 추가한다.

```java
    PLACE_NOT_FOUND(HttpStatus.BAD_REQUEST, "P0001", "장소를 찾을 수 없습니다."),
    RECOMMEND_NO_RESULT(HttpStatus.UNPROCESSABLE_ENTITY, "P0002", "추천할 만한 장소를 찾지 못했습니다.");
```

- [ ] **Step 3: Write the failing test**

협력 객체를 모두 목으로 두고 흐름만 검증한다.

```java
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
```

- [ ] **Step 4: Run test to verify it fails**

Run: `cd backend && ./gradlew test --tests 'com.begae.backend.place.service.RecommendServiceImplTest'`
Expected: 컴파일 실패

- [ ] **Step 5: `PlaceService`에 재사용 메서드 두 개를 노출한다**

오케스트레이터가 카카오 원본 문서와 enrich를 나눠 쓸 수 있어야 한다. `PlaceService` 인터페이스에 추가하고 `PlaceServiceImpl`에 구현한다.

```java
    /** 카카오 로컬 키워드 검색 원본. Google 사진·DB 적재를 하지 않는다. */
    List<KakaoPlaceResponseDto.Document> searchRawByKeyword(String keyword, double x, double y, int radiusM);

    /** Google 사진을 붙이고 place에 upsert한 뒤 요약을 돌려준다. */
    SearchPlaceResponseDto enrichAndUpsert(KakaoPlaceResponseDto.Document document, String wellnessContentId);
```

`PlaceServiceImpl` 구현은 아래와 같다.

```java
    @Override
    public List<KakaoPlaceResponseDto.Document> searchRawByKeyword(
            String keyword, double x, double y, int radiusM) {

        KakaoPlaceResponseDto response = kakaoWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/v2/local/search/keyword.json")
                        .queryParam("query", keyword)
                        .queryParam("radius", radiusM)
                        .queryParam("x", x)
                        .queryParam("y", y)
                        .build())
                .retrieve()
                .bodyToMono(KakaoPlaceResponseDto.class)
                .timeout(Duration.ofSeconds(10))
                .onErrorResume(e -> {
                    // 검색어 하나가 실패해도 나머지 후보로 추천을 이어간다
                    log.warn("카카오 키워드 검색 실패: keyword={}", keyword, e);
                    return Mono.empty();
                })
                .block();

        if (response == null || response.getDocuments() == null) return List.of();
        return response.getDocuments();
    }

    @Override
    public SearchPlaceResponseDto enrichAndUpsert(
            KakaoPlaceResponseDto.Document document, String wellnessContentId) {
        return toPlaceSummary(document, wellnessContentId).block(Duration.ofSeconds(20));
    }
```

`toPlaceSummary`의 시그니처에 `String wellnessContentId`를 추가하고, 마지막 `upsertPlace` 호출에 그대로 넘긴다.

```java
    @Override
    public Mono<SearchPlaceResponseDto> toPlaceSummary(
            KakaoPlaceResponseDto.Document document, String wellnessContentId) {
        // ... 기존 Google 사진 조회 로직은 그대로 ...

        return placeSummary.flatMap(placeSummaryDto ->
                Mono.fromCallable(() -> upsertPlace(
                                PlaceUpsertCommand.fromKakao(document, placeSummaryDto, wellnessContentId)))
                        .subscribeOn(reactor.core.scheduler.Schedulers.boundedElastic())
                        .map(placeId -> SearchPlaceResponseDto.builder()
                                .placeId(placeId)
                                .placeName(placeSummaryDto.getPlaceName())
                                .categoryName(placeSummaryDto.getCategoryName())
                                .placeImageUrl(placeSummaryDto.getPlaceImageUrl())
                                .x(Double.parseDouble(placeSummaryDto.getX()))
                                .y(Double.parseDouble(placeSummaryDto.getY()))
                                .build()));
    }
```

`PlaceService` 인터페이스의 `toPlaceSummary` 선언과, `getSearchResult` 안의 호출부를 함께 고친다. `getSearchResult`는 웰니스와 무관하므로 `null`을 넘긴다.

```java
        return Flux.fromIterable(documents)
                .flatMap(document -> toPlaceSummary(document, null), 8)
```

`buildDto`가 `document.getCategoryName().split(">")` 결과의 `[1]`을 무조건 읽는다. 표 C 검색어는 v1보다 카테고리가 다양해서 `>`가 없는 값이 들어올 확률이 올라간다. 이 기회에 방어한다.

```java
    private PlaceSummaryDto buildDto(KakaoPlaceResponseDto.Document document, String photoUri) {
        String raw = document.getCategoryName() == null ? "" : document.getCategoryName();
        String[] split = raw.split(">");
        String categoryName = split.length >= 2
                ? split[0].trim() + "· " + split[1].trim()
                : raw.trim();
        return PlaceSummaryDto.builder()
                .categoryName(categoryName)
                .placeName(document.getPlaceName())
                .placeImageUrl(photoUri)
                .x(document.getX())
                .y(document.getY())
                .build();
    }
```

- [ ] **Step 6: Write RecommendServiceImpl**

```java
package com.begae.backend.place.service;

import com.begae.backend.global.exception.CustomException;
import com.begae.backend.place.client.WellnessApiClient;
import com.begae.backend.place.component.*;
import com.begae.backend.place.dto.*;
import com.begae.backend.place.exception.PlaceErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecommendServiceImpl implements RecommendService {

    private static final DateTimeFormatter SURVEY_TIME = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
    private static final int WELLNESS_MATCH_RADIUS_M = 1000;

    @Value("${anthropic-api.api-key}")
    private String anthropicApiKey;

    private final SurveySearchPolicy searchPolicy;
    private final WellnessApiClient wellnessApiClient;
    private final WellnessMatcher wellnessMatcher;
    private final CandidateMerger candidateMerger;
    private final AiSelectionValidator selectionValidator;
    private final PlaceService placeService;
    private final PromptRegistry promptRegistry;
    private final ObjectMapper objectMapper;

    @Override
    public RecommendResponseDto recommend(SurveyResultDto survey) {
        int totalHours = totalHours(survey);
        double x = survey.getLocation().getX();
        double y = survey.getLocation().getY();
        int radiusM = searchPolicy.radiusMeters(survey.getTransport(), totalHours);

        List<PlaceCandidate> wellnessCandidates = collectWellness(x, y, radiusM);
        List<PlaceCandidate> kakaoCandidates = collectKakao(survey.getEmotion(), x, y, radiusM);
        List<PlaceCandidate> candidates = candidateMerger.merge(wellnessCandidates, kakaoCandidates);

        AiSelectionDto ai = callAi(toSurveyJson(survey), toCandidateList(candidates));
        List<AiSelectionDto.Selection> selections = selectionValidator.validate(ai, candidates.size());

        if (selections.isEmpty()) {
            throw new CustomException(PlaceErrorCode.RECOMMEND_NO_RESULT);
        }

        List<RecommendResponseDto.Item> items = new ArrayList<>();
        for (AiSelectionDto.Selection s : selections) {
            PlaceCandidate picked = candidates.get(s.getIndex());
            SearchPlaceResponseDto enriched =
                    placeService.enrichAndUpsert(picked.getDocument(), picked.getWellnessContentId());
            items.add(RecommendResponseDto.Item.builder()
                    .order(s.getOrder())
                    .placeId(enriched.getPlaceId())
                    .placeName(enriched.getPlaceName())
                    .categoryName(enriched.getCategoryName())
                    .placeImageUrl(enriched.getPlaceImageUrl())
                    .roadAddressName(picked.getDocument().getRoadAddressName())
                    .x(enriched.getX())
                    .y(enriched.getY())
                    .stayMinutes(s.getStayMinutes())
                    .reason(s.getReason())
                    .tags(s.getTags())
                    .wellnessCertified(picked.isWellness())
                    .build());
        }

        return RecommendResponseDto.builder()
                .recommendId("rc_" + UUID.randomUUID().toString().substring(0, 8))
                .candidateCount(RecommendResponseDto.CandidateCount.builder()
                        .wellness(wellnessCandidates.size())
                        .kakao(candidates.size() - wellnessCandidates.size())
                        .build())
                .plan(toPlan(ai, totalHours, items.size()))
                .items(items)
                .build();
    }

    /**
     * 웰니스 장소를 카카오 POI로 되찾는다.
     * 정책상 웰니스 콘텐츠를 저장할 수 없으므로, 카카오에서 같은 장소를 찾지 못하면 후보에서 뺀다.
     */
    private List<PlaceCandidate> collectWellness(double x, double y, int radiusM) {
        List<PlaceCandidate> result = new ArrayList<>();
        for (WellnessPlaceDto w : wellnessApiClient.findNearby(x, y, radiusM)) {
            List<KakaoPlaceResponseDto.Document> found = placeService.searchRawByKeyword(
                    w.getTitle(), w.getX(), w.getY(), WELLNESS_MATCH_RADIUS_M);
            wellnessMatcher.nearest(w.getX(), w.getY(), found)
                    .ifPresentOrElse(
                            doc -> result.add(new PlaceCandidate(doc, w.getContentId())),
                            () -> log.info("웰니스 장소를 카카오에서 찾지 못해 제외한다: contentId={}, title={}",
                                    w.getContentId(), w.getTitle()));
        }
        return result;
    }

    private List<PlaceCandidate> collectKakao(String emotion, double x, double y, int radiusM) {
        List<PlaceCandidate> result = new ArrayList<>();
        for (String keyword : searchPolicy.keywordsFor(emotion)) {
            for (KakaoPlaceResponseDto.Document doc : placeService.searchRawByKeyword(keyword, x, y, radiusM)) {
                result.add(new PlaceCandidate(doc, null));
            }
        }
        return result;
    }

    private int totalHours(SurveyResultDto survey) {
        LocalDateTime start = LocalDateTime.parse(survey.getStartTime(), SURVEY_TIME);
        LocalDateTime end = LocalDateTime.parse(survey.getEndTime(), SURVEY_TIME);
        return (int) Math.max(1, Duration.between(start, end).toHours());
    }

    private RecommendResponseDto.Plan toPlan(AiSelectionDto ai, int totalHours, int itemCount) {
        AiSelectionDto.TravelPlan p = ai != null ? ai.getTravelPlan() : null;
        return RecommendResponseDto.Plan.builder()
                .totalHours(p != null && p.getTotalHours() > 0 ? p.getTotalHours() : totalHours)
                .estimatedPlaceCount(itemCount)
                .reasoning(p != null ? p.getReasoning() : null)
                .build();
    }

    private String toCandidateList(List<PlaceCandidate> candidates) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < candidates.size(); i++) {
            PlaceCandidate c = candidates.get(i);
            sb.append("[").append(i).append("] ");
            if (c.isWellness()) sb.append("[WELLNESS] ");
            sb.append(c.getDocument().getPlaceName())
              .append(" | ").append(c.getDocument().getCategoryName())
              .append(" | ").append(c.getDocument().getRoadAddressName())
              .append("\n");
        }
        return sb.toString();
    }

    String toSurveyJson(SurveyResultDto survey) {
        try {
            return objectMapper.writeValueAsString(survey);
        } catch (JsonProcessingException e) {
            log.error("설문 직렬화 실패", e);
            throw new CustomException(GlobalErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    // Task 8에서 PlaceServiceImpl의 Anthropic 호출 코드를 옮겨 채운다.
    // 이 태스크의 테스트는 callAi를 spy로 가로채므로 아직 비어 있어도 통과한다.
    AiSelectionDto callAi(String surveyJson, String candidateList) {
        throw new UnsupportedOperationException("Task 8에서 구현한다");
    }
}
```

`RecommendService` 인터페이스:

```java
package com.begae.backend.place.service;

import com.begae.backend.place.dto.RecommendResponseDto;
import com.begae.backend.place.dto.SurveyResultDto;

public interface RecommendService {
    RecommendResponseDto recommend(SurveyResultDto survey);
}
```

> `callAi`만 Task 8로 미룬다. 테스트가 `spy`로 가로채므로 이 시점에 미구현 본문이어도 통과한다. Task 8 Step 1에서 실제 구현으로 교체하며, 그때 생성자는 바뀌지 않는다(`promptRegistry`·`objectMapper`·`anthropicApiKey`를 이미 갖고 있다).

- [ ] **Step 7: Run test to verify it passes**

Run: `cd backend && ./gradlew test --tests 'com.begae.backend.place.service.RecommendServiceImplTest'`
Expected: PASS (5 tests)

- [ ] **Step 8: Commit**

```bash
git add backend/src/main/java/com/begae/backend/place/dto/RecommendResponseDto.java \
        backend/src/main/java/com/begae/backend/place/exception/PlaceErrorCode.java \
        backend/src/main/java/com/begae/backend/place/service/RecommendService.java \
        backend/src/main/java/com/begae/backend/place/service/RecommendServiceImpl.java \
        backend/src/main/java/com/begae/backend/place/service/PlaceService.java \
        backend/src/main/java/com/begae/backend/place/service/PlaceServiceImpl.java \
        backend/src/test/java/com/begae/backend/place/service/RecommendServiceImplTest.java
git commit -m "feat: 웰니스 우선 추천 오케스트레이션 서비스 추가"
```

---

### Task 8: AI 호출 이관과 컨트롤러 교체

`PlaceServiceImpl`에 남아 있는 Anthropic 호출을 새 계약으로 옮기고, 컨트롤러를 v2 응답으로 바꾼다. v1 잔재를 지운다.

**Files:**
- Modify: `backend/src/main/java/com/begae/backend/place/service/RecommendServiceImpl.java`
- Modify: `backend/src/main/java/com/begae/backend/place/service/PlaceService.java`
- Modify: `backend/src/main/java/com/begae/backend/place/service/PlaceServiceImpl.java`
- Modify: `backend/src/main/java/com/begae/backend/place/controller/PlaceController.java`
- Delete: `backend/src/main/java/com/begae/backend/place/dto/RecommendKeywordDto.java`

**Interfaces:**
- Consumes: `RecommendService#recommend(SurveyResultDto)`
- Produces: `POST /api/place/recommend -> ResponseEntity<RecommendResponseDto>`

- [ ] **Step 1: `callAi`를 실제 구현으로 채운다**

`PlaceServiceImpl.generateKeyword`의 Anthropic 호출 코드를 `RecommendServiceImpl`로 옮긴다. `promptRegistry`·`objectMapper`·`anthropicApiKey`는 Task 7에서 이미 주입되어 있으므로 **생성자는 건드리지 않는다.** Task 7의 미구현 `callAi` 본문만 아래로 교체한다.

```java
    AiSelectionDto callAi(String surveyJson, String candidateList) {
        AnthropicClient client = AnthropicOkHttpClient.builder()
                .apiKey(anthropicApiKey)
                .timeout(Duration.ofMinutes(1))
                .build();

        String userPrompt = promptRegistry.getUserTemplate()
                .replace("{{SURVEY_JSON}}", surveyJson)
                .replace("{{CANDIDATES}}", candidateList);

        MessageCreateParams params = MessageCreateParams.builder()
                .model("claude-sonnet-4-5-20250929")
                .maxTokens(1500)
                .system(promptRegistry.getSystemPrompt())
                .addUserMessage(userPrompt)
                .build();

        Message message = client.messages().create(params);

        String content = message.content().getFirst().asText().text()
                .replaceAll("```json\\n", "")
                .replaceAll("```", "")
                .trim();

        try {
            return objectMapper.readValue(content, AiSelectionDto.class);
        } catch (JsonProcessingException e) {
            log.error("AI 응답 파싱 실패: {}", content, e);
            throw new CustomException(GlobalErrorCode.INTERNAL_SERVER_ERROR);
        }
    }
```

`maxTokens`를 1000에서 1500으로 올린 이유: 선택 결과에 `reason`과 `tags`가 항목마다 붙어 v1보다 출력이 길다.

`RecommendServiceImpl`에 import를 추가한다.

```java
import com.anthropic.client.AnthropicClient;
import com.anthropic.client.okhttp.AnthropicOkHttpClient;
import com.anthropic.models.messages.Message;
import com.anthropic.models.messages.MessageCreateParams;
```

- [ ] **Step 2: `PlaceService`에서 v1 전용 메서드를 제거한다**

인터페이스와 구현에서 아래를 지운다.

- `RecommendKeywordDto generateKeyword(SurveyResultDto survey)`
- `List<SearchPlaceResponseDto> searchPlaceForRecommend(SearchPlaceRequestDto request)` — `searchRawByKeyword`로 대체됨. 다른 호출부가 없는지 `grep -rn "searchPlaceForRecommend" backend/src`로 확인 후 제거한다.

- [ ] **Step 3: 컨트롤러를 교체한다**

`PlaceController`의 `recommendPlace`를 아래로 바꾼다. `placeService` 대신 `recommendService`를 주입받는다.

```java
    @PostMapping("/recommend")
    @Operation(summary = "장소 추천 (v2)",
               description = "설문 결과로 웰니스 인증 장소와 카카오 장소를 모아 AI가 코스를 구성한다. "
                           + "웰니스 인증 장소는 wellnessCertified=true로 내려간다.")
    @ApiResponse(responseCode = "200", description = "추천 코스가 성공적으로 생성되었습니다.")
    @ApiResponse(responseCode = "422", description = "추천할 만한 장소를 찾지 못했습니다.")
    public ResponseEntity<RecommendResponseDto> recommendPlace(
            @Parameter(hidden = true) @AuthenticationPrincipal OauthUserDetails user,
            @RequestBody SurveyResultDto survey
    ) {
        return ResponseEntity.ok(recommendService.recommend(survey));
    }
```

`throws JsonProcessingException`이 사라지므로 시그니처에서 제거하고, 쓰이지 않게 된 import(`JsonProcessingException`, `RecommendPlaceResponseDto`, `SearchPlaceRequestDto`)를 정리한다.

- [ ] **Step 4: v1 DTO를 삭제한다**

```bash
rm backend/src/main/java/com/begae/backend/place/dto/RecommendKeywordDto.java
grep -rn "RecommendKeywordDto\|RecommendPlaceResponseDto" backend/src
```

`RecommendPlaceResponseDto`도 참조가 없으면 함께 지운다.

- [ ] **Step 5: 전체 빌드와 신규 테스트를 돌린다**

Run: `cd backend && ./gradlew compileJava compileTestJava`
Expected: BUILD SUCCESSFUL

Run:
```bash
cd backend && ./gradlew test \
  --tests 'com.begae.backend.place.component.*' \
  --tests 'com.begae.backend.place.client.*' \
  --tests 'com.begae.backend.place.dto.*' \
  --tests 'com.begae.backend.place.service.*'
```
Expected: 전부 PASS (32 tests)

> `./gradlew test`를 인자 없이 돌리면 `BackendApplicationTests`가 MySQL·Redis를 찾다가 실패한다. 이는 이 작업으로 생긴 문제가 아니다.

- [ ] **Step 6: 실제 호출로 확인한다**

`.env`에 `TOUR_API_KEY`가 있는 상태에서 앱을 띄우고 Swagger(`/swagger-ui.html`)에서 `POST /api/place/recommend`를 호출한다. 웰니스 인증 장소가 실제로 있는 좌표를 써야 배지를 확인할 수 있다.

```json
{
  "emotion": "그냥 기운이 없고 지쳤어요",
  "startTime": "2026-08-20 10:00",
  "endTime": "2026-08-20 18:00",
  "transport": "자가용",
  "transportTime": "상관없어요",
  "location": { "x": 127.0812, "y": 37.5372 }
}
```

확인 항목:
- `items[].wellnessCertified`가 `true`인 항목이 하나 이상 있고 그 항목의 `order`가 앞쪽인가
- `candidateCount.wellness`가 0이 아닌가
- DB에서 `SELECT place_id, place_name, source, wellness_content_id FROM place WHERE wellness_content_id IS NOT NULL;` 결과에 **웰니스 이름·주소가 아니라 카카오 값이 들어 있고** `wellness_content_id`만 웰니스 값인가
- 좌표를 동해 먼바다(`x: 131.0, y: 37.0`)로 바꾸면 `candidateCount.wellness`가 0이고 모든 `wellnessCertified`가 `false`인가

- [ ] **Step 7: Commit**

```bash
git add -A backend/src/main/java/com/begae/backend/place/
git commit -m "feat: 추천 API를 v2 응답 계약으로 교체하고 v1 잔재 제거"
```

---

## Self-Review

**스펙 커버리지**

| 스펙 절 | 담당 태스크 |
|---|---|
| 1. 파이프라인 | Task 7 |
| 2. 요청 (`transportTime`) | Task 5 Step 1 |
| 3. 응답 스키마 | Task 7 Step 1 |
| 3. 에러 코드 422 | Task 7 Step 2, Task 7 테스트 |
| 3. 웰니스 실패 degrade | Task 3 (클라이언트 내부), Task 7 테스트 |
| 4. 웰니스 API 연동 | Task 3 |
| 4. `items=""` 0건 처리 | Task 3 Step 2 테스트 |
| 5. 표 C | Task 1 |
| 6. 매칭 규칙 150m | Task 2, Task 7 `collectWellness` |
| 7. DB 변경 | Task 6 |
| 8. 리팩터링 항목 | Task 5·6·8 |
| 9. 프론트 매핑 | 백엔드 범위 밖(응답 필드로 충족) |

**미커버 항목**: 없음.

**타입 일관성 확인**
- `PlaceCandidate(document, wellnessContentId)` 생성자 — Task 4에서 정의, Task 7에서 동일 순서로 사용
- `placeService.searchRawByKeyword(String, double, double, int)` — Task 7 Step 5에서 정의, Task 7 테스트·`collectWellness`·`collectKakao`에서 동일 시그니처
- `placeService.enrichAndUpsert(Document, String)` — Task 7 Step 5에서 정의, 동일하게 사용
- `PlaceUpsertCommand.fromKakao(Document, PlaceSummaryDto, String)` — Task 6에서 정의, Task 6 Step 7·Task 7 Step 5에서 사용
- `AiSelectionValidator.validate(AiSelectionDto, int)` — Task 5에서 정의, Task 7에서 사용
- `WellnessMatcher.nearest(double, double, List<Document>)` — Task 2에서 정의, Task 7에서 사용

**알려진 위험**
- `PlaceServiceImpl`의 `searchRawByKeyword` / `enrichAndUpsert` 추출은 기존 `searchPlaceForRecommend` / `toPlaceSummary`를 쪼개는 작업이라 Task 7에서 가장 손이 많이 간다. 리팩터링 전후로 `./gradlew compileJava`를 자주 돌린다.
- 웰니스↔카카오 매칭 실패율은 미측정이다. Task 8 Step 6에서 로그(`웰니스 장소를 카카오에서 찾지 못해 제외한다`) 빈도를 보고 `MATCH_THRESHOLD_M`을 조정한다.
- 표 C는 제안값이다. 기획 확정 표가 나오면 `SurveySearchPolicy.KEYWORDS`와 스펙 5절을 함께 고친다.
- Task 6의 마이그레이션은 `DROP INDEX uk_place_source` 후 복합 유니크로 재생성한다. `place` 행이 많은 환경에서는 테이블 락이 걸린다. 운영 반영 시점을 트래픽이 적은 때로 잡는다.
- Task 6 적용 후 롤백하려면 역방향 마이그레이션이 필요하다. Flyway `undo`는 커뮤니티 버전에서 지원되지 않으므로, 되돌릴 일이 생기면 수동 DDL을 써야 한다.
