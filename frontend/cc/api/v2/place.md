# PLACE-16 (v2). 설문 바탕 장소 추천 — 웰니스 우선 개편

> v1 대비 파이프라인이 반대로 뒤집힌다. v1은 **AI가 검색 키워드를 만들고** 카카오로 찾았다.
> v2는 **웰니스 공공 API와 카카오에서 후보를 먼저 모으고, AI가 그 중에서 고르고 순서를 짠다.**
> v1 명세: [../v1/place.md](../v1/place.md) PLACE-16

## URL : POST /api/place/recommend

엔드포인트와 요청 스키마는 v1과 동일하다. **응답 스키마만 바뀐다.**
현재 프론트는 이 API를 호출하지 않고 `RECOMMENDED_PLACES` mock을 쓰므로(`CourseCreationFlow.tsx:934`) 파괴적 변경의 영향 범위가 없다.

---

## 1. 파이프라인

```
설문(emotion, 시간, transport, 좌표)
 │
 ├─ (A) 웰니스 공공 API locationBasedList 1콜 → 웰니스 N건 (실측 0~6건)
 │       └ 각 건의 title + 좌표로 카카오 키워드 검색 → 같은 장소의 카카오 POI 확보
 │         → 후보 풀에 [웰니스] 태그를 달아 우선 편입
 │
 └─ (B) 표 C 검색어로 카카오 로컬 검색 → 일반 후보 M건
        │
        ▼
   병합 · 카카오 place id 기준 중복 제거 (중복 시 웰니스 쪽 채택)
        │
        ▼
   AI 1콜 — 후보 중 선택 + 순서 + 이유 (웰니스 태그 우선 지시)
        │
        ▼
   선택된 4~5곳만 Google 사진 조회 + place upsert (+ wellness_content_id)
        │
        ▼
   응답
```

### 설계 근거

**왜 웰니스를 "메인 후보 풀"이 아니라 "우선 가산점 소스"로 두는가**
웰니스 공공 API의 전국 데이터가 **169건이 전부다**(2026-08-19 실측). 좌표 기반 조회 결과:

| 좌표 | 반경 20km(API 상한) |
|---|---|
| 서울시청 | 6건 |
| 서울시청 (반경 5km) | 1건 |
| 강릉 (v1 명세 설문 예시 좌표) | 1건 |
| 부산 서면 | 3건 |
| 제주시청 | 1건 |
| 대전시청 | 2건 |
| 안동 | 1건 |

도보 반경(500~2000m)에서는 전국 어디서도 사실상 0건이다. 웰니스만으로 코스를 구성하는 것은 불가능하므로, 카카오 결과와 병합하되 **웰니스 매칭 장소를 AI 선택 단계에서 우선**시킨다.

**왜 웰니스 장소를 카카오로 되찾는가**
공공데이터 이용 정책상 웰니스 콘텐츠를 자체 DB에 적재할 수 없고 **식별자만 저장 가능**하다. `place` 행을 만들려면 이름·주소·좌표·이미지가 필요하므로 이는 카카오+Google 출처로 채우고, 웰니스에서는 `contentId`만 가져와 붙인다. 되찾기 과정이 동시에 우선 편입의 수단이 된다.

**왜 AI 호출이 1회인가**
표 C 검색어를 폴백 전용이 아니라 **상시 카카오 검색어**로 사용한다. v1처럼 AI가 키워드를 먼저 생성하면 AI 호출이 2회가 된다.

**왜 후보 전체가 아니라 선택된 것만 enrich 하는가**
v1의 `getSearchResult`는 검색 결과 **전건**에 `toPlaceSummary`(Google 텍스트검색 + 사진 미디어 = 2콜) + DB upsert를 돌린다. 후보 20~30건에 그대로 적용하면 외부 호출이 40~60회가 된다. AI 선택 이후로 미룬다.

---

## 2. 요청 (v1과 동일)

