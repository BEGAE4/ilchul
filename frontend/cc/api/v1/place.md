# PLACE-4. 장소 검색
## URL : GET /api/place/search?keyword={keyword}

> 1차로 자체 DB에서 검색하고, 0건이면 백엔드가 Kakao Local 키워드 검색(1-5)을 호출해 외부 결과를 가공·적재 후 반환한다. 외부 fallback이 동작한 경우 응답 항목에 `source: "kakao"` 플래그를 함께 내려 클라이언트가 신규 placeId임을 인지하도록 한다. 직접 외부 POI를 가공하지 않고 raw 결과만 보고 싶다면 PLACE-N9를 사용.

### 본문 파라미터

| **이름** | **유형** | **필수/선택** | **설명** |
| --- | --- | --- | --- |
| keyword | query parameter | O | 검색할 키워드 (장소명/지역명/카테고리). `SearchPage` 자동완성 입력값 또는 `/search/results?q=` 쿼리 |
| limit | query parameter | X | 반환 개수 (기본 20, 자동완성 드롭다운은 상위 3건만 사용) |

### 응답 코드

| status | message |
| --- | --- |
| 200 | 성공 |
| 400 | 요청 데이터 오류 (keyword 누락 또는 길이 0) |
| 500 | 외부 검색 API 호출 실패 |

## 코드 예시

### 요청

```jsx
{
	get 요청 url 예시 -> http://localhost:8080/api/place/search?keyword=강남역근처초밥
}
```

### 응답

```java
[
    {
        "placeId": 374,
        "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AL8-SNFL...",
        "categoryName": "음식점 · 일식",
        "placeName": "갓덴스시 강남점",
        "roadAddressName": "서울 강남구 강남대로 390",
        "likeCount": 1240
    },
    {
        "placeId": 375,
        "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AL8-SNHA...",
        "categoryName": "음식점 · 일식",
        "placeName": "고메스시",
        "roadAddressName": "서울 강남구 테헤란로 5길 12",
        "likeCount": 980
    },
    {
        "placeId": 381,
        "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AL8-SNFz...",
        "categoryName": "음식점 · 일식",
        "placeName": "은행골 강남역점",
        "roadAddressName": "서울 강남구 테헤란로 8길 21",
        "likeCount": 850
    },
    {
        "placeId": 378,
        "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AL8-SNEh...",
        "categoryName": "음식점 · 일식",
        "placeName": "스시이안앤 강남역점",
        "roadAddressName": "서울 강남구 강남대로 358",
        "likeCount": 720
    },
    {
        "placeId": 379,
        "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AL8-SNHg...",
        "categoryName": "음식점 · 일식",
        "placeName": "오마카세 오사이초밥 강남역점",
        "roadAddressName": "서울 강남구 봉은사로 4길 18",
        "likeCount": 615
    }
]
```



# PLACE-16. 설문 바탕 장소 추천
## URL : POST /api/place/recommend
### 본문 파라미터

| **이름** | **유형** | **필수/선택** | **설명** |
| --- | --- | --- | --- |
| emotion | String | 필수 | 사용자가 선택/입력한 마음 상태 (`CourseCreationFlow` Survey 1 `mindState`) |
| startTime | DateTime | 필수 | 여행 시작 일시 (`startDate` + `startTime`, 형식 `yyyy-MM-dd HH:mm`) |
| endTime | DateTime | 필수 | 여행 종료 일시 (`endDate` + `endTime`, 24시간 이내 당일치기) |
| transport | String | 필수 | 이동 수단 (`도보` / `대중교통` / `자가용`) |
| transportTime | String | 선택 | 희망 이동 시간 (`1시간 이내` / `상관없어요` / 30분 단위 직접 입력) |
| location | Object | 필수 | 출발지 좌표 (`startingPoint.coord` — `{ x: 경도, y: 위도 }`) |

### 응답 코드

| status | message |
| --- | --- |
| 200 | 성공 |
| 400 | 요청 데이터 오류 (필수 필드 누락 / 시간 형식 오류 / startTime ≥ endTime) |
| 401 | 인증 필요 |
| 422 | 추천 결과 없음 (모든 keyword 빈 배열 — UI는 다시 하기로 안내) |
| 500 | 외부 추천 엔진 호출 실패 |

## 코드 예시

### 요청

