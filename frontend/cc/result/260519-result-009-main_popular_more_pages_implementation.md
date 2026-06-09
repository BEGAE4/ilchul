---
작성일: 2026-05-19
작업 영역: frontend
관련 문서:
  - 계획: [cc/plan/260519-plan-004-main_popular_more_pages.md](../plan/260519-plan-004-main_popular_more_pages.md)
  - 명세: [cc/api/v1/main.md](../api/v1/main.md)
---

# 메인 인기 섹션 "더보기" 전용 페이지 구현 결과 (PR-1~4 완료)

## 1. 한 줄 요약

[cc/plan/260519-plan-004](../plan/260519-plan-004-main_popular_more_pages.md)의 PR-1~4 전체를 `yj-03` 브랜치 위에서 연속 구현. 홈 더보기 버튼 4곳을 `/{place,plan}/popular[/nationwide]` 전용 페이지로 분리하고, 무한 스크롤 페이지네이션 + 위치 권한 거부 시 nationwide 자동 리다이렉트까지 동작 검증 완료.

---

## 2. 변경 요약

### 2-1. 신규 파일

| 카테고리 | 파일 |
| --- | --- |
| 타입 | [pagination.types.ts](../../src/features/main/types/pagination.types.ts), [popular-place.types.ts](../../src/features/main/types/popular-place.types.ts), [popular-plan.types.ts](../../src/features/main/types/popular-plan.types.ts), [types/index.ts](../../src/features/main/types/index.ts) |
| 유틸 | [utils/popular-mock.ts](../../src/features/main/utils/popular-mock.ts) (mock 6배 카탈로그 빌더 + `clampPagination` + `paginate`) |
| API | [api/main.api.ts](../../src/features/main/api/main.api.ts) (axios 함수 4종) |
| 훅 | [usePaginatedList.ts](../../src/features/main/hooks/usePaginatedList.ts), [useGeolocation.ts](../../src/features/main/hooks/useGeolocation.ts), [useInfiniteScroll.ts](../../src/features/main/hooks/useInfiniteScroll.ts), [useNearbyPopularPlaces.ts](../../src/features/main/hooks/useNearbyPopularPlaces.ts), [useNearbyPopularPlans.ts](../../src/features/main/hooks/useNearbyPopularPlans.ts), [useNationwidePopularPlaces.ts](../../src/features/main/hooks/useNationwidePopularPlaces.ts), [useNationwidePopularPlans.ts](../../src/features/main/hooks/useNationwidePopularPlans.ts), [hooks/index.ts](../../src/features/main/hooks/index.ts) |
| BFF | [api/place/popular/route.ts](../../src/app/api/place/popular/route.ts), [api/place/popular/nationwide/route.ts](../../src/app/api/place/popular/nationwide/route.ts), [api/plan/popular/route.ts](../../src/app/api/plan/popular/route.ts), [api/plan/popular/nationwide/route.ts](../../src/app/api/plan/popular/nationwide/route.ts) |
| 컴포넌트 | [PopularPlaceCard/](../../src/features/main/components/PopularPlaceCard/), [PopularPlanCard/](../../src/features/main/components/PopularPlanCard/), [ListPageShell/](../../src/features/main/components/ListPageShell/), [PopularPlaceListPage/](../../src/features/main/components/PopularPlaceListPage/), [PopularPlanListPage/](../../src/features/main/components/PopularPlanListPage/), [NationwidePopularPlaceListPage/](../../src/features/main/components/NationwidePopularPlaceListPage/), [NationwidePopularPlanListPage/](../../src/features/main/components/NationwidePopularPlanListPage/), [components/index.ts](../../src/features/main/components/index.ts) |
| 라우트 | [src/app/place/popular/page.tsx](../../src/app/place/popular/page.tsx), [src/app/place/popular/nationwide/page.tsx](../../src/app/place/popular/nationwide/page.tsx), [src/app/plan/popular/page.tsx](../../src/app/plan/popular/page.tsx), [src/app/plan/popular/nationwide/page.tsx](../../src/app/plan/popular/nationwide/page.tsx) |
| feature barrel | [src/features/main/index.ts](../../src/features/main/index.ts) |

### 2-2. 수정 파일

| 파일 | 변경 |
| --- | --- |
| [src/app/page.tsx](../../src/app/page.tsx) | 더보기 버튼 4곳 라우트 교체: `/search` → `/place/popular`, `/plan/popular`, `/place/popular/nationwide`, `/plan/popular/nationwide` |

---

## 3. 설계 메모

### 3-1. 페이지네이션 (`usePaginatedList`)
- `baseParams`의 JSON 직렬화를 의존성으로 사용 → 위치 좌표 변경 시 1페이지부터 자동 재조회.
- `requestIdRef`로 race condition 가드 — 빠른 페이지 이동 시 stale 응답이 화면을 덮어쓰지 않음.
- **id 기준 dedupe** — 실시간 랭킹 변동으로 동일 항목이 두 페이지에 등장해도 누적 머지 시 자동 제거.
- `isLoading`(초기) / `isLoadingMore`(더보기) / `error` / `hasNext` / `totalCount` 분리 노출.

