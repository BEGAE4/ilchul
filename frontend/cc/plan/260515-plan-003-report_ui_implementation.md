# 신고(Report) UI 추가 구현 계획서 (v2)

> 작성일: 2026-05-15
> 작성: Planner (sub-agent) → v2 통합: 메인 에이전트
> 입력 문서: [신고 UI 구현 현황](../result/260510-result-001-신고_ui_구현_현황.md), [컨벤션 v1.0](../convention/260506-convention-001-convention_v1.0.md.md), [디렉토리 구조 v1.0](../convention/260506-convention-002-directory_structure_v1.0.md)
> 출력 파일 경로: `frontend/cc/plan/260515-plan-003-report_ui_implementation.md`

---

## 📜 v2 개정 이력 (Revision History)

본 v2는 v1에 대한 3개 에이전트(`critic`, `architect`, `designer`) 병렬 검토를 반영한 결과다.

| Critical 반영 항목 | 출처 |
| --- | --- |
| ① Next.js 라우트의 `catch → mock 201` 폴백 제거 (POST write 작업에서 사일런트 누락 방지) | Architect C-1 |
| ② `useReportEligibility` → `useUserStore` 직접 결합 해제, currentUser **인자 주입** | Architect C-2 |
| ③ `submit(target, reasonCode, detail)` 시그니처로 변경 (race condition 차단) | Architect C-3 |
| ④ `idempotency-key` 재설계: `reporterId + target + reasonCode + 컴포넌트 마운트당 UUID` | Critic C-2 |
| ⑤ `REPORT_REASONS` 상수 삭제를 PR-3에서 분리 → flag 회수 후 별도 PR-3c | Critic C-3 |
| ⑥ `ReportTarget` discriminated union 전환 (P1 확장 시 누락 컴파일 에러로 표면화) | Architect M-4 |
| ⑦ `alreadyReported` 단일 소스 → `hiddenReportsStorage`로 일원화 | Architect M-3 |
| ⑧ "신고 후 숨기기"를 sonner 2-button toast → 다이얼로그 내 **2단계 뷰**로 변경 | Designer C-1 |
| ⑨ BottomSheet 키보드 회피 명세 (`visualViewport` 리스너) 추가 | Designer C-2 |
| ⑩ 자기 신고 차단의 식별자 매칭 한계를 가정 A7에 명시 + 단일 교체 지점 보장 | Critic C-1 / M-1 |

| Major 반영 | 출처 |
| --- | --- |
| `lib/` → `utils/`로 통일 (기존 feature 선례) | Architect M-2 |
| 포커스 트랩 구체 명세 (Tab 순환, 트리거 복귀, `dialogTriggerRef`) | Designer M-1 |
| z-index 계층 명시 (`ReportDialog: 200`, BottomMenu: 50) | Designer M-3 |
| 제출 버튼 `bg-red-500` 통일, 선택 상태만 sky 계열로 분리 명세 | Designer M-2 |
| 비로그인 UX 단일화: 메뉴 비노출 (A6와 5-2 모순 해소) | Critic M-6 |
| `.omc/plans/open-questions.md` 죽은 링크 제거 → 본 문서 §16 인라인 관리 | Critic M-4 |
| MSW Storybook 핸들러 명시(deferred 표기) | Critic M-5 |
| 댓글 진입점 트리거를 BottomMenu 단일 패턴으로 확정 | Designer M-4 |
| `hiddenReportsStorage` 키를 `${type}:${id}` 컴포지트로 변경 | Critic M-8 |
| BottomMenu의 `MenuItem`은 라벨 텍스트만 받을 수 있어 ReportMenuItem은 **별도 컴포넌트로 슬롯 주입** 방식 명시 | Architect (기존 코드 정합성) |

---

## ✅ 결정 완료 항목 (Resolved Questions)

본 v2의 Open Questions 8개는 **사용자와 합의 완료**(2026-05-18)되었다. 결정이 바뀌면 해당 영역만 단일 파일 수정으로 흡수 가능하도록 설계됨.

| # | 결정 항목 | 확정 사항 | 변경 시 영향 범위 |
| --- | --- | --- | --- |
| Q1 | 본인 식별 전략 (닉네임 vs 안정 ID) | **단계적 접근**: ① P0에서는 닉네임 best-effort + `isSelfReport()` 단일 함수 격리. ② 백엔드에 **안정 식별자(`authorId`/`userId`) 응답 포함 요청**(§14 O3, P0 머지 전후 처리). ③ 안정 ID 도입 시 `isSelfReport()` 1줄 교체. ④ 서버 측 **`403 self-report-forbidden` 이중 안전망**(§8-2 백엔드 계약에 이미 명시) | `useReportEligibility.ts` 1개 함수 + 백엔드 계약 |
| Q2 | 댓글 신고 사유 5종 확정 | result 임시안 채택 (`ABUSE/OBSCENE/SPAM_AD/PERSONAL_INFO_LEAK/ETC`) — 기획자 확정 시 한 줄 갱신 | `reasonsByTarget.ts` 한 줄 |
| Q3 | `autoBlinded: true` 응답 시 P0 동작 | P0는 신호 수신만, UI 분기는 Phase 3. 타입에는 미리 옵셔널로 포함 | UI 분기 점 1곳(`useReport.submit`) |
| Q4 | 비로그인 진입 UX | 메뉴 항목 비노출 (`return null`). 클릭/토스트 둘 다 없음 | `ReportMenuItem` 렌더 분기 |
| Q5 | feature flag 도입 여부 | **도입 폐기**. PR-3 머지 전 dev 환경 2일 dogfooding으로 대체. 사고 시 git revert | PR-3 머지 절차 |
| Q6 | 댓글 ⋮ 트리거 패턴 | BottomMenu 단일 (popover/long-press 제외) | `CourseViewPage.tsx` 댓글 영역 |
| Q7 | "숨기기" 디바이스 간 동기 | 동기화 없음 (localStorage only). 영구 차단은 자동 블라인드(Q3) 또는 별도 user-block feature가 담당. 코드 주석 명시 | `hiddenReportsStorage.ts` |
| Q8 | 신고 후 UX 패턴 | 다이얼로그 내 **2단계 뷰** ("신고 접수됨" + "이 콘텐츠 숨기기" CTA) | `ReportDialog/component.tsx` |

