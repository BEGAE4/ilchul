# 플랜 좋아요
## URL : POST /api/like/{planId}

> `CourseViewPage`의 좋아요 버튼 토글 시 호출 (이미 좋아요 상태면 DELETE 사용).

### 응답 코드

| status | message |
| --- | --- |
| 200 | 성공 |
| 400 | 요청 데이터 오류 (planId 형식 오류) |
| 401 | 인증 필요 |
| 404 | 플랜을 찾을 수 없음 |
| 409 | 이미 좋아요 처리된 플랜 (POST) / 좋아요 상태가 아닌 플랜 (DELETE) |

### 응답

```java
{
	"isLiked": true,
	"likeCount": 26
}
```

# 플랜 상세 조회
## URL : GET /api/plan/{planId}
### 응답 코드

| status | message |
| --- | --- |
| 200 | 성공 |
| 400 | 요청 데이터 오류 (planId 형식 오류) |
| 401 | 비공개 플랜 접근 시 인증 필요 |
| 403 | 비공개 플랜 접근 권한 없음 |
| 404 | 플랜을 찾을 수 없음 |

## 코드 예시

### 응답

```java
{
    "planId": 1,
    "planTitle": "성수동 힙플레이스 완전 정복",
    "planDescription": "요즘 가장 핫한 성수동의 카페와 팝업스토어를 하루만에 돌아보는 알짜배기 코스입니다.",
    "thumbnailUrl": "https://images.unsplash.com/photo-1692103675608-6e635afa077b?...",
    "location": "서울 성동구",
    "duration": "4시간",
    "tags": ["#카페투어", "#팝업스토어", "#사진맛집"],
    "userId": "u-001",
    "userNickname": "힙스터김",
    "userAvatar": "https://i.pravatar.cc/150?u=a042581f4e29026704d",
    "tripDate": "2024-12-27T09:00:00",
    "createAt": "2024-12-19T19:00:00",
    "isPlanVisible": true,
    "planVerified": true,
    "likeCount": 124,
    "isLiked": false,
    "bookmarkCount": 89,
    "isBookmarked": false,
    "planPlaceDetailDtos": [
        {
            "planPlaceId": 1,
            "placeId": 1001,
            "placeImage": "https://images.example.com/cafe1.jpg",
            "placeName": "블루보틀 성수",
            "categoryName": "카페",
            "address": "서울 성동구 아차산로 17길 49",
            "orderIndex": 1,
            "visitTime": "11:00",
            "stayDescription": "성수동의 랜드마크 카페에서 모닝 커피 한 잔",
            "isStamped": false
        },
        {
            "planPlaceId": 2,
            "placeId": 1002,
            "placeImage": "https://images.example.com/seoulforest.jpg",
            "placeName": "서울숲 산책",
            "categoryName": "공원",
            "address": "서울 성동구 뚝섬로 273",
            "orderIndex": 2,
            "visitTime": "12:30",
            "stayDescription": "커피 들고 서울숲 벤치에서 여유 즐기기",
            "isStamped": true
        }
    ]
}
```


# 플랜 저장 전 시간계산 및 프리뷰
## URL : POST /api/plan-place/duration
### 응답 코드

| status | message |
| --- | --- |
| 200 | 성공 |
| 400 | 요청 데이터 오류 (places 비어있음 / order 중복 / placeId 누락) |
| 401 | 인증 필요 |
| 404 | 일부 placeId가 존재하지 않음 |

## 코드 예시

### 요청

```jsx
{
    "planTitle" : "나만의 힐링 코스",
    "planDescription" : "도보로 떠나는 나만의 힐링 여행",
    "isPlanVisible" : false,
    "places" : [
        { "placeId" : 300, "order" : 1 },
        { "placeId" : 301, "order" : 2 },
        { "placeId" : 302, "order" : 3 },
        { "placeId" : 303, "order" : 4 },
        { "placeId" : 304, "order" : 5 }
    ]
}
```

### 응답

