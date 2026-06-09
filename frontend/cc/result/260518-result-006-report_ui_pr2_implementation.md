# 신고(Report) UI — PR-2 구현 결과

> 작성일: 2026-05-18
> 구현자: `oh-my-claudecode:executor` / 검증: 메인 에이전트
> 입력 계획서: [260515-plan-003-report_ui_implementation.md (v2)](../plan/260515-plan-003-report_ui_implementation.md)
> 범위: 계획서 §11 Phase 1 → PR-2 (훅 + API 계층 + Next.js stub)
> 선행: [PR-1 구현 결과](./260518-result-005-report_ui_pr1_implementation.md)

---

## 1. 작업 요약

PR-1의 타입/유틸 자산 위에 **신고 제출 흐름의 두뇌부**(훅 + API + Next.js BFF)를 얹었다. 컴포넌트 없이도 이 PR이 머지되면 신고 제출 로직이 코드 레벨에서 완성되며, PR-3가 UI만 붙이면 동작한다.

### 핵심 사양 출처

| 코드 | 계획서 출처 |
| --- | --- |
| `useReport({ reporterId })` 훅 + `submit(target, ...)` 시그니처 | §6 + Architect C-3 (race 차단) |
| `useReportEligibility({ currentUser, target })` 인자 주입 | §6 + Architect C-2 (store 디커플링) |
| `isSelfReport()` 단일 격리 함수 | §6 + Q1 결정 |
| `submitReport()` axios + idempotency-key 헤더 | §8-1 |
| `/api/reports` Next.js 라우트 (dev mock / prod 5xx 전파) | §8-2 + Architect C-1 |

---

## 2. 생성된 파일 (6개) + 수정 1개

```
src/features/report/
├── index.ts                              # ✏️ 수정 — hooks/api re-export 추가
├── hooks/
│   ├── index.ts                          # 🆕 hooks barrel
│   ├── useReport.ts                      # 🆕 메인 훅
│   └── useReportEligibility.ts           # 🆕 자격 판정 + isSelfReport
└── api/
    ├── index.ts                          # 🆕 api barrel
    └── report.api.ts                     # 🆕 submitReport()

src/app/api/reports/
└── route.ts                              # 🆕 Next.js POST 핸들러
```

| 파일 | 절대 경로 |
| --- | --- |
| 메인 훅 | [src/features/report/hooks/useReport.ts](../../src/features/report/hooks/useReport.ts) |
| 자격 판정 훅 | [src/features/report/hooks/useReportEligibility.ts](../../src/features/report/hooks/useReportEligibility.ts) |
| hooks barrel | [src/features/report/hooks/index.ts](../../src/features/report/hooks/index.ts) |
| axios API | [src/features/report/api/report.api.ts](../../src/features/report/api/report.api.ts) |
| api barrel | [src/features/report/api/index.ts](../../src/features/report/api/index.ts) |
| Next.js 라우트 | [src/app/api/reports/route.ts](../../src/app/api/reports/route.ts) |
| 최상위 barrel | [src/features/report/index.ts](../../src/features/report/index.ts) |

---

## 3. 핵심 export 일람

### 3-1. `useReport({ reporterId }): UseReportResult`

```ts
{
  isOpen: boolean;
  target: ReportTarget | null;
  isSubmitting: boolean;
  open: (target: ReportTarget) => void;
  close: () => void;
  submit: (target, reasonCode, detail?) => Promise<ReportResponse>;
}
```

특징:
- **`reporterId`는 옵션 인자로 주입** — 훅이 `useUserStore`에 직접 결합되지 않음 (Architect C-2)
- **`attemptId`는 마운트 시 1회 생성**(`useMemo`) — 같은 다이얼로그 인스턴스의 재시도가 같은 idempotency-key를 가지도록
- `crypto.randomUUID()` 폴백 — secure context가 아닌 환경(HTTP localhost 등)에서는 `Math.random().toString(36) + Date.now()` 대체
- **`submit`은 명시적 `target` 인자**(Architect C-3 race 차단)
- ETC + detail 빈값 → `throw new Error('ETC_DETAIL_REQUIRED')` — 토스트는 PR-3 호출부 책임
- 성공 응답 시 `hiddenReportsStorage.markReported(target)` 갱신 (단일 소스)

