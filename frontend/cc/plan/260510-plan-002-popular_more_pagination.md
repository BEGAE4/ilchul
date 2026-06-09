# 메인 인기 섹션 "더보기" 페이지네이션 작업 계획 (A안)

작성일: 2026-05-10
작업 영역: `frontend` (+ 명세 측 변경 요청)
관련 문서:
- 사전 검토: [cc/result/260510-result-002-내_주변_실시간_베스트_플랜_더보기_api_검토.md](../result/260510-result-002-내_주변_실시간_베스트_플랜_더보기_api_검토.md)
- 명세: [cc/api/v1/main(O).md](../api/v1/main(O).md)
- 컨벤션: [cc/convention/260506-convention-001-convention_v1.0.md.md](../convention/260506-convention-001-convention_v1.0.md.md)

---

## 0. 한 줄 요약

> 메인 4개 인기 섹션(MAIN-57/58/60/61)에 **`page` 파라미터와 `hasNext`·`totalCount` 응답 메타를 통일**하고, 홈 화면의 더보기 버튼이 `/search`로 가던 것을 **전용 더보기 리스트 페이지**로 이동하도록 교체한다.

---

## 1. 배경

[260510-result-002](../result/260510-result-002-내_주변_실시간_베스트_플랜_더보기_api_검토.md) 검토 결과:

- MAIN-57(`/api/plan/popular`)·MAIN-61(`/api/place/popular`)에는 `page` 파라미터가 없어 페이지네이션이 불가능.
- MAIN-58·60에는 `page`가 있으나 4개 엔드포인트 모두 응답에 `hasNext`/`totalCount`가 없어 클라이언트가 끝 판정·카운트 표시를 할 수 없음.
- 홈 화면([src/app/page.tsx](../../src/app/page.tsx))의 더보기 버튼 4개([page.tsx:106](../../src/app/page.tsx#L106), [page.tsx:169](../../src/app/page.tsx#L169), [page.tsx:241](../../src/app/page.tsx#L241), [page.tsx:303](../../src/app/page.tsx#L303))는 모두 `/search`로만 라우팅되어 있어 페이지네이션 진입점 자체가 부재.

**A안**: 홈은 `limit=5/3/6/5`로 가볍게 유지하고, 더보기는 신규 라우트(`/popular/...`)에서 `page` 증가형(또는 무한 스크롤)으로 호출.

---

## 2. 작업 범위

### 즉시 진행 (이번 plan)

1. **명세 변경 요청**: MAIN-57·61에 `page` 추가, 4개 모두 응답에 `hasNext`/`totalCount` 추가, `limit` 상한 명시.
2. **타입·API 함수**: `features/main/api/main.api.ts`(또는 동등 위치) 신규 작성, axios 호출 함수 4종 + 타입 정의.
3. **Next API Route**: `/api/plan/popular`, `/api/place/popular`, `/api/plan/popular/nationwide`, `/api/place/popular/nationwide` 4개 BFF 라우트 신규 추가 (기존 `mypage/*` 라우트 패턴 참고).
4. **더보기 리스트 페이지**: `/popular/plan`, `/popular/place`, `/popular/plan/nationwide`, `/popular/place/nationwide` 4개 라우트 + 페이지 컴포넌트 신규 추가.
5. **홈 화면 라우팅 교체**: [src/app/page.tsx](../../src/app/page.tsx) 의 4개 `router.push('/search')` → 각 더보기 페이지로 교체.
6. **현재 사용 중인 mock([src/shared/data/mockData.ts](../../src/shared/data/mockData.ts))** 은 잠시 유지하되, 신규 hook 안에서만 fetch 실패 시 폴백으로 사용 (Phase 4 게이팅 패턴과 동일).

### 보류 (별도 plan / 후속)

- 인기 섹션 자체의 mock 완전 제거 (백엔드 안정화 이후).
- 커서 기반 페이지네이션으로의 통일 ([PLACE-N4](../api/v1/place(O).md) 스타일과 정렬). 단기에는 오프셋 기반으로 충분.
- 홈의 첫 로드도 새로 만든 API 함수로 교체할지 (이번 plan에서는 더보기 라우트만 우선).

---

## 3. 의존성 / 선결 조건

- **명세 측 변경**(Phase 0)은 백엔드 합의가 필요. 합의 전이라도 프론트는 mock 폴백으로 작업을 시작할 수 있다.
- 신규 라우트의 url 컨벤션(`/popular/plan` 등)은 PM/디자인 검토 1회 필요.

---

## 4. 작업 단계 (Phase)

### Phase 0. 명세 변경 합의 — 백엔드 협의 필요

**대상**: [cc/api/v1/main(O).md](../api/v1/main(O).md)

변경 내용:

1. **MAIN-57**(`GET /api/plan/popular`)·**MAIN-61**(`GET /api/place/popular`)에 `page` 파라미터 추가.

   ```
   | page | number | 선택 | 페이지 번호 (기본 1, "더보기" 진입 시 사용) |
   ```

2. **MAIN-57/58/60/61** 4개 응답에 메타 추가:

   ```jsonc
   {
     "status": 200,
     "message": "성공",
     "data": [ /* ... */ ],
     "page": 1,
     "limit": 5,
     "hasNext": true,
     "totalCount": 124
   }
   ```

3. `limit` 상한(예: 50) 명시 + `400` 응답 조건에 "limit 범위 초과" 추가.

수용 기준:
- 4개 엔드포인트의 요청·응답 컨벤션이 동일.
- 백엔드 팀과 합의 완료 후 명세 PR merge.

---

### Phase 1. 타입 + feature API 함수 — 명세 합의 후 즉시 가능

**대상**: 신규 폴더 `src/features/main/`

작업 내용:

1. 폴더 구조 신규 생성:
   ```
   src/features/main/
   ├── api/
   │   └── main.api.ts
   ├── types/
   │   ├── popular-plan.types.ts
   │   ├── popular-place.types.ts
   │   └── index.ts
   └── hooks/
       ├── useNearbyPopularPlans.ts
       ├── useNearbyPopularPlaces.ts
       ├── useNationwidePopularPlans.ts
       └── useNationwidePopularPlaces.ts
   ```

2. `main.api.ts` axios 함수 4종 ([my-page.api.ts](../../src/features/my-page/api/my-page.api.ts) 패턴 참고):
   - `fetchNearbyPopularPlans({ lat, lng, limit, page })` → `/api/plan/popular`
   - `fetchNearbyPopularPlaces({ lat, lng, limit, page })` → `/api/place/popular`
   - `fetchNationwidePopularPlans({ limit, page })` → `/api/plan/popular/nationwide`
   - `fetchNationwidePopularPlaces({ limit, page })` → `/api/place/popular/nationwide`

3. 공통 타입:
   ```ts
   interface PaginatedResponse<T> {
     status: number;
     message: string;
     data: T[];
     page: number;
     limit: number;
     hasNext: boolean;
     totalCount: number;
   }
   ```

4. hook 4종: `data`, `loading`, `error`, `hasNext`, `loadMore()` 반환. `loadMore` 호출 시 `page + 1`로 재요청 후 누적 머지.

수용 기준:
- 타입스크립트 빌드 통과.
- 각 hook 단독 호출 시 mock 응답 없이 실제 axios 요청이 정상 발생함을 dev 콘솔/네트워크 탭으로 확인.

---

### Phase 2. Next API Route (BFF) 추가

**대상**: 신규 라우트 4개

```
src/app/api/plan/popular/route.ts
src/app/api/plan/popular/nationwide/route.ts
src/app/api/place/popular/route.ts
src/app/api/place/popular/nationwide/route.ts
```

작업 내용:

1. 기존 [src/app/api/mypage/plans/route.ts](../../src/app/api/mypage/plans/route.ts) 의 BFF 패턴(백엔드 프록시 + 환경 게이팅) 그대로 차용.
2. 쿼리 파라미터(`lat`, `lng`, `limit`, `page`)를 그대로 백엔드(`localhost:3845`)로 전달.
3. 백엔드 미연결 시:
   - `NEXT_PUBLIC_USE_MOCK=true` → [mockData.ts](../../src/shared/data/mockData.ts)에서 `slice(start, start + limit)`로 슬라이싱한 mock 페이지네이션 응답 반환.
   - `NEXT_PUBLIC_USE_MOCK !== 'true'` → 502 + `{ error: 'upstream_unavailable' }`.
4. mock 폴백 응답에도 `hasNext`/`totalCount`를 채워 클라이언트 로직이 동일하게 동작하도록 한다 (`hasNext = (page * limit) < total`).

수용 기준:
- 4개 라우트 각각 `?limit=5&page=1`, `?page=2` 호출이 정상 응답.
- 백엔드 다운 + dev 환경 → mock 데이터로 동작.
- 운영 빌드 → 502.

---

### Phase 3. 더보기 리스트 페이지 컴포넌트

**대상**: 신규 라우트·컴포넌트

```
src/app/popular/plan/page.tsx              → 내 주변 실시간 베스트 플랜
src/app/popular/place/page.tsx             → 내 주변 인기 장소
src/app/popular/plan/nationwide/page.tsx   → 전국 인기 플랜
src/app/popular/place/nationwide/page.tsx  → 전국 인기 장소

src/features/main/components/
├── PopularPlanListPage.tsx
├── PopularPlaceListPage.tsx
├── NationwidePopularPlanListPage.tsx
└── NationwidePopularPlaceListPage.tsx
```

작업 내용:

1. `app/popular/**/page.tsx`는 thin wrapper — 컴포넌트만 import해 렌더링 (CLAUDE.md "Page → Feature pattern" 준수).
2. 페이지 컴포넌트 공통 사양:
   - 헤더(backArrow variant) + 제목 + 총 개수(`totalCount`).
   - 카드 리스트(홈에서 쓰던 카드 디자인 재사용 또는 압축형).
   - 무한 스크롤 vs Pager 둘 중 **무한 스크롤** 채택 (모바일 PWA 특성). `IntersectionObserver` 또는 `react-intersection-observer` 활용. 라이브러리 신규 추가가 부담이면 `IntersectionObserver` 직접 사용.
   - `hasNext === false` 도달 시 "마지막 결과입니다" 안내.
   - 빈 결과·에러 상태 처리.
3. 위치 기반 2개 페이지(`/popular/plan`, `/popular/place`)는 `navigator.geolocation`으로 lat/lng 획득 — 거부/실패 시 사용자에게 안내 후 전국 페이지로 유도하거나 기본 좌표(서울시청)로 폴백.
4. 페이지 진입 시 첫 로드 `limit=20&page=1`, 더 불러올 때 `page` 증가.

수용 기준:
- 4개 페이지가 mobile viewport(375px)에서 정상 렌더링.
- 더보기 스크롤 시 다음 페이지가 누적 표시되며, 끝까지 도달 시 안내 노출.
- 카드 클릭 시 기존 상세 라우트(`/course/[id]`, `/place/[id]`)로 정상 진입.

---

### Phase 4. 홈 화면 더보기 버튼 라우팅 교체

**대상**: [src/app/page.tsx](../../src/app/page.tsx)

작업 내용 (4곳 일괄 교체):

| 위치 | 현재 | 변경 후 |
| --- | --- | --- |
| [page.tsx:106](../../src/app/page.tsx#L106) (주변 인기 장소) | `router.push('/search')` | `router.push('/popular/place')` |
| [page.tsx:169](../../src/app/page.tsx#L169) (실시간 베스트 플랜) | `router.push('/search')` | `router.push('/popular/plan')` |
| [page.tsx:241](../../src/app/page.tsx#L241) (전국 인기 장소) | `router.push('/search')` | `router.push('/popular/place/nationwide')` |
| [page.tsx:303](../../src/app/page.tsx#L303) (전국 인기 플랜) | `router.push('/search')` | `router.push('/popular/plan/nationwide')` |

수용 기준:
- 홈에서 4개 더보기 버튼이 각각 올바른 페이지로 이동.
- 뒤로가기 시 홈 스크롤 위치 보존(Next 기본 동작 확인).

---

### Phase 5. 검증 및 회귀 테스트

작업 내용:

1. `yarn lint`, `yarn format:check`, `yarn build` 통과.
2. 시나리오 수동 QA:
   - 홈 → 4개 더보기 → 각 페이지 진입 정상.
   - 무한 스크롤 1회 / 끝까지 / 에러 발생 3가지 시나리오.
   - 위치 권한 거부 / 허용 양쪽.
   - 백엔드 정상·미연결 양쪽.
3. `grep -r "router.push('/search')" src/app/page.tsx` 결과 0건.
4. 카드 클릭 → 상세 페이지 → 뒤로가기 → 리스트 위치/스크롤 보존 확인.

---

## 5. 작업 순서·의존 관계

```
Phase 0 (명세 합의) ──┬─→ Phase 1 (타입/API/hook) ──→ Phase 2 (BFF) ──→ Phase 3 (리스트 페이지) ──→ Phase 4 (홈 버튼) ──→ Phase 5 (검증)
                      │
                      └─ (mock 폴백으로 Phase 1~3 선행 가능, Phase 0 합의 후 응답 스키마만 동기화)
```

- 백엔드 합의가 늦어지면 Phase 1~3을 mock 응답으로 먼저 진행 후, 합의 완료 시 응답 타입만 미세 조정.

---

## 6. 위험·미해결 항목

1. **위치 권한 거부 UX**: 위치 기반 2개 페이지는 권한 거부 시 동작이 막힘. 폴백 좌표(서울시청 등) 사용 vs 전국 페이지 유도 중 기획 결정 필요.
2. **순위 변동 중복**: 실시간 랭킹이라 페이지 N→N+1 사이에 순위가 흔들리면 동일 항목이 두 페이지에 등장할 수 있음. 클라이언트에서 `id` 기준 dedupe 적용 필요.
3. **`limit` 상한 미합의 시**: 백엔드가 임의로 자르면 `hasNext` 판정이 어긋남. Phase 0에서 반드시 상한값을 명시해야 함.
4. **mock 페이지네이션의 정합성**: mock 폴백에서 `hasNext`/`totalCount`를 정직하게 계산하지 않으면 dev에서 무한 스크롤이 무한 루프할 수 있음. 슬라이싱 로직 단위 테스트 권장.
5. **신규 라우트 URL 네이밍**: `/popular/plan` vs `/plan/popular` 등 컨벤션은 PM·디자인 협의 1회 필요. 현재 안은 도메인 prefix(`popular`) 우선.

---

## 7. 산출물 체크리스트

- [ ] [cc/api/v1/main(O).md](../api/v1/main(O).md) 4개 섹션 명세 갱신
- [ ] `src/features/main/api/main.api.ts` 신규 (axios 함수 4종)
- [ ] `src/features/main/types/` 타입 정의
- [ ] `src/features/main/hooks/` hook 4종 (loadMore 포함)
- [ ] `src/app/api/plan/popular/{route.ts, nationwide/route.ts}` BFF 신규
- [ ] `src/app/api/place/popular/{route.ts, nationwide/route.ts}` BFF 신규
- [ ] `src/features/main/components/` 리스트 페이지 컴포넌트 4종
- [ ] `src/app/popular/{plan, place}/{page.tsx, nationwide/page.tsx}` 라우트 4종
- [ ] [src/app/page.tsx](../../src/app/page.tsx) 더보기 버튼 4곳 라우트 교체
- [ ] dev/prod 빌드 통과, 4개 페이지 수동 QA 완료
