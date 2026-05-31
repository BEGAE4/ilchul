# 신고(Report) UI — PR-1 구현 결과

> 작성일: 2026-05-18
> 구현자: `oh-my-claudecode:executor` (sub-agent) / 검증: 메인 에이전트
> 입력 계획서: [260515-plan-003-report_ui_implementation.md (v2)](../plan/260515-plan-003-report_ui_implementation.md)
> 범위: 계획서 §11 Phase 1 → PR-1 (타입 + 유틸 + barrel)

---

## 1. 작업 요약

`src/features/report/` 신규 feature 폴더를 만들고 **타입 정의 + 유틸 함수 + barrel** 만 구현했다. 컴포넌트·훅·API 계층은 포함하지 않으며(PR-2/3 범위), `mockData.ts` 의 기존 `REPORT_REASONS` 상수도 손대지 않았다(PR-3c에서 제거 예정).

이 PR이 머지되면 PR-2/3가 import 만으로 즉시 활용 가능한 **타입 안전한 신고 도메인 어휘**가 확보된다.

### 구현된 사양 출처

| 코드 | 계획서 출처 |
| --- | --- |
| `ReportTarget` discriminated union | §4 (Architect M-4 반영) |
| `REASONS_BY_TARGET` 매핑 | §7 + Q2 임시안 |
| `buildIdempotencyKey()` | §8-1 (Critic C-2 — 분 단위 윈도우 폐기, attemptId UUID 채택) |
| `hiddenReportsStorage` 컴포지트 키 | §10 + Critic M-8 + Q7 결정 |

---

## 2. 생성된 파일 (7개)

```
src/features/report/
├── index.ts                              # 외부 노출 barrel (named only)
├── types/
│   ├── index.ts                          # type-only re-exports + REASON_LABELS
│   └── report.ts                         # 핵심 타입 정의
└── utils/
    ├── index.ts                          # named re-exports
    ├── buildIdempotencyKey.ts            # idempotency-key 생성기
    ├── hiddenReportsStorage.ts           # localStorage 기반 숨김 Set
    └── reasonsByTarget.ts                # 대상별 사유 매핑
```

| 파일 | 절대 경로 |
| --- | --- |
| 타입 정의 | [src/features/report/types/report.ts](../../src/features/report/types/report.ts) |
| 타입 barrel | [src/features/report/types/index.ts](../../src/features/report/types/index.ts) |
| 사유 매핑 | [src/features/report/utils/reasonsByTarget.ts](../../src/features/report/utils/reasonsByTarget.ts) |
| 숨김 스토리지 | [src/features/report/utils/hiddenReportsStorage.ts](../../src/features/report/utils/hiddenReportsStorage.ts) |
| 멱등 키 생성 | [src/features/report/utils/buildIdempotencyKey.ts](../../src/features/report/utils/buildIdempotencyKey.ts) |
| utils barrel | [src/features/report/utils/index.ts](../../src/features/report/utils/index.ts) |
| 최상위 barrel | [src/features/report/index.ts](../../src/features/report/index.ts) |

---

## 3. 핵심 export 일람

### 3-1. 타입 (`@/features/report`)

```ts
// 타입 (type-only)
ReportTargetType    = 'course' | 'comment' | 'user'
ReportReasonCode    = 9개 union (SPAM_AD ~ ETC)
ReportTarget        = discriminated union (course | comment | user)
ReportPayload       = { target, reasonCode, detail? }
ReportStatus        = 'PENDING' | 'REVIEWING' | 'RESOLVED' | 'REJECTED'
ReportResponse      = { reportId?, status?, alreadyReported?, autoBlinded? }
CurrentUser         = { id, name, isLoggedIn }

// 상수
REASON_LABELS       : Record<ReportReasonCode, string>  // 한글 라벨
```

### 3-2. 유틸 (`@/features/report`)

```ts
REASONS_BY_TARGET   : Record<ReportTargetType, ReportReasonCode[]>

buildIdempotencyKey({ reporterId, attemptId, target, reasonCode }): string

// hiddenReportsStorage — named export 방식
add(target)         : void
remove(target)      : void
has(target)         : boolean
markReported(target): void  // add의 alias (계획서 §6)
getAll()            : ReadonlySet<string>
clear()             : void  // 테스트용
```

---

## 4. 검증 결과

| 항목 | 결과 |
| --- | --- |
| `yarn build` | exit 0 (15초) |
| `yarn lint` (report feature) | report feature 신규 파일 에러 0건 |
| `export default` 검색 | 0건 (named exports only 규칙 준수) |
| 의도치 않은 파일 변경 | 없음 (`git status`로 확인) |
| `REPORT_REASONS` 상수 보존 | `mockData.ts:793-800` 그대로 유지 (PR-3c에서 제거 예정) |
| discriminated union 정합성 | `target.type`이 'course'/'comment'/'user' 분기에서 컴파일러가 필수 필드 강제 확인 |

---

## 5. 채택한 가정 (executor 보고 + 검증)

