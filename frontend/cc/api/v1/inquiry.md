# 문의(CS-Inquiry) API 명세 (v1)

## 공통

- Base URL: `/api/cs-inquiry`
- 인증: 세션 쿠키
- 작성/수정: `multipart/form-data`, 그 외: `application/json`
- 분류 체계
  - `inquiryType` (문의 타입): `GENERAL`(일반) / `BUG`(버그) / `SUGGESTION`(제안) / `OTHER`(기타)
  - `categoryId` (숫자) + `categoryName` (표시명). 프론트는 `inquiryType → categoryId` 고정 매핑 사용
    (`GENERAL=1, BUG=2, SUGGESTION=3, OTHER=4`)
- 상태값(`status`): `PENDING`(답변 대기) / `ANSWERED`(답변 완료)
- 목록은 커서 기반 페이지네이션(`nextCursorId`, `hasNext`) 사용

> 프론트엔드 BFF(`src/app/api/cs-inquiry/*`)가 백엔드(`{BASE}/api/cs-inquiry/*`)로 프록시하며,
> `NEXT_PUBLIC_API_BASE_URL` 미설정/요청 실패 시 mock 데이터를 반환한다.

---

## INQ-1. 문의 작성

**POST** `/api/cs-inquiry` · `multipart/form-data`

### Request (form fields)

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| title | string | ✅ | 제목 |
| content | string | ✅ | 내용 |
| categoryId | number | ✅ | 카테고리 ID |
| inquiryType | string | ✅ | `GENERAL`/`BUG`/`SUGGESTION`/`OTHER` |
| images | File[] | ✗ | 첨부 이미지(여러 장, 최대 5장) |

### Response `201`

```json
{
  "inquiryId": 123,
  "title": "앱 오류 문의드립니다",
  "categoryId": 2,
  "categoryName": "버그",
  "inquiryType": "BUG",
  "status": "PENDING",
  "images": [{ "imageId": 11, "url": "https://cdn.example.com/inq/11.jpg" }],
  "createdAt": "2026-05-07T10:00:00"
}
```

---

## INQ-2. 문의 수정

**PATCH** `/api/cs-inquiry/{inquiryId}` · `multipart/form-data`

> `status === PENDING` 인 경우에만 수정 가능

### Request (form fields)

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| title | string | ✗ | 제목 |
| content | string | ✗ | 내용 |
| categoryId | number | ✗ | 카테고리 ID |
| inquiryType | string | ✗ | 문의 타입 |
| images | File[] | ✗ | 새로 추가할 이미지 |
| deleteImageIds | number[] | ✗ | 삭제할 기존 이미지 ID |

### Response `200`

수정된 문의 상세 객체 반환

---

## INQ-3. 문의 삭제

**DELETE** `/api/cs-inquiry/{inquiryId}`

> `status === PENDING` 인 경우에만 삭제 가능

### Response `200`

```json
{ "success": true }
```

---

## INQ-4. 내 문의 조회

**GET** `/api/cs-inquiry/me`

### Query

| 파라미터 | 타입 | 필수 | 설명 |
|---|---|---|---|
| status | string | ✗ | `PENDING` / `ANSWERED` |
| cursorId | number | ✗ | 커서(이전 페이지 마지막 ID) |

### Response `200`

```json
{
  "items": [
    {
      "inquiryId": 123,
      "title": "앱 오류 문의드립니다",
      "categoryName": "버그",
      "status": "ANSWERED",
      "hasAnswer": true,
      "createdAt": "2026-05-07T10:00:00"
    }
  ],
  "nextCursorId": 118,
  "hasNext": true
}
```

---

## INQ-5. 전체 문의 조회 (관리자)

**GET** `/api/cs-inquiry`

### Query

| 파라미터 | 타입 | 필수 | 설명 |
|---|---|---|---|
| category | string | ✗ | 카테고리 필터 |
| search | string | ✗ | 검색어 |
| status | string | ✗ | `PENDING` / `ANSWERED` |
| lastInquiryId | number | ✗ | 커서 |

### Response `200`

```json
{
  "items": [
    {
      "inquiryId": 123,
      "title": "앱 오류 문의드립니다",
      "categoryName": "버그",
      "status": "PENDING",
      "hasAnswer": false,
      "authorNickname": "여행자123",
      "createdAt": "2026-05-07T10:00:00"
    }
  ],
  "nextCursorId": 118,
  "hasNext": true,
  "totalCount": 342
}
```

---

## INQ-6. 문의 상세 조회

**GET** `/api/cs-inquiry/{inquiryId}`

> 명세에 명시되지 않았으나 상세/수정/답변 화면에 필요하여 추가

### Response `200`

```json
{
  "inquiryId": 123,
  "title": "앱 오류 문의드립니다",
  "content": "코스 저장 시 오류가 발생합니다.",
  "categoryId": 2,
  "categoryName": "버그",
  "inquiryType": "BUG",
  "status": "ANSWERED",
  "images": [{ "imageId": 11, "url": "https://cdn.example.com/inq/11.jpg" }],
  "authorNickname": "여행자123",
  "createdAt": "2026-05-07T10:00:00",
  "updatedAt": "2026-05-07T11:00:00",
  "answer": {
    "answerId": 55,
    "inquiryId": 123,
    "content": "안녕하세요. 문의 주신 내용에 대해 답변드립니다...",
    "answeredBy": "관리자",
    "answeredAt": "2026-05-07T14:00:00"
  }
}
```

---

## INQ-7. 문의 답변 작성 (관리자)

**POST** `/api/cs-inquiry/{inquiryId}` · `application/json`

### Request Body

```json
{ "content": "안녕하세요. 문의 주신 내용에 대해 답변드립니다..." }
```

### Response `201`

```json
{
  "answerId": 55,
  "inquiryId": 123,
  "content": "안녕하세요. 문의 주신 내용에 대해 답변드립니다...",
  "answeredBy": "관리자",
  "answeredAt": "2026-05-07T14:00:00"
}
```

---

## INQ-8. 문의 카테고리(타입) 조회

**GET** `/api/cs-inquiry/category`

### Response `200`

```json
{
  "categories": [
    { "slug": "GENERAL", "name": "일반" },
    { "slug": "BUG", "name": "버그" },
    { "slug": "SUGGESTION", "name": "제안" },
    { "slug": "OTHER", "name": "기타" }
  ]
}
```