---

## 1. 개요 · 목표

### 1-1. 무엇을

`CourseViewPage.tsx` 내부에 인라인으로 박혀 있는 신고 UI를 **공용 feature(`src/features/report/`)** 로 추출하고, 신고 대상을 **플랜(course) / 댓글(comment) / 사용자(user)** 세 가지로 확장한다. 후속 단계에서 커뮤니티 게시글 · 후기/리뷰까지 동일 컴포넌트로 확장 가능한 구조를 만든다.

### 1-2. 왜

- 현재 신고 UI는 mock 토스트만 띄울 뿐 백엔드와 단절되어 있고, 페이로드에 `courseId`조차 실리지 않는다.
- 새 진입점(댓글/사용자)을 도입할 때마다 중앙 모달을 복제하면 일관성과 접근성이 무너진다.
- 운영 데이터(사유 코드 통계, 처리 큐 입력)는 한글 문자열 사유로는 추출이 어렵다 → `reasonCode` 기반 표준화 필요.

### 1-3. 본 계획의 범위 (P0)

| 우선순위 | 대상 | 포함 사항 |
| --- | --- | --- |
| **P0 (이번 PR 시리즈)** | course, comment, user | feature 폴더 추출 / 공용 컴포넌트 / 사유 코드 매핑 / API 계층 stub / 기존 플랜 신고 마이그레이션 / 신규 진입점 2개 |
| **P1 (후속)** | community-post, review | 컴포넌트 재사용 + 사유 매핑 추가만으로 도입 |
| **검토 제외** | magazine, feed, healing-diary | CLAUDE.md 규정에 따라 본 계획에서 다루지 않음 |

### 1-4. Non-Goals

- 자동 블라인드 · 누적 경고 · 영구 정지 등 운영 파이프라인 → Phase 3
- Admin 인터페이스(처리 큐) → 별도 프로젝트
- 신고자 인앱 알림, 이의제기 이메일 라우팅
- 후기/리뷰 · 커뮤니티 게시글 진입점 → P1
- 차단(block) 기능 → 별도 feature(`features/user-block`)

---

## 2. 전제 가정 (Assumptions)

| # | 가정 | 근거 / 폴백 |
| --- | --- | --- |
| A1 | 백엔드 `POST /api/reports` 명세는 미확정. Next.js API 라우트(`src/app/api/reports/route.ts`)를 **dev 환경 한정 mock-first stub**으로 만들고, 프로덕션에서는 백엔드 장애 시 **5xx로 그대로 전파** | v1의 `catch → mock 201` 폴백 폐기 (Architect C-1) |
| A2 | 사유 코드 한글 라벨은 result §1-2 표 채택. 댓글 사유는 result TBD 1의 임시안(`ABUSE/OBSCENE/SPAM_AD/PERSONAL_INFO_LEAK/ETC`) | 기획자 확정 시 `reasonsByTarget.ts` 단일 파일 갱신 |
| A3 | 자동 블라인드 임계치 N, 중복 신고 주기는 **클라이언트에서 강제하지 않는다.** 서버 응답(`alreadyReported`, `429`)에만 반응 | 정책 변경 비용 최소화 |
| A4 | 차단(block)은 본 계획 범위 외. 별개 feature(`features/user-block`) | 신고 ≠ 차단 |
| A5 | "신고 직후 숨기기" 는 **로컬 스토리지** 임시 hide-set. 디바이스 간 동기 없음 (Q7) | 자동 블라인드 도입 전 임시 |
| A6 | 비로그인 시 ReportMenuItem 자체 **비노출**(`return null`). 클릭/토스트 없음 (Q4, v1의 모순 해소) | result §2 정합 |
| A7 | **본인 콘텐츠 자기 신고 차단은 닉네임 best-effort**. `course.author`/`comment.user`가 닉네임 문자열이고, `useUserStore.user.name`도 닉네임 → `user.name === target.ownerId` 비교. **동명이인 우회 가능성 인지**. 비교는 `isSelfReport()` 단일 함수(`useReportEligibility.ts`)로 격리해 백엔드 안정 식별자 도입 시 즉시 교체 | 가정 A7-fix (Critic C-1, Architect C-2) |
| A8 | 기존 `REPORT_REASONS` 상수는 **PR-3c(별도 PR)에서 제거**. PR-3 머지 시점에는 신·구 코드가 동일 상수 참조 가능 상태 유지 (feature flag 폐기 결정 후에도 안전한 분리) | Critic C-3 |
| A9 | 디렉토리 컨벤션은 **CLAUDE.md FSD 실사용 구조**(`features/{name}/{api,components,hooks,types,utils}`) 채택. `lib/`는 다른 feature 선례 없음 → `utils/`로 통일 | Architect M-2 |
| A10 | `useReportEligibility`는 store에 직접 결합하지 않고 `currentUser` 객체를 **인자로 받는다** → 테스트 가능 + 진짜 인증 store 도입 시 호출부 1곳만 수정 | Architect C-2 |

---

## 3. 신규 디렉토리 / 파일 구조