### 3-2. `useReportEligibility({ currentUser, target }): EligibilityResult`

```ts
{
  canShow: boolean;
  disabled: boolean;
  reason?: 'NOT_LOGGED_IN' | 'SELF_REPORT' | 'ALREADY_REPORTED';
}
```

판정 순서: `NOT_LOGGED_IN` → `SELF_REPORT` → `ALREADY_REPORTED` → 정상

### 3-3. `isSelfReport(user, target): boolean` — **named export**

```ts
// Q1 결정: 닉네임 best-effort. 백엔드 안정 식별자 도입 시 이 함수 1개만 교체.
export function isSelfReport(user: CurrentUser, target: ReportTarget): boolean {
  return user.isLoggedIn && user.name === target.ownerId;
  // TODO(auth): user.id === target.ownerId로 교체
}
```

PR-3 컴포넌트 분기에 직접 호출 가능 + 단위 테스트 용이.

### 3-4. `submitReport(payload, { reporterId, attemptId }): Promise<ReportResponse>`

- axios POST `/api/reports`, `idempotency-key` 헤더 자동 부여
- `try/catch` 없음 — 4xx/5xx는 그대로 throw, 호출부(`useReport.submit`) 책임

### 3-5. `/api/reports` (Next.js POST)

분기:
- `!baseUrl && NODE_ENV === 'production'` → **502** (설정 실수 표면화)
- `!baseUrl && dev` → mock **201** `{ reportId: 'mock-${Date.now()}', status: 'PENDING', alreadyReported: false }`
- `baseUrl 있음` → 백엔드로 프록시 (cookie, idempotency-key 전달). fetch 예외 시 **catch 폴백 없음** → Next.js가 500 반환 (Architect C-1: write 작업 사일런트 누락 차단)

---

## 4. 검증 결과

| 항목 | 결과 |
| --- | --- |
| `yarn build` | **통과**. `/api/reports`가 빌드 출력에 `ƒ /api/reports` (동적 라우트)로 등록됨. 정적 페이지 20개 모두 생성 |
| `yarn lint` | exit 1이지만 **모든 에러가 pre-existing** (다른 파일의 unused vars 등). PR-2 신규 파일 에러 0건 |
| `export default` 검색 | 0건 |
| `useUserStore` 직접 호출 | 0건 (주석 문자열에만 1회 등장 — `useReport.ts`의 "주입 — useUserStore 직접 결합 회피" 설명) |
| `mockData.ts` 변경 | **없음** (PR-3c 영역 보존) |
| 의도치 않은 파일 변경 | 없음 (`src/features/report/index.ts`만 1줄 추가 수정) |

---

## 5. 채택한 가정

1. **`crypto.randomUUID` 폴백** — secure context(HTTPS / localhost SecureContext) 아니면 `Math.random().toString(36).slice(2) + Date.now().toString(36)` 사용. idempotency-key 용도라 암호학적 강도 불필요.
2. **`fetchMyReports` 제외** — 계획서 §11 PR-2 체크리스트에 없고 §8 백엔드 계약상 P1. 마이페이지 신고 내역 화면(Phase 3)과 함께 도입.
3. **`/api/reports/me` GET 라우트 제외** — 위와 동일 사유.
4. **`submitReport`를 최상위 barrel에서도 export** — PR-3 컴포넌트가 훅을 거치지 않고 직접 호출할 일은 없지만, 테스트/Storybook에서 mock 주입 시 편의를 위해 노출.
5. **`isSelfReport`를 훅 외부에서도 export** — PR-3에서 ⋮ 메뉴 노출 결정 시 훅을 거치지 않고 즉시 분기 가능. 단위 테스트도 용이.

