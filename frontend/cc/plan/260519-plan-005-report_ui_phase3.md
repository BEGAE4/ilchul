# 신고(Report) UI Phase 3 — 후속 UI 구현 계획서 (v2)

> 작성일: 2026-05-19
> 입력 문서: [신고 UI 계획서 v2](./260515-plan-003-report_ui_implementation.md), [신고 API 명세 v1](../api/v1/report.md)
> 선행 결과: [PR-1](../result/260518-result-005-report_ui_pr1_implementation.md) ~ [PR-4/5](../result/260518-result-008-report_ui_pr4_pr5_implementation.md)
> 출력 파일 경로: `frontend/cc/plan/260519-plan-005-report_ui_phase3.md`

---

## 📜 개정 이력 (Revision)

| v | 변경 사유 |
| --- | --- |
| v1 (2026-05-19 오전) | REP-2/3/4/5 + autoBlinded 5종 모두 P0 |
| **v2 (2026-05-19 오후, 본 문서)** | 실무 검토 결과 REP-2/3/4 도입 효용 < 운영 부담 → **REP-5 + autoBlinded만 P0**로 좁힘. REP-2/3/4는 §3 "보류 항목"에 의사결정 흔적만 남김 |

---

## 1. 개요 · 목표

### 1-1. 무엇을

P0/P1(PR-1~5)에서 구축한 신고 인프라 위에 **백엔드 API가 갖춰진 시점**에 도입할 후속 UI **2종**:

1. **자동 블라인드 UI 분기** — `POST /api/reports`(REP-1) 응답의 `autoBlinded: true` 신호 처리
2. **마이페이지 "받은 제재 내역" 화면** — REP-5

부수적으로 PR-3에서 deferred 처리한 **MSW Storybook 핸들러**를 함께 정리한다.

### 1-2. 왜 — 이 2종만 P0로 선정한 근거

| 항목 | 필요성 | 근거 |
| --- | --- | --- |
| 자동 블라인드 | **필수** | 신고가 작동한다는 시그널을 신고자에게 줘야 신고 동기 유지. 누적 신고에도 콘텐츠가 안 가려지면 같은 콘텐츠를 다시 보게 되어 신고 피로도 ↑ |
| 받은 제재 내역 | **필수** | 한국 정보통신망법상 임시조치 처분 통지 의무 + GDPR 정신. 미제공 시 사용자는 자기 콘텐츠가 왜 안 보이는지 알 길이 없어 CS 폭주. 인스타 Account Status, X "Restrictions" 등 글로벌 SNS 표준 |

### 1-3. 본 계획의 범위

| 항목 | 우선순위 | 출처 API |
| --- | --- | --- |
| **자동 블라인드 UI 분기** + `BlindedContentPlaceholder` | **P0** | REP-1 응답 처리만, 신규 API 없음 |
| **마이페이지 "받은 제재" 화면** | **P0** | REP-5 (백엔드 O8 합의 필요) |
| MSW Storybook 핸들러 (deferred 해소) | P1 | — |

### 1-4. Non-Goals

- **내 신고 내역 / 신고 상세 / 신고 취소 (REP-2/3/4)** — §3 보류 사유 참고
- 이의제기(appeal) — Phase 4
- 운영자 어드민(처리 큐) — 별도 프로젝트
- block(차단) 기능 — 별도 feature(`features/user-block`)
- 운영자 메시지 노출 — `history.actor` 공개 범위(O7) 합의 후 결정

---

## 2. 전제 가정

| # | 가정 | 폴백 |
| --- | --- | --- |
| A1 | 백엔드 협의 O1·O3 **완료된 상태에서 시작** (`NEXT_PUBLIC_API_BASE_URL` + 안정 식별자 응답) | 미완료면 본 계획 시작 보류 |
| A2 | REP-5 (`GET /api/sanctions/me`) 백엔드 구현 + `SanctionType` enum 4종 확정(O8) | 본 계획 §6 PR 시작 전 합의 필요 |
| A3 | `autoBlinded: true` 정책 = **본 콘텐츠를 모든 사용자에게 즉시 가림** | 부분 노출 정책이면 placeholder UI 추가 분기 |
| A4 | 마이페이지 라우팅 구조: `/mypage/sanctions` | 기존 `/mypage` 하위 |
| A5 | 받은 제재 내역 화면은 **로그인 필수** — 라우트 가드 | `isLoggedIn === false`면 `/login` 리다이렉트 |