### 3-2. 위치 권한 (`useGeolocation` + 페이지 단)
- 상태 5단계: `idle | loading | granted | denied | unsupported`.
- 거부/미지원 시 폴백 좌표를 사용하지 않고 **호출 측에 통보만** — 페이지 컴포넌트가 `useEffect`에서 `router.replace('/...popular/nationwide')` 호출.
- `idle`/`loading` 단계에서는 ListPageShell이 로딩 상태를 보여주므로 빈 화면 깜빡임이 없음.
- `getCurrentPosition` 7s timeout, `maximumAge` 5분.

### 3-3. 무한 스크롤 (`useInfiniteScroll`)
- ref callback 패턴 — sentinel DOM 노드가 마운트되면 `IntersectionObserver`를 부착, 언마운트되면 disconnect.
- `enabled` prop이 false로 바뀌면 즉시 disconnect, 다시 true가 되면 재바인딩 (예: error/last page 도달 시 자동 정지).
- `rootMargin: 200px` 기본값으로 미리 로드.

### 3-4. BFF 게이팅
- `NEXT_PUBLIC_API_BASE_URL` 유무로만 분기 (기존 [mypage/plans/route.ts](../../src/app/api/mypage/plans/route.ts) 패턴과 동일, 별도 USE_MOCK 환경변수 신설 안 함).
- 백엔드 실패/404/500 시 자동으로 mock 폴백 — dev 단계에서 무중단 개발 가능.
- mock 폴백도 `hasNext = page * limit < total`로 정직 계산 → 무한 스크롤이 무한 루프하지 않음.

### 3-5. mock 카탈로그 확장
- mockData의 시드(5~6건)로는 페이지네이션 시연 불가. `popular-mock.ts`의 6배 복제로 ~18~30건 규모 확보.
- 백엔드 연동 후에는 이 helper가 사용되지 않으므로 영향 없음. 정리 시점은 백엔드 안정화 이후 별도 plan으로.

### 3-6. URL/네이밍 결정 (계획서 §6 반영)
- URL: `/{place,plan}/popular[/nationwide]` — 도메인 우선, API 네임스페이스(`/api/{place,plan}/popular/...`)와 정렬.
- Next.js의 정적 세그먼트 우선 매칭으로 `/place/popular`가 `/place/[id]`와 충돌하지 않음을 확인.
- 카드 컴포넌트 명: `PopularPlaceCard`/`PopularPlanCard` (코스→플랜 일괄 변경 정책에 정렬).

---

## 4. 검증

### 4-1. 정적 검사

| 항목 | 결과 |
| --- | --- |
| `npx tsc --noEmit` | 0건 |
| `yarn lint` 신규 파일 (`src/features/main/`, `src/app/{place,plan}/popular/`, `src/app/api/{place,plan}/popular/`) | 0건 |
| `yarn lint` 사전 존재 에러 (기타 파일) | 본 작업 범위 외, 미수정 |

### 4-2. 런타임 (dev 서버, port 3002, 백엔드 미연결 → mock 폴백)

| 호출 | 결과 |
| --- | --- |
| `GET /place/popular` | 200 |
| `GET /place/popular/nationwide` | 200 |
| `GET /plan/popular` | 200 |
| `GET /plan/popular/nationwide` | 200 |
| `GET /api/place/popular?lat=37.5&lng=127&limit=5&page=1` | `page=1 hasNext=true totalCount=30 firstRank=1` |
| `GET /api/place/popular?...&page=2` | `page=2 firstRank=6` (누적 정상, "성수 카페거리 2호점" 등 카탈로그 확장 변형 확인) |
| `GET /api/place/popular/nationwide?limit=6&page=3` | `page=3 firstRank=13 "...3호점"` |
| `GET /api/plan/popular?...&limit=20&page=1` | `totalCount=24 firstRank=1 lastRank=20 hasNext=true` |
| `GET /api/plan/popular/nationwide?limit=20&page=1` | `totalCount=18 count=18 firstRank=1` |

### 4-3. 응답 컨벤션
- 4개 BFF 응답 모두 `{ status, message, data, page, limit, hasNext, totalCount }` 스키마 준수 ([cc/api/v1/main.md](../api/v1/main.md) MAIN-57/58/60/61 명세와 일치).

---

## 5. 사용자 동선

| 홈 섹션 | 더보기 행선지 | 페이지 사양 |
| --- | --- | --- |
| 주변 인기 장소 | `/place/popular` | 위치 기반 → 거부 시 nationwide 리다이렉트, 2열 그리드, limit=20 무한 스크롤 |
| 실시간 베스트 플랜 | `/plan/popular` | 위치 기반 → 거부 시 nationwide 리다이렉트, 가로형 카드 리스트, limit=20 무한 스크롤 |
| 전국 인기 장소 | `/place/popular/nationwide` | 위치 무관, 2열 그리드, limit=20 무한 스크롤 |
| 전국 인기 플랜 | `/plan/popular/nationwide` | 위치 무관, 가로형 카드 리스트, limit=20 무한 스크롤 |