```
src/features/report/
├── api/
│   ├── report.api.ts                     # axios 호출. submitReport / fetchMyReports
│   └── index.ts
├── components/
│   ├── ReportDialog/
│   │   ├── component.tsx                 # BottomSheet 다이얼로그 + 2단계 뷰
│   │   ├── types.ts
│   │   ├── styles.module.scss
│   │   ├── index.ts
│   │   └── index.stories.tsx
│   ├── ReportMenuItem/
│   │   ├── component.tsx                 # ⋮ 메뉴에 꽂는 "신고하기" 항목. 자격 검사 내장
│   │   ├── types.ts
│   │   ├── styles.module.scss
│   │   ├── index.ts
│   │   └── index.stories.tsx
│   └── index.ts
├── hooks/
│   ├── useReport.ts                      # open / close / submit(target, reasonCode, detail)
│   ├── useReportEligibility.ts           # currentUser 인자 주입, isSelfReport() 격리
│   └── index.ts
├── utils/                                # ← v1의 lib/ 에서 변경 (Architect M-2)
│   ├── reasonsByTarget.ts                # 대상별 사유 코드 매핑 + 한글 라벨
│   ├── hiddenReportsStorage.ts           # 신고 후 "숨기기" 로컬 스토리지 헬퍼 + alreadyReported 단일 소스
│   ├── buildIdempotencyKey.ts            # reporterId + target + reasonCode + 컴포넌트 UUID
│   └── index.ts
├── types/
│   ├── report.ts                         # ReportTargetType, ReportTarget(union), ReportPayload 등
│   └── index.ts
└── index.ts                              # 외부 노출 barrel (named exports only)
```

추가:
```
src/app/api/reports/
└── route.ts                              # POST 핸들러. baseUrl 부재 시에만 mock (dev 한정)
```

기존 코드 변경 위치:
- `src/features/course-detail/components/CourseViewPage.tsx` — 인라인 신고 코드 제거 + 댓글 진입점 추가
- `src/features/profile/components/UserProfilePage.tsx` — 헤더 ⋮ + BottomMenu 추가
- `src/shared/data/mockData.ts` — `REPORT_REASONS` 상수 제거 (**PR-3c, 별도 PR**)

---

## 4. 타입 정의 (Discriminated Union 채택)

`src/features/report/types/report.ts`

```ts
// 신고 대상 유형. P0: course/comment/user
export type ReportTargetType = 'course' | 'comment' | 'user';

// 사유 코드
export type ReportReasonCode =
  | 'SPAM_AD'
  | 'FAKE_INFO'
  | 'OBSCENE'
  | 'ABUSE'
  | 'COPYRIGHT'
  | 'IMPROPER_PROFILE'
  | 'IMPERSONATION'
  | 'PERSONAL_INFO_LEAK'
  | 'ETC';

export const REASON_LABELS: Record<ReportReasonCode, string> = {
  SPAM_AD: '스팸/광고',
  FAKE_INFO: '허위정보',
  OBSCENE: '음란성',
  ABUSE: '욕설/비방',
  COPYRIGHT: '저작권 침해',
  IMPROPER_PROFILE: '부적절한 닉네임/프로필',
  IMPERSONATION: '타인 사칭',
  PERSONAL_INFO_LEAK: '개인정보 노출',
  ETC: '기타(직접 입력)',
};

// Discriminated Union (Architect M-4)
// — 대상별로 필수 컨텍스트가 다르므로 type 단위로 강제
export type ReportTarget =
  | { type: 'course';  id: string; ownerId: string; title: string; contextUrl: string }
  | { type: 'comment'; id: string; ownerId: string; courseId: string; snippet: string; contextUrl: string }
  | { type: 'user';    id: string; ownerId: string; nickname: string; contextUrl: string };

export interface ReportPayload {
  target: ReportTarget;
  reasonCode: ReportReasonCode;
  detail?: string;
}

export type ReportStatus = 'PENDING' | 'REVIEWING' | 'RESOLVED' | 'REJECTED';

export interface ReportResponse {
  reportId?: string;
  status?: ReportStatus;
  alreadyReported?: boolean;
  autoBlinded?: boolean;
}

export interface CurrentUser {
  id: string;
  name: string;
  isLoggedIn: boolean;
}
```

규칙
- 컨벤션: `interface` 우선. union/literal만 `type`.
- `REASONS_BY_TARGET[target.type]` 호출이 union으로 인해 **exhaustive 체크** 자동.

---

## 5. 공용 컴포넌트 명세

### 5-1. `ReportDialog` (BottomSheet + 2단계 뷰)

**역할** — 사유 선택 → 제출 → 완료 후 "숨기기" CTA까지 단일 시트 안에서 처리.

**디자인 출발점** — `src/shared/ui/ShareBottomSheet/component.tsx` 레이아웃·애니메이션 참고. 단 ShareBottomSheet 그대로는 라디오/textarea 없으므로 **별도 신설**.

**Props**

```ts
interface ReportDialogProps {
  isOpen: boolean;
  target: ReportTarget;
  alreadyReported?: boolean;
  triggerRef?: React.RefObject<HTMLElement>;   // 닫힐 때 포커스 복귀 대상 (Designer M-1)
  onClose: () => void;
  onSubmitted?: (response: ReportResponse, target: ReportTarget) => void;
  onHideContent?: (target: ReportTarget) => void;  // 2단계 뷰에서 호출 (Q8)
}
```

**2단계 뷰 (Designer C-1 핵심 반영)**

| Step | 내용 |
| --- | --- |
| Step 1 (입력) | 라디오 사유 + textarea + 취소/신고하기 버튼 |
| Step 2 (완료) | 성공 응답 후 같은 시트에서 전환. 헤더 "신고가 접수됐어요. 검토 후 조치할게요." + 본문 짧은 설명 + 단일 CTA "이 콘텐츠 숨기기" + 보조 CTA "닫기" |

