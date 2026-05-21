# SEARCH-1. 통합 검색 (장소 + 코스)
## URL : GET /api/search

> [SearchPage](../../src/features/search/components/SearchPage.tsx) 자동완성 + [SearchResultsPage](../../src/features/search/components/SearchResultsPage.tsx) 결과. 현재는 클라이언트가 mock 데이터를 필터링 중. 본 API로 대체 필요.

### 쿼리 파라미터

| **이름** | **유형** | **필수/선택** | **설명** |
| --- | --- | --- | --- |
| q | String | 필수 | 검색어 (장소명/지역명/코스 제목/태그) |
| type | String | 선택 | `all` / `plans` / `places` (기본 `all`, SearchResultsPage 탭에 대응) |
| verifiedOnly | Boolean | 선택 | 검증된 코스만 (기본 false, type=plans 일 때 유효) |
| sort | String | 선택 | `likes` / `recent` (기본 `likes`) |
| page | Integer | 선택 | 페이지 번호 (기본 1) |
| size | Integer | 선택 | 페이지 크기 (기본 20) |

### 응답 코드

| status | message |
| --- | --- |
| 200 | 성공 |
| 400 | 요청 데이터 오류 (q 누락 또는 길이 0) |
| 422 | 검색어 너무 짧음 (최소 2자) |

## 코드 예시

### 요청

```jsx
GET /api/search?q=성수&type=all&sort=likes
```

### 응답

```java
{
    "status": 200,
    "places": [
        {
            "placeId": 1,
            "placeName": "성수 카페거리",
            "categoryName": "카페",
            "placeImageUrl": "https://images.unsplash.com/photo-1692103675608-6e635afa077b?...",
            "roadAddressName": "서울 성동구 성수이로 18길",
            "likeCount": 2340
        }
    ],
    "plans": [
        {
            "planId": 1,
            "planTitle": "성수동 힙플레이스 완전 정복",
            "thumbnailUrl": "https://images.unsplash.com/photo-1692103675608-6e635afa077b?...",
            "userNickname": "힙스터김",
            "location": "서울 성동구",
            "duration": "4시간",
            "tags": ["#카페투어", "#팝업스토어"],
            "isVerified": true,
            "likeCount": 124,
            "stopCount": 3
        }
    ],
    "totalPlaces": 1,
    "totalPlans": 1,
    "hasNext": false
}
```

# SEARCH-2. 검색 자동완성
## URL : GET /api/search/autocomplete

> `SearchPage`의 200ms 디바운스 입력에 따라 호출. 현재 클라이언트에서 mock 필터링 중. 장소 3건 + 코스 3건의 짧은 목록만 반환.

### 쿼리 파라미터

| **이름** | **유형** | **필수/선택** | **설명** |
| --- | --- | --- | --- |
| q | String | 필수 | 검색어 (최소 1자) |
| limit | Integer | 선택 | 종류별 최대 개수 (기본 3) |

### 응답 코드

| status | message |
| --- | --- |
| 200 | 성공 |
| 400 | 요청 데이터 오류 (q 누락) |

## 코드 예시

### 요청

```jsx
GET /api/search/autocomplete?q=성수&limit=3
```

### 응답

```java
{
    "status": 200,
    "places": [
        {
            "placeId": 1,
            "placeName": "성수 카페거리",
            "categoryName": "카페",
            "location": "서울 성동구"
        }
    ],
    "plans": [
        {
            "planId": 1,
            "planTitle": "성수동 힙플레이스 완전 정복",
            "stopCount": 3,
            "userNickname": "힙스터김"
        }
    ]
}
```

# SEARCH-3. 인기 검색 키워드
## URL : GET /api/search/trending

> `SearchPage`의 [POPULAR_KEYWORDS](../../src/shared/data/mockData.ts) 영역에 표시. 시간대별 인기 키워드.

### 쿼리 파라미터

| **이름** | **유형** | **필수/선택** | **설명** |
| --- | --- | --- | --- |
| limit | Integer | 선택 | 반환 개수 (기본 5) |

### 응답 코드

| status | message |
| --- | --- |
| 200 | 성공 |

## 코드 예시

### 응답

```java
{
    "status": 200,
    "data": [
        { "rank": 1, "keyword": "강릉 바다", "trend": "up" },
        { "rank": 2, "keyword": "성수동 카페", "trend": "same" },
        { "rank": 3, "keyword": "전주 한옥", "trend": "down" },
        { "rank": 4, "keyword": "부산 힐링", "trend": "up" },
        { "rank": 5, "keyword": "제주 당일치기", "trend": "new" }
    ],
    "updatedAt": "2026-05-06T12:00:00Z"
}
```
