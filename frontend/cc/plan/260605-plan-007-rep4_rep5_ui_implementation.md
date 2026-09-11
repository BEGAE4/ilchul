# 신고 상세 조회(REP-4) + 받은 제재 내역(REP-5) UI 구현 계획서

> 작성일: 2026-06-05
> 입력 문서: [신고 API 명세 v2](../api/v2/report.md), [Phase 3 계획서](./260519-plan-005-report_ui_phase3.md)
> 배경: REP-2(내 신고 내역), REP-3(신고 취소) 실무 판단으로 삭제. REP-4/5 구현으로 범위 확정.

---

## 1. 개요

| 항목 | API | 우선순위 | 비고 |
| --- | --- | --- | --- |
| **신고 상세 조회** | REP-4 `GET /api/reports/{reportId}` | P0 | REP-2 삭제로 진입점 재설계 필요 |
| **받은 제재 내역** | REP-5 `GET /api/sanctions/me` | P0 | plan-005 §6 설계 계승 |

---

## 2. REP-4 — 신고 상세 조회

### 2-1. 진입점 재설계 (REP-2 삭제 대응)

REP-2(내 신고 내역 목록)가 삭제됨에 따라 REP-4의 진입점을 아래 방식으로 대체한다.

**신고 완료 Step 2 다이얼로그에서 직접 링크 제공**

```
신고가 접수됐어요. 검토 후 조치할게요.
[이 콘텐츠 숨기기]  [닫기]
                     ↓ (하단 소형 링크)
              "신고 현황 보기 →"  →  /mypage/reports/{reportId}
```

- `onSubmitted` 콜백에서 응답의 `reportId`를 받아 링크 생성
- 링크는 Step 2에서만 노출 (신고 직후 1회성 진입점)
- `reportId`를 세션에 별도 저장하지 않음 — 다이얼로그 닫히면 링크 소멸

### 2-2. 신규 파일 구조

```
src/
├── app/
│   ├── mypage/reports/[reportId]/
│   │   └── page.tsx                         # 🆕 신고 상세 페이지
│   └── api/reports/[reportId]/
│       └── route.ts                         # 🆕 BFF GET
└── features/report/
    ├── api/
    │   └── reportDetail.api.ts              # 🆕 REP-4 API 호출
    ├── hooks/
    │   └── useReportDetail.ts               # 🆕 상세 조회 훅
    └── components/
        └── ReportDetailPage/                # 🆕
            ├── component.tsx
            ├── types.ts
            ├── styles.module.scss
            └── index.ts
```

### 2-3. 페이지 구성 (`/mypage/reports/{reportId}`)

| 영역 | 구성 |
| --- | --- |
| 헤더 | `<Header variant="backArrow">` + "신고 현황" |
| 신고 대상 카드 | target.type 아이콘 + title/nickname + contextUrl 링크 |
| 신고 사유 | `REASON_LABELS[reasonCode]` + detail (있을 때) |
| 처리 상태 배지 | `PENDING` 검토대기 / `REVIEWING` 검토중 / `RESOLVED` 처리완료 / `REJECTED` 반려 |
| 처리 이력 타임라인 | `history` 배열 — 시간순 스텝 표시 |
| 처리 결과 | `resolution` 있을 때만 — `BLINDED` / `WARNED` / `BANNED` / `NO_ACTION` |
| 비로그인 가드 | `/login` 리다이렉트 |
| 본인 신고 아닌 경우 | 403 → "접근 권한이 없어요" 빈 상태 |

### 2-4. 타입 추가 (`report.ts`)

```ts
export interface ReportHistoryItem {
  status: ReportStatus;
  at: string;
  actor: 'system' | 'operator' | 'reporter';
}

export type ReportResolution = 'BLINDED' | 'WARNED' | 'BANNED' | 'NO_ACTION';

export interface ReportDetail {
  reportId: string;
  target: ReportTarget;
  reasonCode: ReportReasonCode;
  detail: string | null;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
  history: ReportHistoryItem[];
  resolution: ReportResolution | null;
}
```

### 2-5. BFF 라우트 (`/api/reports/[reportId]/route.ts`)

기존 `/api/reports/route.ts` mock-first 패턴 동일 적용:
- `!baseUrl && dev` → mock `ReportDetail` 응답
- `!baseUrl && prod` → 502
- `baseUrl 있음` → 백엔드 프록시 (cookie 전달)

### 2-6. `ReportDialog` 수정 사항

`ReportDialogProps`에 `reportId` 수신 및 Step 2 링크 추가:

```tsx
// handleSubmit 내부
const res = await onSubmit(reasonCode, detail);
setSubmittedReportId(res.reportId ?? null);  // 🆕
setStep('done');

// Step 2 footer
{submittedReportId && (
  <Link href={`/mypage/reports/${submittedReportId}`} className={styles.detailLink}>
    신고 현황 보기 →
  </Link>
)}
```

---

## 3. REP-5 — 받은 제재 내역

plan-005 §6 설계를 그대로 계승한다. 핵심만 요약.

### 3-1. 신규 파일 구조

```
src/
├── app/
│   ├── mypage/sanctions/
│   │   └── page.tsx                         # 🆕 받은 제재 화면
│   └── api/sanctions/me/
│       └── route.ts                         # 🆕 BFF GET
└── features/report/
    ├── api/
    │   └── sanctions.api.ts                 # 🆕 REP-5 API 호출
    ├── hooks/
    │   └── useMySanctions.ts                # 🆕
    └── components/
        ├── MySanctionsList/                 # 🆕
        └── SanctionItem/                   # 🆕
```

### 3-2. 타입 추가 (`report.ts`)

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

### 3-3. 페이지 구성 (`/mypage/sanctions`)

| 영역 | 구성 |
| --- | --- |
| 헤더 | `<Header variant="backArrow">` + "받은 제재" |
| 필터 탭 | 전체 / 진행 중 (active) / 종료 (expired) |
| 리스트 | `<MySanctionsList>` |
| 빈 상태 | "받은 제재가 없어요" |
| 비로그인 가드 | `/login` 리다이렉트 |

### 3-4. `SanctionItem` 카드

- 제재 유형 배지 색상: `WARNING` 노랑 / `CONTENT_BLINDED` 주황 / `TEMP_BAN` 빨강 / `PERMANENT_BAN` 검정
- `isActive: true`이면 카드 테두리 강조
- `TEMP_BAN` active이면 D-day 카운트다운 표시 ("D-3 후 종료")
- 이의제기 버튼 항상 `disabled` + "준비 중이에요" (Phase 4 예정)

### 3-5. 마이페이지 진입점

- 마이페이지 설정 또는 본체 하단에 "받은 제재" 메뉴 추가
- 0건이어도 메뉴 노출 (사용자가 자기 상태를 확인할 수 있는 공식 채널)
- 정확한 위치는 디자이너 협의 필요

---

## 4. PR 단위 작업 순서

### PR-A: REP-4 신고 상세 (P0)

**선행 조건**: 백엔드 REP-4 API + `history` 스키마 합의

- [ ] `ReportDetail`, `ReportHistoryItem`, `ReportResolution` 타입 추가
- [ ] `reportDetail.api.ts` 신규
- [ ] `src/app/api/reports/[reportId]/route.ts` BFF (mock-first)
- [ ] `useReportDetail.ts` 훅
- [ ] `ReportDetailPage` 컴포넌트
- [ ] `src/app/mypage/reports/[reportId]/page.tsx`
- [ ] `ReportDialog` Step 2에 `submittedReportId` state + "신고 현황 보기" 링크
- [ ] `yarn lint` / `yarn build` 통과

### PR-B: REP-5 받은 제재 (P0)

**선행 조건**: 백엔드 REP-5 API + `SanctionType` enum 4종 합의

- [ ] `SanctionType`, `Sanction`, `MySanctionsResponse`, `AppealStatus`, `SANCTION_TYPE_LABELS` 타입 추가
- [ ] `sanctions.api.ts` 신규
- [ ] `src/app/api/sanctions/me/route.ts` BFF (mock-first)
- [ ] `useMySanctions.ts` 훅 (useState + useEffect 패턴)
- [ ] `MySanctionsList`, `SanctionItem` 컴포넌트
- [ ] `src/app/mypage/sanctions/page.tsx`
- [ ] D-day 카운트다운 로직
- [ ] 마이페이지 진입점 메뉴 추가
- [ ] `yarn lint` / `yarn build` 통과

---

## 5. 외부 의존

| # | 항목 | 담당 | 우선순위 |
| --- | --- | --- | --- |
| O1 | REP-4 백엔드 구현 + `history` 스키마 확정 | 백엔드 | P0 (PR-A 시작 전) |
| O2 | REP-5 백엔드 구현 + `SanctionType` enum 확정 | 백엔드 | P0 (PR-B 시작 전) |
| O3 | 마이페이지 "받은 제재" 진입점 위치 | 디자이너 | PR-B 시작 전 |
| O4 | `history.actor` 공개 범위 (system/operator 표기) | 백엔드 + 운영 | P1 |
