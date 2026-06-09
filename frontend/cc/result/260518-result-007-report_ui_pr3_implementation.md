# 신고(Report) UI — PR-3 구현 결과

> 작성일: 2026-05-18
> 구현자: `oh-my-claudecode:executor` / 검증: 메인 에이전트
> 입력 계획서: [260515-plan-003-report_ui_implementation.md (v2)](../plan/260515-plan-003-report_ui_implementation.md)
> 범위: 계획서 §11 Phase 1 → PR-3 (공용 컴포넌트 + CourseViewPage 마이그레이션)
> 선행: [PR-1](./260518-result-005-report_ui_pr1_implementation.md), [PR-2](./260518-result-006-report_ui_pr2_implementation.md)

---

## 1. 작업 요약

신고 UI 구조 전환의 **하이라이트 단계**. 두 개의 신규 공용 컴포넌트(`ReportDialog`, `ReportMenuItem`)를 만들고, 기존 [CourseViewPage.tsx](../../src/features/course-detail/components/CourseViewPage.tsx)의 인라인 신고 코드 57줄을 새 컴포넌트로 대체했다. 사용자 인지 가능한 UX 개선 항목(2단계 뷰, 라디오 리스트, 키보드 회피, 포커스 트랩, destructive 톤 등)이 전부 이 PR에서 들어간다.

### 핵심 사양 출처

| 코드 | 계획서 출처 |
| --- | --- |
| `ReportDialog` 2단계 뷰 + BottomSheet | §5-1 + Q8 결정 |
| 키보드 회피 (`visualViewport`) | §5-1 + Designer C-2 |
| 포커스 트랩 직접 구현 | §5-1 + Designer M-1 (focus-trap-react 의존성 추가 금지) |
| `ReportMenuItem` 자격 검사 내장 | §5-2 + Q4 결정 |
| CourseViewPage 마이그레이션 (L26·L57-59·L500-533·L535-591) | §9-1 |
| 카피라이팅 9종 | §10-1 |

---

## 2. 생성/수정 파일

### 생성 (11개)

```
src/features/report/components/
├── index.ts
├── ReportDialog/
│   ├── component.tsx
│   ├── types.ts
│   ├── styles.module.scss
│   ├── index.ts
│   └── index.stories.tsx          # 6 stories (course/comment/user × Step1/2/submitting/alreadyReported/serverError)
└── ReportMenuItem/
    ├── component.tsx
    ├── types.ts
    ├── styles.module.scss
    ├── index.ts
    └── index.stories.tsx          # 4 stories (정상/비로그인/자기/이미신고)
```

### 수정 (2개)

- `src/features/report/index.ts` — `ReportDialog`, `ReportMenuItem` re-export 추가
- `src/features/course-detail/components/CourseViewPage.tsx` — 신고 인라인 코드 제거 + 새 컴포넌트 적용

| 파일 | 절대 경로 |
| --- | --- |
| ReportDialog | [src/features/report/components/ReportDialog/component.tsx](../../src/features/report/components/ReportDialog/component.tsx) |
| ReportMenuItem | [src/features/report/components/ReportMenuItem/component.tsx](../../src/features/report/components/ReportMenuItem/component.tsx) |
| 마이그레이션 대상 | [src/features/course-detail/components/CourseViewPage.tsx](../../src/features/course-detail/components/CourseViewPage.tsx) |

---

## 3. CourseViewPage 마이그레이션 diff 요약

순 변경: **약 -29줄** (71줄 제거 + 42줄 추가)

| 위치 | 변경 |
| --- | --- |
| L26 | `REPORT_REASONS` import 제거 |
| L57-L59 | 신고 관련 state 3개(`isReportOpen`, `reportReason`, `reportDetail`) 제거 → `useReport({ reporterId: currentUser.id })` 한 줄 |
| 신규 import | `useUserStore`, `useReport`, `ReportDialog`, `ReportMenuItem`, `hiddenReportsStorage`, `CurrentUser` |
| L515-L524 | 인라인 신고 메뉴 항목 → `<ReportMenuItem target={courseTarget} currentUser={currentUser} onSelect={...} />` |
| L535-L591 | 인라인 신고 다이얼로그 57줄 → `<ReportDialog ... />` |