```jsx
{
    "emotion" : "마음이 좀 울적하고 속상해요",
    "startTime" : "2026-04-18 15:00",
    "endTime" : "2026-04-18 22:00",
    "transport" : "도보",
    "transportTime" : "1시간 이내",
    "location" : {
        "x" : 128.898981,
        "y" : 37.760152
    }
}
```

### 응답

```json
[
    {
        "keyword": "카페",
        "radiusM": 1500,
        "places": [
            {
                "placeId": 165,
                "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AJRVUZOU...",
                "categoryName": "음식점 · 카페",
                "placeName": "알뜨",
                "stayMinutes": 60,
                "x": 128.899802252991,
                "y": 37.7631911006287
            },
            {
                "placeId": 163,
                "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AJRVUZMo...",
                "categoryName": "음식점 · 카페",
                "placeName": "비사이드그라운드",
                "stayMinutes": 90,
                "x": 128.90304529019443,
                "y": 37.761153305137384
            }
        ]
    },
    {
        "keyword": "공원",
        "radiusM": 2000,
        "places": [
            {
                "placeId": 177,
                "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AJRVUZOa...",
                "categoryName": "여행 · 공원",
                "placeName": "말나눔터 공원",
                "stayMinutes": 60,
                "x": 128.895186645304,
                "y": 37.759298135914
            }
        ]
    },
    {
        "keyword": "전망좋은",
        "radiusM": 2000,
        "places": []
    }
]
```

# PLACE-19. 플랜에 장소 추가
## URL : POST api/plan-place/{planId}

### 본문 파라미터

| **이름** | **유형** | **필수/선택** | **설명** |
| --- | --- | --- | --- |
| placeId | Integer | 필수 | 추가할 장소의 placeId (`PlaceAddSheet`에서 선택한 BestPlace) |
| order | Integer | 필수 | 코스 내 플랜 장소 순서(1부터 시작). 신규 코스 생성 시 1, 기존 코스에 append 시 마지막 + 1 |

### 응답 코드

| status | message |
| --- | --- |
| 200 | 성공 |
| 400 | 요청 데이터 오류 (placeId/order 누락 또는 형식 오류) |
| 401 | 인증 필요 |
| 403 | 작성자 본인이 아님 |
| 404 | 플랜 또는 장소를 찾을 수 없음 |
| 409 | 동일 order 중복 또는 이미 추가된 장소 |

## 코드 예시

### 요청

```jsx
{
    "placeId" : 1,
    "order" : 3
}
```

### 응답

```java
{
    "planTitle": "성수 카페거리 여행",
    "planDescription": "성수 카페거리에서 시작하는 나만의 코스",
    "isPlanVisible": false,
    "totalDuration": 480,
    "places": [
        {
            "placeId": 300,
            "placeName": "교보문고 잠실점",
            "roadAddressName": "서울 송파구 올림픽로 269",
            "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AL8-SNFt...",
            "order": 1,
            "duration": 0
        },
        {
            "placeId": 301,
            "placeName": "교보문고 천호점",
            "roadAddressName": "서울 강동구 올림픽로 664",
            "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AL8-SNFs...",
            "order": 2,
            "duration": 18
        },
        {
            "placeId": 1,
            "placeName": "성수 카페거리",
            "roadAddressName": "서울 성동구 성수이로 18길",
            "placeImageUrl": "https://images.unsplash.com/photo-1692103675608-6e635afa077b?...",
            "order": 3,
            "duration": 29
        }
    ]
}
```

# PLACE-N1. 장소 상세 조회
## URL : GET /api/place/{placeId}

> `PlaceDetailPage` 진입 시 호출. 현재 UI는 카테고리별 fake detail에 의존하므로 본 API로 대체 필요.

### 본문 파라미터

| **이름** | **유형** | **필수/선택** | **설명** |
| --- | --- | --- | --- |
| placeId | path parameter | 필수 | 장소 ID |

### 응답 코드

| status | message |
| --- | --- |
| 200 | 성공 |
| 400 | 요청 데이터 오류 (placeId 형식 오류) |
| 404 | 장소를 찾을 수 없음 |

## 코드 예시

### 응답

