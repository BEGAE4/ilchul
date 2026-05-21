# 관리자(Admin) 페이지 UI 구현 계획서 (v1)

> 작성일: 2026-05-20
> 작성: 메인 에이전트
> 입력 문서:
> - [신고 기획 내용 DOCS](../docs/260510-001-DOCS-신고%20기획%20내용.md)
> - [신고 API 명세 v1](../api/v1/report.md)
> - [신고 UI 구현 계획서 v2 (Phase 1+2)](./260515-plan-003-report_ui_implementation.md)
> - [신고 UI Phase 3 계획서](./260519-plan-005-report_ui_phase3.md)
> - [컨벤션 v1.0](../convention/260506-convention-001-convention_v1.0.md.md)
> - [디렉토리 구조 v1.0](../convention/260506-convention-002-directory_structure_v1.0.md)
> 출력 파일 경로: `frontend/cc/plan/260520-plan-006-admin_page_ui_implementation.md`

---

## 1. 개요 · 목표

### 1-1. 무엇을

운영자(Admin)가 사용하는 **신고(Report) / 문의(Inquiry) 관리 콘솔**을 구축한다.
사용자 앱은 모바일-퍼스트이지만, **관리자 페이지는 PC/태블릿/모바일 모두에서 동작하는 반응형 웹** 으로 구현한다.

### 1-2. 왜

- 본 프로젝트 신고 시스템(REP-1~5)은 **사용자 측 진입점/피신고자 채널**까지 갖춰졌으나, 운영자 측 처리 콘솔은 비어 있다. 신고는 받았는데 처리할 수 없는 상태.
- 신고 기획 §4.1 "관리자 화면 목록" 및 §4.2 "관리자 권한/로그" 는 **미구현 상태**.
- 문의(Inquiry)는 아직 API/UI 모두 백지 상태 → **신규 도메인 feature 신설** 필요.
- 운영팀이 단일 콘솔에서 다음을 처리할 수 있어야 한다:
  - 신고 큐 조회/상세 확인/유저 제재 처분 (경고, 일시 정지, 영구 정지, 콘텐츠 블라인드)
  - 문의 큐 조회/상세 확인/답변 등록·수정·삭제

### 1-3. 본 계획의 범위 (P0)

| 우선순위 | 영역 | 포함 사항 |
| --- | --- | --- |
| **P0 (이번 PR 시리즈)** | 신고 / 문의 콘솔 기본 동선 | 라우트 설정, 권한 가드, 레이아웃 셸, 리스트/상세/제재·답변 액션 (반응형) |
| **P1 (후속)** | 통계, 운영자 로그, 일괄 처리 | 신고 사유별 통계 / 처리 SLA 대시보드 / 운영자 활동 로그(§4.2) / 다중 선택 일괄 처분 |
| **검토 제외** | 매거진/피드/healing-diary 관련 어드민 | CLAUDE.md 규정 |

### 1-4. Non-Goals

- 백엔드 어드민 API 명세 자체의 확정 (본 계획은 클라이언트 측 제안 + BFF stub 만 다룬다 — §16 백엔드 협의 항목 참고)
- 통계 대시보드 / 그래프 (Phase 2)
- 운영자 SSO / 다중 권한 레벨 (super-admin / moderator) — Phase 2
- 이의제기(appeal) 처리 화면 — 사용자 측 Phase 4와 연동되어야 하므로 별도 plan

---

## 2. 전제 가정 (Assumptions)

| # | 가정 | 근거 / 폴백 |
| --- | --- | --- |
| A1 | 어드민 인증은 **세션 쿠키 기반**, 일반 사용자 세션과 동일. 단 서버에서 `role` 필드 검사 후 어드민 권한 부여 | 백엔드 협의 O1 |
| A2 | 권한 체크는 **클라이언트 가드(UX 차원) + 서버 강제(보안 차원)** 이중. 클라이언트는 best-effort 차단만 | 정보통신망법상 운영자 콘솔 접근 제한 강제 |
| A3 | 어드민 진입점은 **별도 URL prefix `/admin/*`** 를 사용. 기존 `(public)` 모바일 앱과 라우트 분리 | Next.js App Router 그룹 라우트로 레이아웃 단절 |
| A4 | 어드민 페이지에서는 **모바일 BottomNavigation, PageLayout(사용자용)을 사용하지 않는다.** 별도 `AdminLayout` 신설 | 사용자 셸과 정보 밀도가 다름 (테이블/사이드바 vs 카드/하단탭) |
| A5 | 기존 사용자 측 `ReportTarget`, `ReportReasonCode`, `SanctionType` enum을 **그대로 재사용**. 어드민 응답에 부가 필드(`reporterId`, `assignedOperator` 등)가 추가되는 형태 | 타입 분기 최소화 |
| A6 | 자동 블라인드, 누적 경고 로직은 **백엔드가 강제**. 어드민은 결과를 조회하고 수동 조치만 수행 | 클라이언트가 정책 강제 안 함 (기존 신고 plan과 일관) |
| A7 | 문의(Inquiry) 도메인은 **신규 feature**. 사용자 측 진입점(`/mypage/inquiry`)이 추후 도입될 가능성이 있지만 본 계획은 **어드민 측만** 다룬다 | 사용자 측 진입점은 별도 plan에서 다룸 |
| A8 | 신고/문의 모두 **서버 측 페이지네이션**. cursor vs offset은 백엔드 합의(O5/O11) | 기존 REP-2 패턴 재사용 |
| A9 | 반응형 분기점: **768px 이상 데스크톱 레이아웃 (사이드바 + 테이블)**, **768px 미만 모바일 레이아웃 (카드 리스트 + 슬라이드 인 상세)**. Tailwind `md:` 브레이크포인트 활용 | 기존 프로젝트 모바일-퍼스트 컨벤션 유지 |
| A10 | 어드민도 `Pretendard` 폰트 사용 (앱 일관성). 단 정보 밀도가 높으므로 `text-sm`/`text-xs` 비중 ↑ | globals.css 그대로 활용 |

---

## 3. 신규 디렉토리 / 파일 구조

### 3-1. Next.js App Router 라우트 트리