1. **SSR 가드** — `hiddenReportsStorage`의 모든 함수에 `typeof window === 'undefined'` 체크. Next.js SSR에서 호출되어도 빈 Set 반환, throw 없음.
2. **JSON 파싱 실패** — `localStorage` 값이 손상되었거나 형식 불일치 시 `try/catch`로 빈 Set 반환. 사용자 데이터 손실은 발생하지만 앱 크래시 방지가 우선.
3. **localStorage 쓰기 실패** — 쿼터 초과/사파리 프라이빗 모드 등에서 silently ignore. 다음 호출 시 빈 Set로 시작.
4. **사유 라벨 헬퍼 함수 미생성** — 계획서 지시대로 `REASONS_BY_TARGET` 상수만 export. 라벨 조회는 호출부에서 `REASON_LABELS[code]` 직접 참조.
5. **`hiddenReportsStorage` namespace import 권장** — 개별 함수가 named export이므로 PR-3 호출 시 `import * as hiddenReportsStorage from '../utils/hiddenReportsStorage'` 형태를 권장(계획서 §5-2의 `hiddenReportsStorage.has(target)` 호출 패턴 정합).

---

## 6. PR-2 (훅 + API 계층)가 사용할 import 예시

```ts
// PR-2의 useReport.ts / report.api.ts에서
import type {
  ReportTarget,
  ReportReasonCode,
  ReportPayload,
  ReportResponse,
  CurrentUser,
} from '@/features/report';

import {
  REASONS_BY_TARGET,
  REASON_LABELS,
  buildIdempotencyKey,
} from '@/features/report';

import * as hiddenReportsStorage from '@/features/report/utils/hiddenReportsStorage';
// 호출: hiddenReportsStorage.has(target), hiddenReportsStorage.markReported(target)
```

---

## 7. v2 계획서 결정사항 반영 확인

| Q | 결정 | PR-1 반영 위치 |
| --- | --- | --- |
| Q1 | 닉네임 best-effort + `isSelfReport()` 격리 | 타입(`CurrentUser`)만 PR-1에서 정의. 함수는 PR-2 |
| Q2 | 댓글 사유 5종 (`ABUSE/OBSCENE/SPAM_AD/PERSONAL_INFO_LEAK/ETC`) | `reasonsByTarget.ts` `comment` 키 |
| Q3 | `autoBlinded` P0는 수신만 | `ReportResponse.autoBlinded?: boolean` 옵셔널로 포함 |
| Q4 | 비로그인 비노출 | `CurrentUser.isLoggedIn` 필드 (PR-3 `ReportMenuItem`에서 사용) |
| Q5 | feature flag 폐기 | PR-1은 flag 없음 |
| Q6 | 댓글 트리거 BottomMenu | PR-1 영향 없음 (PR-4) |
| Q7 | localStorage only, 동기 없음 | `hiddenReportsStorage.ts` 파일 헤더 주석 명시 |
| Q8 | 다이얼로그 Step 2 뷰 | PR-1 영향 없음 (PR-3) |

---

## 8. v2 계획서 Critical 반영 확인

| ID | 출처 | 반영 위치 |
| --- | --- | --- |
| ④ idempotency-key 재설계 | Critic C-2 | `buildIdempotencyKey()` — attemptId UUID 채택, 분 단위 윈도우 제거 |
| ⑥ discriminated union | Architect M-4 | `ReportTarget` |
| ⑩ `isSelfReport()` 격리 준비 | Critic C-1 / Architect C-2 | `CurrentUser` 타입 정의 |
| M-8 컴포지트 키 | Critic | `hiddenReportsStorage.compositeKey(target)` |
| Architect M-2 lib → utils | Architect | `src/features/report/utils/` 채택 |

---

## 9. 다음 단계 — PR-2 작업 범위

계획서 §11 PR-2 체크리스트:

- [ ] `src/features/report/hooks/useReport.ts`
  - `submit(target, reasonCode, detail)` 시그니처 (Architect C-3: race 차단)
  - `attemptId = crypto.randomUUID()` 컴포넌트 마운트 시 1회 생성
  - 성공 시 `hiddenReportsStorage.markReported(target)` 갱신
- [ ] `src/features/report/hooks/useReportEligibility.ts`
  - `currentUser` 인자 주입 (Architect C-2: store 디커플링)
  - `isSelfReport()` 단일 격리 함수 (Q1)
- [ ] `src/features/report/api/report.api.ts`
  - `submitReport()`, `fetchMyReports()`
- [ ] `src/app/api/reports/route.ts`
  - **POST 핸들러**
  - dev 한정 mock 응답, **프로덕션에서 catch fallback 금지** (Architect C-1)
- [ ] `yarn lint` / `yarn build` 통과

PR-2가 머지되면 컴포넌트 없이도 신고 제출 흐름이 코드 레벨에서 완성된다.

---

## 10. 참고

- [계획서 v2](../plan/260515-plan-003-report_ui_implementation.md)
- [현황 조사](./260510-result-001-신고_ui_구현_현황.md)
- [컨벤션 v1.0](../convention/260506-convention-001-convention_v1.0.md.md)
