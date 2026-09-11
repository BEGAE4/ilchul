# PLAN 목데이터 제거 및 에러 UI 적용 결과

> 선행 작업: [260705-result-012-plan_api_v5_migration.md](260705-result-012-plan_api_v5_migration.md)
> 작업일: 2026-07-05 / 브랜치: `feature-fe-admin`

## 개요

plan 도메인에서 목데이터 폴백(하이브리드)을 제거하고 **서버 전용**으로 전환했다.
데이터 로드 실패 시 에러 UI(안내 문구 + 다시 시도 + 돌아가기)를 렌더링한다.

## 변경 내용

### 1. `src/features/plan/hooks/usePlanDetail.ts`
- 목데이터 폴백 제거 — planId가 숫자가 아니면 즉시 `error: '플랜을 찾을 수 없습니다.'`
- `refetch()` 추가 (에러 UI의 "다시 시도" 버튼용)

### 2. `src/features/plan/hooks/usePlanActions.ts`
- `onLocalLike`/`onLocalScrap` 로컬 폴백 옵션 제거 — 서버 플랜 없으면 no-op
- 시그니처 변경: `usePlanActions(serverPlan)` (planId 파라미터 제거)

### 3. `src/features/course-detail/components/CourseViewPage.tsx` — 서버 전용 전면 전환
- `useCourseStore` 의존 완전 제거. 모든 표시 데이터를 v5 `PlanDetailDto`에서 렌더링:
  - 히어로: `thumbnailUrl`/`planImageUrls[0]`, `tags`, `planTitle`, 첫 장소 주소 기반 지역 라벨
  - 작성자: `userNickName`/`userAvatar`/`userId` (프로필 이동은 `/profile/{userId}`)
  - 정보 그리드: `requiredTime`(분→시간 포맷), `bookmarkCount`, `likeCount`
  - 타임라인: `planPlaceDetailDtos`를 `orderIndex` 정렬 후 `visitTime`/`categoryName`/`placeName`/`stayDescription` 렌더링
- **에러 UI 추가**: 로드 실패/존재하지 않는 플랜 시 안내 + "다시 시도"(refetch) + "돌아가기"
- **일정 담기**: 로컬 `cloneCourseToMy` → **v5 `POST /api/plan/{planId}/clone`** 연동. 성공 모달의 "플랜 보기"는 복제된 `/course/{planId}`로 이동. 실패 시 에러 토스트.
- "관련 플랜" 섹션 제거 (목데이터 기반이었고 v5에 대응 API 없음 — 추후 인기 플랜 API 등으로 대체 가능)

### 4. `src/features/course-creation/components/CourseCreationFlow.tsx`
- 로컬 스토어 저장(`addMyCourse`) 제거 — **서버 생성 성공 시에만** reset + 성공 토스트 + `/course/{planId}` 이동
- 실패 시 에러 토스트("플랜 저장에 실패했어요 / 네트워크 상태 확인") 노출하고 현재 화면 유지
- `isSaving` 가드로 중복 제출 방지

## 남은 목데이터 화면 (이번 범위 밖, 후속 전환 필요)

| 화면 | 상태 |
| --- | --- |
| `MyCourseDetailPage` (내 플랜 상세) | 여전히 `useCourseStore.myCourses` 기반 — v5 `PlanDetailDto`(isStamped 포함) 기반 전환 필요 |
| 홈/검색의 플랜 목록·캐러셀 | 목데이터 기반 — 인기 플랜 API 연동은 기존 BFF 유지 중 |
| `ProfilePage`의 'courses'/'bookmarks' 탭 | 스토어 기반 ('plans' 탭은 서버 연동됨) |

## 검증

- `yarn tsc --noEmit` 통과
- `yarn build` 성공 (11.9s)