`courseTarget`은 `course` truthy 가드 이후 위치(L71-L79 분기 안전 처리).

---

## 4. 검증 결과

| 항목 | 결과 |
| --- | --- |
| `npx tsc --noEmit` | **통과** (0 errors) |
| `yarn build` | **통과** (exit 0) |
| `yarn build-storybook` | ⚠️ **실패** — 환경 이슈 의심 (아래 §6 참조) |
| `yarn lint` 신규 파일 | 기존 `storybook/no-renderer-packages` 경고 (다른 stories와 동일 패턴) |
| `export default` 검색 (component.tsx/types.ts/index.ts) | 0건 |
| `export default meta;` (stories) | 2건 — Storybook CSF 표준 패턴 (Button/IconBox/TabBar/TabMenu/DropdownMenu 등 기존 stories와 동일) |
| `REPORT_REASONS` in `mockData.ts` | 보존됨 (L794) — PR-3c에서 제거 예정 |
| `REPORT_REASONS` in `CourseViewPage.tsx` | 0건 |
| `useUserStore` in `src/features/report/` | 0건 (호출부 CourseViewPage에서만 사용) |
| `package.json` 변경 | 없음 (신규 의존성 추가 안 함) |
| 의도치 않은 파일 변경 | 없음 |

---

## 5. 채택한 가정

| 항목 | 채택 |
| --- | --- |
| **키보드 회피 방식** | `bottom: var(--keyboard-offset)` 채택. transform은 fixed 자식의 stacking context에 영향 가능 → bottom 변경이 layout shift 없이 시트만 이동 |
| **포커스 트랩** | `dialogRef.current?.querySelectorAll('input, textarea, button:not([disabled])')`로 포커스 가능 요소 수집 → Tab/Shift+Tab wrap → 닫힘 시 `triggerRef?.current?.focus()` |
| **Storybook step 컨트롤** | `onSubmit` 람다를 mock으로 주입해 Step 2 진입 시뮬레이션. `@storybook/test` 미설치 확인 후 일반 함수 사용 |
| **`triggerRef` 타입** | `RefObject<HTMLElement \| null>`로 유연하게 — 호출부가 button/div 무엇이든 받을 수 있도록 |
| **`ReportDialog.onSubmitted`** | CourseViewPage 마이그레이션에서는 미사용 (Step 2 자체가 완료 피드백 역할). prop 자체는 유지(향후 확장용) |
| **자기 신고 차단 비교** | `isSelfReport()` 단일 함수 위임 (Q1) — TODO 주석 명시 |
| **자기 콘텐츠 가드** | `course.author === currentUser.name`일 때 ⋮ 메뉴의 신고 항목 자체가 `return null` (ReportMenuItem 내부 처리) |

---

## 6. ⚠️ Storybook 빌드 실패 — 환경 이슈 분석

`yarn build-storybook` exit 1. 에러:

```
SB_BUILDER-WEBPACK5_0002 (WebpackInvocationError)
TypeError: Cannot read properties of undefined (reading 'tap')
```

**executor 분석**: 에러 스택이 `tapable` 라이브러리 내부(webpack cache 종료 시점) 문제를 가리키며, **신규 PR-3 파일 경로가 에러 메시지에 등장하지 않음**. Next.js 15.3.5 + `@storybook/builder-webpack5` 9.0.15 버전 호환성 충돌로 PR-3 이전부터 존재하는 환경 문제로 추정.

**확정 검증을 위한 별도 액션 필요** (메인 에이전트가 git stash 같은 destructive 작업을 사용자 승인 없이 안 함):
1. 사용자가 PR-3 변경분 stash 후 `yarn build-storybook` 시도
2. PR-2 머지 직후 시점에서 재현되면 환경 이슈 확정 → PR-3 통과로 간주
3. 환경 이슈로 확정될 경우 별도 plan으로 Storybook builder 버전 매칭 작업

**현 시점에서의 판단**: PR-3 단독으로 도입된 회귀 가능성은 낮으나 (a) 신규 파일에 webpack 빌더에 영향 줄 코드 없음 (b) 에러가 일반적 tapable 라이브러리 내부 문제 패턴.

---

## 7. 카피라이팅 §10-1 적용 확인

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

## 8. v2 계획서 Critical / Q 반영 확인

