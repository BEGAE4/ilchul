# INQUIRY API (v2)

> Notion [엔드포인트 (3)](https://www.notion.so/3740e945fc0980c29284f38e962359db) 기준. 엔드포인트 7건.

# 문의 작성
## URL : POST api/cs-inquiry
> **Notion ID**: 59 | **서버**: 시작 전 | **클라이언트**: 시작 전 | **FE 검토**: 미완료
> **URL**: `POST api/cs-inquiry`
> **비고**: AI 틀 작성, 검토 필요


### 응답 코드

| status | message |
| --- | --- |
| 200 | 성공 |
| 400 | 요청 데이터 오류 |

---

# 문의 수정
## URL : PATCH api/cs-inquiry/{inquiryId}
> **Notion ID**: 66 | **서버**: 시작 전 | **클라이언트**: 시작 전 | **FE 검토**: 미완료
> **URL**: `PATCH api/cs-inquiry/{inquiryId}`


### 응답 코드

| status | message |
| --- | --- |
| 200 | 성공 |
| 400 | 요청 데이터 오류 |

---

# 문의 삭제
## URL : DELETE api/cs-inquiry/{inquiryId}
> **Notion ID**: 67 | **서버**: 시작 전 | **클라이언트**: 시작 전 | **FE 검토**: 미완료
> **URL**: `DELETE api/cs-inquiry/{inquiryId}`


### 응답 코드

| status | message |
| --- | --- |
| 200 | 성공 |
| 400 | 요청 데이터 오류 |

---

# 내 문의 조회 → 마이페이지 기능인가..?
## URL : GET
> **Notion ID**: 68 | **서버**: 시작 전 | **클라이언트**: 시작 전 | **FE 검토**: 미완료


### 응답 코드

| status | message |
| --- | --- |
| 200 | 성공 |
| 400 | 요청 데이터 오류 |

---

# 모든 문의 조회
## URL : GET api/cs-inquiry?category=&search=&lastInquiryId=
> **Notion ID**: 69 | **서버**: 시작 전 | **클라이언트**: 시작 전 | **FE 검토**: 미완료
> **URL**: `GET api/cs-inquiry?category=&search=&lastInquiryId=`


### 응답 코드

| status | message |
| --- | --- |
| 200 | 성공 |
| 400 | 요청 데이터 오류 |

---

# 문의 답변 작성
## URL : POST api/cs-inquiry/{inquiryId}
> **Notion ID**: 70 | **서버**: 시작 전 | **클라이언트**: 시작 전 | **FE 검토**: 미완료
> **URL**: `POST api/cs-inquiry/{inquiryId}`


### 응답 코드

| status | message |
| --- | --- |
| 200 | 성공 |
| 400 | 요청 데이터 오류 |

---

# 문의 카테고리 조회
## URL : GET api/cs-inquiry/category
> **Notion ID**: 71 | **서버**: 시작 전 | **클라이언트**: 시작 전 | **FE 검토**: 미완료
> **URL**: `GET api/cs-inquiry/category`


### 응답 코드

| status | message |
| --- | --- |
| 200 | 성공 |
| 400 | 요청 데이터 오류 |

