---
작성일: 2026-05-19
작업 영역: frontend
관련 문서:
  - 명세: [cc/api/v1/main.md](../api/v1/main.md)
  - 사전 검토(과거): [cc/result/260510-result-002-내_주변_실시간_베스트_플랜_더보기_api_검토.md](../result/260510-result-002-내_주변_실시간_베스트_플랜_더보기_api_검토.md)
  - 이전 plan(폐기): [cc/plan/260510-plan-002-popular_more_pagination.md](260510-plan-002-popular_more_pagination.md)
  - 이전 result(미머지): [cc/result/260510-result-004-popular_more_pagination_implementation.md](../result/260510-result-004-popular_more_pagination_implementation.md)
  - 컨벤션: [cc/convention/](../convention/)
---

# 메인 인기 섹션 "더보기" 전용 페이지 구현 (v2 plan)

## 0. 한 줄 요약

메인 홈 화면의 4개 인기 섹션(주변/전국 × 장소/플랜) "더보기" 버튼을 현재의 `/search` 폴백에서 **전용 페이지(`/{place,plan}/popular[/nationwide]`)** 로 분리하고, 무한 스크롤 페이지네이션 리스트를 신규 구현한다.

---

## 1. 배경

- 2026-05-13의 임시 커밋(`a97a4a5`, `api-check-yj` 브랜치)에서 동일 기능이 한 차례 구현된 적이 있으나 main/yj-03에 머지되지 않았고, 그 사이에 "코스→플랜" 일괄 명명 변경(`0b0760c`), `useUserStore` 변경, report feature 신설 등 코드베이스가 크게 달라졌다.
- 미머지 결과물을 cherry-pick하는 대신, 현재 컨벤션·디렉토리 구조·report feature의 PR 분할 패턴에 맞춰 **새로 구현**한다.
- API 명세([cc/api/v1/main.md](../api/v1/main.md))는 이미 `page`/`limit`/`hasNext`/`totalCount` 메타가 반영된 상태이므로 백엔드 협의는 별도 진행 불필요.

---

## 2. 현재 상태