| ID | 출처 | 반영 |
| --- | --- | --- |
| Designer C-1 | "숨기기"를 toast 2-button → 다이얼로그 2단계 뷰 | Step 1 → Step 2 시트 내 전환 |
| Designer C-2 | 키보드 회피 명세 | `visualViewport` 리스너 + `--keyboard-offset` CSS 변수 |
| Designer M-1 | 포커스 트랩 구체 명세 | Tab/Shift+Tab wrap, triggerRef 복귀 |
| Designer M-2 | 컬러 토큰 | 라디오 선택 sky 계열, 제출 버튼 `bg-red-500` |
| Designer M-3 | z-index 계층 | 오버레이 199, 시트 200 |
| Q1 | 닉네임 best-effort + 격리 | `ReportMenuItem`이 `useReportEligibility` 위임 |
| Q4 | 비로그인 비노출 | `ReportMenuItem` `return null` 분기 |
| Q5 | feature flag 폐기 | flag 코드 없음, dev dogfooding으로 대체 |
| Q8 | Step 2 시트 뷰 | `step` state로 전환 |
| 카피라이팅 §10-1 | 앱 어투 통일 | 9개 문구 모두 적용 |

---

## 9. 🧪 사용자 dogfooding 체크리스트 (Q5 절차)

PR-3 머지 전 dev 환경에서 직접 확인:

- [ ] **모바일 사파리 키보드 회피**: textarea 포커스 시 키보드 올라와도 입력 영역이 안 가려지나
- [ ] **자기 신고 차단**: `김여행` 작성자의 플랜에서 ⋮ → 신고하기가 비노출되나 (현재 mockData에서 `김여행`이 본인이므로 일부 플랜에서 확인 가능)
- [ ] **Step 2 → 숨기기**: 신고 완료 후 "이 콘텐츠 숨기기" 클릭 시 `router.back()` 정상 동작
- [ ] **포커스 트랩**: ESC 닫기 / 오버레이 클릭 / Tab 순환 / 닫힘 시 triggerRef 포커스 복귀
- [ ] **ETC placeholder**: 사유에서 "기타" 선택 시 textarea placeholder가 "신고 사유를 직접 입력해주세요 (필수)"로 바뀌나
- [ ] **글자수 카운터**: 한글 IME 조합 중 카운터가 안 깜빡이나
- [ ] **회귀**: 기존 플랜 신고 플로우(⋮ → 신고하기 → 사유선택 → 제출 → 토스트)가 그대로 동작하나
- [ ] **z-index**: 더보기 시트 위에 신고 다이얼로그가 정상적으로 겹쳐 보이나

---

## 10. 다음 단계

### 10-1. 즉시: Storybook 빌드 환경 이슈 확정 (선택)
사용자 stash 후 PR-2 시점 재현 확인. 환경 이슈로 확정되면 PR-3 머지에 영향 없음.

### 10-2. PR-3 머지 절차 (Q5)
- [ ] dev 환경 2일 dogfooding (위 체크리스트)
- [ ] 사용자가 문제 없다고 판단 → PR-3 머지

### 10-3. PR-4: 댓글 신고 진입점 (계획서 §9-2)
- `CourseViewPage.tsx` 댓글 영역에 ⋮ 추가
- `commentMenuTarget` state로 어떤 댓글인지 추적 (race 차단)
- BottomMenu 단일 트리거 (Q6)
- 본인 댓글은 기존 `Trash2` 유지, 타인 댓글에 `MoreVertical` 추가

### 10-4. PR-5: 사용자 신고 진입점 (계획서 §9-3)
- `UserProfilePage.tsx` 헤더에 ⋮ + BottomMenu
- 본인 프로필 자동 비노출 검증

### 10-5. PR-3c: `REPORT_REASONS` 상수 최종 제거
- PR-3 머지 후 1주
- `mockData.ts:794`에서 상수 삭제
- `grep -r "REPORT_REASONS" src/` 0건 확인

---

## 11. 참고

- [계획서 v2](../plan/260515-plan-003-report_ui_implementation.md)
- [PR-1 결과](./260518-result-005-report_ui_pr1_implementation.md)
- [PR-2 결과](./260518-result-006-report_ui_pr2_implementation.md)
- [현황 조사](./260510-result-001-신고_ui_구현_현황.md)
