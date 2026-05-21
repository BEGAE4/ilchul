# 문의 API 명세 (v1)

## 공통

- Base URL: `/api/inquiry`
- 인증: 세션 쿠키
- Content-Type: `application/json`

---

## INQ-1. 내 문의 목록 조회

**GET** `/api/inquiry`

### Response `200`

```json
{
  "inquiries": [
    {
      "inquiryId": 1,
      "userId": "me",
      "userNickname": "김여행",
      "category": "bug",
      "title": "앱 실행 시 화면이 멈춥니다",
      "content": "홈 화면에서 코스 탭을 누르면...",
      "status": "pending",
      "createdAt": "2026-05-14T10:30:00Z",
      "updatedAt": "2026-05-14T10:30:00Z",
      "answer": null
    }
  ]
}
```

---

## INQ-2. 문의 작성

**POST** `/api/inquiry`

### Request Body

```json
{
  "category": "bug",
  "title": "앱 실행 시 화면이 멈춥니다",
  "content": "홈 화면에서 코스 탭을 누르면..."
}
```

### Category 값

| 값 | 레이블 |
|---|---|
| `account` | 계정 |
| `payment` | 결제 |
| `bug` | 오류/버그 |
| `feature` | 기능 제안 |
| `content` | 콘텐츠 |
| `other` | 기타 |

### Response `201`

생성된 `Inquiry` 객체 반환

---

## INQ-3. 문의 상세 조회

**GET** `/api/inquiry/{inquiryId}`

### Response `200`

`Inquiry` 객체 (answer 포함)

---

## INQ-4. 문의 수정

**PATCH** `/api/inquiry/{inquiryId}`

> `status === 'pending'` 인 경우에만 수정 가능

### Request Body

```json
{
  "category": "account",
  "title": "수정된 제목",
  "content": "수정된 내용"
}
```

### Response `200`

수정된 `Inquiry` 객체 반환

---

## INQ-5. 문의 삭제

**DELETE** `/api/inquiry/{inquiryId}`

> `status === 'pending'` 인 경우에만 삭제 가능

### Response `200`

```json
{ "success": true }
```

---

## INQ-6. 전체 문의 조회 (관리자)

**GET** `/api/inquiry/all`

### Response `200`

```json
{
  "inquiries": [ /* 전체 유저의 Inquiry 배열 */ ]
}
```

---

## INQ-7. 문의 답변 작성 (관리자)

**POST** `/api/inquiry/{inquiryId}/answer`

### Request Body

```json
{
  "content": "안녕하세요! 일출 팀입니다..."
}
```

### Response `200`

```json
{
  "success": true,
  "inquiryId": 1,
  "answer": {
    "answerId": 101,
    "content": "안녕하세요! 일출 팀입니다...",
    "createdAt": "2026-05-16T10:00:00Z",
    "adminName": "일출 운영팀"
  }
}
```

---

## INQ-8. 카테고리 목록 조회

**GET** `/api/inquiry/categories`

### Response `200`

```json
{
  "categories": [
    { "id": "account", "label": "계정" },
    { "id": "payment", "label": "결제" },
    { "id": "bug", "label": "오류/버그" },
    { "id": "feature", "label": "기능 제안" },
    { "id": "content", "label": "콘텐츠" },
    { "id": "other", "label": "기타" }
  ]
}
```