```
src/app/
├── admin/
│   ├── layout.tsx                       # 🆕 어드민 셸 (사이드바 + 헤더, 사용자 PageLayout 미사용)
│   ├── page.tsx                         # 🆕 /admin → /admin/reports 리다이렉트 또는 대시보드 placeholder
│   ├── reports/
│   │   ├── page.tsx                     # 🆕 신고 리스트
│   │   └── [reportId]/
│   │       └── page.tsx                 # 🆕 신고 상세 + 제재 처분
│   └── inquiries/
│       ├── page.tsx                     # 🆕 문의 리스트
│       └── [inquiryId]/
│           └── page.tsx                 # 🆕 문의 상세 + 답변
│
└── api/
    ├── admin/
    │   ├── reports/
    │   │   ├── route.ts                 # 🆕 GET (목록) — BFF mock-first
    │   │   └── [reportId]/
    │   │       ├── route.ts             # 🆕 GET (상세) / PATCH (상태 변경)
    │   │       └── sanctions/
    │   │           └── route.ts         # 🆕 POST (제재 발급)
    │   └── inquiries/
    │       ├── route.ts                 # 🆕 GET (목록)
    │       └── [inquiryId]/
    │           ├── route.ts             # 🆕 GET (상세) / PATCH (상태 변경)
    │           └── answers/
    │               ├── route.ts         # 🆕 POST (답변 등록)
    │               └── [answerId]/
    │                   └── route.ts     # 🆕 PATCH (수정) / DELETE (삭제)
```

### 3-2. Feature 디렉토리 (FSD 컨벤션)

```
src/features/admin-report/
├── api/
│   ├── adminReport.api.ts               # 🆕 목록/상세/제재 axios 호출
│   └── index.ts
├── components/
│   ├── ReportListTable/                 # 🆕 (PC/태블릿) 테이블 뷰
│   ├── ReportListCards/                 # 🆕 (모바일) 카드 리스트
│   ├── ReportFilters/                   # 🆕 사유/타입/상태 필터
│   ├── ReportDetailPanel/               # 🆕 상세 정보 + 컨텍스트 링크
│   ├── SanctionForm/                    # 🆕 제재 발급 폼 (유형 선택, 기간, 메시지)
│   ├── ReportStatusBadge/               # 🆕 PENDING/REVIEWING/RESOLVED/REJECTED 배지
│   └── index.ts
├── hooks/
│   ├── useAdminReportList.ts            # 🆕 필터/페이지/정렬 통합
│   ├── useAdminReportDetail.ts          # 🆕 단건 조회 + 상태 변경 mutation
│   ├── useIssueSanction.ts              # 🆕 제재 발급 mutation
│   └── index.ts
├── types/
│   ├── adminReport.ts                   # 🆕 AdminReportListItem, AdminReportDetail
│   └── index.ts
├── utils/
│   ├── reportFiltersToQuery.ts          # 🆕 필터 객체 → URLSearchParams 변환
│   └── index.ts
└── index.ts

src/features/admin-inquiry/
├── api/
│   ├── adminInquiry.api.ts
│   └── index.ts
├── components/
│   ├── InquiryListTable/
│   ├── InquiryListCards/
│   ├── InquiryFilters/
│   ├── InquiryDetailPanel/              # 본문 + 사용자 컨텍스트
│   ├── AnswerForm/                      # 답변 등록/수정 폼
│   ├── AnswerList/                      # 등록된 답변 목록 (수정/삭제 액션 포함)
│   ├── InquiryStatusBadge/              # OPEN / ANSWERED / CLOSED
│   └── index.ts
├── hooks/
│   ├── useAdminInquiryList.ts
│   ├── useAdminInquiryDetail.ts
│   ├── useAnswerMutations.ts            # 등록/수정/삭제 통합
│   └── index.ts
├── types/
│   ├── adminInquiry.ts
│   └── index.ts
├── utils/
│   ├── inquiryFiltersToQuery.ts
│   └── index.ts
└── index.ts
```

### 3-3. 공용 어드민 쉘

```
src/widgets/admin-layout/
├── AdminLayout/
│   ├── component.tsx                    # 🆕 사이드바(데스크톱) + 햄버거(모바일) + Outlet
│   ├── styles.module.scss
│   └── index.ts
├── AdminSidebar/
│   ├── component.tsx                    # 🆕 신고/문의/(통계) 메뉴
│   ├── styles.module.scss
│   └── index.ts
├── AdminHeader/
│   ├── component.tsx                    # 🆕 운영자명/로그아웃/현재 메뉴
│   ├── styles.module.scss
│   └── index.ts
└── index.ts
```

> 디렉토리 컨벤션 근거: CLAUDE.md FSD 실사용 구조(`features/{name}/{api,components,hooks,types,utils}`) 그대로. `widgets/`는 디렉토리 구조 v1.0 §widgets — 복합 위젯/레이아웃에 사용.

### 3-4. 공용 어드민 UI (shared)

테이블/페이지네이션/모달은 어드민에서만 쓰이지만 도메인 중립이므로 `src/shared/ui/admin/` 하위에 분리:

```
src/shared/ui/admin/
├── DataTable/                           # 🆕 헤더/정렬/빈 상태/로딩 행 포함
├── Pagination/                          # 🆕 단순 page 번호 + prev/next
├── FilterChip/                          # 🆕 토글형 필터 칩
├── ConfirmDialog/                       # 🆕 제재/삭제 확인 다이얼로그 (Radix Dialog 활용)
├── EmptyState/                          # 🆕 데이터 없음 안내
└── index.ts
```

> Radix Dialog가 이미 의존성(`@radix-ui/react-dialog`)에 있으므로 ConfirmDialog는 이를 base로 구성한다. 사용자 측의 BottomSheet 다이얼로그(ReportDialog)와는 별개.

---

## 4. 타입 정의

### 4-1. 신고 (admin)

`src/features/admin-report/types/adminReport.ts`

```ts
import type {
  ReportTarget,
  ReportReasonCode,
  ReportStatus,
} from '@/features/report';
import type { SanctionType } from '@/features/admin-report/types'; // 본 파일 내 정의

// 어드민 목록 응답의 단일 항목.
export interface AdminReportListItem {
  reportId: string;
  target: ReportTarget;
  reasonCode: ReportReasonCode;
  status: ReportStatus;
  reporterId: string;
  reporterNickname: string;
  createdAt: string;        // ISO 8601
  updatedAt: string;
  assignedOperator: string | null;
  reportCount: number;      // 동일 대상에 누적된 신고 수
  autoBlinded: boolean;     // 누적 임계치 도달 여부
}

// 상세 응답
export interface AdminReportDetail extends AdminReportListItem {
  detail: string | null;    // 신고자가 입력한 본문
  history: Array<{
    status: ReportStatus;
    at: string;
    actor: string;          // 'system' | 'operator:{id}' | 'reporter'
    note?: string;
  }>;
  relatedReports: Array<{
    reportId: string;
    reasonCode: ReportReasonCode;
    reporterNickname: string;
    createdAt: string;
  }>;                       // 동일 target에 묶인 다른 신고
  resolution: ReportResolution | null;
}

export type ReportResolution = 'BLINDED' | 'WARNED' | 'BANNED' | 'NO_ACTION';

// 제재 (사용자 측 SanctionType 재사용, 단 운영자 발급용 입력 페이로드)
export type SanctionType =
  | 'WARNING'
  | 'CONTENT_BLINDED'
  | 'TEMP_BAN'
  | 'PERMANENT_BAN';

export interface IssueSanctionPayload {
  reportId: string;
  type: SanctionType;
  durationDays?: number;    // TEMP_BAN 일 때만
  message: string;          // 사용자 노출 메시지
  resolution: ReportResolution;
}

export interface AdminReportListParams {
  status?: ReportStatus | 'all';
  targetType?: 'course' | 'comment' | 'user' | 'all';
  reasonCode?: ReportReasonCode | 'all';
  q?: string;               // 키워드(신고자/대상/사유 통합 검색)
  page?: number;
  size?: number;
  sort?: 'createdAt:desc' | 'createdAt:asc' | 'reportCount:desc';
}

export interface AdminReportListResponse {
  data: AdminReportListItem[];
  totalCount: number;
  page: number;
  size: number;
  hasNext: boolean;
}
```

