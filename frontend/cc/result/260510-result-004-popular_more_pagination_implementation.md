# 메인 인기 섹션 "더보기" 페이지네이션 구현 결과 (A안)

작성일: 2026-05-10
작업 영역: `frontend`
관련 문서:
- 사전 검토: [cc/result/260510-result-002-내_주변_실시간_베스트_플랜_더보기_api_검토.md](260510-result-002-내_주변_실시간_베스트_플랜_더보기_api_검토.md)
- 실행 계획: [cc/plan/260510-plan-002-popular_more_pagination.md](../plan/260510-plan-002-popular_more_pagination.md)
- 변경된 명세: [cc/api/v1/main(O).md](../api/v1/main(O).md)

---

## 1. 한 줄 요약

> 계획서의 Phase 0~5를 모두 적용해 **메인 4개 인기 섹션에 `page` + `hasNext`/`totalCount` 컨벤션을 통일**했고, **신규 더보기 라우트 4종 (`/popular/...`)** 과 **무한 스크롤 리스트 페이지**를 신설해 홈의 더보기 버튼을 모두 새 페이지로 연결했다. lint(신규 코드 0건) / `tsc --noEmit`(0건) / dev 라우트 200 응답 / 페이지네이션 응답(page=1·2·3) 검증 완료.

---

## 2. 변경 요약

### 2-1. API 명세 갱신

| ID | 변경 내용 |
| --- | --- |
| MAIN-57 (`/api/plan/popular`) | `page` 파라미터 추가, `limit` 최대값 50 명시, 응답에 `page/limit/hasNext/totalCount` 추가, 400 사유에 limit·page 범위 초과 추가 |
| MAIN-58 (`/api/plan/popular/nationwide`) | `limit` 최대값 50 명시, 응답에 메타 추가, 400 사유 보강 |
| MAIN-60 (`/api/place/popular/nationwide`) | 동일 |
| MAIN-61 (`/api/place/popular`) | `page` 파라미터 추가 + 위와 동일 |

→ [cc/api/v1/main(O).md](../api/v1/main(O).md)

### 2-2. 신규 추가 파일