| 이름 | 유형 | 필수 | 설명 |
|---|---|---|---|
| emotion | String | O | 마음 상태 (Survey 1 `mindState`) |
| startTime | DateTime | O | `yyyy-MM-dd HH:mm` |
| endTime | DateTime | O | 당일치기 24시간 이내 |
| transport | String | O | `도보` / `대중교통` / `자가용` |
| transportTime | String | X | `1시간 이내` / `상관없어요` / 30분 단위 직접 입력 |
| location | Object | O | 출발지 좌표 `{ x: 경도, y: 위도 }` |

> `SurveyResultDto`에 `transportTime` 필드가 없다(v1 명세에는 존재). v2에서 추가한다.

```json
{
  "emotion": "마음이 좀 울적하고 속상해요",
  "startTime": "2026-08-20 15:00",
  "endTime": "2026-08-20 22:00",
  "transport": "도보",
  "transportTime": "1시간 이내",
  "location": { "x": 127.0812, "y": 37.5372 }
}
```

---

## 3. 응답

### 스키마

```json
{
  "recommendId": "rc_8f3a91c2",
  "candidateCount": { "wellness": 6, "kakao": 24 },
  "plan": {
    "totalHours": 7,
    "estimatedPlaceCount": 4,
    "reasoning": "울적할 땐 몸을 데운 뒤 조용한 실내에서 마무리하는 흐름이 좋아요"
  },
  "items": [
    {
      "order": 1,
      "placeId": 165,
      "placeName": "우리유황온천",
      "categoryName": "관광,명소 · 온천,사우나",
      "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/...",
      "roadAddressName": "서울 광진구 자양로5길 33",
      "x": 127.0812,
      "y": 37.5372,
      "stayMinutes": 90,
      "reason": "따뜻한 물에 몸을 담그면 굳은 마음이 먼저 풀려요",
      "tags": ["#온천", "#몸풀기"],
      "wellnessCertified": true
    },
    {
      "order": 2,
      "placeId": 402,
      "placeName": "밀도 서울숲점",
      "categoryName": "음식점 · 카페",
      "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/...",
      "roadAddressName": "서울 성동구 왕십리로 82",
      "x": 127.0442,
      "y": 37.5445,
      "stayMinutes": 60,
      "reason": "따뜻한 차 한 잔으로 생각을 정리하기 좋아요",
      "tags": ["#조용함", "#창가"],
      "wellnessCertified": false
    }
  ]
}
```

### 필드

| 필드 | 타입 | 설명 |
|---|---|---|
| `recommendId` | String | 재추천·AI 응답 로그 추적용 |
| `candidateCount.wellness` | Integer | 웰니스 API가 반환한 후보 수 (매칭 실패 제외 전) |
| `candidateCount.kakao` | Integer | 카카오 검색 후보 수 (중복 제거 후) |
| `plan.totalHours` | Integer | startTime~endTime 총 가용 시간 |
| `plan.estimatedPlaceCount` | Integer | AI가 판단한 방문 가능 장소 수 |
| `plan.reasoning` | String | 코스 구성 이유 1문장 |
| `items[].order` | Integer | 1부터 시작하는 방문 순서 |
| `items[].placeId` | Integer | 자체 DB placeId. 장소 상세·좋아요·스크랩에 그대로 사용 |
| `items[].stayMinutes` | Integer | 추천 체류 시간(분). **숫자** — 문자열 파싱 불필요 |
| `items[].reason` | String | 이 장소를 고른 이유. 40자 이내 |
| `items[].tags` | String[] | AI 생성 태그 0~3개 |
| `items[].wellnessCertified` | Boolean | 힐링 인증 배지 노출 여부 |

`placeName`, `categoryName`, `placeImageUrl`, `roadAddressName`, `x`, `y`는 v1 `places[]` 항목과 동일한 의미·타입이다.

### 설계 결정 기록