### 4-2. 문의 (admin)

`src/features/admin-inquiry/types/adminInquiry.ts`

```ts
export type InquiryCategory =
  | 'ACCOUNT'        // 계정/로그인
  | 'CONTENT'        // 코스/장소 관련
  | 'REPORT_APPEAL'  // 신고/제재 이의제기 (사용자 측 Phase 4와 연동 후보)
  | 'BUG'            // 버그 신고
  | 'FEATURE'        // 기능 제안
  | 'ETC';

export const INQUIRY_CATEGORY_LABELS: Record<InquiryCategory, string> = {
  ACCOUNT: '계정/로그인',
  CONTENT: '콘텐츠 관련',
  REPORT_APPEAL: '신고/제재 이의제기',
  BUG: '버그 신고',
  FEATURE: '기능 제안',
  ETC: '기타',
};

export type InquiryStatus = 'OPEN' | 'ANSWERED' | 'CLOSED';

export interface InquiryAuthor {
  userId: string;
  nickname: string;
  email: string | null;     // 답변 통보용 이메일 (선택 입력)
}

export interface AdminInquiryListItem {
  inquiryId: string;
  title: string;
  category: InquiryCategory;
  author: InquiryAuthor;
  status: InquiryStatus;
  hasUnreadByAuthor: boolean;   // 답변 후 작성자가 미열람
  answerCount: number;
  createdAt: string;
  updatedAt: string;
  assignedOperator: string | null;
}

export interface InquiryAnswer {
  answerId: string;
  body: string;
  authorOperatorId: string;
  authorOperatorName: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminInquiryDetail extends AdminInquiryListItem {
  body: string;
  attachments: Array<{ id: string; name: string; url: string }>;  // 선택, 첨부 가능 시
  answers: InquiryAnswer[];
}

export interface AdminInquiryListParams {
  status?: InquiryStatus | 'all';
  category?: InquiryCategory | 'all';
  q?: string;
  page?: number;
  size?: number;
  sort?: 'createdAt:desc' | 'updatedAt:desc';
}

export interface AdminInquiryListResponse {
  data: AdminInquiryListItem[];
  totalCount: number;
  page: number;
  size: number;
  hasNext: boolean;
}

export interface CreateAnswerPayload { body: string; }
export interface UpdateAnswerPayload { body: string; }
```

---

## 5. 라우트 / 권한 가드

### 5-1. 라우트 트리

| Path | 화면 |
| --- | --- |
| `/admin` | 대시보드 placeholder (Phase 2에서 통계 카드). P0는 `/admin/reports`로 redirect |
| `/admin/reports` | 신고 리스트 |
| `/admin/reports/[reportId]` | 신고 상세 |
| `/admin/inquiries` | 문의 리스트 |
| `/admin/inquiries/[inquiryId]` | 문의 상세 |

### 5-2. 권한 가드

`src/app/admin/layout.tsx`에서 다음 흐름:

1. **서버 컴포넌트 차원**: 쿠키를 BFF의 `/api/admin/me` 로 검증 → role !== 'ADMIN' 시 `notFound()` 또는 `/login?next=/admin` 리다이렉트.
2. **클라이언트 UX 보강**: 인증 만료 시 axios 인터셉터가 401 잡아 toast + 로그인 페이지 이동.
3. **데스크톱/모바일 공통**: 비어드민 사용자가 어쩌다 진입해도 본 콘솔 정보 일체 노출 금지.

> 백엔드 합의(O1) 전에는 dev 한정으로 `localStorage('admin_dev_token')` 존재 여부로 우회 검증 가능하게 한다. 프로덕션 빌드에서는 이 우회 경로 비활성 (`process.env.NODE_ENV === 'production'` 분기).

### 5-3. AdminLayout 구조 (반응형)

```
[ AdminHeader (고정 상단, 56px)             |  운영자명 / 로그아웃 ]
[ AdminSidebar      ] [ <main>                                    ]
  - 신고               (페이지별 콘텐츠)
  - 문의
  - (통계 placeholder)
```

- **데스크톱 (≥ 768px)**: 사이드바 240px 고정 left, 본문 flex-1
- **모바일 (< 768px)**: 사이드바 숨김, AdminHeader 좌측 햄버거 → Drawer로 슬라이드 인. 본문 100% 너비. BottomNavigation 미사용.
- z-index: AdminHeader 30, Sidebar Drawer 40, ConfirmDialog 100.

---

## 6. 신고 관리 화면

### 6-1. `/admin/reports` 리스트

**핵심 요구사항** (사용자 요청 §신고):
- 신고 리스트 조회 ✅
- 신고에 대한 유저 처리 기능 → 상세에서 처리하되 리스트에서 빠른 액션도 가능

#### 데스크톱 (md:) — `ReportListTable`

| 컬럼 | 내용 | 정렬 |
| --- | --- | --- |
| 상태 | `ReportStatusBadge` | — |
| 대상 유형 | 코스/댓글/사용자 (아이콘 + 텍스트) | — |
| 대상 | `target.title`/`snippet`/`nickname` (말줄임 1행) | — |
| 신고자 | `reporterNickname` | — |
| 사유 | `REASON_LABELS[reasonCode]` | — |
| 누적 신고 | `reportCount` (autoBlinded 시 강조) | desc 가능 |
| 접수 시각 | `createdAt` 상대 표시 + tooltip 절대 표시 | desc/asc |
| 담당자 | `assignedOperator` | — |
| 액션 | "상세" 버튼 → 행 클릭으로도 진입 가능 | — |

- 빈 상태: `EmptyState` "신고가 없어요"
- 로딩: skeleton 행 5개
- 행 hover 시 `bg-gray-50`, 행 클릭 시 상세 페이지 이동 (`router.push`)