```java
{
    "placeId": 165,
    "placeName": "알뜨",
    "categoryName": "음식점 · 카페",
    "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AJRVUZOU...",
    "roadAddressName": "강원 강릉시 율곡로 2729",
    "phoneNumber": "033-123-4567",
    "businessHours": "10:00 - 22:00",
    "description": "감성적인 인테리어와 특별한 음료로 유명한 카페입니다.",
    "tags": ["감성카페", "디저트 맛집", "포토스팟"],
    "x": 128.899802252991,
    "y": 37.7631911006287,
    "likeCount": 2340,
    "isLiked": false,
    "bookmarkCount": 412,
    "isBookmarked": false,
    "averageRating": 4.6,
    "reviewCount": 38,
    "mapMeta": {
        "provider": "naver",
        "center": { "x": 128.899802252991, "y": 37.7631911006287 },
        "zoom": 16,
        "markers": [
            { "x": 128.899802252991, "y": 37.7631911006287, "label": "알뜨" }
        ],
        "staticMapUrl": "https://naveropenapi.apigw.ntruss.com/map-static/v2/raster?w=600&h=400&center=128.899802,37.763191&level=16&markers=type:d|size:mid|pos:128.899802%2037.763191"
    }
}
```

### 응답 필드별 데이터 출처

> **원칙**: 외부 API 호출은 **백엔드 적재 파이프라인이 1회만** 수행하고 결과를 자체 DB에 저장한다. 사용자가 본 API를 호출하는 시점에는 외부 API 호출이 발생하지 않는다 (지도 렌더링용 Naver Maps SDK는 클라이언트가 직접 로드).

| 필드 | 데이터 종류 | 1순위 출처 | 보조 | 메모 |
| --- | --- | --- | --- | --- |
| `placeId` | 자체 식별자 | 자체 DB | — | 외부 무관 |
| `placeName` | POI 명칭 | Kakao Local 1-5 (키워드) | TMAP 4-2 / Google 3-1 | 국내 POI는 Kakao/TMAP 우위 |
| `categoryName` | 카테고리 (`음식점 · 카페` 포맷) | Kakao Local 1-5 `category_name` | TMAP 4-2 업종 | Kakao 카테고리 체계가 현재 응답 포맷과 일치 |
| `placeImageUrl` | 대표 이미지 | Google Places 3-4 (Place Photos) | 운영자 업로드 | 기존 `lh3.googleusercontent.com/place-photos` URL 사용 흔적 |
| `roadAddressName` | 도로명 주소 | Kakao Local 1-5 응답 동봉 | Kakao 1-3 (좌표→주소 재호출), TMAP 4-2 새주소, Naver 2-4 | 1-5 응답에 누락 시 1-3로 보강 |
| `phoneNumber` | 전화번호 | Kakao Local 1-5 | TMAP 4-2 / Google 3-1 `nationalPhoneNumber` | 셋 다 비면 운영자 입력 |
| `businessHours` | 영업시간 | Google Places 3-1 `regularOpeningHours` | 운영자 수동 입력 | Kakao/TMAP 미제공 → Google + 운영자 큐레이션 조합 |
| `description` | 장소 설명 | 운영자 수동 입력 | Google 3-1 `editorialSummary` / `generativeSummary` | AI 요약은 한글 품질 편차 큼 |
| `tags` | 큐레이션 태그 | 자체 운영자 / AI 분류기 | — | 외부 API에 1:1 매칭 필드 없음 |
| `x`, `y` | WGS84 좌표 | Kakao Local 1-5 | TMAP 4-2, Google 3-1 `location` | 적재 시 1회 |
| `likeCount`, `isLiked` | 자체 좋아요 집계 | 자체 DB (PLACE-N2) | — | 외부 무관 |
| `bookmarkCount`, `isBookmarked` | 자체 스크랩 집계 | 자체 DB (PLACE-N3) | — | 외부 무관 |
| `averageRating`, `reviewCount` | 자체 후기 집계 | 자체 DB (PLACE-N4) | (참고) Google 3-1 `rating` | 외부 평점 노출은 정책·라이선스 이슈로 비권장 |
| `mapMeta.provider` | 렌더링 벤더 | Naver Maps (고정) | Kakao Maps JS (대안) | 디자인 일관성·국내 정확도 |
| `mapMeta.center`, `markers` | 지도용 좌표 | 자체 DB의 `x,y` 재사용 | — | 외부 호출 X |
| `mapMeta.staticMapUrl` | 카드 썸네일 URL | Naver Static Map 2-2 | — | 백엔드/BFF에서 URL 빌드 (키 보호). `(좌표, zoom, size)` 동일 시 CDN 캐시 |