---

## 3. 보류 항목 (REP-2/3/4 의사결정 기록)

본 계획 v1 초안은 REP-2/3/4도 P0로 포함했으나, 실무 검토에서 **도입 효용 < 운영 부담**으로 판단되어 보류로 전환.

| 항목 | API | 보류 사유 |
| --- | --- | --- |
| 내 신고 내역 목록 | REP-2 | 인스타·X·페이스북·당근 모두 미제공. 처리 지연 시 "왜 안 됐냐" 항의 부담. 대체로 **자동 블라인드 알림 + "24시간 내 처리" 안내**로 충분 |
| 신고 상세 조회 | REP-4 | REP-2 부속. REP-2 미도입이면 자동 불필요 |
| 신고 취소 | REP-3 | 거의 모든 서비스 미제공. 잘못 신고는 운영자 `REJECTED`로 처리. 어뷰저의 "신고 폭격 후 취소" 패턴 악용 가능. 운영 통계 노이즈 ↑ |

### 3-1. 보류 항목의 미래 도입 조건

다음 조건이 충족되면 본 계획에 정식 편입을 재검토한다:
- **운영 CS 빈도**에서 "내 신고가 어떻게 됐는지" 문의가 임계치 초과 (관측 데이터 기반)
- **운영자 처리 SLA**가 24시간 내 안정화되어 사용자 노출 시 항의 위험이 작아진 상태
- **신고 데이터 누적**으로 운영 통계가 의미를 가지기 시작

### 3-2. 대체 패턴 (REP-2를 만들지 않고 신고 결과 피드백을 주는 방법)

- 자동 블라인드 발화 시 **인앱 알림** ("신고하신 콘텐츠가 가려졌어요") — 본 계획 §5 자동 블라인드의 부수 효과로 흡수
- 신고 시점에 다이얼로그 Step 2에서 **"24시간 내 처리됩니다"** 안내 문구 (기대치 관리, PR-3 카피라이팅 §10-1에 추가 후보)

---

## 4. 신규 디렉토리 / 파일 구조

대폭 축소됨. REP-2/3/4 관련 파일은 모두 보류.

### 4-1. `src/features/report/` 확장

```
src/features/report/
├── api/
│   ├── report.api.ts                     # 기존 (PR-2)
│   ├── sanctions.api.ts                  # 🆕 REP-5
│   └── index.ts                          # ✏️ re-export
├── hooks/
│   ├── useReport.ts                      # 기존, 본 계획 §5에서 보강
│   ├── useReportEligibility.ts           # 기존
│   ├── useMySanctions.ts                 # 🆕 REP-5
│   └── index.ts
├── components/
│   ├── ReportDialog/                     # 기존 (PR-3), 본 계획 §5에서 보강
│   ├── ReportMenuItem/                   # 기존
│   ├── BlindedContentPlaceholder/        # 🆕 자동 블라인드 시 카드 자리 placeholder
│   ├── MySanctionsList/                  # 🆕 받은 제재 목록
│   ├── SanctionItem/                     # 🆕 제재 카드 1개
│   └── index.ts
├── types/
│   └── report.ts                         # ✏️ Sanction 관련 타입 추가
└── utils/
    └── (변경 없음)
```

### 4-2. 신규 페이지

```
src/app/mypage/sanctions/
└── page.tsx                              # 🆕 받은 제재 화면 (REP-5)
```

### 4-3. 신규 Next.js BFF 라우트

```
src/app/api/sanctions/me/
└── route.ts                              # 🆕 GET (REP-5)
```

기존 `/api/reports/route.ts`의 mock-first 패턴 재사용. 단 catch 폴백은 도입 금지(PR-2 결정).

### 4-4. (선택) MSW 핸들러

```
src/mocks/handlers/reportHandlers.ts      # 🆕 REP-1, REP-5 mock
```

---

## 5. 자동 블라인드 UI 분기 (P0)

### 5-1. 타입 영향

