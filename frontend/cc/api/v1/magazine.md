# MAG-1. 매거진 목록 조회
## URL : GET /api/magazine

> [src/app/magazine/](../../src/app/magazine/) 진입 시 호출. 현재는 [MOCK_MAGAZINES](../../src/shared/data/mockData.ts) 사용 중.

### 쿼리 파라미터

| **이름** | **유형** | **필수/선택** | **설명** |
| --- | --- | --- | --- |
| tag | String | 선택 | 필터 태그 (예: `MAY ISSUE`, `SOLO TRIP`) |
| page | Integer | 선택 | 페이지 번호 (기본 1) |
| size | Integer | 선택 | 페이지 크기 (기본 10) |

### 응답 코드

| status | message |
| --- | --- |
| 200 | 성공 |
| 400 | 요청 데이터 오류 |

## 코드 예시

### 응답

```java
{
    "status": 200,
    "data": [
        {
            "magazineId": "mag1",
            "title": "떠나기 좋은 5월의 여행지",
            "subtitle": "에디터가 직접 다녀온 숨은 명소 5곳",
            "coverImage": "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?...",
            "author": "에디터 윤슬",
            "authorAvatar": "https://i.pravatar.cc/150?u=editor1",
            "date": "2026.02.20",
            "readTime": "5분",
            "tag": "MAY ISSUE",
            "likeCount": 124
        },
        {
            "magazineId": "mag2",
            "title": "혼자 떠나도 외롭지 않은 여행법",
            "subtitle": "나를 위한 시간, 솔로 여행 가이드",
            "coverImage": "https://images.unsplash.com/photo-1522383225653-ed111181a951?...",
            "author": "에디터 한결",
            "authorAvatar": "https://i.pravatar.cc/150?u=editor2",
            "date": "2026.02.15",
            "readTime": "4분",
            "tag": "SOLO TRIP",
            "likeCount": 87
        }
    ],
    "totalCount": 2,
    "hasNext": false
}
```

# MAG-2. 매거진 상세 조회
## URL : GET /api/magazine/{magazineId}

> [src/app/magazine/[id]/](../../src/app/magazine/) 진입 시 호출. sections 배열 + relatedCourseIds 포함.

### 응답 코드

| status | message |
| --- | --- |
| 200 | 성공 |
| 404 | 매거진을 찾을 수 없음 |

## 코드 예시

### 응답

```java
{
    "status": 200,
    "data": {
        "magazineId": "mag1",
        "title": "떠나기 좋은 5월의 여행지",
        "subtitle": "에디터가 직접 다녀온 숨은 명소 5곳",
        "coverImage": "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?...",
        "author": "에디터 윤슬",
        "authorAvatar": "https://i.pravatar.cc/150?u=editor1",
        "date": "2026.02.20",
        "readTime": "5분",
        "tag": "MAY ISSUE",
        "likeCount": 124,
        "isLiked": false,
        "sections": [
            {
                "type": "text",
                "content": "5월은 여행의 계절이에요. 따사로운 햇살, 적당한 바람, 그리고 어디를 가도 싱그러운 초록빛이 반겨주는 달이죠..."
            },
            {
                "type": "image",
                "image": "https://images.unsplash.com/photo-1591325478691-c0f3b67c45e0?...",
                "caption": "한옥 마을에 봄이 오면, 시간이 멈춘 듯한 고요함이 있어요."
            },
            {
                "type": "place",
                "placeId": 5101,
                "placeName": "전주 한옥마을 숨은 골목길",
                "placeLocation": "전북 전주시 완산구",
                "placeDescription": "관광객이 몰리는 메인 거리 대신, 골목 안쪽으로 한 발짝만 들어가면 정말 조용한 한옥들을 만날 수 있어요."
            }
        ],
        "relatedCourseIds": [2, 3]
    }
}
```

# MAG-3. 매거진 좋아요
## URL : POST /api/magazine/like/{magazineId}

> 향후 매거진 상세 페이지에 좋아요 진입점이 추가될 경우 사용 (해제는 DELETE).

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
| 401 | 인증 필요 |
| 404 | 매거진을 찾을 수 없음 |
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
        "magazineId": "mag1",
        "isLiked": true,
        "likeCount": 125
    }
}
```
