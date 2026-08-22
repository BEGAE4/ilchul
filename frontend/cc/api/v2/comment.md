# COMMENT API (v2)

> Notion [엔드포인트 (3)](https://www.notion.so/3740e945fc0980c29284f38e962359db) 기준. 엔드포인트 8건.

| ID | 제목 | 메서드 | URL | 서버 | 클라이언트 | FE검토 |
| --- | --- | --- | --- | --- | --- | --- |
| 6 | 댓글 작성 | POST | `api/reply/\{planId\}` | 완료 | 시작 전 | N |
| 7 | 댓글 수정 | PATCH | `api/reply/\{replyId\}` | 완료 | 시작 전 | N |
| 8 | 댓글 삭제 | DELETE | `api/reply/\{replyId\}` | 완료 | 시작 전 | Y |
| 9 | 플랜의 댓글 조회 | GET | `api/reply/\{planId\}?size=\{\}&lastReplyId=\{\}` | 진행 중 | 시작 전 | Y |
| 10 | 댓글 좋아요 | POST | `api/reply/like/\{replyId\}` | 완료 | 시작 전 | Y |
| 11 | 댓글 좋아요 취소 | DELETE | `api/reply/like/\{replyId\}` | 완료 | 시작 전 | Y |
| 12 | 댓글 신고 | POST | `api/reply/\{replyId\}/report` | 시작 전 | 시작 전 | Y |
| 13 | 댓글의 대댓글 조회 | GET | `api/reply/\{parentReplyId\}/children?size=\{\}&lastReplyId=\` | 진행 중 | 시작 전 | N |

---

# CMT-34. 댓글 작성
# URL : POST api/reply/{planId}

**현재 UI 기준 결정 사항**:

- **대댓글 허용 (깊이 1로 제한)**. 대댓글에 다시 대댓글을 다는 행위는 불가하며, 추가 응답이 필요할 경우 본문 내 `@유저` 멘션을 사용해 동일 부모 댓글의 대댓글로 작성한다.
- **`@유저` 멘션 지원**. 본문에서 `@닉네임` 형태로 다른 사용자를 언급할 수 있으며, 서버는 `mentions` 배열로 멘션 대상 사용자 ID를 함께 받는다.
- 작성 입력은 textarea 한 개, `maxLength=500`.

### 본문 파라미터

| **이름** | **유형** | **필수/선택** | **설명** |
| --- | --- | --- | --- |
| content | String | 필수 | 댓글 본문 내용 (최대 500자). `@닉네임` 형식으로 멘션 표기 가능 |
| parentReplyId | Integer | 선택 | 대댓글일 경우 부모 댓글 ID. **부모 댓글이 이미 대댓글(parentReplyId가 존재)이면 거절(400)** — 깊이 1 제한 |
| mentions | Array&lt;Integer&gt; | 선택 | 본문에서 `@닉네임`으로 언급한 사용자들의 userId 목록. 알림/하이라이트 용도 |

### 응답 코드

| status | message |
| --- | --- |
| 201 | 작성 성공 |
| 400 | 요청 데이터 오류 (content 누락/길이 초과, **대댓글 깊이 초과**, mentions 형식 오류) |
| 401 | 인증 필요 |
| 403 | 비공개 플랜에 댓글 작성 권한 없음 |
| 404 | 대상 플랜 또는 parentReplyId 댓글을 찾을 수 없음 |
| 429 | 단시간 다수 댓글 — 도배 방지 |

## 코드 예시

### 요청 (일반 댓글)

```jsx
{
  "content": "이 코스 따라갔는데 진짜 완벽했어요! 특히 두 번째 장소가 최고 👍"
}
```

### 요청 (대댓글 + 멘션)

```jsx
{
  "content": "@여행꿈나무 저도 그 장소 너무 좋았어요! 다음에 같이 가요~",
  "parentReplyId": 101,
  "mentions": [12]
}
```

### 응답

```java
{
  "status": 201,
  "data": {
    "replyId": 105,
    "parentReplyId": 101,
    "user": "맛집헌터",
    "userId": 27,
    "avatar": "https://i.pravatar.cc/150?u=cm2",
    "content": "@여행꿈나무 저도 그 장소 너무 좋았어요! 다음에 같이 가요~",
    "mentions": [
      { "userId": 12, "username": "여행꿈나무" }
    ],
    "createdAt": "2026-05-06T10:23:00Z",
    "likeCount": 0,
    "isLiked": false
  }
}
```

# CMT-35. 댓글 수정 
# URL : PATCH api/reply/{replyId}

> 현재 메인 UI(`CourseViewPage`)에는 댓글 수정 진입점이 없음. 향후 지원 시 본 명세 사용.
> 일반 댓글/대댓글 모두 동일 엔드포인트 사용. 부모 관계(`parentReplyId`)는 수정 불가.

### 본문 파라미터

| **이름** | **유형** | **필수/선택** | **설명** |
| --- | --- | --- | --- |
| content | String | 필수 | 수정할 댓글 본문 내용 (최대 500자). `@닉네임` 멘션 표기 가능 |
| mentions | Array&lt;Integer&gt; | 선택 | 변경된 멘션 대상 userId 목록 (전체 교체) |
|  |  |  |  |

### 응답 코드

| status | message |
| --- | --- |
| 200 | 성공 |
| 400 | 요청 데이터 오류 |
| 401 | 인증 필요 |
| 403 | 작성자 본인이 아님 |
| 404 | 댓글을 찾을 수 없음 |

## 코드 예시

### 요청

```jsx
{
  "content": "@여행꿈나무 수정된 댓글 내용입니다.",
  "mentions": [12]
}
```

### 응답

```java
{
  "status": 200,
  "data": {
    "replyId": 105,
    "parentReplyId": 101,
    "content": "@여행꿈나무 수정된 댓글 내용입니다.",
    "mentions": [
      { "userId": 12, "username": "여행꿈나무" }
    ],
    "updatedAt": "2026-05-06T10:35:00Z"
  }
}
```

# CMT-36. 댓글 삭제
# URL : DELETE api/reply/{replyId}

> 현재 메인 UI(`CourseViewPage`)에는 댓글 삭제 진입점이 없음. 향후 지원 시 본 명세 사용.
> **부모 댓글이 삭제되면 해당 댓글에 달린 대댓글들은 보존되며 본문이 "삭제된 댓글입니다"로 대체된 placeholder 형태로 노출된다 (soft delete).**

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
| 403 | 작성자 본인이 아님 |
| 404 | 댓글을 찾을 수 없음 |

## 코드 예시

### 응답

```java
{
  "status": 200
}
```

# CMT-37. 플랜의 댓글 조회 
URL :  GET api/reply/{planId}?lastReplyId=

**응답 구조**: 최상위 댓글(부모) 목록을 반환하며, 각 항목에 `replies` 배열로 해당 댓글의 대댓글이 포함된다 (깊이 1 고정). 페이지네이션은 최상위 댓글 기준이며, 대댓글은 부모에 모두 포함되어 함께 반환된다.

### 쿼리 파라미터

| **이름** | **유형** | **필수/선택** | **설명** |
| --- | --- | --- | --- |
| lastReplyId | Integer | 필수 | 조회한 가장 마지막 **최상위** 댓글의 replyId(처음 조회면 0) |
| size | Integer | 선택 | 조회 개수 (기본 20, 현재 UI는 한 번에 전체 노출) |
|  |  |  |  |

### 응답 코드

| status | message |
| --- | --- |
| 200 | 성공 |
| 400 | 요청 데이터 오류 (lastReplyId 형식 오류) |
| 403 | 비공개 플랜의 댓글 접근 권한 없음 |
| 404 | 대상 플랜을 찾을 수 없음 |

## 코드 예시

### 응답

```java
{
  "status": 200,
  "data": [
    {
      "replyId": 101,
      "parentReplyId": null,
      "user": "여행꿈나무",
      "userId": 12,
      "avatar": "https://i.pravatar.cc/150?u=cm1",
      "content": "이 코스 따라갔는데 진짜 완벽했어요! 특히 두 번째 장소가 최고 👍",
      "mentions": [],
      "createdAt": "2026-05-04T10:23:00Z",
      "likeCount": 12,
      "isLiked": false,
      "replyCount": 2,
      "replies": [
        {
          "replyId": 105,
          "parentReplyId": 101,
          "user": "맛집헌터",
          "userId": 27,
          "avatar": "https://i.pravatar.cc/150?u=cm2",
          "content": "@여행꿈나무 저도 그 장소 너무 좋았어요! 다음에 같이 가요~",
          "mentions": [
            { "userId": 12, "username": "여행꿈나무" }
          ],
          "createdAt": "2026-05-04T11:02:00Z",
          "likeCount": 3,
          "isLiked": false
        },
        {
          "replyId": 108,
          "parentReplyId": 101,
          "user": "힐링마니아",
          "userId": 33,
          "avatar": "https://i.pravatar.cc/150?u=cm3",
          "content": "@맛집헌터 @여행꿈나무 저도 끼워주세요!",
          "mentions": [
            { "userId": 27, "username": "맛집헌터" },
            { "userId": 12, "username": "여행꿈나무" }
          ],
          "createdAt": "2026-05-04T12:15:00Z",
          "likeCount": 1,
          "isLiked": false
        }
      ]
    },
    {
      "replyId": 102,
      "parentReplyId": null,
      "user": "맛집헌터",
      "userId": 27,
      "avatar": "https://i.pravatar.cc/150?u=cm2",
      "content": "주말에 가봤는데 사람이 좀 많았어요. 평일 추천합니다~",
      "mentions": [],
      "createdAt": "2026-05-01T18:10:00Z",
      "likeCount": 8,
      "isLiked": true,
      "replyCount": 0,
      "replies": []
    },
    {
      "replyId": 103,
      "parentReplyId": null,
      "user": "힐링마니아",
      "userId": 33,
      "avatar": "https://i.pravatar.cc/150?u=cm3",
      "content": "코스 순서 그대로 따라가면 동선이 딱 맞아요. 짱입니다!",
      "mentions": [],
      "createdAt": "2026-04-29T09:45:00Z",
      "likeCount": 24,
      "isLiked": false,
      "replyCount": 0,
      "replies": []
    }
  ],
  "hasNext": false
}
```

# CMT-39. 댓글 좋아요
## URL : POST api/reply/like/{replyId}

> `CourseViewPage`의 ThumbsUp 버튼이 비활성 상태일 때 호출. 일반 댓글/대댓글 모두 동일 엔드포인트 사용.

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
| 404 | 댓글을 찾을 수 없음 |
| 409 | 이미 좋아요 처리된 댓글 |

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
    "replyId": 101,
    "likeCount": 13,
    "isLiked": true
  }
}
```

# CMT-40. 댓글 좋아요 취소
## URL : DELETE api/reply/like/{replyId}

> `CourseViewPage`의 ThumbsUp 버튼이 이미 활성 상태일 때 호출. 일반 댓글/대댓글 모두 동일 엔드포인트 사용.

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
| 404 | 댓글을 찾을 수 없음 |
| 409 | 좋아요 상태가 아닌 댓글 |

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
    "replyId": 101,
    "likeCount": 12,
    "isLiked": false
  }
}
```

# CMT-N1. 댓글 신고
## URL : POST api/reply/{replyId}/report

> 현재 UI 진입점은 없음. 코스 신고와 동일 정책으로 향후 추가 예정. 일반 댓글/대댓글 모두 동일 엔드포인트 사용.

### 본문 파라미터

| **이름** | **유형** | **필수/선택** | **설명** |
| --- | --- | --- | --- |
| reason | String | 필수 | 신고 사유 (REPORT_REASONS enum) |
| detail | String | 선택 | 상세 설명 (최대 500자) |
|  |  |  |  |

### 응답 코드

| status | message |
| --- | --- |
| 201 | 신고 접수 |
| 400 | 요청 데이터 오류 |
| 401 | 인증 필요 |
| 404 | 댓글을 찾을 수 없음 |
| 409 | 동일 댓글 중복 신고 |

## 코드 예시

### 요청

```jsx
{
  "reason": "부적절한 내용이 있어요",
  "detail": "욕설이 포함되어 있습니다."
}
```

### 응답

```java
{
  "status": 201,
  "data": {
    "reportId": 14,
    "createdAt": "2026-05-06T12:30:00Z"
  }
}
```