별도 추가 없음. 기존 `ReportResponse.autoBlinded?: boolean` (PR-1) 그대로 활용.

### 5-2. `useReport.submit` 응답 처리 (PR-2 보강)

기존 PR-2의 흐름에 한 줄 추가:

```ts
const res = await submitReport(payload, { reporterId, attemptId });
hiddenReportsStorage.markReported(target);
// autoBlinded === true 분기는 호출부에서 처리 (onSubmitted 콜백)
return res;
```

`useReport`는 응답을 그대로 흘려보내고, **호출부의 `onSubmitted`/`onHideContent` 콜백에서 분기**한다.

### 5-3. 호출부(`CourseViewPage`) 처리

PR-3에서 미사용이었던 `ReportDialog.onSubmitted` prop 활성화:

```tsx
<ReportDialog
  ...
  onSubmitted={(res, target) => {
    if (res.autoBlinded) {
      // Step 2 헤더 메시지 분기 — "신고가 접수됐어요. 누적 신고로 즉시 가려졌어요."
      // 다이얼로그 컴포넌트 내부에서 자동 처리 권장 (state로 두기)
    }
  }}
  onHideContent={(t) => {
    hiddenReportsStorage.add(t);
    if (t.type === 'course') router.back();
    else if (t.type === 'comment') setComments(prev => prev.filter(c => c.id !== t.id));
  }}
/>
```

### 5-4. `ReportDialog` Step 2 메시지 분기

`ReportDialog` 내부 state에 `autoBlinded` 추가:

```tsx
const [step, setStep] = useState<'input' | 'done'>('input');
const [submittedResponse, setSubmittedResponse] = useState<ReportResponse | null>(null);

// 제출 성공 시
setSubmittedResponse(res);
setStep('done');
```

Step 2 헤더 분기:
- 일반 — "신고가 접수됐어요. 검토 후 조치할게요."
- `autoBlinded === true` — **"신고가 접수됐어요. 누적 신고로 즉시 가려졌어요."**
- CTA는 동일 ("이 콘텐츠 숨기기" / "닫기")

### 5-5. 페이지 진입 시 블라인드 가드

`CourseViewPage` 마운트 시 `hiddenReportsStorage.has(courseTarget)` 체크 → `true`면 **`BlindedContentPlaceholder` 노출 + 본 페이지 내용 미렌더**:

```tsx
if (hiddenReportsStorage.has(courseTarget)) {
  return <BlindedContentPlaceholder type="course" />;
}
```

댓글의 경우 카드 자리에 inline placeholder. 사용자 신고는 프로필 진입 시 동일 패턴.

### 5-6. `BlindedContentPlaceholder` 컴포넌트

| Props | 설명 |
| --- | --- |
| `type` | `'course' \| 'comment' \| 'user'` |
| `onBack?` | 코스 페이지에서 뒤로가기 콜백 (선택) |

화면:
- 회색 배경 + 자물쇠/blur 아이콘
- 텍스트 "신고 다수 누적으로 가려진 콘텐츠입니다."
- 코스 진입 시 "뒤로가기" 버튼
- 댓글의 경우 한 줄 inline placeholder ("가려진 댓글입니다")

---

## 6. 받은 제재 내역 화면 (P0, REP-5)

### 6-1. 타입 정의

`src/features/report/types/report.ts`에 추가:

```ts
export type SanctionType =
  | 'WARNING'
  | 'CONTENT_BLINDED'
  | 'TEMP_BAN'
  | 'PERMANENT_BAN';

export type AppealStatus = 'NONE' | 'PENDING' | 'RESOLVED' | 'REJECTED';

export interface Sanction {
  sanctionId: string;
  type: SanctionType;
  target: ReportTarget;
  reasonCode: ReportReasonCode;
  message: string;
  issuedAt: string;
  expiresAt: string | null;
  isActive: boolean;
  relatedReportIds: string[];
  appealStatus: AppealStatus;
}

export interface MySanctionsResponse {
  data: Sanction[];
  totalCount: number;
  hasNext: boolean;
}

export const SANCTION_TYPE_LABELS: Record<SanctionType, string> = {
  WARNING: '경고',
  CONTENT_BLINDED: '콘텐츠 블라인드',
  TEMP_BAN: '일시 정지',
  PERMANENT_BAN: '영구 정지',
};
```