```java
{
    "planTitle": "나만의 힐링 코스",
    "planDescription": "도보로 떠나는 나만의 힐링 여행",
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
            "placeId": 302,
            "placeName": "교보문고 동대문점",
            "roadAddressName": "서울 중구 장충단로13길 20",
            "placeImageUrl": "https://lh3.googleusercontent.com/place-photos/AL8-SNFR...",
            "order": 3,
            "duration": 29
        }
    ]
}
```

# 플랜 스크랩 
## URL : POST /api/plan/scrapped/{planId}

> `CourseViewPage` / `PlaceDetailPage`의 북마크/스크랩 버튼 토글 시 호출 (해제는 DELETE 사용).

### 응답 코드

| status | message |
| --- | --- |
| 200 | 성공 |
| 400 | 요청 데이터 오류 |
| 401 | 인증 필요 |
| 404 | 플랜을 찾을 수 없음 |
| 409 | 이미 스크랩 상태 (POST) / 스크랩 상태가 아님 (DELETE) |

## 코드 예시

### 응답

```java
{
	"planId": 13,
	"isBookmarked": true,
	"bookmarkCount": 90
}
```

# 플랜 신규 생성
## URL : POST /api/plan

> `CourseCreationFlow` finalPlan 단계에서 "힐링 플랜 생성 완료" 버튼 클릭 시 호출.

### 본문 파라미터

| **이름** | **유형** | **필수/선택** | **설명** |
| --- | --- | --- | --- |
| planTitle | String | 필수 | 코스 제목 (최대 50자) |
| planDescription | String | 선택 | 코스 설명 (최대 500자) |
| isPlanVisible | Boolean | 필수 | 공개여부 (생성 시 기본 false 권장) |
| scheduledDate | String | 필수 | 여행 날짜 (yyyy-MM-dd) |
| scheduledStartTime | String | 필수 | 시작 시각 (HH:mm) |
| scheduledEndTime | String | 필수 | 종료 시각 (HH:mm) |
| tags | Array(String) | 선택 | 해시태그 |
| startingPoint | Object | 선택 | 출발지 `{ address, x, y }` |
| places | Array(Object) | 필수 | 플랜 장소 배열 `{ placeId, order }`. 1개 이상 |

### 응답 코드

| status | message |
| --- | --- |
| 201 | 생성 성공 |
| 400 | 요청 데이터 오류 (필수 필드 누락 / 시간 역전 / order 중복) |
| 401 | 인증 필요 |
| 404 | 일부 placeId 미존재 |
| 422 | 일정 시간을 초과한 플랜 장소 구성 |

## 코드 예시

### 요청

```jsx
{
    "planTitle": "마음이 좀 울적하고 속상해요 힐링 코스",
    "planDescription": "도보로 떠나는 나만의 힐링 여행",
    "isPlanVisible": false,
    "scheduledDate": "2026-04-18",
    "scheduledStartTime": "15:00",
    "scheduledEndTime": "22:00",
    "tags": ["#카페", "#공원", "#서점"],
    "startingPoint": {
        "address": "강릉역",
        "x": 128.898981,
        "y": 37.760152
    },
    "places": [
        { "placeId": 165, "order": 1 },
        { "placeId": 177, "order": 2 },
        { "placeId": 192, "order": 3 }
    ]
}
```

### 응답

```java
{
    "status": 201,
    "data": {
        "planId": 27,
        "planTitle": "마음이 좀 울적하고 속상해요 힐링 코스",
        "isPlanVisible": false,
        "createAt": "2026-05-06T10:00:00"
    }
}
```

# 플랜 수정
## URL : PATCH /api/plan/{planId}

> `MyCourseDetailPage`에서 제목/일정/공개여부/후기 등을 수정할 때 호출.

### 본문 파라미터

