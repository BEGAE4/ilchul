# PLACE-4. 장소 검색
## URL : GET /api/place/search?keyword={keyword}
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
    "reviewCount": 38
}
```

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