#### 모바일 — `ReportListCards`

테이블 대신 카드 1장 = 1 신고. 카드 구성:
```
[Badge: 상태]  [autoBlinded 아이콘]
[대상유형 · 사유]
대상: target.title
신고자: reporterNickname · 3시간 전
```

탭 시 상세 페이지 이동. 카드 우측 ⋮ 메뉴(데스크톱 행 액션 대체)는 P1에서.

#### 공통 필터바 — `ReportFilters`

```
[ 상태: 전체 | PENDING | REVIEWING | RESOLVED | REJECTED ]  ← Tab 또는 Chip
[ 대상: 전체 | 코스 | 댓글 | 사용자 ]
[ 사유: 전체 | SPAM_AD | ... ]   ← Select (라벨은 한글)
[ 검색: 신고자/대상 키워드 ]      ← InputField (300ms debounce)
[ 정렬: 최신 | 누적 신고 많은 순 ] ← Select
```

- 모바일에서는 `FilterChip` 가로 스크롤 + "상세 필터" 버튼 → BottomSheet에 카테고리 묶음 노출.
- 데스크톱은 한 줄 가로 배치.

### 6-2. `/admin/reports/[reportId]` 상세

#### 영역 구성 (반응형)

데스크톱 (md:): 좌측 2/3 신고 정보, 우측 1/3 처분(SanctionForm) — sticky.
모바일: 세로 1열, 처분 영역은 페이지 하단 sticky 버튼 → 탭 시 ConfirmDialog 또는 BottomSheet 폼.

#### 영역 1 — `ReportDetailPanel`

| 섹션 | 내용 |
| --- | --- |
| 헤더 | `ReportStatusBadge` + reportId + autoBlinded 표시 |
| 대상 정보 | target.type/id/title/owner + **"원본 보기" 외부 링크** (`target.contextUrl`, `target="_blank"`) |
| 신고 사유 | `REASON_LABELS[reasonCode]` + 신고자 입력 `detail` (없으면 "(상세 사유 없음)") |
| 신고자 정보 | reporterNickname + reporterId. 신고자 본인은 운영자 측에만 공개 |
| 처리 이력 (history) | 타임라인 — system/operator/reporter 액션 시간순 |
| 동일 대상 누적 신고 | `relatedReports` 짧은 리스트, 각각 클릭 시 해당 reportId 상세로 이동 |

#### 영역 2 — `SanctionForm` (유저 처리 액션)

> "신고에 대한 유저 처리 기능" — 본 계획의 핵심 액션.

```
[ 처분 유형 ] ◯ 경고 (WARNING)
              ◯ 콘텐츠 블라인드 (CONTENT_BLINDED)
              ◯ 일시 정지 (TEMP_BAN)
              ◯ 영구 정지 (PERMANENT_BAN)
              ◯ 조치 없음 / 거절 (NO_ACTION → 신고 REJECTED)

[ 정지 기간 ] (TEMP_BAN 선택 시만 활성)
              [7일 ▽]  ← 7 / 14 / 21 / 28 / 35 / custom

[ 사용자 노출 메시지 ]
[ textarea, 최대 500자, 필수 ]

[ 처리 결과(resolution) ]
              BLINDED / WARNED / BANNED / NO_ACTION
              ← 처분 유형 선택 시 자동 매핑되며 운영자가 override 가능

[취소]  [신고 거절(REJECT)]  [처분 발급(빨강 강조)]
```

- "처분 발급" 클릭 시 **ConfirmDialog** 노출: "이 처분은 되돌릴 수 없어요. 진행할까요?"
- 성공 시 toast "처분이 발급됐어요." + 상세 화면을 새 데이터로 refetch (이력에 운영자 액션 추가)
- 폼 vstate는 `useIssueSanction` 훅이 관리. `useReducer` 또는 단순 useState. mutation 진행 중 버튼 disabled.

#### 추가 액션 — 빠른 처리

- **"검토 중으로 변경"** 버튼: PATCH `/api/admin/reports/{id}` → status `REVIEWING`. 운영자가 본인 담당으로 잠금 표시.
- **"담당자 할당"** P1 (선택)

### 6-3. 이외 필요한 기능 제안 (Beyond user requirements)

본 어드민 신고 콘솔에 함께 도입하면 운영 효율이 크게 오르는 항목들:

| 제안 | 우선순위 | 이유 |
| --- | --- | --- |
| **동일 대상 신고 그룹화 뷰** (relatedReports) | **P0 (이번에 포함)** | 같은 코스에 10명이 신고했을 때 1건만 처분하면 나머지 자동 정리. UI는 §6-2 "동일 대상 누적 신고" 섹션으로 흡수 |
| **autoBlinded 필터** | P0 | 자동 블라인드된 항목 즉시 검토 필요 |
| **운영자 활동 로그(§4.2)** | P1 | 누가 언제 어떤 처분을 내렸는지 추적. 별도 `/admin/logs` |
| **신고 통계 대시보드** | P1 | 사유별/대상별/일별. Chart.js 또는 recharts. `/admin` 진입 시 |
| **다중 선택 일괄 처분** | P1 | 같은 사유의 대량 스팸 신고 한번에 처리 |
| **신고자 신뢰도 표시** | P2 | 어뷰저 신고자 식별. 신고자별 RESOLVED/REJECTED 비율 |
| **메모(operator note)** | P1 | history 항목에 운영자 내부 메모. 사용자 비노출 |

---

## 7. 문의 관리 화면

### 7-1. `/admin/inquiries` 리스트

**핵심 요구사항** (사용자 요청 §문의):
- 문의 리스트 조회 ✅
- 답변 등록/수정/삭제 → 상세에서 처리

#### 데스크톱 — `InquiryListTable`

| 컬럼 | 내용 |
| --- | --- |
| 상태 | `InquiryStatusBadge` (OPEN/ANSWERED/CLOSED) |
| 카테고리 | `INQUIRY_CATEGORY_LABELS[category]` |
| 제목 | title (말줄임) + 미열람 시 `•` 마커 |
| 작성자 | author.nickname |
| 답변 수 | answerCount (0이면 회색) |
| 접수 시각 | 상대 표시 + tooltip |
| 담당자 | assignedOperator |
| 액션 | "상세" 또는 행 클릭 |

#### 모바일 — `InquiryListCards`

```
[Badge: 상태]      [카테고리 칩]
[제목 — 1~2행]
작성자 · 답변 N개 · 3시간 전
```

#### 공통 필터바 — `InquiryFilters`

```
[ 상태: 전체 | OPEN | ANSWERED | CLOSED ]
[ 카테고리: 전체 | ACCOUNT | CONTENT | REPORT_APPEAL | BUG | FEATURE | ETC ]
[ 검색: 제목/본문/작성자 키워드 ]
[ 정렬: 최신 접수 | 최근 활동 ]
```