| **이름** | **유형** | **필수/선택** | **설명** |
| --- | --- | --- | --- |
| planTitle | String | 선택 | 수정할 제목 |
| planDescription | String | 선택 | 수정할 설명 |
| isPlanVisible | Boolean | 선택 | 공개여부 (전용 토글 API는 MY-5 별도) |
| scheduledDate | String | 선택 | 여행 날짜 |
| scheduledStartTime | String | 선택 | 시작 시각 |
| scheduledEndTime | String | 선택 | 종료 시각 |
| tags | Array(String) | 선택 | 해시태그 전체 교체 |
| review | String | 선택 | 여행 후기 (최대 1000자) |

### 응답 코드

| status | message |
| --- | --- |
| 200 | 성공 |
| 400 | 요청 데이터 오류 |
| 401 | 인증 필요 |
| 403 | 작성자 본인이 아님 |
| 404 | 플랜을 찾을 수 없음 |

## 코드 예시

### 요청

```jsx
{
    "planTitle": "주말 힐링 드라이브",
    "review": "날씨가 너무 좋아서 급하게 떠났는데 정말 좋았음. 특히 노을 질 때 뷰가 최고!"
}
```

### 응답

```java
{
    "status": 200,
    "data": {
        "planId": 27,
        "updatedAt": "2026-05-06T11:00:00"
    }
}
```

# 플랜 삭제
## URL : DELETE /api/plan/{planId}

> 마이페이지 내 코스 목록에서 삭제 시 호출.

### 응답 코드

| status | message |
| --- | --- |
| 200 | 성공 |
| 401 | 인증 필요 |
| 403 | 작성자 본인이 아님 |
| 404 | 플랜을 찾을 수 없음 |

## 코드 예시

### 응답

```java
{
    "status": 200
}
```

# 플랜 클론 (코스 담기)
## URL : POST /api/plan/{planId}/clone

> `CourseViewPage`의 "내 일정에 담기" 버튼 ([useCourseStore.cloneCourseToMy](../../src/shared/lib/stores/useCourseStore.ts)). 원본을 내 코스로 복제하고 좋아요/북마크/검증 정보는 초기화.

### 본문 파라미터

| **이름** | **유형** | **필수/선택** | **설명** |
| --- | --- | --- | --- |
| scheduledDate | String | 선택 | 새 여행 날짜 (yyyy-MM-dd, 미지정 시 빈 값) |
| scheduledStartTime | String | 선택 | 시작 시각 |
| scheduledEndTime | String | 선택 | 종료 시각 |

### 응답 코드

| status | message |
| --- | --- |
| 201 | 복제 성공 |
| 401 | 인증 필요 |
| 404 | 원본 플랜을 찾을 수 없음 |
| 409 | 본인 플랜은 클론 불가 (정책에 따라) |

## 코드 예시

### 요청

```jsx
{
    "scheduledDate": "2026-06-01"
}
```

### 응답

```java
{
    "status": 201,
    "data": {
        "planId": 142,
        "originalPlanId": 1,
        "createAt": "2026-05-06T11:30:00"
    }
}
```

# 플랜 장소 순서 변경
## URL : PATCH /api/plan-place/{planPlaceId}/order

> `CourseCreationFlow` finalPlan 단계와 `MyCourseDetailPage`의 ↑↓ 버튼 클릭 시 호출.

### 본문 파라미터

| **이름** | **유형** | **필수/선택** | **설명** |
| --- | --- | --- | --- |
| newOrder | Integer | 필수 | 변경할 새 순서 (1부터 시작) |

### 응답 코드

| status | message |
| --- | --- |
| 200 | 성공 |
| 400 | 요청 데이터 오류 (newOrder 범위 초과) |
| 401 | 인증 필요 |
| 403 | 작성자 본인이 아님 |
| 404 | 플랜 장소을 찾을 수 없음 |

## 코드 예시

### 요청

```jsx
{
    "newOrder": 2
}
```

### 응답

```java
{
    "status": 200,
    "data": {
        "planPlaceId": 11,
        "order": 2,
        "totalDuration": 495
    }
}
```

# 플랜 장소 제거
## URL : DELETE /api/plan-place/{planPlaceId}

### 응답 코드