- **최상위를 배열이 아닌 객체로 둔다.** v1은 최상위가 배열이라 `plan`, `candidateCount` 같은 리스트 밖 정보를 실을 자리가 없었다.
- **`keyword` 그룹핑을 제거한다.** v2에는 키워드 그룹이라는 개념이 없고, `order`가 그룹 경계를 넘나들 수 있어 그룹 구조는 오버헤드다.
- **`source` / `fallback` 필드를 두지 않는다.** 병합 구조에서는 "웰니스 경로 vs 폴백 경로"라는 이분법이 성립하지 않는다. 배지 판정은 `items[].wellnessCertified`가 온전히 담당한다.
- **배지 판정은 백엔드가 확정해 boolean으로 내린다.** 프론트가 다른 필드로 추론하게 두면 규칙이 두 곳에 흩어진다.

### 응답 코드

| status | 조건 |
|---|---|
| 200 | 성공 |
| 400 | 필수 필드 누락 / 시간 형식 오류 / `startTime >= endTime` |
| 401 | 인증 필요 |
| 422 | AI 선택 후 유효 `items`가 0건 (UI는 "다시 하기" 안내) |
| 500 | 카카오 또는 AI 호출 실패 |

**웰니스 API 실패는 500이 아니다.** 타임아웃·장애 시 `candidateCount.wellness = 0`으로 degrade 하고 카카오 후보만으로 추천을 완성한다. 그 경우 모든 `wellnessCertified`가 `false`가 된다. 부가 소스의 장애가 추천 전체를 죽이면 안 된다.

---

## 4. 웰니스 공공 API 연동 (2026-08-19 실측)

```
GET https://apis.data.go.kr/B551011/WellnessTursmService/locationBasedList
    ?serviceKey={TOUR_API_KEY}
    &MobileOS=ETC&MobileApp=ilchul&_type=json
    &numOfRows={n}&pageNo=1
    &mapX={경도}&mapY={위도}&radius={m, 최대 20000}
    &langDivCd=KOR
```

- 오퍼레이션명에 숫자가 없다. `locationBasedList1` / `locationBasedList2`는 존재하지 않는다.
- **`langDivCd`는 필수.** 누락 시 `resultCode: "11"`. 값은 형식적이며 응답의 `langDivCd`는 항상 `KOR`이다.
- 사용 가능한 다른 오퍼레이션: `areaBasedList`, `searchKeyword`(keyword 필수), `detailCommon`(contentId 필수, `overview` 제공), `detailIntro`
- **코드 목록 API가 없다.** `wellnessThemaCode` / `areaCode` / `categoryCode` 모두 미제공 → 테마코드는 하드코딩해야 한다.
- 키는 `.env`의 `TOUR_API_KEY`로 옮기고 `WebClientConfig`에 `tourWebClient` 빈을 추가한다. (현재 리포 루트 `.tour-api` 파일에 보관, 권한 600, gitignore됨)

### 응답 필드 (locationBasedList, 19개)

```
contentId  contentTypeId  title  baseAddr  detailAddr  zipCd
mapX  mapY  dist  mlevel  orgImage  thumbImage  cpyrhtDivCd
lDongRegnCd  lDongSignguCd  wellnessThemaCd  langDivCd  regDt  mdfcnDt
```

이 중 v2가 사용하는 것은 **`contentId`, `title`, `mapX`, `mapY`** 뿐이다. 나머지는 저장하지 않는다.

### 데이터 품질 (169건 전수)

| 항목 | 실측 |
|---|---|
| `contentTypeId` | 전건 `"12"` (단일 타입) |
| `tel` | **169/169 전부 빈 값** |
| `orgImage` / `thumbImage` | 30건 없음 |
| `detailAddr` | 135건 없음 |
| `cpyrhtDivCd` | Type3 111건 / Type1 28건 / 빈값 30건 |