> sonner의 2-button toast는 모바일 safe-area 침범 + 터치 영역 44px 미달 위험이 있어 폐기.

**내부 동작**

1. `target.type` → `REASONS_BY_TARGET[target.type]` 조회
2. 라디오 렌더 (`<input type="radio">` 커스텀 스타일). 선택 상태만 `bg-sky-50 border-sky-400`
3. `ETC` 선택 시 textarea 필수 + `maxLength={500}` + `compositionend` 이후 카운터 갱신 (Designer m-2). placeholder도 "신고 사유를 직접 입력해주세요 (필수)"로 변경 (Designer m-1)
4. 제출 → `useReport().submit(target, reasonCode, detail)` 호출 (target 명시 전달, Architect C-3)
5. 응답 분기:
   - 성공 → **Step 2로 전환** (토스트는 보조용으로만 짧게)
   - `alreadyReported` → 토스트 + 닫기
   - `429` → 토스트 (일시 제한 안내)
   - 4xx/5xx → 토스트 (일시 오류 안내)
6. ESC 닫기, 오버레이 클릭 닫기

**키보드 회피 (Designer C-2)**

```ts
useEffect(() => {
  if (!isOpen || !window.visualViewport) return;
  const vv = window.visualViewport;
  const update = () => {
    const offset = window.innerHeight - vv.height - vv.offsetTop;
    sheetRef.current?.style.setProperty('--keyboard-offset', `${Math.max(0, offset)}px`);
  };
  vv.addEventListener('resize', update);
  vv.addEventListener('scroll', update);
  update();
  return () => {
    vv.removeEventListener('resize', update);
    vv.removeEventListener('scroll', update);
  };
}, [isOpen]);
```

SCSS: `bottom: var(--keyboard-offset, 0px)` + `padding-bottom: max(1.5rem, env(safe-area-inset-bottom))` + `max-height: 85vh; overflow-y: auto`.

**z-index 계층 (Designer M-3)**
- BottomMenu 오버레이: 50
- BottomMenu 시트: 51
- **ReportDialog 오버레이: 199**
- **ReportDialog 시트: 200**
- sonner 토스트: 250 (sonner 기본값 사용)

**포커스 트랩 (Designer M-1)**

1. 열림 → 첫 `<input type="radio">`에 `.focus()`
2. Tab/Shift+Tab → 시트 내부 포커스 가능 요소(라디오, textarea, 취소, 제출) 순환. 끝/처음에서 wrap.
3. 닫힘 → `triggerRef?.current?.focus()` 복귀.
4. 구현은 `focus-trap-react` 의존성 추가하지 않고 직접 구현(시트 내 포커스 가능 요소 수가 적음).

**접근성**
- `role="dialog"`, `aria-modal="true"`, `aria-labelledby` 헤더 id 참조
- 라디오 그룹 `role="radiogroup"` + `aria-label="신고 사유"`
- textarea `aria-label="신고 상세 내용"`
- disabled 버튼 색 대비 — `bg-gray-300` 위 white는 WCAG 미달이므로 텍스트 색은 `text-gray-500`로 조정 (Designer ♿)

**컬러 토큰 (Designer M-2)**
- 선택 상태 표시: sky 계열 (`bg-sky-50 border-sky-400`)
- 제출 버튼: **`bg-red-500` / hover `bg-red-600`** (destructive)
- 라디오 선택과 제출 버튼이 다른 컬러 톤인 점을 styles.module.scss 상단 주석에 명시

### 5-2. `ReportMenuItem`

**역할** — 더보기 메뉴 안에 꽂는 단일 "신고하기" 항목. BottomMenu의 `items` prop은 단순 라벨/아이콘만 받으므로 **별도 컴포넌트로 슬롯 주입** (BottomMenu 옆에 형제로 배치, 혹은 BottomMenu에 `renderExtra` slot 추가 — PR-3에서 결정).

**Props**

```ts
interface ReportMenuItemProps {
  target: ReportTarget;
  currentUser: CurrentUser;     // 외부 주입 (Architect C-2 / A10)
  onSelect: () => void;
}
```

**렌더 규칙**

| 자격 상태 | UI |
| --- | --- |
| `!currentUser.isLoggedIn` | **비노출** (`return null`) — Q4 결정 |
| `isSelfReport(currentUser, target)` | **비노출** |
| `hiddenReportsStorage.has(target)` (= 이미 신고함) | "이미 신고함" 라벨 + `disabled` |
| 정상 | 빨간 라벨 + Flag 아이콘 |

자격 판정은 `useReportEligibility({ currentUser, target })` 훅에 위임.

---

## 6. `useReport` 훅 명세

`src/features/report/hooks/useReport.ts`

```ts
interface UseReportResult {
  isOpen: boolean;
  target: ReportTarget | null;
  isSubmitting: boolean;
  open: (target: ReportTarget) => void;
  close: () => void;
  submit: (
    target: ReportTarget,        // 명시 전달 (Architect C-3)
    reasonCode: ReportReasonCode,
    detail?: string
  ) => Promise<ReportResponse>;
}
```

내부
- `isOpen`, `target` — 다이얼로그 제어
- `isSubmitting` — 더블 클릭 방지
- **`alreadyReported`는 별도 상태로 보유하지 않음**. 호출부에서 `hiddenReportsStorage.has(target)`을 단일 소스로 조회 (Architect M-3)
- 컴포넌트 마운트 시 1회 `attemptId = crypto.randomUUID()` 생성 → idempotency-key에 사용

`submit` 흐름
1. `ETC` 사유 + `detail` 비어 있음 → reject + 토스트 (호출부 처리)
2. `idempotency-key`: `buildIdempotencyKey({ reporterId, target, reasonCode, attemptId })` (분 단위 윈도우 폐기)
3. `submitReport(payload)` 호출
4. 응답에 따라 `hiddenReportsStorage.markReported(target)` (성공 시) — alreadyReported 단일 소스 갱신

