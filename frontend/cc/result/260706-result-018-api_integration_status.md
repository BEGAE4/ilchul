# 전체 API 적용 현황 (v5 기준)

> 작성일: 2026-07-06 / 브랜치: `feature-fe-admin`
> 기준 명세: [cc/api/v5/](../api/v5/260705-v5-000-overview.md) / 상세 이력: [011](260705-result-011-plan_api_integration.md)~[017](260705-result-017-backend_requests_and_pending_items.md)

## 상태 범례

| 표기 | 의미 |
| --- | --- |
| ✅ 연동 완료 | API 호출 + UI 반영까지 완료 |
| 🔶 함수만 준비 | API 함수 구현 완료, UI 연동 대기 |
| ⏸ 보류 | 명세 괴리/스키마 미정의/서버 필드 부재로 보류 |
| 🧪 BFF 목 | Next.js BFF 목 라우트 사용 중 (v5 미전환) |
| ➖ 대상 아님 | 프론트 사용처 없음 |

---

## 1. PLAN — `src/features/plan/` (✅ 서버 전용 전환 완료)

| 엔드포인트 | 프론트 함수 | 사용 화면 | 상태 |
| --- | --- | --- | --- |
| POST `/api/plan/create` | `createPlan` | 코스 생성 플로우 최종 단계 | ✅ |
| GET `/api/plan/{planId}` | `fetchPlanDetail` (`usePlanDetail`) | 코스 상세, 내 플랜 상세 (에러 UI 포함) | ✅ |
| PATCH `/api/plan/{planId}` | `updatePlan` | 플랜 이름 수정, 복제 시 시간 반영 | ✅ |
| DELETE `/api/plan/{planId}` | `deletePlan` | 내 플랜 삭제 | ✅ |
| POST `/api/plan/{planId}/clone` | `clonePlan` | 코스 상세 "일정 담기", 내 플랜 복제 | ✅ |
| POST `/api/like/{planId}` / DELETE | `likePlan`/`unlikePlan` (`usePlanActions`) | 코스 상세 좋아요 (낙관적 업데이트+롤백) | ✅ |
| POST `/api/plan/scrapped/{planId}` | `togglePlanScrap` | 코스 상세 스크랩 | ✅ |
| POST `/api/mypage/plan/visibility/{planId}` | `togglePlanVisibility`, my-page `setMyPlanVisibility` | 마이페이지 공개 토글 | ✅ |
| POST `/api/plan/{planId}/images` | `uploadPlanImages` | 내 플랜 "사진 관리" 시트 업로드 | ✅ |
| DELETE `/api/plan/{planId}/images` | `deletePlanImages` | — | ⏸ 응답에 이미지 ID 없음 (A-1) |
| GET `/api/mypage/plans` | `fetchMyPlans` | ProfilePage는 BFF(`/api/mypage/plans`) 경유 | 🔶 (D-6) |
| GET `/api/mypage/scrapped` | `fetchMyScraps` | — | 🔶 |
| GET `/api/plan` (좋아요순) | — | — | ⏸ 스키마 미정의 (C-1) |
| GET `/api/plan/popular`(+nationwide) | — | 홈 인기 플랜 — BFF 라우트 사용 | 🧪 |

## 2. PLAN-PLACE

| 엔드포인트 | 프론트 함수 | 사용 화면 | 상태 |
| --- | --- | --- | --- |
| POST `/api/plan-place/{planId}/update` | `updatePlanPlaces` | 내 플랜 순서 편집 확정 저장 | ✅ |
| POST `/api/plan-place/{planId}/preview` | `updatePlanPreview` | 순서 편집 완료 시 비교 모달(소요시간/거리) | ✅ |
| POST `/api/plan-place/preview` | `createPlanPreview` | 코스 생성 최종 단계 프리뷰 배너 | ✅ |
| POST `/api/plan-place/{planPlaceId}/stamp` | `stampPlanPlace` | 내 플랜 스탬프 인증 (카메라+위치) | ✅ (location 파트 형식 서버 확인 필요, B-3) |

## 3. PLACE — `src/features/place/` (하이브리드: 숫자 id → 서버)

| 엔드포인트 | 프론트 함수 | 사용 화면 | 상태 |
| --- | --- | --- | --- |
| GET `/api/place/{placeId}` | `fetchPlaceDetail` (`usePlaceDetail`) | 장소 상세 | ✅ |
| POST `/api/place/{placeId}/likes` / DELETE | `likePlace`/`unlikePlace` | 장소 상세 좋아요 | ✅ (초기값 필드 부재, A-3) |
| POST `/api/place/{placeId}/scraps` / DELETE | `scrapPlace`/`unscrapPlace` | 장소 상세 스크랩 | ✅ (초기값 필드 부재, A-3) |
| GET `/api/place/{placeId}/review` | `fetchPlaceReviews` | 후기 목록 + "후기 더 보기"(커서 페이징) | ✅ |
| POST `/api/place/{placeId}/review` | `writePlaceReview` | 후기 작성 폼 | ✅ |
| GET `/api/place/{placeId}/plan` | `fetchPlansContainingPlace` | "이 장소가 포함된 플랜" 캐러셀 | ✅ |
| GET `/api/place/search` | `searchPlaces` | 검색 페이지는 목데이터 기반 | 🔶 (D-3) |
| GET `/api/place/popular`(+nationwide) | `fetchPopularPlaces` 등 | 홈은 BFF 라우트 사용 | 🔶/🧪 (D-4) |
| POST `/api/place/recommend` | `recommendPlaces` | 코스 생성 추천 장소는 목데이터 | ⏸ 응답 스키마 미정의 (C-2) |

