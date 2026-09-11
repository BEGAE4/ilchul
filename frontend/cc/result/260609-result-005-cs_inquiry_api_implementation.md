# CS-Inquiry(문의) API 신규 명세 반영 결과

> 일자: 2026-06-09
> 요청: 변경된 문의 API 명세(`/api/cs-inquiry`)에 맞춰 문의 기능 API 및 화면 구현

## 개요

기존 문의 구현(`/api/inquiry`, `category` 문자열, `pending/answered`)을 신규 명세로 전면 교체했다.

- URL: `/api/inquiry` → **`/api/cs-inquiry`**
- 분류: `category`(문자열) → **`categoryId`(숫자) + `inquiryType`(GENERAL/BUG/SUGGESTION/OTHER)**
  - 결정: 카테고리 조회 API 결과를 단일 타입 선택지로 사용, `categoryId`는 `inquiryType` 고정 매핑(GENERAL=1, BUG=2, SUGGESTION=3, OTHER=4)
- 상태: `pending/answered` → **`PENDING/ANSWERED`**
- 목록: 배열 → **커서 페이지네이션**(`items`, `nextCursorId`, `hasNext`, `totalCount`) + `hasAnswer`, `authorNickname`
- 이미지: **multipart/form-data**(`images: File[]`, 수정 시 `deleteImageIds: number[]`)
- 답변 작성: `POST /api/cs-inquiry/{id}`, 응답 `answeredBy/answeredAt`

## 엔드포인트 (BFF, `src/app/api/cs-inquiry/`)

| 기능 | 메서드 | URL |
|---|---|---|
| 작성 | POST | `/api/cs-inquiry` (multipart) |
| 전체 조회(관리자) | GET | `/api/cs-inquiry?category=&search=&status=&lastInquiryId=` |
| 내 문의 조회 | GET | `/api/cs-inquiry/me?status=&cursorId=` |
| 상세 조회 | GET | `/api/cs-inquiry/{id}` |
| 수정 | PATCH | `/api/cs-inquiry/{id}` (multipart) |
| 삭제 | DELETE | `/api/cs-inquiry/{id}` |
| 답변 작성(관리자) | POST | `/api/cs-inquiry/{id}` |
| 카테고리 조회 | GET | `/api/cs-inquiry/category` |

모든 라우트는 `NEXT_PUBLIC_API_BASE_URL` 미설정/요청 실패 시 mock 으로 폴백(`_mock.ts`). 작성/수정/삭제/답변도 폴백하여 백엔드 없이 전 기능 테스트 가능.

## 생성/수정 파일

**신규**
- `src/app/api/cs-inquiry/_mock.ts`
- `src/app/api/cs-inquiry/route.ts`
- `src/app/api/cs-inquiry/me/route.ts`
- `src/app/api/cs-inquiry/[id]/route.ts`
- `src/app/api/cs-inquiry/category/route.ts`

**수정(전면 교체 포함)**
- `src/features/inquiry/types/inquiry.types.ts` — 신규 타입 체계
- `src/features/inquiry/api/inquiry.api.ts` — FormData 기반 호출
- `src/features/inquiry/components/*` — InquiryCard / InquiryListSection / AdminInquiryListSection / InquiryDetailSection / InquiryFormSection(이미지 첨부 UI 추가) / AdminAnswerFormSection / InquiryPage
- `src/shared/lib/stores/useUserStore.ts` — `isAdmin?: boolean` 정식 필드화
- `cc/api/v1/inquiry.md` — 명세 갱신

**삭제**
- `src/app/api/inquiry/**` (구 라우트 5개)

## 검증

- `npx tsc --noEmit` → 통과(에러 없음)
- 프리뷰(BFF mock)에서 8개 엔드포인트 응답 확인:
  - me/all/detail/category GET 정상
  - create(201, multipart)/update(200)/delete(200)/answer(201) 정상
- UI 확인: 목록(탭/카드), 작성 폼(카테고리 API pill 4종, 이미지 첨부 0/5 + 추가 버튼)
- 콘솔 에러 없음

## 비고 / 후속

- `categoryId`는 명세에 숫자 목록 엔드포인트가 없어 `inquiryType` 1:1 매핑으로 전송 중. 백엔드가 별도 카테고리 목록을 운영한다면 매핑/선택 UI 재조정 필요.
- 상세 조회(`GET /api/cs-inquiry/{id}`)는 명세 미기재이나 화면상 필요하여 추가함(백엔드 구현 확인 필요).
- 이미지 미리보기/상세는 `next/image` `unoptimized`로 렌더(원격 도메인 설정 불필요).