`useReportEligibility({ currentUser, target })` 별도 훅 (`useUserStore` 직접 의존 없음)

```ts
interface EligibilityResult {
  canShow: boolean;
  reason?: 'NOT_LOGGED_IN' | 'SELF_REPORT' | 'ALREADY_REPORTED';
}

// 단일 격리 함수 — 백엔드 ID 도입 시 이 함수만 교체
function isSelfReport(user: CurrentUser, target: ReportTarget): boolean {
  return user.isLoggedIn && user.name === target.ownerId;
  // TODO(auth): currentUser.id가 안정 식별자가 되면 user.id === target.ownerId로 교체
}
```

---

## 7. 대상별 사유 매핑

`src/features/report/utils/reasonsByTarget.ts`

```ts
import type { ReportTargetType, ReportReasonCode } from '../types';

export const REASONS_BY_TARGET: Record<ReportTargetType, ReportReasonCode[]> = {
  course:  ['SPAM_AD', 'FAKE_INFO', 'OBSCENE', 'ABUSE', 'COPYRIGHT', 'ETC'],
  comment: ['ABUSE', 'OBSCENE', 'SPAM_AD', 'PERSONAL_INFO_LEAK', 'ETC'],  // Q2 임시안
  user:    ['COPYRIGHT', 'IMPROPER_PROFILE', 'IMPERSONATION', 'ETC'],
};
```

코드 추가 시: `ReportReasonCode` union → `REASON_LABELS` → `REASONS_BY_TARGET` 3-step 갱신.

---

## 8. API 계층 설계

### 8-1. axios 호출 — `src/features/report/api/report.api.ts`

```ts
import axios from 'axios';
import type { ReportPayload, ReportResponse } from '../types';
import { buildIdempotencyKey } from '../utils/buildIdempotencyKey';

export async function submitReport(
  payload: ReportPayload,
  ctx: { reporterId: string; attemptId: string }
): Promise<ReportResponse> {
  const res = await axios.post<ReportResponse>('/api/reports', payload, {
    headers: {
      'idempotency-key': buildIdempotencyKey({ ...ctx, ...payload }),
    },
  });
  return res.data;
}

export async function fetchMyReports() {
  const res = await axios.get('/api/reports/me');
  return res.data;
}
```

`src/features/report/utils/buildIdempotencyKey.ts`

```ts
// reporterId + target.type + target.id + reasonCode + 마운트당 UUID (Critic C-2)
// — 분 단위 윈도우 폐기. 정상 재시도가 분 경계를 넘어도 동일 키 유지.
export function buildIdempotencyKey(input: {
  reporterId: string;
  attemptId: string;
  target: { type: string; id: string };
  reasonCode: string;
}): string {
  return [
    input.reporterId,
    input.target.type,
    input.target.id,
    input.reasonCode,
    input.attemptId,
  ].join(':');
}
```

### 8-2. Next.js API 라우트 — `src/app/api/reports/route.ts`

**v1 대비 핵심 변경 (Architect C-1)**: 프로덕션 fetch 실패 시 mock 폴백 제거. baseUrl 미설정(`dev`) 시에만 mock 반환.

```ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const body = await request.json();

  // dev only: baseUrl 미설정 시 mock 반환
  if (!baseUrl) {
    if (process.env.NODE_ENV === 'production') {
      // 프로덕션에서 baseUrl이 비어 있으면 설정 실수 — 502로 표면화
      return NextResponse.json({ error: 'backend not configured' }, { status: 502 });
    }
    return NextResponse.json(
      { reportId: `mock-${Date.now()}`, status: 'PENDING', alreadyReported: false },
      { status: 201 }
    );
  }

  const cookie = request.headers.get('cookie') ?? '';
  const idemKey = request.headers.get('idempotency-key') ?? '';

  // try/catch 폴백 제거 — fetch 예외는 그대로 throw → Next가 500으로 전파
  const res = await fetch(`${baseUrl}/api/reports`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { cookie } : {}),
      ...(idemKey ? { 'idempotency-key': idemKey } : {}),
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
```

백엔드 계약

```
POST /api/reports
Body: ReportPayload
응답:
  201 { reportId, status: 'PENDING', alreadyReported: false, autoBlinded?: boolean }
  200 { alreadyReported: true }
  401 unauthorized
  403 self-report-forbidden
  429 too-many-reports

GET /api/reports/me   # P1
```

### 8-3. MSW 핸들러 (deferred)

Storybook 인터랙션 테스트용 MSW 핸들러는 본 plan에서 **deferred**(별도 plan/PR). Storybook story는 `submit` 호출을 args로 모킹하는 수준으로만 처리. (Critic M-5)

---

## 9. 각 진입점별 통합 작업

### 9-1. 플랜(course) — 마이그레이션

**대상**: [src/features/course-detail/components/CourseViewPage.tsx](../../src/features/course-detail/components/CourseViewPage.tsx)

| 위치 | 변경 |
| --- | --- |
| L26 | `REPORT_REASONS` import 제거 |
| L57-L59 | `isReportOpen`/`reportReason`/`reportDetail` → `useReport()` 훅으로 대체 |
| L500-L533 (더보기 메뉴) | `Flag` 인라인 항목 → `<ReportMenuItem target={courseTarget} currentUser={...} onSelect={() => open(courseTarget)} />` |
| L535-L591 (다이얼로그) | 인라인 모달 전체 제거 → `<ReportDialog ... />` 페이지 레벨 1개 |

`courseTarget` (discriminated union 채택)

```ts
const courseTarget: ReportTarget = {
  type: 'course',
  id: courseId,
  ownerId: course.author,            // 가정 A7: 닉네임 매칭
  title: course.title,
  contextUrl: `/course/${courseId}`,
};
```