| 카테고리 | 파일 | 역할 |
| --- | --- | --- |
| 타입 | [src/features/main/types/pagination.types.ts](../../src/features/main/types/pagination.types.ts) | `PaginatedResponse<T>`, `NearbyPaginationParams`, `NationwidePaginationParams` |
| 타입 | [src/features/main/types/popular-plan.types.ts](../../src/features/main/types/popular-plan.types.ts) | `PopularPlan` |
| 타입 | [src/features/main/types/popular-place.types.ts](../../src/features/main/types/popular-place.types.ts) | `PopularPlace` |
| 타입 | [src/features/main/types/index.ts](../../src/features/main/types/index.ts) | barrel |
| API | [src/features/main/api/main.api.ts](../../src/features/main/api/main.api.ts) | axios 함수 4종 (`fetchNearbyPopularPlans` 등) |
| Hook | [src/features/main/hooks/usePaginatedList.ts](../../src/features/main/hooks/usePaginatedList.ts) | 공통 페이지네이션 hook (id 기준 dedupe, race condition 가드 포함) |
| Hook | [src/features/main/hooks/useGeolocation.ts](../../src/features/main/hooks/useGeolocation.ts) | 위치 권한 + 거부 시 `DEFAULT_START_COORD`(서울시청) 폴백 |
| Hook | [src/features/main/hooks/useInfiniteScroll.ts](../../src/features/main/hooks/useInfiniteScroll.ts) | IntersectionObserver 기반 sentinel |
| Hook | useNearbyPopularPlans / Places, useNationwidePopularPlans / Places | `usePaginatedList` 4개 wrapper |
| Hook | [src/features/main/hooks/index.ts](../../src/features/main/hooks/index.ts) | barrel |
| BFF 공통 | [src/shared/lib/api/popular-mock.ts](../../src/shared/lib/api/popular-mock.ts) | mock 페이지네이션 빌더 + `clampPagination` (limit 50 cap) + `USE_MOCK` flag |
| BFF 공통 | [src/shared/lib/api/proxy.ts](../../src/shared/lib/api/proxy.ts) | 백엔드 프록시 + 환경 게이팅 + 502 에러 정규화 |
| BFF 라우트 | [src/app/api/plan/popular/route.ts](../../src/app/api/plan/popular/route.ts) | `/api/plan/popular` |
| BFF 라우트 | [src/app/api/plan/popular/nationwide/route.ts](../../src/app/api/plan/popular/nationwide/route.ts) | `/api/plan/popular/nationwide` |
| BFF 라우트 | [src/app/api/place/popular/route.ts](../../src/app/api/place/popular/route.ts) | `/api/place/popular` |
| BFF 라우트 | [src/app/api/place/popular/nationwide/route.ts](../../src/app/api/place/popular/nationwide/route.ts) | `/api/place/popular/nationwide` |
| 컴포넌트 | [PopularPlanCard.tsx](../../src/features/main/components/PopularPlanCard.tsx) | 가로형 플랜 카드 (홈 디자인 재현) |
| 컴포넌트 | [PopularPlaceCard.tsx](../../src/features/main/components/PopularPlaceCard.tsx) | 정사각 장소 카드 (홈 디자인 재현) |
| 컴포넌트 | [ListPageShell.tsx](../../src/features/main/components/ListPageShell.tsx) | 헤더/총 개수/로딩/에러/빈 상태/sentinel/푸터 공통 셸 |
| 컴포넌트 | PopularPlanListPage / PopularPlaceListPage | 위치 기반 더보기 페이지 |
| 컴포넌트 | NationwidePopularPlanListPage / NationwidePopularPlaceListPage | 전국 더보기 페이지 |
| 컴포넌트 | [src/features/main/components/index.ts](../../src/features/main/components/index.ts) | barrel |
| 라우트 | [src/app/popular/plan/page.tsx](../../src/app/popular/plan/page.tsx) | `/popular/plan` |
| 라우트 | [src/app/popular/place/page.tsx](../../src/app/popular/place/page.tsx) | `/popular/place` |
| 라우트 | [src/app/popular/plan/nationwide/page.tsx](../../src/app/popular/plan/nationwide/page.tsx) | `/popular/plan/nationwide` |
| 라우트 | [src/app/popular/place/nationwide/page.tsx](../../src/app/popular/place/nationwide/page.tsx) | `/popular/place/nationwide` |

### 2-3. 수정 파일

| 파일 | 변경 |
| --- | --- |
| [cc/api/v1/main(O).md](../api/v1/main(O).md) | MAIN-57/58/60/61 전 항목 명세 갱신 |
| [src/app/page.tsx](../../src/app/page.tsx) | 4개 더보기 버튼 행선지 교체 (`/search` → `/popular/...`) |

---

## 3. 핵심 설계 메모

### 3-1. 페이지네이션 hook (`usePaginatedList`)
- baseParams 변경 시 1페이지부터 자동 재조회 (`JSON.stringify` 기반 의존).
- `requestIdRef`로 race condition 가드 — 빠른 페이지 전환·뒤로가기 시 stale 응답이 화면을 덮어쓰지 않음.
- **id 기준 dedupe**: 실시간 랭킹 변동으로 동일 항목이 두 페이지에 등장해도 누적 머지 시 자동 제거.

### 3-2. 위치 권한 UX (`useGeolocation`)
- `'idle' | 'loading' | 'granted' | 'denied' | 'unsupported'` 5단계 상태.
- 거부/미지원 시 [DEFAULT_START_COORD](../../src/shared/data/mockData.ts) (서울시청) 폴백 + `fallbackUsed: true`.
- 페이지 셸이 `geolocationDenied` 배너로 사용자에게 즉시 안내 ("위치 권한이 거부되어 서울 시청 기준으로 표시됩니다.").
- 7s timeout, 5분 캐시 (`maximumAge`).