### 6-2. 페이지: `/mypage/sanctions`

| 영역 | 구성 |
| --- | --- |
| 헤더 | `<Header variant="backArrow">` + 제목 "받은 제재" |
| 필터 탭 | 전체 / 진행 중 (active) / 종료 (expired) — 기존 `TabBar` 또는 `TabMenu` 재사용 |
| 리스트 | `<MySanctionsList>` |
| 빈 상태 | "받은 제재가 없어요" + 일러스트/아이콘 |
| 비로그인 가드 | `useUserStore.isLoggedIn === false`면 `/login` 리다이렉트 |

### 6-3. `SanctionItem` 카드 구성

```
[제재 유형 배지]                                        [활성 여부]
대상: target.title 또는 nickname
사유: REASON_LABELS[reasonCode]
[운영자 메시지 — 말풍선 형태]
[발효: issuedAt] [종료: expiresAt 또는 "영구"]
[이의제기 버튼 — placeholder, disabled]
```

- 제재 유형 배지 색상:
  - `WARNING` 노랑 (가벼움)
  - `CONTENT_BLINDED` 주황
  - `TEMP_BAN` 빨강
  - `PERMANENT_BAN` 검정/진한 빨강
- `isActive: true`일 때만 카드 강조 (테두리 진하게)
- TEMP_BAN active이면 만료까지 **D-day 카운트다운** 표시 (예: "D-3 후 종료")
- 이의제기 버튼은 항상 disabled + tooltip "준비 중" (Phase 4 도입 예정)

### 6-4. `useMySanctions` 훅

```ts
interface UseMySanctionsParams {
  status?: 'all' | 'active' | 'expired';
  type?: SanctionType;
  page?: number;
  size?: number;
}

export function useMySanctions(params: UseMySanctionsParams) {
  // React Query 도입 여부에 따라 useQuery 또는 useState+useEffect 패턴
}
```

⚠️ **현재 프로젝트는 Zustand 사용 중. React Query 미도입**. 본 계획은 `useState + useEffect + 자체 cancel ref` 단순 패턴으로 진행. React Query 도입은 별도 프로젝트 결정 (외부 의존 O5).

### 6-5. `sanctions.api.ts`

```ts
import axios from 'axios';
import type { MySanctionsResponse, SanctionType } from '../types';

export async function fetchMySanctions(params?: {
  status?: 'all' | 'active' | 'expired';
  type?: SanctionType;
  page?: number;
  size?: number;
}): Promise<MySanctionsResponse> {
  const res = await axios.get<MySanctionsResponse>('/api/sanctions/me', { params });
  return res.data;
}
```

### 6-6. Next.js BFF 라우트 `src/app/api/sanctions/me/route.ts`

PR-2의 `/api/reports/route.ts` 패턴 그대로:
- `!baseUrl && dev` → mock 응답 (Sanction 더미 배열)
- `!baseUrl && prod` → 502
- `baseUrl 있음` → 백엔드 프록시 (cookie 전달). catch 폴백 없음

### 6-7. 마이페이지 진입점

기존 마이페이지에 "받은 제재" 메뉴 추가. **정확한 추가 위치는 디자이너/기획자 협의 필요**(외부 의존 O3).

- 후보 1: 설정 페이지 하단 (`SettingsPage.tsx`)
- 후보 2: 마이페이지 본체에 별도 섹션
- 받은 제재가 0건일 때도 메뉴는 노출. 클릭 시 빈 상태 화면 (사용자가 자기 상태를 확인할 수 있는 채널이라는 점에서 중요)

---

## 7. UX 디테일 모음

| 항목 | 구현 방침 |
| --- | --- |
| **로딩** | Skeleton 컴포넌트 사용 (기존 `src/shared/ui/Skeleton` 활용 가능 시 재사용) |
| **빈 상태** | 일러스트 또는 아이콘 + 짧은 한글 안내 |
| **에러 상태** | "잠시 후 다시 시도해주세요" + 재시도 버튼 |
| **상대 시각 표시** | "3일 전", "방금 전" — `date-fns/formatDistanceToNow` 또는 자체 함수 |
| **D-day 카운트다운** | TEMP_BAN active일 때만. 1일 1회 갱신으로 충분 |
| **블라인드 placeholder 톤** | 회색 배경 + 자물쇠/blur 아이콘. 너무 무거워지지 않게 (검열 인상 회피) |
| **카피라이팅** | 기존 §10-1 양식 일관 — "받은 제재", "콘텐츠가 가려졌어요" 등 부드러운 어투 |