## 4. COMMENT(댓글) — `src/features/course-detail/` (기존 연동 유지)

| 엔드포인트 | 프론트 함수 | 사용 화면 | 상태 |
| --- | --- | --- | --- |
| GET/POST `/api/reply/{planId}` | `fetchComments`/`postComment` (`useComments`) | 코스 상세 댓글 | ✅ |
| GET `/api/reply/{parentReplyId}/children` | `fetchChildReplies` | 대댓글 | ✅ |
| DELETE `/api/reply/{replyId}` | `deleteComment` | 댓글 삭제 | ✅ |
| PATCH `/api/reply/{replyId}` (수정) | — | — | ❌ 미연동 (v5 신규, UI 없음) |
| POST/DELETE `/api/reply/like/{replyId}` | `likeComment`/`unlikeComment` | 댓글 좋아요 | ✅ (응답 타입 v5 확인 필요, B-5) |

## 5. MYPAGE

| 엔드포인트 | 프론트 함수 | 사용 화면 | 상태 |
| --- | --- | --- | --- |
| GET/PATCH `/api/mypage/profile` | `fetchMyPageProfile`/`updateMyPageProfile` | 프로필 조회/수정 | ✅ (기존 연동) |
| GET `/api/mypage/summary` | `fetchMyPageSummary` | 마이페이지 카운트 | ✅ (기존 연동) |
| GET `/api/mypage/plans` | `fetchMyPlans` (BFF 경유) | 마이페이지 '내 플랜' 탭 | 🧪 → 🔶 v5 직접 호출 준비됨 (D-6) |
| GET `/api/mypage/scrapped` | `fetchMyScraps` | — | 🔶 |
| POST `/api/mypage/plan/visibility/{planId}` | `setMyPlanVisibility` | 공개 토글 | ✅ |

## 6. REPORT(신고)

| 엔드포인트 | 프론트 함수 | 사용 화면 | 상태 |
| --- | --- | --- | --- |
| POST `/api/report` | `submitReport` | 신고 다이얼로그 (숫자 대상 id → v5 / 목 id → BFF) | ✅ 하이브리드 |
| GET `/api/report/reason` | `fetchReportReasons` | 다이얼로그는 로컬 상수 사용 | 🔶 (D-5) |
| GET `/api/admin/reports` | `fetchAdminReports` | 관리자 신고 목록 (v5 우선 + BFF 폴백) | ✅ |
| GET `/api/admin/reports/{reportId}` | `fetchAdminReportDetail` | 관리자 신고 상세 | ✅ (comment courseId/snippet best-effort, A-4) |
| PATCH `/api/admin/reports/{reportId}` | `patchAdminReportStatus` | 상태 변경 | ✅ |
| 제재 발급 | `issueSanction` | 관리자 상세 | 🧪 v5 엔드포인트 부재 (A-6) |

## 7. CS-INQUIRY(고객 문의)

| 엔드포인트 | 상태 |
| --- | --- |
| 관리자 목록/답변, 사용자 작성/수정/삭제/종료/카테고리 전체 | ⏸ **전체 보류** — 상세 엔드포인트 부재, 상태·카테고리 enum 괴리, 커서 vs 오프셋 페이징 (B-1) → admin-inquiry는 BFF 목 유지 |

## 8. SEARCH / AUTH / 기타

| 엔드포인트 | 사용 화면 | 상태 |
| --- | --- | --- |
| GET/POST/DELETE `/api/recent` (최근 검색어) | 검색 페이지 | ✅ (기존 연동, f96b23f) |
| `/api/sign/logout`·`userinfo`·`reissue`·`delete` | 인증 플로우 | 기존 연동 유지 (`userinfo` 스키마 미정의, C-3) |

---

## 요약 통계

| 상태 | 개수(엔드포인트 기준) |
| --- | --- |
| ✅ 연동 완료 | 28 |
| 🔶 함수만 준비 (UI 연동 대기) | 6 |
| ⏸ 보류 (서버 협의 필요) | 4개 그룹 (이미지 삭제, 좋아요순, 추천, cs-inquiry 전체) |
| 🧪 BFF 목 유지 | 인기 플랜/장소 홈, 제재, admin-inquiry, 목 id 신고 폴백 |
| ❌ 미연동 | 댓글 수정(PATCH) |

## 남은 작업 우선순위 제안

1. **백엔드 협의(A 항목)** — 이미지 ID, 여행 기록 API, 장소 반응 초기값, 신고 대상 필드, 문의 상세/제재 → [017 문서](260705-result-017-backend_requests_and_pending_items.md) 전달
2. 홈/검색 목데이터 화면의 v5 전환 (인기 플랜·장소 직접 호출 + 좋아요순/추천 스키마 확정 후)
3. ProfilePage 'courses'/'bookmarks' 탭 및 내 플랜 목록 v5 직접 호출 전환 (D-6)
4. 댓글 수정 UI, 신고 사유 서버 전환 (D-5)
