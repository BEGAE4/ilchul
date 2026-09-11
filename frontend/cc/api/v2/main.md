# MAIN API (v2)

> Notion [엔드포인트 (3)](https://www.notion.so/3740e945fc0980c29284f38e962359db) 기준. 엔드포인트 4건.

| ID | 제목 | 메서드 | URL | 서버 | 클라이언트 | FE검토 |
| --- | --- | --- | --- | --- | --- | --- |
| 35 | 내 주변 실시간 베스트 플랜 조회 | GET | `/api/plan/popular` | 완료 | 시작 전 | Y |
| 36 | 내 주변 인기 장소 | GET | `/api/place/popular` | 완료 | 시작 전 | Y |
| 37 | 전국 인기 플랜 | GET | `/api/plan/popular/nationwide` | 완료 | 시작 전 | Y |
| 40 | 전국 인기 장소 | GET | `/api/place/popular/nationwide` | 완료 | 시작 전 | Y |

---


# MAIN-57. 내 주변 실시간 베스트 플랜 조회
## URL : GET /api/plan/popular
### 본문 파라미터

| **이름** | **유형** | **필수/선택** | **설명** |
| --- | --- | --- | --- |
| lat | number | 필수 | 사용자 현재 위치 위도 (예: 37.5547) |
| lng | number | 필수 | 사용자 현재 위치 경도 (예: 126.9707) |
| limit | number | 선택 | 조회 개수 (기본 5, 메인 UI는 5건 노출, 최대 50) |
| page | number | 선택 | 페이지 번호 (기본 1, "더보기" 진입 시 사용) |

### 응답 코드

| status | message |
| --- | --- |
| 200 | 성공 |
| 400 | 요청 데이터 오류 (lat/lng 누락 또는 형식 오류 / limit·page 범위 초과) |
| 401 | 인증 필요 |
| 500 | 서버 오류 |

## 코드 예시

### 요청

```jsx
GET /api/plan/popular?lat=37.5547&lng=126.9707&limit=5&page=1
```

### 응답

```java
{
  "status": 200,
  "message": "성공",
  "data": [
    {
      "id": "1",
      "title": "성수동 힙플레이스 완전 정복",
      "description": "요즘 가장 핫한 성수동의 카페와 팝업스토어를 하루만에 돌아보는 알짜배기 코스입니다.",
      "thumbnail": "https://images.unsplash.com/photo-1692103675608-6e635afa077b?...",
      "location": "서울 성동구",
      "duration": "4시간",
      "tags": ["#카페투어", "#팝업스토어", "#사진맛집"],
      "likes": 124,
      "ranking": 1
    },
    {
      "id": "2",
      "title": "강릉 바다보며 물멍 때리기",
      "description": "답답한 도시를 떠나 강릉 바다를 보며 마음을 치유하는 당일치기 힐링 여행",
      "thumbnail": "https://images.unsplash.com/photo-1703768516086-45eb97f36ce7?...",
      "location": "강원 강릉시",
      "duration": "6시간",
      "tags": ["#오션뷰", "#힐링", "#드라이브"],
      "likes": 352,
      "ranking": 2
    }
  ],
  "page": 1,
  "limit": 5,
  "hasNext": true,
  "totalCount": 124
}
```


# MAIN-61. 내 주변 인기 장소
## URL : GET /api/place/popular
### 본문 파라미터

| **이름** | **유형** | **필수/선택** | **설명** |
| --- | --- | --- | --- |
| lat | number | 필수 | 사용자 현재 위치 위도 (예: 37.5547) |
| lng | number | 필수 | 사용자 현재 위치 경도 (예: 126.9707) |
| limit | number | 선택 | 조회 개수 (기본 5, 상위 3건은 메인 상단 비주얼 슬라이드 배너로 재활용, 최대 50) |
| page | number | 선택 | 페이지 번호 (기본 1, "더보기" 진입 시 사용) |

### 응답 코드

| status | message |
| --- | --- |
| 200 | 성공 |
| 400 | 요청 데이터 오류 (lat/lng 누락 또는 형식 오류 / limit·page 범위 초과) |
| 401 | 인증 필요 |
| 500 | 서버 오류 |

## 코드 예시

### 요청

```jsx
GET /api/place/popular?lat=37.5547&lng=126.9707&limit=5&page=1
```

### 응답

```java
{
  "status": 200,
  "message": "성공",
  "data": [
    {
      "id": "np1",
      "name": "성수 카페거리",
      "category": "카페",
      "location": "서울 성동구",
      "image": "https://images.unsplash.com/photo-1692103675608-6e635afa077b?...",
      "likes": 2340,
      "ranking": 1
    },
    {
      "id": "np2",
      "name": "서울숲 피크닉",
      "category": "공원",
      "location": "서울 성동구",
      "image": "https://images.unsplash.com/photo-1563299796-b729d0af54a5?...",
      "likes": 1870,
      "ranking": 2
    },
    {
      "id": "np3",
      "name": "런던 베이글 뮤지엄",
      "category": "맛집",
      "location": "서울 강남구",
      "image": "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?...",
      "likes": 1240,
      "ranking": 3
    }
  ],
  "page": 1,
  "limit": 5,
  "hasNext": true,
  "totalCount": 87
}
```

# MAIN-58. 전국 인기 플랜
## URL : GET /api/plan/popular/nationwide
### 본문 파라미터

| **이름** | **유형** | **필수/선택** | **설명** |
| --- | --- | --- | --- |
| limit | number | 선택 | 조회 개수 (기본 3, 메인 UI는 3건 노출, 최대 50) |
| page | number | 선택 | 페이지 번호 (기본 1, "더보기" 진입 시 사용) |

### 응답 코드

| status | message |
| --- | --- |
| 200 | 성공 |
| 400 | 요청 데이터 오류 (limit·page 형식 오류 또는 범위 초과) |
| 500 | 서버 오류 |

## 코드 예시

### 요청

```jsx
GET /api/plan/popular/nationwide?limit=3&page=1
```

### 응답

```java
{
  "status": 200,
  "message": "성공",
  "data": [
    {
      "id": "nc1",
      "title": "제주 동쪽 해안 드라이브",
      "description": "성산일출봉부터 월정리까지 제주 동부의 매력을 한번에",
      "thumbnail": "https://images.unsplash.com/photo-1758327740342-4e705edea29b?...",
      "location": "제주 제주시",
      "duration": "5시간",
      "tags": ["#드라이브", "#제주", "#오션뷰"],
      "likes": 487,
      "ranking": 1
    },
    {
      "id": "nc2",
      "title": "부산 감성 골목 여행",
      "description": "감천문화마을과 부산의 숨은 골목들을 탐험하는 코스",
      "thumbnail": "https://images.unsplash.com/photo-1762440775708-7dbfe9e10842?...",
      "location": "부산 사하구",
      "duration": "4시간",
      "tags": ["#감성", "#골목", "#부산"],
      "likes": 321,
      "ranking": 2
    },
    {
      "id": "nc3",
      "title": "경주 역사 탐방 코스",
      "description": "천년 고도 경주의 유적지를 하루 만에 둘러보기",
      "thumbnail": "https://images.unsplash.com/photo-1653632445017-0da95027672c?...",
      "location": "경북 경주시",
      "duration": "6시간",
      "tags": ["#역사", "#경주", "#문화유산"],
      "likes": 276,
      "ranking": 3
    }
  ],
  "page": 1,
  "limit": 3,
  "hasNext": true,
  "totalCount": 56
}
```

# MAIN-60. 전국 인기 장소
## URL : GET /api/place/popular/nationwide
### 본문 파라미터

| **이름** | **유형** | **필수/선택** | **설명** |
| --- | --- | --- | --- |
| limit | number | 선택 | 조회 개수 (기본 6, 메인 UI는 2열 그리드 6건 노출, 최대 50) |
| page | number | 선택 | 페이지 번호 (기본 1, "더보기" 진입 시 사용) |

### 응답 코드

| status | message |
| --- | --- |
| 200 | 성공 |
| 400 | 요청 데이터 오류 (limit·page 형식 오류 또는 범위 초과) |
| 500 | 서버 오류 |

## 코드 예시

### 요청

```jsx
GET /api/place/popular/nationwide?limit=6&page=1
```

### 응답

```java
{
  "status": 200,
  "message": "성공",
  "data": [
    {
      "id": "nw1",
      "name": "제주 월정리 해변",
      "category": "관광지",
      "location": "제주 제주시",
      "image": "https://images.unsplash.com/photo-1758327740342-4e705edea29b?...",
      "likes": 3120,
      "ranking": 1
    },
    {
      "id": "nw2",
      "name": "감천문화마을",
      "category": "관광지",
      "location": "부산 사하구",
      "image": "https://images.unsplash.com/photo-1762440775708-7dbfe9e10842?...",
      "likes": 2580,
      "ranking": 2
    },
    {
      "id": "nw3",
      "name": "경주 불국사",
      "category": "문화",
      "location": "경북 경주시",
      "image": "https://images.unsplash.com/photo-1653632445017-0da95027672c?...",
      "likes": 2210,
      "ranking": 3
    },
    {
      "id": "nw4",
      "name": "속초 해수욕장",
      "category": "관광지",
      "location": "강원 속초시",
      "image": "https://images.unsplash.com/photo-1660785462445-f9d21cad7ada?...",
      "likes": 1950,
      "ranking": 4
    },
    {
      "id": "nw5",
      "name": "전주 한옥마을",
      "category": "문화",
      "location": "전북 전주시",
      "image": "https://images.unsplash.com/photo-1670737479946-07fdd0278ba5?...",
      "likes": 1780,
      "ranking": 5
    },
    {
      "id": "nw6",
      "name": "광안리 해수욕장",
      "category": "관광지",
      "location": "부산 수영구",
      "image": "https://images.unsplash.com/photo-1634149023596-189f81664d9b?...",
      "likes": 1650,
      "ranking": 6
    }
  ],
  "page": 1,
  "limit": 6,
  "hasNext": true,
  "totalCount": 142
}
```