**적재 파이프라인 권장 순서**

```
[1] Kakao 1-5 키워드 검색      → placeName, categoryName, x, y, roadAddressName, phoneNumber
[2] roadAddressName 누락 시 Kakao 1-3 (좌표→주소)
[3] Google Places 3-1 (Place Details New) → businessHours, (옵션) description 후보
[4] Google Places 3-4 (Place Photos)      → placeImageUrl 캐싱
[5] 운영자 큐레이션                          → description, tags 보강
[6] 자체 DB 적재 완료 → 이후 PLACE-N1은 자체 DB만으로 응답
```

**런타임 외부 호출은 단 하나** — 클라이언트가 `mapMeta`를 가지고 Naver Maps JS SDK(2-1 Dynamic)로 지도를 그리는 순간뿐. `staticMapUrl`은 카드/공유 OG 이미지용 fallback.

# PLACE-N2. 장소 좋아요
## URL : POST /api/place/like/{placeId}

> `PlaceDetailPage` Heart 버튼 토글 시 호출 (이미 좋아요 상태면 DELETE).

### 본문 파라미터

| **이름** | **유형** | **필수/선택** | **설명** |
| --- | --- | --- | --- |
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |

### 응답 코드

| status | message |
| --- | --- |
| 200 | 성공 |
| 400 | 요청 데이터 오류 (placeId 형식 오류) |
| 401 | 인증 필요 |
| 404 | 장소를 찾을 수 없음 |
| 409 | 이미 좋아요 처리됨 (POST) / 좋아요 상태가 아님 (DELETE) |

## 코드 예시

### 요청

```jsx
{
}
```

### 응답

```java
{
    "status": 200,
    "data": {
        "placeId": 165,
        "isLiked": true,
        "likeCount": 2341
    }
}
```

# PLACE-N3. 장소 스크랩
## URL : POST /api/place/scrapped/{placeId}

> `PlaceDetailPage` Bookmark 버튼 토글 시 호출 (해제는 DELETE).

### 본문 파라미터

| **이름** | **유형** | **필수/선택** | **설명** |
| --- | --- | --- | --- |
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |

### 응답 코드

| status | message |
| --- | --- |
| 200 | 성공 |
| 400 | 요청 데이터 오류 |
| 401 | 인증 필요 |
| 404 | 장소를 찾을 수 없음 |
| 409 | 이미 스크랩 상태 (POST) / 스크랩 상태가 아님 (DELETE) |

## 코드 예시

### 요청

```jsx
{
}
```

### 응답

```java
{
    "status": 200,
    "data": {
        "placeId": 165,
        "isBookmarked": true,
        "bookmarkCount": 413
    }
}
```

# PLACE-N4. 장소 후기 조회
## URL : GET /api/place/{placeId}/review?lastReviewId=

> `PlaceDetailPage`의 "방문자 후기" 섹션. 별점/사진/코멘트 표시 (cursor 기반 페이지네이션).

### 쿼리 파라미터

| **이름** | **유형** | **필수/선택** | **설명** |
| --- | --- | --- | --- |
| lastReviewId | Integer | 필수 | 마지막으로 조회한 후기의 reviewId (처음이면 0) |
| size | Integer | 선택 | 조회 개수 (기본 10) |

### 응답 코드

| status | message |
| --- | --- |
| 200 | 성공 |
| 400 | 요청 데이터 오류 |
| 404 | 장소를 찾을 수 없음 |

## 코드 예시

### 응답

```java
{
    "status": 200,
    "data": [
        {
            "reviewId": 1,
            "userId": "u-pr1",
            "username": "여행조아",
            "userAvatar": "https://i.pravatar.cc/150?u=pr1",
            "rating": 5,
            "comment": "분위기가 너무 좋아요! 다음에 또 올 거예요 😊",
            "imageUrl": "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?...",
            "createdAt": "2026-05-04T10:23:00Z"
        },
        {
            "reviewId": 2,
            "userId": "u-pr2",
            "username": "감성충만",
            "userAvatar": "https://i.pravatar.cc/150?u=pr2",
            "rating": 4,
            "comment": "사진 찍기 좋은 곳이에요. 주말에는 사람이 많으니 평일 방문 추천!",
            "imageUrl": null,
            "createdAt": "2026-05-01T14:30:00Z"
        }
    ],
    "hasNext": true,
    "averageRating": 4.6,
    "totalCount": 38
}
```