| status | message |
| --- | --- |
| 200 | 성공 |
| 401 | 인증 필요 |
| 403 | 작성자 본인이 아님 |
| 404 | 플랜 장소을 찾을 수 없음 |
| 409 | 마지막 1개 플랜 장소 — 제거 불가 |

## 코드 예시

### 응답

```java
{
    "status": 200,
    "data": {
        "planId": 27,
        "remainingPlaceCount": 4,
        "totalDuration": 380
    }
}
```

# 방문 인증 (스탬프)
## URL : POST /api/plan-place/{planPlaceId}/stamp

> `MyCourseDetailPage`에서 플랜 장소 방문 인증 (Stop.isVerified, verifiedImage 사용). multipart/form-data 또는 사전 업로드된 imageUrl 전송.

### 본문 파라미터

| **이름** | **유형** | **필수/선택** | **설명** |
| --- | --- | --- | --- |
| image | File / String | 필수 | 인증 사진 (multipart/form-data) 또는 사전 업로드된 imageUrl |
| location | Object | 선택 | 인증 위치 좌표 `{ x, y }` (위치 검증용) |

### 응답 코드

| status | message |
| --- | --- |
| 201 | 인증 성공 |
| 400 | 요청 데이터 오류 (이미지 누락/포맷 오류) |
| 401 | 인증 필요 |
| 403 | 작성자 본인이 아님 |
| 404 | 플랜 장소을 찾을 수 없음 |
| 409 | 이미 인증 완료된 플랜 장소 |
| 413 | 이미지 용량 초과 (최대 10MB) |
| 422 | 위치 검증 실패 (해당 장소와 거리가 멀어요) |

## 코드 예시

### 요청

```jsx
// multipart/form-data
{
    "image": "<binary>",
    "location": { "x": 128.899802, "y": 37.763191 }
}
```

### 응답

```java
{
    "status": 201,
    "data": {
        "planPlaceId": 11,
        "isStamped": true,
        "verifiedImage": "https://cdn.example.com/stamps/11_user001.jpg",
        "stampedAt": "2026-05-06T13:45:00"
    }
}
```

# 코스 신고
## URL : POST /api/plan/{planId}/report

> `CourseViewPage` MoreVertical 메뉴 → 신고하기. [REPORT_REASONS](../../src/shared/data/mockData.ts) 5종 중 선택 + 상세 사유.

### 본문 파라미터

| **이름** | **유형** | **필수/선택** | **설명** |
| --- | --- | --- | --- |
| reason | String | 필수 | 신고 사유 (REPORT_REASONS enum) |
| detail | String | 선택 | 상세 설명 (최대 500자, "기타" 선택 시 권장) |

### 응답 코드

| status | message |
| --- | --- |
| 201 | 신고 접수 |
| 400 | 요청 데이터 오류 (reason 누락) |
| 401 | 인증 필요 |
| 404 | 플랜을 찾을 수 없음 |
| 409 | 동일 플랜에 대해 이미 신고 접수됨 |

## 코드 예시

### 요청

```jsx
{
    "reason": "허위 정보가 포함되어 있어요",
    "detail": "운영시간이 잘못 기재되어 있어요."
}
```

### 응답

```java
{
    "status": 201,
    "data": {
        "reportId": 88,
        "createAt": "2026-05-06T14:00:00"
    }
}
```

# 공유 링크 발급
## URL : POST /api/plan/{planId}/share

> `CourseViewPage` / `PlaceDetailPage`의 [ShareBottomSheet](../../src/shared/ui/ShareBottomSheet/) 진입 시 호출.

### 응답 코드

| status | message |
| --- | --- |
| 200 | 성공 |
| 401 | 인증 필요 |
| 403 | 비공개 플랜 — 공유 불가 |
| 404 | 플랜을 찾을 수 없음 |

## 코드 예시

### 응답

```java
{
    "status": 200,
    "data": {
        "shareUrl": "https://ilchul.app/share/plan/abc123def",
        "expiresAt": "2026-06-05T14:00:00"
    }
}
```