### 7-1. 신규 카피라이팅 후보

| 위치 | 문구 |
| --- | --- |
| 자동 블라인드 시 Step 2 헤더 | "신고가 접수됐어요. 누적 신고로 즉시 가려졌어요." |
| `BlindedContentPlaceholder` | "신고 다수 누적으로 가려진 콘텐츠입니다." |
| `BlindedContentPlaceholder` (댓글 inline) | "가려진 댓글입니다" |
| 받은 제재 화면 빈 상태 | "받은 제재가 없어요" |
| 이의제기 placeholder tooltip | "준비 중이에요. 곧 만나요." |

---

## 8. 단계별 작업 순서 (PR 단위)

총 **3개 PR**로 축소.

### Phase 3-A: 자동 블라인드 (PR-6, P0)

**선행 조건**: 백엔드 협의 O1 완료 (REP-1 응답에 `autoBlinded` 정책 합의)

- [ ] `components/BlindedContentPlaceholder/` 신규 (component/types/styles/index/stories 5개 파일)
- [ ] `ReportDialog` Step 2 헤더에 `autoBlinded` 분기 추가
- [ ] `CourseViewPage.tsx`에 `hiddenReportsStorage.has(courseTarget)` 가드
- [ ] `CourseViewPage.tsx` 댓글 영역에 댓글 단위 블라인드 가드
- [ ] `UserProfilePage.tsx`에 사용자 단위 블라인드 가드
- [ ] Storybook 스토리 (`BlindedContentPlaceholder` 3종: course/comment/user)
- [ ] `yarn lint` / `yarn build` 통과

### Phase 3-B: 받은 제재 (PR-7, P0)

**선행 조건**: 백엔드 협의 O2 완료 (`SanctionType` enum 4종 + `/api/sanctions/me` 명세 확정)

- [ ] `types/report.ts`에 `SanctionType`, `Sanction`, `MySanctionsResponse`, `AppealStatus`, `SANCTION_TYPE_LABELS` 추가
- [ ] `api/sanctions.api.ts` 신규
- [ ] `src/app/api/sanctions/me/route.ts` BFF (mock-first)
- [ ] `hooks/useMySanctions.ts` (useState + useEffect 패턴)
- [ ] `components/MySanctionsList/`, `SanctionItem/`
- [ ] `src/app/mypage/sanctions/page.tsx`
- [ ] 마이페이지 진입점 메뉴 추가 (위치 협의 후)
- [ ] D-day 카운트다운 로직
- [ ] 이의제기 placeholder 버튼 (disabled)
- [ ] Storybook 스토리 (`SanctionItem` 4종 × active/expired)
- [ ] `yarn lint` / `yarn build` 통과

### Phase 3-C: MSW Storybook (PR-8, P1)

- [ ] `src/mocks/handlers/reportHandlers.ts` — REP-1, REP-5 mock 핸들러
- [ ] PR-3·6·7의 Storybook에서 args 콜백 mock을 MSW로 점진 교체 (선택)

---

## 9. 테스트 전략

### 9-1. Storybook
- `BlindedContentPlaceholder` 3종 (course/comment/user)
- `SanctionItem` 4종 × (active / expired) = 8개 케이스
- `MySanctionsList` — 빈 상태 / 로딩 / 정상 리스트

### 9-2. 단위 테스트
- `useMySanctions` — 파라미터 직렬화 + cancel on unmount
- `BlindedContentPlaceholder` 가드 경로 — `hiddenReportsStorage.has` 모킹
- `ReportDialog` Step 2 `autoBlinded` 분기 메시지

