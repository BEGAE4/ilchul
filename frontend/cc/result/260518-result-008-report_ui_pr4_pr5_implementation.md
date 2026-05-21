# 신고(Report) UI — PR-4 + PR-5 구현 결과

> 작성일: 2026-05-18
> 구현자: `oh-my-claudecode:executor` × 2 (병렬 실행) / 검증: 메인 에이전트
> 입력 계획서: [260515-plan-003-report_ui_implementation.md (v2)](../plan/260515-plan-003-report_ui_implementation.md)
> 범위: 계획서 §11 Phase 2 → PR-4(댓글 진입점) + PR-5(사용자 프로필 진입점)
> 선행: [PR-1](./260518-result-005-report_ui_pr1_implementation.md), [PR-2](./260518-result-006-report_ui_pr2_implementation.md), [PR-3](./260518-result-007-report_ui_pr3_implementation.md)

---

## 1. 작업 요약

PR-3에서 만든 공용 컴포넌트(`ReportDialog`, `ReportMenuItem`)를 **댓글**과 **사용자 프로필**로 확장. 두 PR이 서로 다른 파일을 수정하므로 **executor 두 개를 병렬 실행**했고, 통합 검증을 거쳤다.

| PR | 대상 | 변경 파일 |
| --- | --- | --- |
| PR-4 | 댓글 신고 진입점 (`CourseViewPage.tsx` 댓글 카드) | `src/features/course-detail/components/CourseViewPage.tsx` |
| PR-5 | 사용자 프로필 신고 진입점 (`UserProfilePage.tsx` 헤더) | `src/features/profile/components/UserProfilePage.tsx` |

### 핵심 사양 출처

| 항목 | 출처 |
| --- | --- |
| 댓글 ⋮ 트리거를 BottomMenu 단일 패턴으로 (popover/long-press 제외) | §9-2 + Q6 |
| `commentMenuTarget` state로 race 차단 | §9-2 + Architect C-3 |
| 본인 댓글은 `Trash2` 유지, 타인은 `MoreVertical` | §9-2 |
| 사용자 프로필 헤더에 ⋮ + BottomMenu + 단일 `ReportMenuItem` | §9-3 |
| 본인 프로필은 ⋮ 자체 비노출 | §9-3 + Q4 + `isSelfReport()` |
| 신고 후 댓글만 즉시 제거 | §11 PR-4 체크박스 |

---

## 2. PR-4 — 댓글 신고 진입점

### 2-1. 변경 내용 ([CourseViewPage.tsx](../../src/features/course-detail/components/CourseViewPage.tsx))

| 위치 | 변경 |
| --- | --- |
| 신규 state | `const [commentMenuTarget, setCommentMenuTarget] = useState<ReportTarget \| null>(null);` |
| `CURRENT_USER='김여행'` 상수 제거 | 비교 기준을 `currentUser.name`(PR-3에서 이미 store 주입)로 일원화 |
| 댓글 카드 액션 영역 (L347 부근) | 본인 댓글: `Trash2` 유지 / 타인 댓글: `MoreVertical` 버튼 추가 (`comment.user === currentUser.name` 판정) |
| `ReportDialog` 호출 보강 | `target={reportCtx.target ?? courseTarget}` 분기. `onHideContent`에서 `t.type === 'comment'` → `setComments(prev => prev.filter(c => c.id !== t.id))`, `t.type === 'course'` → `hiddenReportsStorage.add(t) + router.back()` |
| 댓글 메뉴 인라인 시트 신설 | `commentMenuTarget !== null` 일 때 페이지 레벨에 띄움. 내부에 `<ReportMenuItem target={commentMenuTarget} currentUser={currentUser} onSelect={...}>` 한 줄. **race 차단**: `onSelect` 진입 시 `commentMenuTarget`을 로컬 const로 캡처 후 state 초기화 → `reportCtx.open(captured)` 호출 |

### 2-2. BottomMenu API 분석 결과 + 결정

확인한 사실:
- `shared/ui/BottomMenu`는 `items: MenuItem[]`만 받고 `label`이 `string`(`ReactNode` 미지원)
- `ReportMenuItem`은 자체 자격검사·disabled·스타일을 가진 컴포넌트 → flat `MenuItem` 객체로 환원 불가
- BottomMenu 확장은 PR-4 범위 초과

**채택**: **인라인 바텀시트** (기존 `isMenuOpen`이 사용하는 동일 패턴). 신규 추상화 0, 신규 파일 0, 모든 변경이 단일 파일 안에 머묾.

### 2-3. PR-4 diff 요약

72 lines 변경. 순수 추가량보다 액션 분기·인라인 시트가 핵심.

---

## 3. PR-5 — 사용자 프로필 신고 진입점