### 7-2. `/admin/inquiries/[inquiryId]` 상세

#### 영역 1 — `InquiryDetailPanel`

| 섹션 | 내용 |
| --- | --- |
| 헤더 | `InquiryStatusBadge` + inquiryId + 카테고리 |
| 작성자 정보 | nickname + userId + email(있으면) + "프로필 보기" 링크(별도 탭) |
| 제목 | h2 |
| 본문 | pre-wrap. 줄바꿈/공백 보존 |
| 첨부파일 | 있을 시 다운로드 링크 |
| 접수/수정 시각 | 상대 + 절대 |

#### 영역 2 — `AnswerList` + `AnswerForm`

> 답변 등록/수정/삭제 — 사용자 요청 핵심.

**`AnswerList`** — 등록된 답변을 시간순 카드로 렌더
```
[Avatar / 운영자명]                    [3시간 전]
답변 본문 (pre-wrap)
[수정]  [삭제]                          ← 본인이 작성한 답변만 노출 (서버 검증 필수)
```

- **수정 버튼**: 인라인 모드로 `<textarea>` 전환, [저장]/[취소]. 저장 시 PATCH.
- **삭제 버튼**: `ConfirmDialog` "답변을 삭제할까요? 사용자에게 통보된 답변은 되돌릴 수 없어요." → 확인 시 DELETE.
- 다른 운영자가 작성한 답변은 read-only.

**`AnswerForm`** — 신규 답변 등록 폼 (페이지 하단)
```
[ textarea, 최소 1자, 최대 5000자 ]
[ "이 답변으로 문의 마감(CLOSED)" 체크박스 ]   ← 선택
[취소]  [답변 등록]
```

- 등록 성공 시 toast + `AnswerList`에 새 답변 prepend + 본문 폼 reset + 상태가 `OPEN`이었다면 `ANSWERED`로 자동 전환.
- 마감 체크 시 답변 등록 + 상태 `CLOSED` 동시 처리.

#### 추가 액션

- **"문의 마감"** 단독 버튼 (답변 없이도 마감 가능: 예: 중복 문의)
- **"문의 재개"** CLOSED 상태에서 다시 OPEN

### 7-3. 이외 필요한 기능 제안

| 제안 | 우선순위 | 이유 |
| --- | --- | --- |
| **답변 템플릿(quick replies)** | P1 | "비밀번호 재설정 안내" 등 반복 응대 빠르게. textarea 위에 dropdown |
| **답변 미리보기** | P1 | 사용자에게 어떻게 보일지 미리보기 (markdown 또는 plain) |
| **내부 메모** | P1 | 답변과 별개로 운영자끼리만 보는 메모. 사용자 미공개 |
| **이의제기(REPORT_APPEAL) → 신고 상세 연동** | P0 (가능하면) | 카테고리가 REPORT_APPEAL이면 본문에서 관련 reportId 추출 → "관련 신고 보기" 링크 |
| **이메일 통보 옵션** | P1 | 답변 등록 시 author.email로 통보 (sendgrid/SES). 운영자 토글 |
| **카테고리별 SLA 표시** | P2 | OPEN → 24h 경과 시 빨강 강조 |
| **다중 운영자 협업** | P2 | 답변 작성 중 잠금 (lock indicator) |

---

## 8. API 계층 설계

### 8-1. axios 호출 — 신고

`src/features/admin-report/api/adminReport.api.ts`

```ts
import axios from 'axios';
import type {
  AdminReportListParams,
  AdminReportListResponse,
  AdminReportDetail,
  IssueSanctionPayload,
} from '../types';
import { reportFiltersToQuery } from '../utils';

export async function fetchAdminReports(
  params: AdminReportListParams
): Promise<AdminReportListResponse> {
  const res = await axios.get<AdminReportListResponse>('/api/admin/reports', {
    params: reportFiltersToQuery(params),
  });
  return res.data;
}

export async function fetchAdminReportDetail(
  reportId: string
): Promise<AdminReportDetail> {
  const res = await axios.get<AdminReportDetail>(`/api/admin/reports/${reportId}`);
  return res.data;
}

export async function patchAdminReportStatus(
  reportId: string,
  body: { status: 'REVIEWING' | 'REJECTED'; note?: string }
): Promise<AdminReportDetail> {
  const res = await axios.patch<AdminReportDetail>(
    `/api/admin/reports/${reportId}`,
    body
  );
  return res.data;
}

export async function issueSanction(
  payload: IssueSanctionPayload
): Promise<{ sanctionId: string; reportId: string }> {
  const res = await axios.post(
    `/api/admin/reports/${payload.reportId}/sanctions`,
    payload
  );
  return res.data;
}
```

### 8-2. axios 호출 — 문의

`src/features/admin-inquiry/api/adminInquiry.api.ts`

```ts
import axios from 'axios';
import type {
  AdminInquiryListParams,
  AdminInquiryListResponse,
  AdminInquiryDetail,
  CreateAnswerPayload,
  UpdateAnswerPayload,
  InquiryAnswer,
  InquiryStatus,
} from '../types';
import { inquiryFiltersToQuery } from '../utils';

export async function fetchAdminInquiries(
  params: AdminInquiryListParams
): Promise<AdminInquiryListResponse> {
  const res = await axios.get<AdminInquiryListResponse>('/api/admin/inquiries', {
    params: inquiryFiltersToQuery(params),
  });
  return res.data;
}

export async function fetchAdminInquiryDetail(
  inquiryId: string
): Promise<AdminInquiryDetail> {
  const res = await axios.get<AdminInquiryDetail>(
    `/api/admin/inquiries/${inquiryId}`
  );
  return res.data;
}

export async function patchAdminInquiryStatus(
  inquiryId: string,
  body: { status: InquiryStatus }
): Promise<AdminInquiryDetail> {
  const res = await axios.patch(`/api/admin/inquiries/${inquiryId}`, body);
  return res.data;
}

export async function createInquiryAnswer(
  inquiryId: string,
  payload: CreateAnswerPayload & { closeAfter?: boolean }
): Promise<InquiryAnswer> {
  const res = await axios.post(
    `/api/admin/inquiries/${inquiryId}/answers`,
    payload
  );
  return res.data;
}

export async function updateInquiryAnswer(
  inquiryId: string,
  answerId: string,
  payload: UpdateAnswerPayload
): Promise<InquiryAnswer> {
  const res = await axios.patch(
    `/api/admin/inquiries/${inquiryId}/answers/${answerId}`,
    payload
  );
  return res.data;
}

export async function deleteInquiryAnswer(
  inquiryId: string,
  answerId: string
): Promise<void> {
  await axios.delete(`/api/admin/inquiries/${inquiryId}/answers/${answerId}`);
}
```