---

## 6. v2 계획서 결정사항 / Critical 반영 확인

| ID | 출처 | 반영 위치 |
| --- | --- | --- |
| Architect C-1 | Next.js 폴백 제거 | `route.ts` catch 폴백 없음, prod baseUrl 부재 시 502 |
| Architect C-2 | store 디커플링 | `useReport({ reporterId })`, `useReportEligibility({ currentUser })` 인자 주입 |
| Architect C-3 | race 차단 | `submit(target, reasonCode, detail)` 명시 인자 |
| Critic C-2 | idempotency-key 재설계 | `submitReport`가 `{ reporterId, attemptId }` ctx + PR-1의 `buildIdempotencyKey` 호출 |
| Architect M-3 | alreadyReported 단일 소스 | 훅 state로 보유 안 함. `hiddenReportsStorage.has(target)` 직접 조회 |
| Q1 | 닉네임 best-effort + 격리 함수 | `isSelfReport()` 단일 함수, `TODO(auth)` 주석 |
| Q3 | autoBlinded P0 수신만 | 훅이 응답을 그대로 반환, 분기 없음 |
| Q4 | 비로그인 비노출 | `useReportEligibility` → `NOT_LOGGED_IN` 반환 (canShow:false) |
| Q5 | feature flag 폐기 | flag 관련 코드 없음 |

---

## 7. PR-3가 사용할 import 예시

```ts
// 컴포넌트에서
import {
  useReport,
  useReportEligibility,
  isSelfReport,
  REASONS_BY_TARGET,
  REASON_LABELS,
} from '@/features/report';
import type {
  ReportTarget,
  ReportReasonCode,
  ReportResponse,
  CurrentUser,
} from '@/features/report';
import * as hiddenReportsStorage from '@/features/report/utils/hiddenReportsStorage';
```

전형적 사용 흐름:

```tsx
function CourseViewPage({ courseId }: Props) {
  const currentUser = useUserStore(s => ({
    id: s.user?.id ?? '',
    name: s.user?.name ?? '',
    isLoggedIn: s.isLoggedIn,
  }));
  const reportCtx = useReport({ reporterId: currentUser.id });

  return (
    <>
      {/* ⋮ 메뉴 안에 */}
      <ReportMenuItem
        target={courseTarget}
        currentUser={currentUser}
        onSelect={() => reportCtx.open(courseTarget)}
      />
      {/* 페이지 레벨 1개만 */}
      <ReportDialog
        isOpen={reportCtx.isOpen}
        target={reportCtx.target!}
        triggerRef={moreButtonRef}
        onClose={reportCtx.close}
        onSubmitted={(res, target) => { /* Step 2 전환 */ }}
        onHideContent={(target) => hiddenReportsStorage.add(target)}
      />
    </>
  );
}
```

---

## 8. 다음 단계 — PR-3 작업 범위

계획서 §11 PR-3:

- [ ] `src/features/report/components/ReportDialog/` — BottomSheet + 2단계 뷰 + 키보드 회피 + 포커스 트랩 + z-index 200
- [ ] `src/features/report/components/ReportMenuItem/`
- [ ] `CourseViewPage.tsx` 인라인 신고 코드 제거 → 새 컴포넌트 적용 (§9-1)
- [ ] `REPORT_REASONS` import 제거 (상수 자체는 PR-3c까지 보존)
- [ ] dev 환경 2일 dogfooding (Q5 절차)
- [ ] Storybook 빌드 + `yarn lint`/`yarn build` 통과

PR-3가 머지되면 **기존 인라인 신고 UI가 완전히 대체**되어 신고 기능이 새 구조로 동작한다.

---

## 9. 참고

- [계획서 v2](../plan/260515-plan-003-report_ui_implementation.md)
- [PR-1 결과](./260518-result-005-report_ui_pr1_implementation.md)
- [현황 조사](./260510-result-001-신고_ui_구현_현황.md)