`cpyrhtDivCd` 빈값 30건은 이미지 없는 30건과 정확히 일치 → **이미지 저작권 유형 필드**다. 과반이 Type3(출처표시 + **변경금지**)이므로 이미지 리사이즈·가공 캐싱도 제약을 받는다. v2가 웰니스 이미지를 쓰지 않는 이유다.

### 테마 분포 (참고, 저장하지 않음)

| 코드 | 건수 | 성격 |
|---|---|---|
| EX050100 | 93 | 온천·유황온천 |
| EX050600 | 24 | 치유의숲 |
| EX050200 | 22 | 찜질·해수찜 |
| EX050500 | 11 | 호텔 스파 |
| EX050400 | 10 | 명상·요가·힐링센터 |
| EX050300 | 6 | 한방 |
| EX050700 | 3 | 생태탐방·해양치유 |

절반 이상이 온천·스파·찜질이다. 감정 기반 추천과 결이 다르므로 우선 편입은 하되 전체 코스를 웰니스로 채우려 하지 않는다.

---

## 5. 표 C — 감정별 카카오 검색어

`emotion` 값은 `CourseCreationFlow.tsx`의 `MIND_STATES` 7종과 정확히 일치한다.
**아래는 제안값이다. 기획 확정 표로 교체한다.**

| emotion | 카카오 검색어 |
|---|---|
| 그냥 기운이 없고 지쳤어요 | 온천, 사우나, 브런치카페, 공원 |
| 마음이 좀 울적하고 속상해요 | 카페, 산책로, 서점, 전망대 |
| 답답하고 짜증이 많아졌어요 | 등산로, 하천, 방탈출, 클라이밍 |
| 무기력하고 재미가 없어요 | 전시회, 체험공방, 보드게임카페, 시장 |
| 기분이 좋아요, 뭔가 하고 싶어요 | 맛집, 전시회, 산책로, 사진스팟 |
| 생각이 많아졌어요, 정리가 필요해요 | 서점, 북카페, 사찰, 도서관 |
| 아무 감정도 없이 멍한 느낌이에요 | 수목원, 미술관, 카페, 강변 |

- 검색어 4개 × 카카오 키워드 검색 = 요청당 카카오 호출 4회 (+ 웰니스 되찾기 N회)
- 반경은 `transport`로 산출한다. 도보 500~2000m / 대중교통·자전거 2000~5000m / 자가용 5000~15000m, 가용 시간에 비례
- `emotion`이 표에 없는 값이면 마지막 행("멍한 느낌")을 기본값으로 쓴다

---

## 6. 웰니스 ↔ 카카오 매칭 규칙

1. 웰니스 `title`로 카카오 키워드 검색 (`x`, `y`에 웰니스 `mapX`, `mapY`, `radius=1000`)
2. 결과 중 웰니스 좌표로부터 **150m 이내** 최근접 1건을 채택
3. 150m 이내 결과가 없으면 **그 웰니스 장소는 후보에서 제외**한다. place 행을 만들 카카오 출처 데이터가 없기 때문이다
4. 채택된 카카오 POI가 (B) 일반 후보에도 있으면 중복 제거하고 웰니스 태그를 유지한다

매칭 실패율은 실측 데이터가 없다. 구현 시 실패 건을 로그로 남기고 임계값 150m를 사후 조정한다.

---

## 7. DB 변경

```sql
-- V26xxxxxxxx__add_place_source_and_wellness.sql

-- 1) 출처 구분
ALTER TABLE `place` ADD COLUMN `source` VARCHAR(20) NOT NULL DEFAULT 'KAKAO';
ALTER TABLE `place` DROP INDEX `uk_place_source`;
ALTER TABLE `place` ADD UNIQUE KEY `uk_place_source` (`source`, `source_id`);

-- 2) 웰니스 식별자 (콘텐츠는 저장하지 않는다)
ALTER TABLE `place` ADD COLUMN `wellness_content_id` VARCHAR(20) NULL;
ALTER TABLE `place` ADD INDEX `idx_place_wellness` (`wellness_content_id`);
```