| 항목 | 상태 |
| --- | --- |
| 홈 더보기 버튼 4곳 | 모두 `router.push('/search')`로 폴백 ([src/app/page.tsx:106](../../src/app/page.tsx#L106), [:169](../../src/app/page.tsx#L169), [:241](../../src/app/page.tsx#L241), [:303](../../src/app/page.tsx#L303)) |
| `/popular/*` 페이지 | 없음 |
| `src/features/main/` | 없음 |
| `/api/place/popular`, `/api/plan/popular` BFF 라우트 | 없음 |
| mockData | `NEARBY_POPULAR_PLACES`, `NATIONWIDE_PLACES`, `MOCK_COURSES`, `NATIONWIDE_COURSES`, `DEFAULT_START_COORD` 등 정상 export 중 |
| 명세 | 4개 엔드포인트 모두 `page`/`limit`/`hasNext`/`totalCount` 포함 완료 |

---

## 3. 작업 범위

### IN

1. 신규 feature: `src/features/main/` (api / hooks / components / types / utils / index.ts)
2. Next API Route 4종: `/api/place/popular`, `/api/place/popular/nationwide`, `/api/plan/popular`, `/api/plan/popular/nationwide`
3. App Router 페이지 4종: `/place/popular`, `/place/popular/nationwide`, `/plan/popular`, `/plan/popular/nationwide`
4. 카드·리스트 셸 컴포넌트(홈 디자인 재현)
5. 페이지네이션 공통 hook (`usePaginatedList`) + 위치 권한 hook (`useGeolocation`) + sentinel hook (`useInfiniteScroll`)
6. 홈 더보기 버튼 4곳 라우팅 교체

### OUT (별도 plan으로 분리)

- 홈 첫 로드의 mock 의존 제거 (홈은 현행 mockData 유지)
- 카드 컴포넌트의 `shared/ui`로의 승격 (홈/리스트 페이지 공통화)
- Storybook 스토리 (PR-4 이후 후속)
- mock helper 코드의 운영 빌드 제거 (백엔드 안정화 이후)

---

## 4. 디렉토리 구조 (목표)

```
src/features/main/
├── api/
│   └── main.api.ts                              # axios 함수 4종
├── components/
│   ├── ListPageShell/                           # 헤더+총 개수+로딩/에러/빈 상태+sentinel
│   │   ├── component.tsx
│   │   ├── styles.module.scss
│   │   ├── types.ts
│   │   └── index.ts
│   ├── PopularPlaceCard/
│   │   ├── component.tsx
│   │   ├── styles.module.scss
│   │   ├── types.ts
│   │   └── index.ts
│   ├── PopularPlanCard/
│   │   ├── component.tsx
│   │   ├── styles.module.scss
│   │   ├── types.ts
│   │   └── index.ts
│   ├── PopularPlaceListPage/                    # /place/popular
│   ├── PopularPlanListPage/                     # /plan/popular
│   ├── NationwidePopularPlaceListPage/          # /place/popular/nationwide
│   ├── NationwidePopularPlanListPage/           # /plan/popular/nationwide
│   └── index.ts
├── hooks/
│   ├── useGeolocation.ts
│   ├── useInfiniteScroll.ts
│   ├── usePaginatedList.ts
│   ├── useNearbyPopularPlaces.ts
│   ├── useNearbyPopularPlans.ts
│   ├── useNationwidePopularPlaces.ts
│   ├── useNationwidePopularPlans.ts
│   └── index.ts
├── types/
│   ├── pagination.types.ts                      # PaginatedResponse<T>, 공통 query
│   ├── popular-place.types.ts                   # PopularPlace
│   ├── popular-plan.types.ts                    # PopularPlan
│   └── index.ts
├── utils/
│   └── popular-mock.ts                          # mock 페이지네이션 빌더 (개발 폴백용)
└── index.ts                                     # barrel

src/app/api/
├── place/popular/route.ts
├── place/popular/nationwide/route.ts
├── plan/popular/route.ts
└── plan/popular/nationwide/route.ts

src/app/
├── place/
│   ├── [id]/page.tsx                            # 기존 (place 상세)
│   ├── popular/page.tsx                         # 신규 — /place/popular
│   └── popular/nationwide/page.tsx              # 신규 — /place/popular/nationwide
└── plan/
    ├── popular/page.tsx                         # 신규 — /plan/popular
    └── popular/nationwide/page.tsx              # 신규 — /plan/popular/nationwide
```

> Next.js는 정적 세그먼트(`popular`)를 동적 세그먼트(`[id]`)보다 우선 매칭하므로 `/place/popular`가 `/place/[id]`와 충돌하지 않는다. `src/app/plan/`은 신규 생성 (현재 plan 상세 라우트는 `/course/[id]` 사용 중이며 별개).

> 컴포넌트 폴더 구조는 [src/features/report/components/ReportDialog/](../../src/features/report/components/ReportDialog/) 패턴(component/styles/types/index)을 그대로 따른다.

---

## 5. PR 분할 (report feature와 동일한 incremental 패턴)

### PR-1. 타입 + utils 골격

**브랜치**: `yj-03` (현재 작업 브랜치 유지, 별도 분기 없음)
**범위**:
- `src/features/main/types/` 4종 (pagination / popular-place / popular-plan / index)
- `src/features/main/utils/popular-mock.ts` (mockData에서 5배 카탈로그 빌더 + `paginate`, `clampPagination` 헬퍼)
- `src/features/main/index.ts` (빈 barrel)

**수용 기준**:
- `npx tsc --noEmit` 통과
- mockData export 시그니처와 충돌 없음
- 외부에서 import 가능한 타입만 추가, 동작 변화 0

---

### PR-2. API 함수 + hook + BFF 라우트

**브랜치**: `yj-03`
**범위**:
- `src/features/main/api/main.api.ts` (axios 함수 4종)
- `src/features/main/hooks/` 7종
  - `usePaginatedList` — 공통 페이지네이션 (id dedupe + race guard + baseParams 변경 시 1페이지 재로드)
  - `useGeolocation` — `idle | loading | granted | denied | unsupported` 5단계, 거부/실패/미지원 시 호출 측에 통보(페이지에서 `router.replace`로 nationwide로 이동), 7s timeout
  - `useInfiniteScroll` — `IntersectionObserver` sentinel
  - 4개 도메인 wrapper hook
- BFF 라우트 4종 ([src/app/api/mypage/plans/route.ts](../../src/app/api/mypage/plans/route.ts) 패턴 차용)
  - 백엔드 정상 → 그대로 프록시
  - `NEXT_PUBLIC_API_BASE_URL` 미설정 or 백엔드 실패 → mock 페이지네이션 응답 반환
  - mock에서도 `hasNext = page * limit < total` 정직 계산

**수용 기준**:
- `npx tsc --noEmit` 통과
- 4개 BFF 라우트가 `curl '?lat=...&lng=...&limit=5&page=1'` 호출에 200 응답
- `page=2` 호출 시 ranking이 누적 (mockData가 5건뿐이므로 mock 빌더로 ~30건 확장)
- hook은 단위 테스트 불필요 (PR-4 페이지에서 통합 검증)

---

### PR-3. 카드·리스트 셸 컴포넌트

**브랜치**: `yj-03`
**범위**:
- `PopularPlaceCard`, `PopularPlanCard` — 홈([src/app/page.tsx](../../src/app/page.tsx))의 카드 인라인 마크업을 그대로 이식
- `ListPageShell` — backArrow 헤더 + 총 개수 + 로딩/에러/빈 상태 + sentinel + 푸터 메시지
- `components/index.ts` barrel

**수용 기준**:
- Storybook 없이도 4개 페이지 컴포넌트에서 import만 가능한 상태
- mobile viewport(375px) 기준 시각적으로 홈 카드 디자인과 동일
- `yarn lint` 신규 파일 0건

---

### PR-4. 페이지 컴포넌트 + 라우트 + 홈 연결

**브랜치**: `yj-03`
**범위**:
- 4개 페이지 컴포넌트 (`PopularPlaceListPage`, `PopularPlanListPage`, `NationwidePopularPlaceListPage`, `NationwidePopularPlanListPage`)
  - 첫 로드 `limit=20&page=1`, sentinel 트리거 시 `loadMore()`
  - 위치 기반 2개는 `useGeolocation`으로 lat/lng 획득, 거부/실패/미지원 시 즉시 `router.replace('/place/popular/nationwide')` / `('/plan/popular/nationwide')` 호출 (loading 화면 단계에서 결정 → 화면 깜빡임 방지)
  - 카드 클릭 시 기존 상세 라우트(`/place/[id]`, `/course/[id]`)로 진입
- App Router 페이지 4종 (thin wrapper, Page → Feature pattern)
- `src/app/page.tsx` 더보기 버튼 4곳 라우팅 교체:

  | 위치 | 변경 후 |
  | --- | --- |
  | [page.tsx:106](../../src/app/page.tsx#L106) 주변 인기 장소 | `router.push('/place/popular')` |
  | [page.tsx:169](../../src/app/page.tsx#L169) 실시간 베스트 플랜 | `router.push('/plan/popular')` |
  | [page.tsx:241](../../src/app/page.tsx#L241) 전국 인기 장소 | `router.push('/place/popular/nationwide')` |
  | [page.tsx:303](../../src/app/page.tsx#L303) 전국 인기 플랜 | `router.push('/plan/popular/nationwide')` |

**수용 기준**:
- `yarn build` 통과 (사전 존재 이슈는 별개로 명시)
- 홈 → 4개 더보기 → 4개 페이지 진입 모두 200
- 무한 스크롤 1회 / 끝 도달 / 에러 3가지 시나리오 수동 QA 통과
- 위치 권한 거부/실패/미지원 시 nationwide 페이지로 자동 리다이렉트 (체감 깜빡임 없음)
- 카드 클릭 → 상세 → 뒤로가기 시 스크롤 위치 보존 (Next 기본 동작)

---

## 6. 컨벤션 / 명명 결정사항

| 항목 | 결정 |
| --- | --- |
| URL 컨벤션 | `/{place,plan}/popular[/nationwide]` (도메인 우선 — 기존 `/place/[id]`, `/api/place/popular/...` API 네임스페이스와 정렬) |
| feature 폴더명 | `main` (홈/메인 도메인 전체를 포괄하는 의미, 기존 `course-detail`/`my-page` 와 동급) |
| 컴포넌트 폴더 패턴 | `component.tsx + styles.module.scss + types.ts + index.ts` ([cc/convention/](../convention/) 준수, report feature와 동일) |
| 카드 컴포넌트 명명 | `PopularPlaceCard`, `PopularPlanCard` (홈의 "코스→플랜" 일괄 변경 정책에 맞춰 플랜 사용) |
| mock 폴백 | feature 내부(`utils/popular-mock.ts`)에 배치하여 shared 오염 방지 |
| 환경 게이팅 | BFF는 `NEXT_PUBLIC_API_BASE_URL` 유무로만 분기 (별도 USE_MOCK 환경변수 신설하지 않음, 기존 `mypage` 라우트 패턴 일치) |
| 페이지네이션 첫 페이지 limit | 20 (홈 5/6보다 크게, 모바일 한 화면 ~2~3 스크롤 분량) |
| 위치 권한 거부 UX | 즉시 nationwide 페이지로 `router.replace`. 폴백 좌표/배너 방식은 채택 안 함 |
| `DEFAULT_START_COORD` 사용처 | 본 작업에서는 미사용 (리다이렉트 정책 채택). mockData에는 유지 |

---

## 7. 작업 순서·의존 관계

```
PR-1 (타입/utils) ──→ PR-2 (API/hook/BFF) ──→ PR-3 (카드/셸) ──→ PR-4 (페이지/홈 연결)
```

- PR-1 ~ PR-3 머지 후에도 홈 동작 변화 0 (단순 코드 추가).
- PR-4 머지 시점에 사용자 동선이 바뀌므로, 머지 직전 QA 1회 필수.

---

## 8. 위험·미해결 항목

1. **mockData 카탈로그가 너무 작음** — `NEARBY_POPULAR_PLACES`/`NATIONWIDE_PLACES` 등이 5~6건 수준. mock 빌더에서 id/이름 변형으로 5배 복제하지 않으면 페이지네이션 시연이 불가. 백엔드 연동 후에는 무관.
2. **실시간 랭킹 변동 시 중복 노출** — 동일 항목이 두 페이지에 나타날 수 있음. `usePaginatedList`의 id dedupe로 흡수.
3. **nationwide 자동 리다이렉트의 entry-loss UX** — 위치 권한 거부 시 사용자가 "주변" 페이지에 머무는 선택지가 사라짐. flash(빈 화면→리다이렉트) 방지를 위해 `useGeolocation`의 `idle/loading` 동안 로딩 셸을 보여주고, 결과가 `denied/unsupported`로 결정된 시점에 redirect를 호출해야 함.
4. **사전 존재 빌드 이슈** — 과거 result-004에 보고된 `/login` Suspense 미래핑 빌드 실패가 현재까지 잔존하는지 별도 확인 필요. 본 plan과 무관하지만 PR-4 검증 시 영향.
5. **카드 디자인 중복** — 홈과 리스트 페이지가 동일 카드 마크업을 갖게 됨. shared 승격은 후속 plan으로 분리.
6. **`my-course` vs `course` 라우트** — 카드 클릭 시 `/course/[id]`로 보내는 게 맞는지 (`my-course`는 사용자 본인 플랜 상세). 현재 home에서 사용 중인 `handleCourseClick` 로직과 동일하게 정렬할 것.

---

## 9. 산출물 체크리스트

### PR-1
- [ ] `src/features/main/types/pagination.types.ts`
- [ ] `src/features/main/types/popular-place.types.ts`
- [ ] `src/features/main/types/popular-plan.types.ts`
- [ ] `src/features/main/types/index.ts`
- [ ] `src/features/main/utils/popular-mock.ts`
- [ ] `src/features/main/index.ts` (barrel)

### PR-2
- [ ] `src/features/main/api/main.api.ts`
- [ ] `src/features/main/hooks/usePaginatedList.ts`
- [ ] `src/features/main/hooks/useGeolocation.ts`
- [ ] `src/features/main/hooks/useInfiniteScroll.ts`
- [ ] `src/features/main/hooks/useNearbyPopularPlaces.ts`
- [ ] `src/features/main/hooks/useNearbyPopularPlans.ts`
- [ ] `src/features/main/hooks/useNationwidePopularPlaces.ts`
- [ ] `src/features/main/hooks/useNationwidePopularPlans.ts`
- [ ] `src/features/main/hooks/index.ts`
- [ ] `src/app/api/place/popular/route.ts`
- [ ] `src/app/api/place/popular/nationwide/route.ts`
- [ ] `src/app/api/plan/popular/route.ts`
- [ ] `src/app/api/plan/popular/nationwide/route.ts`

### PR-3
- [ ] `src/features/main/components/PopularPlaceCard/{component,styles.module.scss,types,index}`
- [ ] `src/features/main/components/PopularPlanCard/{component,styles.module.scss,types,index}`
- [ ] `src/features/main/components/ListPageShell/{component,styles.module.scss,types,index}`
- [ ] `src/features/main/components/index.ts`

### PR-4
- [ ] `src/features/main/components/PopularPlaceListPage/...`
- [ ] `src/features/main/components/PopularPlanListPage/...`
- [ ] `src/features/main/components/NationwidePopularPlaceListPage/...`
- [ ] `src/features/main/components/NationwidePopularPlanListPage/...`
- [ ] `src/app/place/popular/page.tsx`
- [ ] `src/app/place/popular/nationwide/page.tsx`
- [ ] `src/app/plan/popular/page.tsx`
- [ ] `src/app/plan/popular/nationwide/page.tsx`
- [ ] `src/app/page.tsx` 더보기 버튼 4곳 라우트 교체
- [ ] 수동 QA 시나리오 통과
- [ ] `yarn lint`, `npx tsc --noEmit`, `yarn build` 통과 (사전 존재 이슈 제외)

---

## 10. 예상 작업량

| PR | 추정 시간 | 비고 |
| --- | --- | --- |
| PR-1 | 30분 | 타입/utils만 |
| PR-2 | 90분 | hook 7종 + BFF 4종 |
| PR-3 | 60분 | 카드 2종 + 셸 1종 |
| PR-4 | 90분 | 페이지 4종 + 라우팅 교체 + QA |
| **총합** | **~4.5시간** | report feature PR 1~5 작업 페이스와 유사 |

---

## 11. 확정된 결정 사항 (2026-05-19)

| 항목 | 결정 |
| --- | --- |
| URL 컨벤션 | `/{place,plan}/popular[/nationwide]` |
| 위치 권한 거부 UX | nationwide 페이지로 자동 `router.replace` |
| 작업 브랜치 | `yj-03` 유지 (별도 분기 없음, PR 단위는 커밋 묶음으로 구분) |
| report feature와의 관계 | 병행 진행 (대기 없음) |

> `yj-03` 위에서 report PR-3~5와 popular PR-1~4가 섞이게 되므로, 커밋 메시지에 `[popular]` 같은 prefix를 붙여 구분하는 것을 권장.