### 3-3. BFF 환경 게이팅
- `NEXT_PUBLIC_USE_MOCK=true`일 때만 mock 폴백, 그 외엔 502/원본 status 전달.
- mock도 정직한 페이지네이션 (`hasNext = (page * limit) < total`)을 만들도록 `clampPagination` + `paginate` 헬퍼 분리. 무한 스크롤이 무한 루프하지 않음.
- `limit` 상한 50으로 강제 (`clampPagination`) — 백엔드 합의 값과 동일.

### 3-4. mock 카탈로그 확장
- mock 데이터는 5~6건뿐이라 기본값으로는 페이지네이션 시연이 불가. `popular-mock.ts` 의 `buildPlaceCatalog`/`buildPlanCatalog`가 5배 복제(이름/id 변형)를 만들어 ~30~80건 규모로 확장.
- 백엔드 연동 시 이 helper는 사용되지 않으므로 무관.

---

## 4. 검증

### 4-1. 정적 검사

| 항목 | 결과 |
| --- | --- |
| `yarn lint` 신규 파일 | 0건 (기존 다른 파일의 사전 존재 lint 에러는 본 작업 범위 외) |
| `npx tsc --noEmit` | 0건 |
| `yarn build` | TypeScript 컴파일 통과 (`✓ Compiled successfully in 3.0s`). 정적 export 단계에서 `/login`이 `useSearchParams` Suspense 미래핑으로 실패하나, **이번 변경 이전부터 존재하던 별개 이슈** (stash 후 재현 확인) |

### 4-2. 런타임 (dev 서버, port 3001, `USE_MOCK=true`)

| 호출 | 결과 |
| --- | --- |
| `GET /api/plan/popular?lat=37.5547&lng=126.9707&limit=5&page=1` | `status: 200, count: 5, page=1 limit=5 hasNext=true totalCount=35, first ranking=1` |
| `GET /api/plan/popular?...&page=2` | `page=2 hasNext=true, first ranking=6` (페이지 누적 정상) |
| `GET /api/place/popular/nationwide?limit=6&page=3` | `page=3 hasNext=true totalCount=30 count=6, ids=[nw1-p2-0...nw6-p2-5]` (5배 카탈로그 후반부) |
| `/popular/plan` | 200 |
| `/popular/place` | 200 |
| `/popular/plan/nationwide` | 200 |
| `/popular/place/nationwide` | 200 |

---

## 5. 사용자 이동 흐름

| 홈 섹션 | 더보기 버튼 행선지 | 페이지 사양 |
| --- | --- | --- |
| 주변 인기 장소 | `/popular/place` | 위치 기반, 2열 그리드, limit=20 무한 스크롤 |
| 실시간 베스트 플랜 | `/popular/plan` | 위치 기반, 가로형 카드 리스트, limit=20 무한 스크롤 |
| 전국 인기 장소 | `/popular/place/nationwide` | 위치 무관, 2열 그리드, limit=20 무한 스크롤 |
| 전국 인기 플랜 | `/popular/plan/nationwide` | 위치 무관, 가로형 카드 리스트, limit=20 무한 스크롤 |

각 페이지는 backArrow 헤더 + 총 개수 표시 + 마지막 도달 시 "마지막 결과입니다." 안내 + 에러 시 "다시 시도" 버튼을 갖춘다.

---

## 6. 추가로 해결해야 할 / 사용자 판단이 필요한 항목