- **`wellness_content_id IS NOT NULL` 이 곧 배지 조건이다.** 별도 boolean 컬럼을 두지 않는다
- `wellnessThemaCd`는 저장하지 않는다. 배지는 "웰니스 인증" 단일 라벨로 간다
- `source` 컬럼은 이 설계에서 **방어적 성격**이다. 모든 place 행이 카카오 출처로 채워지므로 `source_id` 충돌은 원천적으로 발생하지 않는다. 다만 기존 `uk_place_source (source_id)` 단일 유니크는 출처가 늘어날 때 취약하므로 지금 정리해둔다
- 배지가 `place`에 붙으므로 장소 상세(PLACE-N1)·인기 장소·검색 결과에서도 동일하게 노출할 수 있다

---

## 8. 백엔드 리팩터링 항목

| 대상 | 변경 |
|---|---|
| `SurveyResultDto` | `transportTime` 필드 추가 |
| `RecommendKeywordDto` | 폐기 → 선택 결과 DTO로 교체 (후보 인덱스 + order + reason + stayMinutes + tags) |
| `prompts/SystemPrompt.txt`, `UserTemplate.txt` | 키워드 생성 → 후보 선별·순서·이유. 웰니스 태그 우선 지시 |
| `PlaceServiceImpl.upsertPlaceFrom`, `Place.mergeFrom` | `KakaoPlaceResponseDto.Document` 강결합 해소 (출처 중립 입력 타입) |
| `PlaceServiceImpl.getSearchResult` | 전건 enrich → AI 선택 이후로 이동 |
| `WebClientConfig` | `tourWebClient` 빈 추가 |
| `PlaceController.recommendPlace` | 새 응답 DTO, 422 처리, Swagger 어노테이션 |

**AI 응답 검증**: 후보에 없는 인덱스를 반환하면 해당 항목을 drop 한다. 남은 항목이 0건이면 422.

---

## 9. 프론트 카드 필드 매핑

`CourseCreationFlow.tsx`의 `placeSelect` / `placeDetail` 카드 기준.

| 카드 표시 | 현재 mock (`Place`) | v2 응답 |
|---|---|---|
| 카테고리 뱃지 | `category` | `items[].categoryName` |
| 장소명 | `name` | `items[].placeName` |
| 설명문 | `description` | **`items[].reason`** |
| 추천 체류 | `time` (`"60분"` 문자열) | **`items[].stayMinutes`** (숫자) |
| 이미지 | `image` | `items[].placeImageUrl` |
| 주소 | `address` | `items[].roadAddressName` |
| 태그 | `tags` | `items[].tags` |
| 전화번호 | `phone` | 없음 — 장소 상세(PLACE-N1)에서 조회 |
| 방문 순서 | 없음 | `items[].order` |
| 힐링 인증 배지 | 없음 | **`items[].wellnessCertified`** |

### 주의: `wellnessCertified`와 `isVerified`는 다른 개념이다

| 필드 | 의미 | 위치 |
|---|---|---|
| `isVerified` / `verifiedImage` | 사용자가 현장에서 사진 찍어 **방문 인증**한 상태 | `StopSchema` (`shared/types/index.ts:11`), 백엔드는 `plan_place.is_stamped` |
| `wellnessCertified` | 한국관광공사 **웰니스 인증 장소**인지 (출처 표시) | v2 응답 신규 |

`isVerified`를 재사용하면 검색의 "인증된 플랜" 필터(`SearchResultsPage.tsx:255`)와 마이코스 진행률(`MyCourseDetailPage.tsx:141`)이 오염된다. 반드시 별도 필드로 둔다.

### 배지 노출 빈도에 대한 사전 공유

웰니스 데이터가 전국 169건이므로 (서울 7곳, 강릉 1곳 수준) **배지가 붙은 카드는 드물게 나타난다.** 배지 없는 상태를 기본으로 두고 UI를 설계한다.