### 8-3. Next.js BFF 라우트 정책

기존 `src/app/api/reports/route.ts`의 **mock-first** 패턴을 답습.

- `NEXT_PUBLIC_API_BASE_URL` 미설정 + dev → mock 응답 (mock 데이터셋은 `src/mocks/data/adminReport.ts` 등에 분리)
- 미설정 + prod → 502
- 설정 → 백엔드 프록시. cookie/idempotency-key 전달. **try/catch 폴백 금지** (PR-2 결정 그대로)
- 어드민 라우트는 추가로 **서버 측 role 검증 호출**(`/api/admin/me`)을 첫 진입 시 1회 수행. 401/403 시 본 BFF가 동일 코드로 응답.

---

## 9. 훅 명세

### 9-1. `useAdminReportList`

```ts
interface UseAdminReportListResult {
  data: AdminReportListItem[];
  totalCount: number;
  page: number;
  hasNext: boolean;
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<void>;
  setFilters: (next: Partial<AdminReportListParams>) => void;
  filters: AdminReportListParams;
}
```

- React Query 미도입(외부 의존 O5) → **useState + useEffect + AbortController** 단순 패턴.
- 필터 변경 시 URL의 `searchParams`도 함께 동기화(`useRouter`/`useSearchParams`) → 새로고침에도 필터 유지.
- 검색 키워드는 300ms debounce.

### 9-2. `useAdminReportDetail`

```ts
interface UseAdminReportDetailResult {
  data: AdminReportDetail | null;
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<void>;
  patchStatus: (body: { status: 'REVIEWING' | 'REJECTED'; note?: string }) => Promise<void>;
}
```

- 마운트 시 자동 fetch.
- `patchStatus`는 낙관적 업데이트 없이 mutation 성공 후 refetch.

### 9-3. `useIssueSanction`

```ts
interface UseIssueSanctionResult {
  issue: (payload: IssueSanctionPayload) => Promise<void>;
  isSubmitting: boolean;
}
```

- 발급 성공 → toast + 상위에서 `useAdminReportDetail.refetch()` 호출.
- 실패 → 에러 toast. 폼 상태 유지.

### 9-4. 문의 훅 — `useAdminInquiryList` / `useAdminInquiryDetail` / `useAnswerMutations`

신고와 동일 패턴. `useAnswerMutations`는:

```ts
interface UseAnswerMutationsResult {
  create: (body: string, closeAfter: boolean) => Promise<void>;
  update: (answerId: string, body: string) => Promise<void>;
  remove: (answerId: string) => Promise<void>;
  isPending: boolean;
}
```

---

## 10. 반응형 UX 디테일

| 항목 | 데스크톱 (≥ 768px) | 모바일 (< 768px) |
| --- | --- | --- |
| 레이아웃 | 사이드바 240px + 본문 | 햄버거 → Drawer 사이드바, 본문 100% |
| 리스트 표현 | DataTable (행 클릭 진입) | 카드 리스트 |
| 필터바 | 한 줄 가로 배치 | 가로 스크롤 칩 + "상세 필터" BottomSheet |
| 상세 페이지 | 2-column (좌: 정보, 우: 액션 sticky) | 1-column, 액션 영역 하단 sticky 버튼 |
| 액션 다이얼로그 | Radix Dialog 중앙 모달 | 동일 Radix Dialog지만 `bottom-0` slide-up 변형 |
| 폰트 크기 | 14px 본문, 12~13px 메타 | 동일하나 카드 패딩 ↑ |
| 페이지네이션 | 1 2 3 ... prev/next | "더보기" 무한 스크롤 또는 prev/next 단순 |
| 컨텍스트 링크 | `target="_blank"` 새 탭 | 동일 (모바일 사파리도 새 탭 지원) |

### 10-1. 카피라이팅 (어드민 어투 — 사용자 앱보다 다소 격식)

| 위치 | 문구 |
| --- | --- |
| 신고 빈 상태 | "처리할 신고가 없습니다." |
| 문의 빈 상태 | "접수된 문의가 없습니다." |
| 처분 확인 다이얼로그 | "이 처분은 즉시 사용자에게 적용됩니다. 진행하시겠습니까?" |
| 답변 삭제 확인 | "답변을 삭제하시겠습니까? 사용자에게는 변경 사실이 통보되지 않습니다." |
| 처분 발급 성공 | "처분이 발급되었습니다." |
| 답변 등록 성공 | "답변이 등록되었습니다." |
| 403 / 권한 없음 | "이 페이지에 접근할 권한이 없습니다." |

### 10-2. 접근성

- DataTable에 `role="table"`, 컬럼 헤더 `scope="col"`. 정렬 가능 컬럼은 `aria-sort`.
- ConfirmDialog는 Radix Dialog 사용 → `aria-modal`, focus trap, ESC 닫기 자동.
- 처분/삭제 등 destructive 액션 버튼은 `aria-describedby`로 위험성 설명 연결.

---

## 11. 단계별 작업 순서 (PR 단위)

본 계획은 **PR 6개**로 분할. 신고와 문의를 평행 진행 가능하지만 인프라(레이아웃/공용 UI)는 먼저.

### Phase 1 — 어드민 인프라

#### PR-A1: 어드민 셸 + 권한 가드
- [ ] `src/app/admin/layout.tsx`, `src/app/admin/page.tsx`
- [ ] `src/widgets/admin-layout/AdminLayout`, `AdminSidebar`, `AdminHeader`
- [ ] `src/shared/ui/admin/DataTable`, `Pagination`, `FilterChip`, `ConfirmDialog`, `EmptyState`
- [ ] dev-only role 우회 + axios 인터셉터(401 → toast + redirect)
- [ ] Storybook: AdminLayout 데스크톱/모바일, DataTable 기본/빈/로딩
- [ ] `yarn lint` / `yarn build` 통과

### Phase 2 — 신고 콘솔

#### PR-A2: 신고 리스트
- [ ] `src/features/admin-report/types/`, `utils/`, `api/`, `hooks/useAdminReportList`
- [ ] `src/app/api/admin/reports/route.ts` (mock-first)
- [ ] `ReportListTable`, `ReportListCards`, `ReportFilters`, `ReportStatusBadge`
- [ ] `src/app/admin/reports/page.tsx` (URL 동기화)
- [ ] Storybook: 4가지 상태별 행 + 필터 토글
- [ ] `yarn lint` / `yarn build` 통과