성공 시 `onHideContent` → `hiddenReportsStorage.add(courseTarget)` + 사용자 선택 시 `router.back()`.

### 9-2. 댓글(comment) — 신규 진입점

**대상**: [src/features/course-detail/components/CourseViewPage.tsx](../../src/features/course-detail/components/CourseViewPage.tsx) **댓글 영역 L324-L359**

현재 댓글 카드: 본인 댓글 → `Trash2`. **타인 댓글 → 액션 없음**(빈 자리).

변경 (Critic M-2, Designer M-4 결정 반영)

| 변경 | 내용 |
| --- | --- |
| **타인 댓글에 ⋮ 추가** | `MoreVertical` 아이콘 버튼 노출 |
| **트리거 패턴** | **BottomMenu 단일** (popover/long-press 제외, Q6) |
| **페이지 상태** | `const [commentMenuTarget, setCommentMenuTarget] = useState<ReportTarget | null>(null)` — 어느 댓글 메뉴인지 추적 |
| **BottomMenu 내용** | `<ReportMenuItem target={commentMenuTarget} ... />` 1개 |
| **본인 댓글 동작** | 기존 `Trash2` 유지 (변경 없음) |

`commentTarget`

```ts
const commentTarget: ReportTarget = {
  type: 'comment',
  id: comment.id,
  ownerId: comment.user,             // 닉네임 (A7)
  courseId,
  snippet: comment.text.slice(0, 60),
  contextUrl: `/course/${courseId}#comment-${comment.id}`,
};
```

`ReportDialog`는 페이지 레벨 1개만. `useReport.submit(target, ...)`이 target을 명시적으로 받아 race condition 차단 (Architect C-3).

### 9-3. 사용자(user) — 신규 진입점

**대상**: [src/features/profile/components/UserProfilePage.tsx](../../src/features/profile/components/UserProfilePage.tsx) **헤더 L108-L118**

| 변경 | 내용 |
| --- | --- |
| 헤더 우측에 `MoreVertical` 버튼 추가 | onClick → `setUserMenuOpen(true)` |
| BottomMenu 마운트 | `<ReportMenuItem target={userTarget} ... />` 1개 항목 |
| `ReportDialog` 페이지 레벨 마운트 | — |

```ts
const userTarget: ReportTarget = {
  type: 'user',
  id: userId,
  ownerId: userId,                   // 사용자 신고는 id === ownerId (닉네임 키)
  nickname: userProfile.name,
  contextUrl: `/profile/${userId}`,
};
```

본인 프로필(`ProfilePage.tsx`)은 변경 없음 — `isSelfReport()`가 자동 비노출 처리.

---

## 10. UX 디테일

| 항목 | 구현 방침 |
| --- | --- |
| **레이아웃** | BottomSheet, ShareBottomSheet 시각 구조 답습. `max-height: 85vh; overflow-y: auto` |
| **핸들바 크기** | ShareBottomSheet 기준(36px×4px)에 통일. BottomMenu의 48px와 다른 점은 styles.module.scss 주석으로 사유 명시 |
| **사유 선택** | 라디오 리스트. 각 항목 `min-height: 48px`(터치 영역). 선택 시 `bg-sky-50 border-sky-400` |
| **상세 입력** | `<textarea rows={3} maxLength={500}>`. compositionend 이후 카운터 갱신. ETC 선택 시 placeholder/라벨 동적 변경 |
| **ETC 분기** | 빈값이면 제출 버튼 비활성 + 헬프 텍스트 "직접 입력 사유는 필수예요" |
| **버튼** | 취소(회색) + 신고하기 **`bg-red-500` hover `bg-red-600`**(destructive). 제출 중 로딩 인디케이터 |
| **결과 처리 (Q8)** | 성공 → **다이얼로그가 Step 2로 전환** (헤더 "신고가 접수됐어요. 검토 후 조치할게요." + CTA "이 콘텐츠 숨기기" + "닫기"). `alreadyReported`/`429`/`5xx`는 토스트 |
| **중복 신고 방지** | `hiddenReportsStorage`(`${type}:${id}` 컴포지트 키, Critic M-8) 단일 소스 |
| **키보드 회피** | `visualViewport` 리스너 → CSS 변수 `--keyboard-offset`. textarea 가려짐 방지 |
| **z-index** | ReportDialog 200, BottomMenu 50 |
| **safe-area** | `padding-bottom: max(1.5rem, env(safe-area-inset-bottom))` |
| **포커스 관리** | 열림: 첫 라디오로 .focus(). Tab 순환: 라디오↔textarea↔버튼. 닫힘: triggerRef로 복귀 |
| **a11y** | role=dialog / aria-modal / aria-labelledby. radiogroup + aria-label. textarea aria-label. disabled 텍스트 `text-gray-500`(대비) |
| **모션** | `motion/react` 슬라이드업 + 페이드 200ms |

### 10-1. 카피라이팅 (Designer 제안 채택)

| 위치 | 문구 |
| --- | --- |
| 다이얼로그 헤더 | "신고하기" |
| 다이얼로그 설명 | "신고 사유를 선택해주세요. 상세 내용은 선택 입력이에요." |
| 안내 푸터 | "신고자 정보는 상대방에게 공개되지 않아요." |
| Step 2 헤더 | "신고가 접수됐어요. 검토 후 조치할게요." |
| Step 2 CTA | "이 콘텐츠 숨기기" / "닫기" |
| 이미 신고함 토스트 | "이미 신고한 콘텐츠예요." |
| 429 토스트 | "신고가 일시 제한됐어요. 잠시 후 다시 시도해주세요." |
| 5xx 토스트 | "일시적인 오류가 발생했어요. 잠시 후 다시 시도해주세요." |
| ETC placeholder | "신고 사유를 직접 입력해주세요 (필수)" |

---

## 11. 단계별 작업 순서

### Phase 1 — 공용 컴포넌트 + 백엔드 stub (PR 3+1개)

#### PR-1: 타입 + 사유 매핑 + 스토리지 유틸
- [ ] `src/features/report/types/report.ts` (§4, discriminated union)
- [ ] `src/features/report/utils/reasonsByTarget.ts` (§7)
- [ ] `src/features/report/utils/hiddenReportsStorage.ts` (컴포지트 키 `${type}:${id}`)
- [ ] `src/features/report/utils/buildIdempotencyKey.ts`
- [ ] `src/features/report/index.ts` barrel (named only)
- [ ] `yarn lint` / `yarn build` 통과

#### PR-2: 훅 + API 계층 + Next.js stub
- [ ] `src/features/report/hooks/useReport.ts` (`submit(target, ...)` 시그니처)
- [ ] `src/features/report/hooks/useReportEligibility.ts` (`currentUser` 인자 주입)
- [ ] `src/features/report/api/report.api.ts`
- [ ] `src/app/api/reports/route.ts` (dev-only mock fallback, prod에서는 502/5xx 전파)
- [ ] `yarn lint` / `yarn build` 통과

#### PR-3: 공용 컴포넌트 + 기존 플랜 마이그레이션 (feature flag 없음, Q5)
- [ ] `src/features/report/components/ReportDialog/` (BottomSheet + 2단계 뷰 + 키보드 회피 + 포커스 트랩)
- [ ] `src/features/report/components/ReportMenuItem/`
- [ ] `CourseViewPage.tsx` 인라인 신고 코드 제거 → 새 컴포넌트 적용 (§9-1)
- [ ] **`REPORT_REASONS` 상수 import는 제거하되 상수 자체는 mockData.ts에 일시 유지**
- [ ] dev 환경 2일 dogfooding(Q5 절차)
- [ ] Storybook 빌드 통과 (`yarn build-storybook`)
- [ ] `yarn lint` / `yarn build` 통과

#### PR-3c: `REPORT_REASONS` 상수 최종 제거 (PR-3 머지 후 1주)
- [ ] `mockData.ts:793-800`에서 상수 삭제
- [ ] `grep -r "REPORT_REASONS" src/` 0건 확인
- [ ] `yarn lint` / `yarn build` 통과

### Phase 2 — 대상 확장 (PR 2개)

#### PR-4: 댓글 신고 진입점
- [ ] `CourseViewPage.tsx` 댓글 액션 영역에 ⋮ 추가 (§9-2)
- [ ] `commentMenuTarget` 상태로 어떤 댓글인지 추적 (race condition 차단)
- [ ] 본인 댓글: 기존 `Trash2` 유지. 타인 댓글: `MoreVertical` + BottomMenu
- [ ] 신고 후 숨기기 시 해당 댓글만 페이지에서 즉시 제거

#### PR-5: 사용자 신고 진입점
- [ ] `UserProfilePage.tsx` 헤더에 ⋮ + BottomMenu (§9-3)
- [ ] 본인 프로필 자동 비노출 검증

### Phase 3 — 백엔드 연동 후 (별도 plan)

- [ ] `NEXT_PUBLIC_API_BASE_URL` 설정 + 실제 응답 통합 테스트
- [ ] `autoBlinded: true` UI 분기 (P0에서는 수신만, P3에서 동작)
- [ ] `GET /api/reports/me` + 마이페이지 "내 신고 내역" 화면
- [ ] MSW 핸들러 (Storybook 인터랙션)

---

## 12. 테스트 전략

### 12-1. Storybook
- `ReportDialog.stories.tsx`: target.type 3종 × (Step 1, Step 2, alreadyReported, isSubmitting)
- `ReportMenuItem.stories.tsx`: 정상 / 비로그인 / 자기 신고 / 이미 신고함

### 12-2. 단위 테스트 (PR-1과 동시 작성)
- `hiddenReportsStorage` — add/has/remove, JSON 파싱 실패 시 빈 Set, 컴포지트 키 충돌 없음 (Architect Minor)
- `buildIdempotencyKey` — 동일 입력 → 동일 키, attemptId 다르면 다른 키
- `isSelfReport` — 동명이인 케이스, 비로그인 케이스
- `useReportEligibility` — 4가지 분기 (currentUser 모킹)
- `reasonsByTarget` — 모든 reasonCode가 `REASON_LABELS`에 정의

### 12-3. 수동 체크
- [ ] 플랜 신고 → 다이얼로그 Step 1 → 제출 → Step 2 → "이 콘텐츠 숨기기" → 페이지 이탈
- [ ] iOS Safari: 키보드 올라올 때 textarea 가려짐 없음
- [ ] ESC 닫기, 오버레이 클릭 닫기, Tab 순환
- [ ] 본인 댓글 → ⋮ 비노출 / 타인 댓글 → ⋮ 노출
- [ ] 본인 프로필 → ⋮ 노출되지만 신고 항목 자체는 비노출
- [ ] 동일 대상 빠른 연타 → 중복 신고 안 됨

---

## 13. 롤백 계획

### 13-1. 위험 요소

| # | 위험 | 영향 | 대응 |
| --- | --- | --- | --- |
| R1 | `REPORT_REASONS` 잔존 참조 | 빌드 실패 | PR-3c 머지 전 `grep -r "REPORT_REASONS" src/` 검증 (PR-3와 PR-3c 분리로 완화) |
| R2 | `CourseViewPage` 새 컴포넌트가 모바일 사파리 사고 | 운영 회귀 | PR-3 머지 전 dev 2일 dogfooding (Q5: feature flag 폐기). 사고 시 revert |
| R3 | mock-first API가 실제 백엔드 스키마와 불일치 | Phase 3 회귀 | `ReportResponse` 옵셔널 필드. zod 런타임 검증은 Phase 3 |
| R4 | 닉네임 매칭 자기 신고 차단 우회 (동명이인) | 자기 콘텐츠 신고 가능 | `isSelfReport()` 단일 함수 격리. 백엔드 ID 도입 시 즉시 교체 |
| R5 | localStorage 키 충돌 (`hiddenReportsStorage`) | 잘못된 콘텐츠 숨김 | 컴포지트 키 `${type}:${id}` 강제 |

### 13-2. PR 분할 자체가 롤백 보조 장치

PR-1·2·3·3c·4·5 모두 독립 revert 가능. PR-3만 revert해도 PR-1·2 인프라는 살아남는다.

---

## 14. 핵심 외부 의존 / 향후 확인

| # | 항목 | 누가 | 우선순위 |
| --- | --- | --- | --- |
| O1 | 백엔드 `POST /api/reports` 명세 확정 (응답 스키마 + `403 self-report-forbidden` 포함) | 백엔드 팀 | **P0 (이번 시리즈 머지 전후)** |
| O2 | 댓글 신고 사유 코드 (Q2) 기획자 확정 | 기획자 | P1 |
| O3 | **`course.authorId`/`comment.userId`/`user.id` 안정 식별자(UUID·DB PK) API 응답 포함** — Q1 결정의 핵심 의존. 도입 시 `isSelfReport()` 1줄 교체로 흡수 | 백엔드 팀 | **P0 (요청 발송 즉시)** |
| O4 | 자동 블라인드 N값, 중복 신고 제한 주기 (`autoBlinded` 발화 정책) | 운영팀 | P1 (Phase 3에서 필요) |
| O5 | 차단(block) feature 도입 시점 | 기획자 | P2 |

위 항목은 본 문서 §✅ 결정 완료 항목과 동기 유지. 별도 `.omc/...` 파일은 만들지 않는다.

---

## 15. 참고 파일 일람

- [src/features/course-detail/components/CourseViewPage.tsx](../../src/features/course-detail/components/CourseViewPage.tsx) — 플랜 마이그레이션 + 댓글 진입점
- [src/features/profile/components/UserProfilePage.tsx](../../src/features/profile/components/UserProfilePage.tsx) — 사용자 신고 진입점
- [src/features/profile/components/ProfilePage.tsx](../../src/features/profile/components/ProfilePage.tsx) — 본인 마이페이지 (변경 없음)
- [src/shared/ui/ShareBottomSheet/component.tsx](../../src/shared/ui/ShareBottomSheet/component.tsx) — ReportDialog 디자인 출발점
- [src/shared/ui/BottomMenu/component.tsx](../../src/shared/ui/BottomMenu/component.tsx) — 사용자 프로필 더보기 + 댓글 신고 트리거
- [src/shared/lib/stores/useUserStore.ts](../../src/shared/lib/stores/useUserStore.ts) — `currentUser` 출처 (단, 훅 내부에서 직접 호출하지 않고 호출부에서 주입)
- [src/app/api/mypage/plans/route.ts](../../src/app/api/mypage/plans/route.ts) — Next.js API 라우트 패턴 참고 (단, 폴백 패턴은 답습하지 않음)
- [src/shared/data/mockData.ts](../../src/shared/data/mockData.ts) — `REPORT_REASONS` 제거 대상 (PR-3c)
- [cc/result/260510-result-001-신고_ui_구현_현황.md](../result/260510-result-001-신고_ui_구현_현황.md) — 입력 문서

---

## 16. v1 대비 변경 요약 (한눈에 보기)

| 영역 | v1 | v2 |
| --- | --- | --- |
| `ReportTarget` | 단일 interface | discriminated union |
| `lib/` | 신설 | `utils/`로 통일 |
| `alreadyReported` 소스 | useReport state + storage + 서버 응답 (3중) | `hiddenReportsStorage` 단일 |
| `useReportEligibility` | `useUserStore` 직접 호출 | `currentUser` 인자 주입 |
| `submit` 시그니처 | `submit(reasonCode, detail)` | `submit(target, reasonCode, detail)` |
| idempotency-key | `target+reasonCode+분단위` | `reporterId+target+reasonCode+attemptId(UUID)` |
| Next.js 라우트 폴백 | catch 시 mock 201 | catch 시 5xx 전파 (dev에서만 baseUrl 부재 시 mock) |
| feature flag | 도입 (`NEXT_PUBLIC_USE_NEW_REPORT_UI`) | **폐기**. PR-3 dev 2일 dogfooding으로 대체 |
| `REPORT_REASONS` 제거 | PR-3에 포함 | PR-3c로 분리 (1주 후) |
| "신고 후 숨기기" | sonner 2-button toast | 다이얼로그 Step 2 뷰 |
| 키보드 회피 | 명세 없음 | `visualViewport` 리스너 + CSS 변수 |
| z-index | 명세 없음 | 200(시트) / 199(오버레이) / 50(BottomMenu) |
| 포커스 트랩 | "첫 라디오로" 한 줄 | 트리거 복귀 + Tab 순환 + 직접 구현 명세 |
| 비로그인 UX | A6(토스트+라우팅) ↔ 5-2(비노출) 모순 | 비노출 단일 (Q4) |
| 댓글 트리거 | popover 또는 BottomMenu | BottomMenu 단일 (Q6) |
| `.omc/plans/open-questions.md` | 죽은 링크 | 본 문서 §✅ 결정 완료 항목으로 인라인 관리 |
| MSW | 누락 | Phase 3로 deferred 명시 |
| 카피라이팅 | 격식체 혼재 | 앱 어투 통일 (§10-1) |