### 6-1. 백엔드 측 명세 합의 — **사용자(또는 PM/백엔드)의 즉시 확정이 필요**
- [cc/api/v1/main(O).md](../api/v1/main(O).md)에 반영한 4건의 변경(`page` 추가, 응답 메타 4필드, `limit` 상한 50)에 대해 **백엔드 팀의 합의가 아직 확보되지 않은 상태**다.
- 합의 전에는 프론트가 `USE_MOCK=true`로 동작하므로 화면은 정상이지만, 운영 빌드에서 실제 백엔드를 붙이면 응답 스키마 미일치로 클라이언트가 즉시 깨진다.
- **판단 필요**: (a) 백엔드 팀에 PR/티켓을 즉시 올릴지, (b) 명세를 더 다듬을지(예: 커서 기반 통일).

### 6-2. URL 컨벤션 — **사용자 판단 필요**
- 현재 `/popular/{plan,place}/[nationwide]`로 구성. 다른 후보:
  - `/{plan,place}/popular/[nationwide]` — 도메인 우선
  - `/explore/popular/...` — explore 허브 하위
- **판단 필요**: 위 옵션 중 어떤 컨벤션을 채택할지. 현재 안은 "popular 허브"를 따로 두는 형태로, 추후 다른 인기 카테고리(예: 신상, 이벤트) 확장에 유리.

### 6-3. 위치 권한 거부 시 폴백 정책 — **사용자 판단 필요**
- 현재는 거부/미지원 시 **서울시청 좌표로 폴백 + 화면 상단에 안내 배너 노출**.
- 대안: (a) 전국 페이지(`/popular/.../nationwide`)로 강제 리다이렉트, (b) 권한 재요청 모달, (c) 사용자가 "지역 직접 선택" 입력.
- **판단 필요**: 현재 폴백 동작을 유지할지, 위 대안 중 하나로 교체할지. 디자인 시안과 정렬 필요.

### 6-4. mock 데이터의 운영 잔존 처리
- BFF 라우트는 `NEXT_PUBLIC_USE_MOCK !== 'true'`이면 mock을 반환하지 않도록 게이팅돼 있으나, mock helper(`popular-mock.ts`)와 5배 카탈로그 확장 코드가 번들에 포함된다. 운영 영향은 없으나 코드 클린업 차원에서 백엔드 안정화 후 제거하는 것이 바람직.
- **판단 필요**: 별도 후속 plan으로 분리할지, 본 plan 종료 시 즉시 제거할지.

### 6-5. 첫 로드(홈 화면)의 mock 의존 — **이번 plan 범위 외였음을 재확인**
- 홈 화면([src/app/page.tsx](../../src/app/page.tsx))은 여전히 `NEARBY_POPULAR_PLACES`, `NATIONWIDE_PLACES`, `useCourseStore.courses`를 사용해 mockData로 렌더링한다.
- 이번 plan은 "더보기 라우트만 우선" 범위였으므로 의도된 잔존 상태.
- **판단 필요**: 홈 첫 로드도 새 API 함수(`fetchNearbyPopularPlans` 등)로 교체하는 후속 작업을 별도 plan으로 띄울지 여부.

### 6-6. 사전 존재 이슈 — `/login` 빌드 실패
- `useSearchParams() should be wrapped in a suspense boundary at page "/login"` 에러는 본 작업과 **무관한 사전 존재 이슈**다 (stash 후 동일 에러 재현 확인).
- 운영 배포가 막혀 있는 상태이므로, 본 plan과 별개로 빠른 시일 내 처리 필요.
- **판단 필요**: 본 작업의 범위에서 함께 고칠지(작업량 적음 — `<Suspense>` 래핑 1곳), 별도 티켓으로 분리할지.

### 6-7. 카드 디자인의 추후 통일
- `PopularPlanCard`/`PopularPlaceCard`는 홈 화면의 인라인 마크업을 그대로 옮겨온 형태. 추후 [src/shared/ui](../../src/shared/ui) 로 끌어올려 홈 화면도 동일 컴포넌트를 쓰도록 통합하면 디자인 변경 시 1곳만 수정하면 된다.
- **판단 필요**: 통합 리팩토링을 본 plan 종료 후 별도 작업으로 띄울지 여부.