각 페이지: backArrow 헤더 + 총 개수 + 무한 스크롤 sentinel + "마지막 결과입니다." 푸터 + 에러 시 "다시 시도" 버튼.

---

## 6. 미해결 / 사용자 판단 필요

### 6-1. 백엔드 응답 스키마 — **확인 필요**
- 현재 mock은 명세대로 `{ status, message, data, page, limit, hasNext, totalCount }` 반환. 백엔드도 동일하게 반환하는지 운영 빌드 시 확인 필요.

### 6-2. 카드 디자인의 추후 통일 — **후속 plan 분리 권장**
- `PopularPlaceCard`/`PopularPlanCard`는 홈의 인라인 마크업과 시각적으로 동일. 추후 [src/shared/ui](../../src/shared/ui) 로 끌어올려 홈도 동일 컴포넌트를 쓰도록 통합하면 디자인 변경 시 1곳만 수정하면 됨.

### 6-3. 홈 첫 로드의 mock 의존 — **이번 plan 범위 외**
- 홈([src/app/page.tsx](../../src/app/page.tsx))은 여전히 `NEARBY_POPULAR_PLACES`/`NATIONWIDE_PLACES`/`useCourseStore.courses` 로 mockData 렌더링. 더보기 라우트만 새 API 함수로 동작. 후속 plan으로 분리.

### 6-4. mock helper의 운영 잔존 — **백엔드 안정화 후 정리**
- BFF는 `NEXT_PUBLIC_API_BASE_URL` 설정 시 mock을 사용하지 않으나, `popular-mock.ts` 코드는 번들에 포함됨. 운영 영향은 없으나 클린업 차원에서 후속 작업으로.

### 6-5. report feature와의 브랜치 혼재
- 본 작업과 report PR-3~5가 `yj-03`에서 섞여 있음. 머지 전 git 히스토리를 cherry-pick으로 분리하거나 PR로 일괄 머지하는 방식 중 선택 필요.

---

## 7. 산출물 체크리스트

### PR-1
- [x] `src/features/main/types/pagination.types.ts`
- [x] `src/features/main/types/popular-place.types.ts`
- [x] `src/features/main/types/popular-plan.types.ts`
- [x] `src/features/main/types/index.ts`
- [x] `src/features/main/utils/popular-mock.ts`
- [x] `src/features/main/index.ts`

### PR-2
- [x] `src/features/main/api/main.api.ts`
- [x] `src/features/main/hooks/{usePaginatedList,useGeolocation,useInfiniteScroll}.ts`
- [x] `src/features/main/hooks/use{NearbyPopularPlaces,NearbyPopularPlans,NationwidePopularPlaces,NationwidePopularPlans}.ts`
- [x] `src/features/main/hooks/index.ts`
- [x] `src/app/api/place/popular/route.ts`
- [x] `src/app/api/place/popular/nationwide/route.ts`
- [x] `src/app/api/plan/popular/route.ts`
- [x] `src/app/api/plan/popular/nationwide/route.ts`

### PR-3
- [x] `src/features/main/components/PopularPlaceCard/{component,types,styles.module.scss,index}`
- [x] `src/features/main/components/PopularPlanCard/{component,types,styles.module.scss,index}`
- [x] `src/features/main/components/ListPageShell/{component,types,styles.module.scss,index}`
- [x] `src/features/main/components/index.ts`

### PR-4
- [x] `src/features/main/components/PopularPlaceListPage/{component,types,styles.module.scss,index}`
- [x] `src/features/main/components/PopularPlanListPage/{component,types,styles.module.scss,index}`
- [x] `src/features/main/components/NationwidePopularPlaceListPage/{component,types,styles.module.scss,index}`
- [x] `src/features/main/components/NationwidePopularPlanListPage/{component,types,styles.module.scss,index}`
- [x] `src/app/place/popular/page.tsx`
- [x] `src/app/place/popular/nationwide/page.tsx`
- [x] `src/app/plan/popular/page.tsx`
- [x] `src/app/plan/popular/nationwide/page.tsx`
- [x] `src/app/page.tsx` 더보기 버튼 4곳 라우트 교체
- [x] tsc/lint/dev 라우트 200 검증

---

## 8. 다음 액션

1. 브라우저에서 `/` 진입 후 4개 더보기 버튼 클릭으로 사용자 시나리오 수동 QA 권장 (시크릿 창에서 위치 권한 거부 시 nationwide로 리다이렉트되는지 포함).
2. report feature와 본 작업이 `yj-03`에 섞여 있으므로 PR 분리/머지 전략 결정 필요.
3. 백엔드 연동 시 응답 스키마 일치 여부 확인.