#### PR-A3: 신고 상세 + 유저 처리
- [ ] `useAdminReportDetail`, `useIssueSanction`
- [ ] `src/app/api/admin/reports/[reportId]/route.ts` GET/PATCH (mock-first)
- [ ] `src/app/api/admin/reports/[reportId]/sanctions/route.ts` POST (mock-first)
- [ ] `ReportDetailPanel`, `SanctionForm`
- [ ] `src/app/admin/reports/[reportId]/page.tsx`
- [ ] Storybook: SanctionForm 4종 처분 시나리오
- [ ] 수동 검증: 데스크톱 처분 발급 → 이력 추가 / 모바일 sticky 액션
- [ ] `yarn lint` / `yarn build` 통과

### Phase 3 — 문의 콘솔

#### PR-A4: 문의 리스트
- [ ] `src/features/admin-inquiry/types/`, `utils/`, `api/`, `hooks/useAdminInquiryList`
- [ ] `src/app/api/admin/inquiries/route.ts` (mock-first)
- [ ] `InquiryListTable`, `InquiryListCards`, `InquiryFilters`, `InquiryStatusBadge`
- [ ] `src/app/admin/inquiries/page.tsx`
- [ ] Storybook
- [ ] `yarn lint` / `yarn build` 통과

#### PR-A5: 문의 상세 + 답변 등록/수정/삭제
- [ ] `useAdminInquiryDetail`, `useAnswerMutations`
- [ ] `src/app/api/admin/inquiries/[inquiryId]/route.ts` GET/PATCH (mock-first)
- [ ] `src/app/api/admin/inquiries/[inquiryId]/answers/route.ts` POST (mock-first)
- [ ] `src/app/api/admin/inquiries/[inquiryId]/answers/[answerId]/route.ts` PATCH/DELETE (mock-first)
- [ ] `InquiryDetailPanel`, `AnswerList`, `AnswerForm`
- [ ] `src/app/admin/inquiries/[inquiryId]/page.tsx`
- [ ] Storybook: AnswerList(빈 상태/3개), AnswerForm(빈/유효/오류)
- [ ] `yarn lint` / `yarn build` 통과

### Phase 4 — 마무리

#### PR-A6: 사이드바 메뉴 카운트 배지 + 사이트 진입 동선 + QA
- [ ] AdminSidebar에 신고/문의 미처리 카운트 배지 (GET 폴링 또는 상세 페이지 이탈 시 refetch)
- [ ] 신고 상세에서 카테고리가 REPORT_APPEAL인 관련 문의로 점프 (역방향도 가능 시)
- [ ] 데스크톱/태블릿(768~1024)/모바일(360~768) 수동 검증
- [ ] Storybook 빌드 통과
- [ ] `yarn lint` / `yarn build` 통과

---

## 12. 테스트 전략

### 12-1. Storybook (PR마다 동시 작성)

| 컴포넌트 | 스토리 |
| --- | --- |
| AdminLayout | 데스크톱 / 모바일(closed/open drawer) |
| DataTable | 기본 / 빈 / 로딩 / 정렬 |
| ReportListTable | 4 상태 × 3 타입 |
| ReportListCards | 동일 |
| ReportDetailPanel | PENDING / REVIEWING / RESOLVED(BLINDED) / autoBlinded |
| SanctionForm | 처분 유형 4종 |
| InquiryListTable | OPEN / ANSWERED / CLOSED × 카테고리 6 |
| InquiryDetailPanel | 답변 없음 / 답변 1개 / 답변 3개 / 첨부 |
| AnswerForm | 빈 / 유효 / 오류 / 마감 체크 |
| ConfirmDialog | destructive / 일반 |

### 12-2. 단위 테스트

- `reportFiltersToQuery` / `inquiryFiltersToQuery` — null/undefined 제거, `all` 값은 쿼리에서 제외
- `useAdminReportList` — AbortController 동작, URL 동기화, debounce
- `useIssueSanction` — 성공 시 콜백 호출, 실패 시 폼 상태 유지
- `useAnswerMutations` — 등록 후 답변 prepend, 삭제 후 제거

### 12-3. 수동 체크

- [ ] 데스크톱 1920px / 1280px / 1024px / 태블릿 768px / 모바일 414px / 360px 6개 폭에서 레이아웃 깨짐 없음
- [ ] 비어드민 세션으로 `/admin` 직접 진입 → 401 또는 not-found
- [ ] 신고 처분 발급 → 상세 이력 갱신 → 리스트 복귀 시 status 변경 확인
- [ ] 답변 등록 → AnswerList prepend → 상태가 OPEN → ANSWERED로 자동 전환
- [ ] 답변 수정 인라인 → 저장 → 표시 갱신
- [ ] 답변 삭제 ConfirmDialog → 확인 → 카드 제거 → 답변 0개 시 상태 OPEN으로 회귀 (백엔드 정책 확인 후 결정, O14)
- [ ] iOS Safari 모바일 어드민 진입 검증 (PWA viewport에서도 zoom 방지 동작)

---

## 13. 롤백 / 위험 관리

| # | 위험 | 영향 | 대응 |
| --- | --- | --- | --- |
| R1 | 어드민 권한 가드가 클라이언트에만 있고 서버 검증 누락 | 사용자가 어드민 데이터 노출 | 백엔드 협의 O1 — `/api/admin/me` 응답 강제. BFF가 401/403을 그대로 전파 |
| R2 | mock-first 데이터가 실제 백엔드 스키마와 불일치 | Phase 2 회귀 | 응답 타입의 nullable 필드 위주로 보완. zod 런타임 검증은 Phase 2 |
| R3 | 처분 발급 실수 후 되돌리기 불가 | 사용자 영향 즉시 발생 | ConfirmDialog 강제 + 운영자 활동 로그(P1) 도입으로 추적 가능성 확보 |
| R4 | 데스크톱 테이블이 모바일에서 가로 스크롤 발생 | 모바일 UX 저하 | 모바일은 ListCards로 완전 분기. 테이블/카드 동시 마운트 금지(렌더링 비용) |
| R5 | 답변 수정/삭제 권한 검증을 클라이언트에서만 함 | 다른 운영자 답변 변조 | 백엔드 협의 O12 — 서버 측 본인 답변만 허용 강제 |
| R6 | 어드민 라우트가 검색엔진에 노출 | 정보 유출 | `src/app/admin/layout.tsx`에 `export const metadata = { robots: { index: false } }` + robots.txt에 `/admin/*` disallow |

각 PR 독립 revert 가능. PR-A1만 revert해도 사용자 앱 전체는 무영향.

---

## 14. 사용자 측 동선과의 연관