# PLACE-N5. 장소 후기 작성
## URL : POST /api/place/{placeId}/review

> 후기 작성 진입점은 향후 UI 추가 예정. 현재는 명세 선행.

### 본문 파라미터

| **이름** | **유형** | **필수/선택** | **설명** |
| --- | --- | --- | --- |
| rating | Integer | 필수 | 별점 (1~5) |
| comment | String | 필수 | 후기 본문 (최대 1000자) |
| image | File / String | 선택 | 사진 (multipart/form-data 또는 사전 업로드된 imageUrl) |

### 응답 코드

| status | message |
| --- | --- |
| 201 | 작성 성공 |
| 400 | 요청 데이터 오류 (rating 범위 초과/comment 누락) |
| 401 | 인증 필요 |
| 404 | 장소를 찾을 수 없음 |
| 409 | 이미 후기 작성됨 (1인 1후기 정책 시) |
| 413 | 이미지 용량 초과 (최대 10MB) |

## 코드 예시

### 요청

```jsx
{
    "rating": 5,
    "comment": "분위기가 너무 좋아요! 다음에 또 올 거예요 😊",
    "image": "https://cdn.example.com/uploads/review_38.jpg"
}
```

### 응답

```java
{
    "status": 201,
    "data": {
        "reviewId": 39,
        "createdAt": "2026-05-06T12:00:00Z"
    }
}
```

# PLACE-N6. 장소가 포함된 코스 조회
## URL : GET /api/place/{placeId}/plan

> `PlaceDetailPage`의 "이 장소가 포함된 코스" 섹션 (가로 스크롤 캐러셀).

### 쿼리 파라미터

| **이름** | **유형** | **필수/선택** | **설명** |
| --- | --- | --- | --- |
| limit | Integer | 선택 | 조회 개수 (기본 5) |

### 응답 코드

| status | message |
| --- | --- |
| 200 | 성공 |
| 400 | 요청 데이터 오류 |
| 404 | 장소를 찾을 수 없음 |

## 코드 예시

### 응답

```java
{
    "status": 200,
    "data": [
        {
            "planId": 1,
            "planTitle": "성수동 힙플레이스 완전 정복",
            "thumbnailUrl": "https://images.unsplash.com/photo-1692103675608-6e635afa077b?...",
            "location": "서울 성동구",
            "duration": "4시간",
            "tags": ["#카페투어", "#팝업스토어"],
            "likeCount": 124
        },
        {
            "planId": 2,
            "planTitle": "강릉 바다보며 물멍 때리기",
            "thumbnailUrl": "https://images.unsplash.com/photo-1703768516086-45eb97f36ce7?...",
            "location": "강원 강릉시",
            "duration": "6시간",
            "tags": ["#오션뷰", "#힐링"],
            "likeCount": 352
        }
    ]
}
```

# PLACE-N7. 주소 → 좌표 (Geocoding)
## URL : GET /api/geo/geocode?address={address}

> `CourseCreationFlow` 출발지 입력 step에서 사용자가 텍스트 주소를 입력했을 때 호출. 백엔드가 **Kakao Local 1-1(주소→좌표)**을 프록시한다. 키 보관·요금 통제 목적으로 외부 직접 호출은 금지하고 본 엔드포인트를 경유한다.

### 쿼리 파라미터

| **이름** | **유형** | **필수/선택** | **설명** |
| --- | --- | --- | --- |
| address | query parameter | 필수 | 도로명 또는 지번 주소 (최소 2자) |
| limit | query parameter | 선택 | 후보 개수 (기본 5, 최대 10) |

### 응답 코드

| status | message |
| --- | --- |
| 200 | 성공 |
| 400 | 요청 데이터 오류 (address 누락/길이 0) |
| 422 | 매칭 결과 없음 |
| 502 | 외부(Kakao) API 호출 실패 |

## 코드 예시

### 요청

```jsx
GET /api/geo/geocode?address=강릉역
```

### 응답

```java
{
    "status": 200,
    "data": [
        {
            "addressName": "강원특별자치도 강릉시 용지로 176",
            "roadAddressName": "강원특별자치도 강릉시 용지로 176",
            "x": 128.898981,
            "y": 37.760152,
            "addressType": "ROAD_ADDR",
            "region": {
                "sido": "강원특별자치도",
                "sigungu": "강릉시",
                "dong": "교동"
            }
        }
    ]
}
```

