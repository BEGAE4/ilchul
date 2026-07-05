# PLAN API (v4) 연동 결과

> 기준 명세: [cc/api/v4/260701-v4-004-plan.md](../api/v4/260701-v4-004-plan.md)
> 작업일: 2026-07-05 / 브랜치: `feature-fe-admin`

## 개요

PLAN v4 명세의 엔드포인트를 현재 UI(플랜 상세 보기, 코스 생성 플로우, 내 플랜 상세, 마이페이지)에 연동했다.
현재 화면 대부분이 목데이터 기반 Zustand 스토어(`useCourseStore`)로 동작하므로, **숫자 planId(서버 플랜)이면 실제 API를 호출하고, 목데이터 id(`my-...` 등)이면 기존 스토어 동작으로 폴백**하는 하이브리드 방식을 적용했다.

## 신규 파일 — `src/features/plan/`

| 파일 | 내용 |
| --- | --- |
| `types/plan.types.ts` | `PlanDetail`, `PlanPlace`, `DeparturePoint`, `CreatePlanBody`, `UpdatePlanPlacesBody`, 반응/목록 응답 타입 등 v4 명세 전체 타입 |
| `api/plan.api.ts` | 엔드포인트 함수 11개 (아래 표) — `@/shared/lib/api/apiClient`(axios) 사용, `comment.api.ts` 패턴 준수 |
| `hooks/usePlanDetail.ts` | 플랜 상세 조회 훅 (숫자 id만 서버 조회, 실패/목데이터 시 null 반환 → 화면이 스토어로 폴백) |
| `hooks/usePlanActions.ts` | 좋아요/스크랩 토글 훅 — 낙관적 업데이트 + 실패 시 롤백 + 로컬 폴백 콜백 지원 |
| `utils/planId.ts` | `toNumericPlanId(id)` — 라우트 string id → 서버 number planId 변환 (비숫자면 null) |
| `index.ts` | 공개 API 재수출 |

### API 함수 ↔ 엔드포인트 매핑

| 함수 | 메서드/URL |
| --- | --- |
| `createPlan` | POST `/api/plan` |
| `fetchPlanDetail` | GET `/api/plan/{planId}` |
| `updatePlan` | PUT `/api/plan/{planId}` |
| `deletePlan` | DELETE `/api/plan/{planId}` |
| `updatePlanPlaces` | POST `/api/plan-place/{planId}/update` (PLAN-3, 출발지+장소 일괄 저장) |
| `updatePlanVisibility` | PATCH `/api/plan/{planId}/visibility` |
| `likePlan` / `unlikePlan` | POST / DELETE `/api/plan/{planId}/like` |
| `scrapPlan` / `unscrapPlan` | POST / DELETE `/api/plan/{planId}/scrap` |
| `fetchMyPlans` | GET `/api/plan/my?page&size` |
| `fetchMyScraps` | GET `/api/plan/my/scrap?page&size` |

## 수정 파일 (UI 연동)

### 1. `src/features/course-detail/components/CourseViewPage.tsx` — 플랜 상세/좋아요/스크랩
- `usePlanDetail(courseId)`로 서버 상세 조회. 서버 데이터가 있으면 제목/설명/좋아요 수/스크랩 수/isLiked/isScrapped를 서버 값으로 표시.
- 좋아요·스크랩 버튼(작성자 옆 버튼, 정보 그리드, `BottomActionBar`, 더보기 메뉴) 전부 `usePlanActions`의 `toggleLike`/`toggleScrap`으로 교체.
  - 서버 플랜: API 호출 + 낙관적 업데이트(실패 시 롤백 + 에러 토스트).
  - 목데이터 플랜: 기존 `useCourseStore` 토글 + 기존 토스트 유지.
- 스켈레톤 로딩에 `isPlanLoading` 반영.

### 2. `src/features/course-creation/components/CourseCreationFlow.tsx` — 플랜 생성 + 장소 일괄 저장 (PLAN-1, PLAN-3)
- 최종 플랜 확정(`finalPlan` step) 시:
  1. `createPlan({ title, description, isPublic: false, thumbnailUrl })` 호출.
  2. 생성된 planId로 `updatePlanPlaces` 호출 — `startingPoint`(주소, `coord.lng→x`, `coord.lat→y`)를 `departurePoint`로, `finalStops`를 `{ placeId, order }` 배열로 전송(숫자 변환 불가한 목 placeId는 제외).
- 서버 저장 실패(백엔드 미기동, 목 placeId 등) 시 콘솔 로그 후 기존 로컬 스토어 저장 흐름은 그대로 유지 → UI 회귀 없음.

### 3. `src/features/my-course/components/MyCourseDetailPage.tsx` — 플랜 수정/삭제
- 이름 변경 확인 시: 로컬 `updateMyCourse` + (숫자 id면) `planApi.updatePlan(planId, { title })`.
- 삭제 확인 시: 로컬 `deleteMyCourse` + (숫자 id면) `planApi.deletePlan(planId)`.

### 4. `src/features/my-page/api/my-page.api.ts` + `src/features/profile/components/ProfilePage.tsx` — 공개 설정 v4 마이그레이션 (PLAN-4)
- 기존 `POST /api/mypage/plan/visibility/{planId}` → **v4 `PATCH /api/plan/{planId}/visibility` + `{ isPublic }` 본문**으로 교체.
- `setMyPlanVisibility(planId, isPublic)` 시그니처 변경, `ProfilePage.handleTogglePlanVisibility`에서 `next` 값 전달.

## 미연동/보류 항목

| 항목 | 사유 |
| --- | --- |
| GET `/api/plan/user/{userId}` (타 사용자 플랜 목록) | 명세상 클라이언트 담당 미배정(`-`), 소비할 UI 미확정 |
| GET `/api/plan/popular`, `/popular/nationwide` | 서버 미구현(`-`) — 기존 `/api/plan/popular` BFF 라우트 유지 |
| `fetchMyPlans` BFF(`/api/mypage/plans`) → v4 `/api/plan/my` 교체 | v4 문서에 목록 응답 스키마가 없어 기존 `MyPlan` 매핑을 깨지 않도록 보류. `plan.api.ts`의 `fetchMyPlans`/`fetchMyScraps`는 준비 완료 상태 |
| 좋아요/스크랩 409 처리 | 낙관적 업데이트 롤백으로 일괄 처리 (별도 재동기화 없음) |

## 검증

- `yarn tsc --noEmit` 통과
- `yarn build` 성공 (15.6s, 전체 라우트 정상 생성)
- 런타임 동작: 백엔드(`localhost:3845`, `NEXT_PUBLIC_API_BASE_URL`) 기동 상태에서 숫자 planId 라우트 접근 시 실제 API 사용. 목데이터 id는 기존과 동일하게 동작.