| 영역 | 어드민 콘솔에서 다루는 것 | 사용자 앱에서 다루는 것 (기존/예정) |
| --- | --- | --- |
| 신고 | 운영자가 처분 결정 (BLINDED/WARNED/BANNED) | 사용자가 신고 제출 (PR-1~5), 자동 블라인드 시그널 (Phase 3 PR-6), 받은 제재 내역 (Phase 3 PR-7) |
| 문의 | 운영자가 답변 작성/관리 | **사용자 측 진입점은 본 계획 범위 외**. `/mypage/inquiry` 별도 plan 필요 (외부 의존 O10) |
| 이의제기 | (Phase 4) 어드민 측 처리 화면 | Phase 4 사용자 측 작성 화면. 본 계획은 카테고리 `REPORT_APPEAL` 수신만 |

---

## 15. 보안 / 운영 고려사항

- **운영자 활동 로그(§4.2)**: P1에서 별도 `/admin/logs` 페이지로 도입. 본 P0에서는 백엔드가 history에 `actor: operator:{id}` 기록만 한다는 가정.
- **민감 정보 마스킹**: 신고자 이메일, 작성자 이메일은 디폴트 마스킹(`a***@gmail.com`), "보기" 토글 시 평문 표시. P0는 평문 표시(운영팀 사용 가정), P1에서 마스킹 토글.
- **CSRF**: BFF 라우트가 같은 origin이므로 cookie SameSite=Strict 충분. 별도 토큰 없음.
- **검색엔진 차단**: robots noindex meta + middleware로 `/admin/*` 비인증 접근 시 404 응답(존재 자체를 숨김).
- **모바일 어드민 사용 범위**: 정보 밀도가 높은 작업은 데스크톱 권장. 모바일은 "긴급 처분 가능" 수준의 핵심 동선만 보장.

---

## 16. 외부 의존 / 향후 확인

| # | 항목 | 누가 | 우선순위 |
| --- | --- | --- | --- |
| O1 | `GET /api/admin/me` (role 검증) + `role: ADMIN` 정책 | 백엔드 | **P0 (PR-A1 머지 전)** |
| O2 | `GET /api/admin/reports` 응답 스키마 — `reporterId/reporterNickname/reportCount/assignedOperator` 포함 여부 | 백엔드 | **P0 (PR-A2 시작 전)** |
| O3 | `PATCH /api/admin/reports/{id}` status 전이 정책 (PENDING→REVIEWING→RESOLVED/REJECTED) | 백엔드 + 운영팀 | **P0** |
| O4 | `POST /api/admin/reports/{id}/sanctions` 응답 + `SanctionType` enum 4종 확정 | 백엔드 | **P0 (PR-A3 시작 전)** |
| O5 | 페이지네이션 방식 (cursor vs offset) | 백엔드 | P0 |
| O6 | 동일 target 신고 그룹화 응답 — `relatedReports` 필드 또는 별도 엔드포인트 | 백엔드 | **P0 (PR-A3)** |
| O7 | 운영자 활동 로그 엔드포인트 (`GET /api/admin/logs`) | 백엔드 | P1 |
| O8 | 신고 통계 엔드포인트 (사유별/대상별/일별) | 백엔드 | P1 |
| O9 | 문의 도메인 API 명세 (`/api/admin/inquiries/*` + 사용자 측 작성 엔드포인트) | 백엔드 + 기획자 | **P0 (PR-A4 시작 전)** |
| O10 | 사용자 측 문의 작성 화면(`/mypage/inquiry`) 도입 계획 | 기획자 | P1 (별도 plan) |
| O11 | 문의 카테고리 enum 확정 (본 plan은 6종 제안) | 기획자 | **P0** |
| O12 | 답변 수정/삭제 권한 정책 — 본인 답변만 vs 모든 운영자 가능 | 백엔드 + 운영팀 | **P0 (PR-A5)** |
| O13 | 답변 수정 시 사용자에게 통보할지 (수정 이력 노출 여부) | 기획자 | P1 |
| O14 | 답변 전체 삭제 시 문의 상태 OPEN으로 회귀 정책 | 기획자 | P0 |
| O15 | 이메일 통보 도입 여부 + 채널 (Sendgrid/SES/Naver Cloud) | 인프라 + 기획자 | P1 |
| O16 | 어드민 페이지 다국어 대응 여부 (현재 사용자 앱은 한국어만) | 기획자 | P2 |

---

## 17. 참고 파일

- [src/features/report/](../../src/features/report/) — 사용자 측 신고 feature (타입/사유 enum 재사용)
- [src/app/api/reports/route.ts](../../src/app/api/reports/route.ts) — BFF mock-first 패턴 답습
- [src/shared/ui/PageLayout/](../../src/shared/ui/PageLayout/) — 사용자 셸 (어드민 미사용, 참조용)
- [cc/docs/260510-001-DOCS-신고 기획 내용.md](../docs/260510-001-DOCS-신고%20기획%20내용.md) — §4.1/4.2 입력
- [cc/api/v1/report.md](../api/v1/report.md) — 사용자 측 명세 (어드민 측 명세는 본 계획에서 제안)
- [cc/plan/260515-plan-003-report_ui_implementation.md](./260515-plan-003-report_ui_implementation.md) — 인접 plan
- [cc/plan/260519-plan-005-report_ui_phase3.md](./260519-plan-005-report_ui_phase3.md) — 인접 plan
- [cc/convention/260506-convention-001-convention_v1.0.md.md](../convention/260506-convention-001-convention_v1.0.md.md)
- [cc/convention/260506-convention-002-directory_structure_v1.0.md](../convention/260506-convention-002-directory_structure_v1.0.md)

---

## 18. 한눈에 보기

```
[PR-A1] AdminLayout + 공용 admin UI + 권한 가드
[PR-A2] /admin/reports 리스트 (table+cards 반응형)
[PR-A3] /admin/reports/[id] 상세 + SanctionForm (유저 처리)
[PR-A4] /admin/inquiries 리스트
[PR-A5] /admin/inquiries/[id] 상세 + 답변 등록/수정/삭제
[PR-A6] 사이드바 카운트 배지 + 반응형 QA
```

**필수 충족 요구사항 매핑**:

| 사용자 요청 | 본 계획 위치 |
| --- | --- |
| 신고 리스트 조회 | §6-1, PR-A2 |
| 신고 상세 내역 조회 | §6-2 `ReportDetailPanel`, PR-A3 |
| 신고에 대한 유저 처리 기능 | §6-2 `SanctionForm` (4종 처분 + REJECT), PR-A3 |
| 문의 리스트 조회 | §7-1, PR-A4 |
| 문의 상세 내역 조회 | §7-2 `InquiryDetailPanel`, PR-A5 |
| 문의 답변 등록/수정/삭제 | §7-2 `AnswerForm`/`AnswerList`, PR-A5 |
| PC/모바일 반응형 | §3-3 AdminLayout, §10 반응형 UX 표 |
| 이외 필요한 기능 제안 | §6-3 (신고 7건), §7-3 (문의 6건) |