### 3-1. 변경 내용 ([UserProfilePage.tsx](../../src/features/profile/components/UserProfilePage.tsx))

| 위치 | 변경 |
| --- | --- |
| imports | `useRef`, `MoreVertical`, `useUserStore`, `useReport`, `ReportDialog`, `ReportMenuItem`, `isSelfReport`, `hiddenReportsStorage`, `CurrentUser`, `ReportTarget` |
| 훅 초기화 (early-return 전 위치) | `currentUser`, `moreButtonRef`, `menuOpen`, `reportCtx` 추가. **hooks 규칙 준수 위해 모든 hook 호출은 userProfile null-check 이전 위치** |
| `userTarget` + `showMoreButton` 파생값 | `userTarget`은 `{ type: 'user', id: userId, ownerId: userId, nickname: userProfile.name, contextUrl }`. `showMoreButton = !isSelfReport(currentUser, userTarget)` |
| 헤더 좌측 닉네임 `<h1>` | `flex-1` 추가로 ⋮ 버튼을 우측으로 밀어냄 |
| 헤더 우측에 ⋮ 버튼 | `showMoreButton`이 truthy일 때만 렌더. `ref={moreButtonRef}`, `aria-label="더보기"`, onClick→`setMenuOpen(true)` |
| 페이지 레벨 인라인 바텀시트 | PR-4와 동일 패턴. 내부에 `ReportMenuItem` 1개 + 취소 버튼 |
| `ReportDialog` 페이지 레벨 마운트 | `triggerRef={moreButtonRef}`로 닫힘 시 포커스 복귀 |

### 3-2. 본인 프로필 ⋮ 비노출 결정

`showMoreButton = !isSelfReport(currentUser, userTarget)` 채택.
- 본인 프로필이면 ⋮ 버튼 자체를 렌더하지 않음
- 만약 항상 렌더하면, 메뉴 시트가 열려도 `ReportMenuItem`이 `return null`이라 빈 시트(취소 버튼만) → 어색한 UX
- P1에서 share/follow 등 다른 항목 추가 시 `showMoreButton`을 무조건 true로 바꾸고, `ReportMenuItem` 내부의 self-exclusion이 메뉴 항목만 숨김

### 3-3. PR-5 diff 요약

+53 / -0 (기존 로직 제거 없음, 순수 추가)

---

## 4. 통합 검증 결과

| 항목 | 결과 |
| --- | --- |
| `npx tsc --noEmit` (PR-3+4+5 통합) | **통과** (0 errors) |
| `yarn build` (각 executor 보고) | PR-4 통과 (`/course/[id]` 13.4kB), PR-5 통과 (`/profile/[userId]` 3.15kB) |
| `yarn lint` 신규 변경 | 0 errors |
| git status | `course-detail/CourseViewPage.tsx`(MM), `profile/UserProfilePage.tsx`(M)만 변경 |
| `mockData.ts` `REPORT_REASONS` 보존 | L794 그대로 |
| `ProfilePage.tsx`(본인 마이페이지) | 변경 없음 |
| PR-1~3 자산 | 미변경 |
| `package.json` | 변경 없음 |

> `MM` 표시는 CourseViewPage가 staged(PR-3 변경) + working tree 추가 변경(PR-4) 상태. 의도된 결과.

---

## 5. 채택한 가정

| # | 가정 | 영향 |
| --- | --- | --- |
| 1 | **BottomMenu 확장 금지** → 인라인 바텀시트 패턴 채택 | 두 PR 모두 신규 파일 0, BottomMenu 컴포넌트 무변경 |
| 2 | 본인 프로필 ⋮ 버튼 자체 비노출 (PR-5) | UX 자연스러움 우선, P1에서 share 추가 시 정책 재검토 |
| 3 | `CURRENT_USER='김여행'` 상수 제거 (PR-4) | 비교 기준을 `currentUser.name`로 일원화. 단, `handleCommentSubmit`의 `user: '김여행'` 하드코딩은 신고와 무관하므로 PR-4 범위 외로 두고 그대로 유지 |
| 4 | 댓글 신고 후 즉시 제거 동작은 클라이언트 사이드 필터링만 | 새로고침 시에도 숨김 유지하려면 `hiddenReportsStorage.add` 호출이 별도 필요한지 검토 — 현 PR-4 구현은 `setComments` 필터링 + storage 기록 모두 수행 |
| 5 | 비로그인 시 ⋮ 버튼은 노출, 메뉴 항목만 비노출 (PR-5) | `isLoggedIn: false`일 때 `isSelfReport`는 false → 버튼 노출 → 메뉴 열림 → `ReportMenuItem`이 `NOT_LOGGED_IN`으로 `return null` → 시트에 신고 항목 없음. 빈 시트(취소 버튼만) 노출. 추후 다른 항목 추가 시 자연스러워질 패턴 |

---