# PLACE-N8. 좌표 → 주소·행정구역 (Reverse Geocoding)
## URL : GET /api/geo/reverse?x={x}&y={y}

> 현 위치 자동 입력(출발지 step "현재 위치" 버튼), 스탬프 라벨링, 추천 응답의 행정구역명 채움 등에 사용. 백엔드가 **Kakao Local 1-3(좌표→주소) + 1-2(좌표→행정구역)** 두 호출을 합쳐서 반환한다.

### 쿼리 파라미터

| **이름** | **유형** | **필수/선택** | **설명** |
| --- | --- | --- | --- |
| x | query parameter | 필수 | 경도 (WGS84) |
| y | query parameter | 필수 | 위도 (WGS84) |

### 응답 코드

| status | message |
| --- | --- |
| 200 | 성공 |
| 400 | 요청 데이터 오류 (x/y 누락 또는 범위 초과) |
| 422 | 변환 결과 없음 (예: 해상 좌표) |
| 502 | 외부(Kakao) API 호출 실패 |

## 코드 예시

### 요청

```jsx
GET /api/geo/reverse?x=128.899802&y=37.763191
```

### 응답

```java
{
    "status": 200,
    "data": {
        "x": 128.899802,
        "y": 37.763191,
        "roadAddress": "강원특별자치도 강릉시 율곡로 2729",
        "jibunAddress": "강원특별자치도 강릉시 교동 1875",
        "region": {
            "sido": "강원특별자치도",
            "sigungu": "강릉시",
            "dong": "교동",
            "h_code": "5115052000",
            "b_code": "5115011500"
        },
        "label": "강릉시 교동"
    }
}
```

# PLACE-N9. 외부 POI 키워드 검색 (Fallback)
## URL : GET /api/geo/keyword?query={query}&x={x}&y={y}

> 자체 DB에 없는 장소를 사용자가 검색했을 때 raw 외부 결과를 보고자 할 때 사용. 백엔드가 **Kakao Local 1-5(키워드 장소 검색)**을 프록시. 사용자 선택 시 별도 placeId 적재 절차(`POST /api/place/import` 등 후속 명세)가 이어진다. PLACE-4의 자동 fallback과 달리 본 API는 *적재 없이* 외부 결과만 반환한다.

### 쿼리 파라미터

| **이름** | **유형** | **필수/선택** | **설명** |
| --- | --- | --- | --- |
| query | query parameter | 필수 | 검색어 (최소 2자) |
| x | query parameter | 선택 | 중심 좌표 경도 (거리순 정렬 시) |
| y | query parameter | 선택 | 중심 좌표 위도 |
| radius | query parameter | 선택 | 반경(m, 기본 20000, 최대 20000 — Kakao 정책) |
| page | query parameter | 선택 | 페이지 (기본 1, 최대 45) |
| size | query parameter | 선택 | 페이지 크기 (기본 15, 최대 15 — Kakao 정책) |

### 응답 코드

| status | message |
| --- | --- |
| 200 | 성공 |
| 400 | 요청 데이터 오류 (query 누락/길이 0) |
| 422 | 결과 없음 |
| 502 | 외부(Kakao) API 호출 실패 |

## 코드 예시

### 요청

```jsx
GET /api/geo/keyword?query=강릉 안목해변&x=128.898981&y=37.760152&radius=5000
```

### 응답

```java
{
    "status": 200,
    "data": [
        {
            "externalId": "kakao:27434277",
            "placeName": "안목해변",
            "categoryName": "여행 · 해수욕장",
            "phoneNumber": "",
            "roadAddressName": "강원특별자치도 강릉시 창해로14번길 20-1",
            "jibunAddressName": "강원특별자치도 강릉시 견소동 286",
            "x": 128.918451,
            "y": 37.776528,
            "distance": 1820,
            "placeUrl": "https://place.map.kakao.com/27434277"
        }
    ],
    "pageable": {
        "page": 1,
        "size": 15,
        "hasNext": true,
        "totalCount": 8
    }
}
```

> **연계 흐름**: 사용자가 외부 POI를 선택하면 (1) `POST /api/place/import { externalId }`로 자체 placeId 적재 → (2) `POST /api/plan-place/{planId}` 로 추가. 적재 파이프라인에서 백엔드가 Google Places 3-4(Photos)로 이미지를 보강한다.

