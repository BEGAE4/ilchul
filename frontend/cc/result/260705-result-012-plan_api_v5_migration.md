# PLAN API v5 마이그레이션 결과

> 기준 명세: [cc/api/v5/260705-v5-004-plan.md](../api/v5/260705-v5-004-plan.md) 외 v5 문서 일체
> 선행 작업: [260705-result-011-plan_api_integration.md](260705-result-011-plan_api_integration.md) (v4 기준 연동)
> 작업일: 2026-07-05 / 브랜치: `feature-fe-admin`

## 개요

v4 기준으로 연동했던 `src/features/plan` 모듈과 소비처를 v5(OpenAPI [api-docs.json](../api/v5/api-docs.json)) 기준으로 전면 교체했다.
하이브리드 전략(숫자 planId → 서버 API, 목데이터 id → 스토어 폴백)은 그대로 유지.

## 변경 내용

### 1. `src/features/plan/types/plan.types.ts` — v5 DTO로 재작성
- `PlanDetail`: `PlanDetailDto` 구조 반영 — `planTitle`, `planDescription`, `isPlanVisible`, `isBookmarked`/`bookmarkCount`, `userId`/`userNickName`/`userAvatar` 평면 작성자 필드, `planPlaceDetailDtos`, `tripStartDate`/`tripEndDate` 등. `{ status, data }` 래핑 제거.
- `CreatePlanBody`: 생성 시 출발지·여행일정·장소 목록까지 포함하는 v5 구조.
- 신규: `ClonePlanBody/Response`(플랜 복제), `LikeResponse`, `ScrapPlanResponse`, `PlanSummary`/`MyPlansResponse`/`ScrappedPlansResponse`.

### 2. `src/features/plan/api/plan.api.ts` — 엔드포인트 교체

| 함수 | v4 | v5 |
| --- | --- | --- |
| `createPlan` | POST `/api/plan` | POST `/api/plan/create` (장소 일괄 포함) |
| `fetchPlanDetail` | GET (래핑 응답) | GET `/api/plan/{planId}` (`PlanDetailDto` 직접) |
| `updatePlan` | PUT | **PATCH** `/api/plan/{planId}` |
| `likePlan`/`unlikePlan` | `/api/plan/{planId}/like` | POST/DELETE `/api/like/{planId}` → `{ isLiked, likeCount }` |
| `togglePlanScrap` (구 scrap/unscrap 2개) | POST/DELETE `/api/plan/{planId}/scrap` | **POST 단일 토글** `/api/plan/scrapped/{planId}` → `{ isBookmarked, bookmarkCount }` |
| `togglePlanVisibility` (구 updatePlanVisibility) | PATCH + body | POST `/api/mypage/plan/visibility/{planId}` (본문 없음) |
| `fetchMyPlans` | GET `/api/plan/my` | GET `/api/mypage/plans` |
| `fetchMyScraps` | GET `/api/plan/my/scrap` | GET `/api/mypage/scrapped` |
| `clonePlan` | (없음) | POST `/api/plan/{planId}/clone` 신규 |
| `updatePlanPlaces` | 동일 | 동일 (`/api/plan-place/{planId}/update`) |

### 3. 훅
- `usePlanDetail`: 래핑 제거된 응답 반영.
- `usePlanActions`: 좋아요/스크랩 모두 **서버 응답값으로 상태 확정** (v5는 두 API 모두 최신 상태를 응답). 스크랩은 토글형 POST 단일 호출로 변경(낙관적 업데이트 대신 pending 가드). 반환 인터페이스(`isScrapped`/`scrapCount`)는 유지해 소비처 변경 최소화.

### 4. 소비처
- `CourseViewPage.tsx`: `serverPlan.title/description` → `planTitle`/`planDescription` 참조만 변경 (나머지는 훅 인터페이스 유지로 무변경).
- `CourseCreationFlow.tsx`: v4의 2단계 호출(createPlan → updatePlanPlaces)을 **v5 `createPlan` 단일 호출**로 교체 — departurePoint, tripStartDate/EndDate(설문 날짜+시간 조합), places 포함.
- `MyCourseDetailPage.tsx`: 이름 변경 시 `updatePlan(planId, { planTitle })` (PATCH).
- `my-page.api.ts` + `ProfilePage.tsx`: 공개 설정을 v5 `POST /api/mypage/plan/visibility/{planId}`(본문 없는 토글)로 변경, `setMyPlanVisibility(planId)` 시그니처 원복.

## 미연동/보류

| 항목 | 사유 |
| --- | --- |
| 플랜 이미지 업로드/삭제 (`/api/plan/{planId}/images`) | 이미지 편집 UI 부재 |
| 플랜 복제 UI 연동 (`clonePlan`) | API 함수만 준비 — CourseViewPage "일정 담기"는 현재 로컬 clone(`cloneCourseToMy`) 유지 (목데이터 플랜과 혼재하므로 별도 작업 권장) |
| 생성/수정 프리뷰 (`/api/plan-place/*/preview`) | 프리뷰 UI 부재 |
| 스탬프 인증 (`/api/plan-place/{planPlaceId}/stamp`) | 인증 플로우가 목데이터 기반 |
| `GET /api/plan` (좋아요순) | 명세에 응답 스키마 미정의 |

## 검증

- `yarn tsc --noEmit` 통과
- `yarn build` 성공 (13.5s)
