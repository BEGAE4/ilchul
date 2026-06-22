# USER API (v2)

> Notion [엔드포인트 (3)](https://www.notion.so/3740e945fc0980c29284f38e962359db) 기준. 엔드포인트 6건.

| ID | 제목 | 메서드 | URL | 서버 | 클라이언트 | FE검토 |
| --- | --- | --- | --- | --- | --- | --- |
| 17 | 사용자 프로필 수정 | PATCH | `/api/mypage/nickname` | 완료 | 완료 | N |
| 18 | 내 플랜 목록 조회 | GET | `/api/mypage/plans` | 완료 | 완료 | N |
| 19 | 내 플랜 공개 여부 설정 | POST | `/api/mypage/plan/visibility/{planId}` | 완료 | 완료 | N |
| 20 | 사용자 프로필 정보 조회 | GET | `/api/mypage/profile` | 완료 | 완료 | N |
| 21 | 사용자 프로필 COUNT 조회 | GET | `/api/mypage/summary` | 완료 | 진행 중 | N |
| 22 | 저장된 플랜 조회 | GET | `/api/mypage/scrapped` | 완료 | 진행 중 | N |

---

# MY-1. 내 플랜 목록 조회
## URL : GET /api/mypage/plans

> [src/app/api/mypage/plans/route.ts](../../src/app/api/mypage/plans/route.ts) BFF 라우트가 프록시 호출. 마이페이지 "내 코스" 탭에서 사용.

### 쿼리 파라미터

| **이름** | **유형** | **필수/선택** | **설명** |
| --- | --- | --- | --- |
| status | String | 선택 | `all` / `public` / `private` / `verified` (기본 `all`) |
| page | Integer | 선택 | 페이지 번호 (기본 1) |
| size | Integer | 선택 | 페이지 크기 (기본 20) |

### 응답 코드

| status | message |
| --- | --- |
| 200 | 성공 |
| 400 | 요청 데이터 오류 (status 값 비정상) |
| 401 | 인증 필요 |

## 코드 예시

### 응답

```java
{
    "status": 200,
    "plans": [
        {
            "planId": 27,
            "planTitle": "주말 힐링 드라이브",
            "thumbnailUrl": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?...",
            "location": "경기 파주시",
            "duration": "3시간",
            "tags": ["#드라이브", "#혼여행"],
            "scheduledDate": "2024-05-20",
            "isPlanVisible": true,
            "isVerified": false,
            "likeCount": 0,
            "bookmarkCount": 0,
            "createAt": "2024-05-15T10:00:00Z"
        },
        {
            "planId": 28,
            "planTitle": "퇴근 후 급번개",
            "thumbnailUrl": "https://images.unsplash.com/photo-1767412729950-3e1a776eaed4?...",
            "location": "서울 강남구",
            "duration": "2시간",
            "tags": ["#맛집", "#스트레스해소"],
            "scheduledDate": "2024-06-01",
            "isPlanVisible": false,
            "isVerified": false,
            "likeCount": 0,
            "bookmarkCount": 0,
            "createAt": "2024-05-28T18:00:00Z"
        }
    ],
    "totalCount": 2,
    "hasNext": false
}
```

# MY-2. 내 프로필 조회
## URL : GET /api/mypage/profile

> [src/app/api/mypage/profile/route.ts](../../src/app/api/mypage/profile/route.ts) BFF GET 라우트.

### 응답 코드

| status | message |
| --- | --- |
| 200 | 성공 |
| 401 | 인증 필요 |

## 코드 예시

### 응답

```java
{
    "userNickname": "김여행",
    "userImg": "https://i.pravatar.cc/150?u=me",
    "userIntro": "힐링 여행을 좋아하는 여행자입니다 🌿"
}
```

# MY-3. 내 프로필 수정
## URL : PATCH /api/mypage/profile

> [src/app/api/mypage/profile/route.ts](../../src/app/api/mypage/profile/route.ts) BFF PATCH 라우트. 성공 시 BFF는 202로 리턴.

### 본문 파라미터

| **이름** | **유형** | **필수/선택** | **설명** |
| --- | --- | --- | --- |
| newUserNickname | String | 선택 | 새 닉네임 (최대 20자) |
| newUserIntro | String | 선택 | 새 자기소개 (최대 200자) |
| newUserProfileImg | String / File | 선택 | 새 프로필 이미지 (multipart 또는 사전 업로드된 URL) |

### 응답 코드

| status | message |
| --- | --- |
| 202 | 수정 성공 (BFF에서 변환) |
| 400 | 요청 데이터 오류 (닉네임 길이 초과/포맷 오류) |
| 401 | 인증 필요 |
| 409 | 닉네임 중복 |
| 413 | 프로필 이미지 용량 초과 (최대 5MB) |

## 코드 예시

### 요청

```jsx
{
    "newUserNickname": "김여행",
    "newUserIntro": "힐링 여행을 좋아하는 여행자입니다 🌿",
    "newUserProfileImg": "https://cdn.example.com/uploads/avatar_001.jpg"
}
```

### 응답

```java
{
    "status": 202,
    "data": {
        "userNickname": "김여행",
        "userImg": "https://cdn.example.com/uploads/avatar_001.jpg",
        "userIntro": "힐링 여행을 좋아하는 여행자입니다 🌿"
    }
}
```

# MY-4. 마이페이지 요약 통계
## URL : GET /api/mypage/summary

> [src/app/api/mypage/summary/route.ts](../../src/app/api/mypage/summary/route.ts) BFF 라우트. 프로필 상단 통계 4개 카운트.

### 응답 코드

| status | message |
| --- | --- |
| 200 | 성공 |
| 401 | 인증 필요 |

## 코드 예시

### 응답

```java
{
    "publicPlanCount": 3,
    "verifyPlanCount": 1,
    "scrappedByOthersCount": 12,
    "savedCourseCount": 7
}
```

# MY-5. 플랜 공개여부 토글
## URL : POST /api/mypage/plan/visibility/{planId}

> [src/app/api/mypage/plan/visibility/[planId]/route.ts](../../src/app/api/mypage/plan/visibility/[planId]/route.ts) BFF 라우트. 토글 방식 (서버가 현재 상태를 반전시켜 반환).

### 본문 파라미터

| **이름** | **유형** | **필수/선택** | **설명** |
| --- | --- | --- | --- |
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |

### 응답 코드

| status | message |
| --- | --- |
| 200 | 성공 (현재 BFF는 응답 본문 `{ status }` 만 전달) |
| 401 | 인증 필요 |
| 403 | 본인 플랜이 아님 |
| 404 | 플랜을 찾을 수 없음 |

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
        "planId": 27,
        "isPlanVisible": true
    }
}
```

# MY-6. 스크랩한 코스 목록
## URL : GET /api/mypage/scrapped

> 향후 마이페이지 "스크랩" 탭. MY-1과 응답 형태 동일하나 본인이 스크랩한 타인 코스 목록.

### 쿼리 파라미터

| **이름** | **유형** | **필수/선택** | **설명** |
| --- | --- | --- | --- |
| page | Integer | 선택 | 페이지 번호 (기본 1) |
| size | Integer | 선택 | 페이지 크기 (기본 20) |

### 응답 코드

| status | message |
| --- | --- |
| 200 | 성공 |
| 401 | 인증 필요 |

## 코드 예시

### 응답

```java
{
    "status": 200,
    "plans": [
        {
            "planId": 1,
            "planTitle": "성수동 힙플레이스 완전 정복",
            "thumbnailUrl": "https://images.unsplash.com/photo-1692103675608-6e635afa077b?...",
            "userNickname": "힙스터김",
            "userAvatar": "https://i.pravatar.cc/150?u=a042581f4e29026704d",
            "location": "서울 성동구",
            "duration": "4시간",
            "tags": ["#카페투어", "#팝업스토어"],
            "likeCount": 124,
            "scrappedAt": "2026-04-10T14:00:00Z"
        }
    ],
    "totalCount": 7,
    "hasNext": false
}
```

# MY-7. 다른 유저 프로필 조회
## URL : GET /api/users/{userId}

> [src/app/profile/[id]/](../../src/app/profile/) 페이지 진입 시 호출. 비공개 프로필은 일부 필드만 응답.

### 응답 코드

| status | message |
| --- | --- |
| 200 | 성공 |
| 404 | 사용자를 찾을 수 없음 |

## 코드 예시

### 응답

```java
{
    "status": 200,
    "data": {
        "userId": "u-001",
        "userNickname": "힙스터김",
        "userImg": "https://i.pravatar.cc/150?u=a042581f4e29026704d",
        "userIntro": "성수동을 사랑하는 힙스터입니다",
        "publicPlanCount": 12,
        "verifyPlanCount": 5,
        "followerCount": 240,
        "followingCount": 88,
        "isFollowed": false
    }
}
```