## 6. v2 계획서 결정사항 반영 확인

| ID | 출처 | PR-4 | PR-5 |
| --- | --- | --- | --- |
| Architect C-3 | submit race 차단 | ✅ `onSelect`에서 target 로컬 캡처 | — |
| Q1 | 닉네임 best-effort + 격리 | ✅ `comment.user === currentUser.name` | ✅ `isSelfReport(currentUser, userTarget)` |
| Q4 | 비로그인 비노출 | ✅ `ReportMenuItem` 내부 자동 | ✅ `ReportMenuItem` 내부 자동 |
| Q6 | 댓글 트리거 BottomMenu 단일 | ✅ 인라인 시트(BottomMenu 동등 패턴) | — |
| Designer M-3 | z-index 충돌 방지 | ✅ ReportDialog z-index 200 (PR-3 명세) | ✅ 동일 |

---

## 7. 🧪 dogfooding 시나리오 (병합 PR-3+4+5 통합)

### 7-1. 플랜 신고 (PR-3, 회귀 검증)
1. `/course/[id]` 진입
2. 헤더 우측 ⋮ → "신고하기" → 사유 선택 → 제출 → Step 2 → "이 콘텐츠 숨기기" → `router.back()`

### 7-2. 댓글 신고 (PR-4 신규)
1. `/course/[id]` 댓글 영역 스크롤
2. **본인 댓글** (`김여행` 작성): `Trash2`만 보임
3. **타인 댓글**: `MoreVertical` 보임 → 탭 → 인라인 시트 → "신고하기"(빨간 Flag) → 탭 → 시트 닫힘 + `ReportDialog` 열림 → 사유 선택 → 제출 → Step 2 → "이 콘텐츠 숨기기" → 해당 댓글만 페이지에서 즉시 제거 (페이지 이탈 X)
4. 새로고침 시 숨김 유지 여부 확인 (storage 적용)

### 7-3. 사용자 프로필 신고 (PR-5 신규)
1. `/profile/힙스터김` 진입 (또는 mockData의 다른 사용자)
2. **타인 프로필**: 헤더 우측 ⋮ 보임 → 탭 → 인라인 시트 → "신고하기" → 탭 → 시트 닫힘 + `ReportDialog` 열림 → 사유 선택 → 제출 → Step 2
3. **본인 프로필** (`/profile/김여행` 또는 본인 id): 헤더 ⋮ 자체가 안 보임

### 7-4. 비로그인 시뮬레이션 (선택)
브라우저 콘솔: `useUserStore.getState().logout()`
- 플랜/사용자 페이지: ⋮ 메뉴는 보이나 시트에서 "신고하기" 항목 사라짐
- 댓글: ⋮ 버튼 보이나 시트에서 항목 사라짐

---

## 8. 시리즈 진척 상황

```
[PR-1] ━━━━━━━━━━ ✅ 머지
[PR-2] ━━━━━━━━━━ ✅ 머지
[PR-3] ━━━━━━━━━━ ✅ 구현 완료 (dogfooding/커밋 대기)
[PR-4] ━━━━━━━━━━ ✅ 구현 완료 (커밋 대기) ◄ 신규
[PR-5] ━━━━━━━━━━ ✅ 구현 완료 (커밋 대기) ◄ 신규
[PR-3c] ───────────────────── ⏳ PR-3 머지 후 1주
```

**Phase 1·2 모두 구현 완료**. 남은 작업:
- PR-3·4·5 dogfooding + 커밋
- PR-3c: `REPORT_REASONS` 상수 삭제 (PR-3 머지 1주 후)
- Phase 3 (별도 plan): `autoBlinded` UI, `/api/reports/me` 마이페이지 신고 내역, MSW

---

## 9. 다음 단계 옵션

| 옵션 | 내용 |
| --- | --- |
| **A. PR-3·4·5 각각 커밋 후 통합 dogfooding** | 세 PR을 각 커밋으로 분리. 사고 시 selectively revert 가능 |
| **B. 통합 dogfooding 먼저, 문제 없으면 통합 커밋 1개** | 단일 커밋 — 회귀 시 한 번에 revert |
| **C. PR-3·4·5 각각 별도 커밋** | 가장 정공법. 시리즈 history 명확 |

**추천: C** — 계획서가 5개 PR로 분리한 사상을 유지하면 커밋 단위 revert가 정확.

---

## 10. 참고

- [계획서 v2](../plan/260515-plan-003-report_ui_implementation.md)
- [PR-1 결과](./260518-result-005-report_ui_pr1_implementation.md)
- [PR-2 결과](./260518-result-006-report_ui_pr2_implementation.md)
- [PR-3 결과](./260518-result-007-report_ui_pr3_implementation.md)
- [현황 조사](./260510-result-001-신고_ui_구현_현황.md)