### 9-3. 수동 체크
- [ ] 신고 후 `autoBlinded: true` mock 응답 → Step 2 헤더 메시지 분기
- [ ] 자동 블라인드된 코스/댓글/사용자 페이지 진입 → placeholder 노출, 본 콘텐츠 미렌더
- [ ] `/mypage/sanctions` 진입 → 4가지 SanctionType 모두 표시 → active/expired 필터 동작
- [ ] TEMP_BAN active D-day 카운트다운 정상
- [ ] 비로그인 시 `/mypage/sanctions` 진입 차단

---

## 10. 롤백 계획

| # | 위험 | 대응 |
| --- | --- | --- |
| R1 | 백엔드 `Sanction` 스키마가 report.md와 다름 | `Sanction` 타입을 optional 필드 위주로 보완. zod 런타임 검증 검토 |
| R2 | `BlindedContentPlaceholder` 가드가 의도치 않게 정상 콘텐츠 가림 (storage 버그) | `hiddenReportsStorage` 컴포지트 키(`type:id`) 정확성 검사. 비상 시 콘솔에서 `hiddenReportsStorage.clear()` 호출로 즉시 해제 |
| R3 | 자동 블라인드 정책 변경 (A3 가정 깨짐) | placeholder UI 분기를 더 세분화 (예: "본인에게만 보임" vs "모두에게 안 보임") — 별도 plan |

PR-6 → PR-7 → PR-8 순. 각 PR 독립 revert 가능.

---

## 11. 외부 의존 / 향후 확인

| # | 항목 | 누가 | 우선순위 |
| --- | --- | --- | --- |
| O1 | `autoBlinded` 발화 정책 확정 (임계치 N값) | 백엔드 + 운영팀 | **P0 (PR-6 시작 전)** |
| O2 | REP-5 백엔드 구현 + `SanctionType` enum 확정 | 백엔드 + 운영팀 | **P0 (PR-7 시작 전)** |
| O3 | 마이페이지 "받은 제재" 진입점 위치 | 디자이너 + 기획자 | PR-7 시작 전 |
| O4 | `BlindedContentPlaceholder` 디자인 톤 (검열 인상 회피) | 디자이너 | PR-6 시작 전 |
| O5 | React Query 프로젝트 차원 도입 여부 | 프론트엔드 팀 | PR-7에 영향 없음 (useState 패턴) |
| O6 | 이의제기(appeal) 정책 | 백엔드 + 운영 + 법무 | **Phase 4 / 별도 plan** |

---

## 12. v2(P0/P1)와의 의존 관계

| Phase 3 항목 | 의존하는 P0/P1 자산 |
| --- | --- |
| 자동 블라인드 분기 | `hiddenReportsStorage` (PR-1), `useReport.submit` (PR-2), `ReportDialog.onSubmitted` (PR-3) |
| 받은 제재 | `ReportTarget`/`ReportReasonCode` (PR-1) — 제재가 동일 타깃/사유 enum 공유 |
| MSW | PR-2의 `/api/reports/route.ts` mock-first 패턴 참조 |

→ **Phase 3 시작 전제: PR-1~5 모두 머지된 상태.**

---

## 13. 참고 파일

- [신고 UI 계획서 v2 (Phase 1+2)](./260515-plan-003-report_ui_implementation.md)
- [신고 API 명세 v1](../api/v1/report.md)
- [현황 조사](../result/260510-result-001-신고_ui_구현_현황.md)
- [PR-1~5 결과 문서](../result/) — 005, 006, 007, 008
- [src/features/report/](../../src/features/report/) — P0/P1 인프라
- [src/app/api/reports/route.ts](../../src/app/api/reports/route.ts) — BFF 라우트 패턴

---

## 14. 핵심 요약

```
[PR-6]  자동 블라인드 분기 + BlindedContentPlaceholder    ─ 즉시 효과
[PR-7]  받은 제재 내역 (REP-5)                            ─ 피신고자 채널 (법적 의무)
[PR-8]  MSW Storybook 핸들러                             ─ deferred 해소
```

**보류** (별도 plan 도입 여부 추후 결정): REP-2(내 신고 내역) / REP-3(취소) / REP-4(상세) — §3 참고

**Phase 3가 머지되면 신고 기능의 운영 안전선이 확보된다.** 신고자에게는 자동 블라인드로 시그널, 피신고자에게는 받은 제재 화면으로 처분 인지 채널 제공.
