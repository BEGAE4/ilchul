# MR: `feature-fe-admin` → `dev-fe`

> 작성일: 2026-05-21  
> 브랜치: `feature-fe-admin`  
> 베이스: `dev-fe`  
> 이슈: #122  
> 커밋 수: 4 · 변경: 188 files (+13,055 / −80)

**제목 제안**

```
feat(#122): 관리자 UI(신고·문의) · 신고 UI · 메인 인기 더보기 페이지
```

---

## 📌 Related Issue

- Closes #122

<br/>

## ✏ Content

### 1. 관리자(Admin) UI — #122 핵심

- `/admin` 레이아웃(사이드바·헤더), 신고·문의 목록/상세 페이지
- `admin-report`, `admin-inquiry` feature (필터·테이블/카드·상세 패널·제재/답변 폼)
- 공용 `shared/ui/admin` (DataTable, Pagination, ConfirmDialog 등)
- BFF mock API: `/api/admin/reports`, `/api/admin/inquiries` (+ 상세·제재·답변 CRUD)
- 반응형: `md`(768px) 이상 테이블·사이드바, 미만 카드·슬라이드 인 상세

### 2. 신고(Report) UI — PR-1 ~ PR-5

- `src/features/report/` feature 신설 (타입·유틸 → 훅/API → 컴포넌트 → 진입점 연동)
- **PR-1**: `ReportTarget` discriminated union, `REASONS_BY_TARGET`, `buildIdempotencyKey`, `hiddenReportsStorage`
- **PR-2**: `useReport`, `useReportEligibility`, `submitReport`, BFF `POST /api/reports`
- **PR-3**: `ReportDialog`(2단계 BottomSheet), `ReportMenuItem`, `CourseViewPage` 인라인 mock 신고 UI 제거
- **PR-4/5**: 댓글 ⋮+BottomMenu 신고(`CourseViewPage`), 사용자 프로필 신고(`UserProfilePage`)
- 비로그인 메뉴 비노출, 자기 신고 차단, 중복 신고(localStorage) 처리

### 3. 메인 인기 섹션 "더보기" 페이지

- 홈 더보기 4곳 라우트 연결: `/place/popular`, `/plan/popular`, `/place/popular/nationwide`, `/plan/popular/nationwide`
- `features/main`: 무한 스크롤·위치 기반 조회, BFF mock (`/api/place|plan/popular`)
- 위치 권한 거부 시 nationwide 자동 리다이렉트

### 4. 문서·도구 (cc / 기타)

- 신고·인기 더보기·관리자 계획/결과 문서, `cc/api/v1/report.md`, `place.md` 갱신
- `.cursor/skills/git-commit-staged` 스킬 추가, `.gitignore`에 `/.omc/*` 추가

<br/>

## 📑 참고 사항

### 커밋 목록 (`dev-fe` 대비)

| 커밋 | 요약 |
|------|------|
| `cef111a` | 신고 feature 타입/유틸 (PR-1) |
| `23e1517` | 신고 훅/API (PR-2) |
| `9b6c4d3` | 신고 UI 컴포넌트 + 플랜 상세 (PR-3) |
| `8a21b3f` | 관리자 UI + 인기 더보기 + 댓글/프로필 신고 (PR-4/5 등) |

### 확인 요청

- [ ] **관리자(#122)**: `/admin/reports`, `/admin/inquiries` 목록·필터·상세·제재/답변 (mock 응답)
- [ ] **신고**: 플랜 상세 ⋮ → 신고 → 2단계 완료 / 댓글·타인 프로필 진입점
- [ ] **인기 더보기**: 홈 더보기 4버튼 → 각 페이지 무한 스크롤, 위치 거부 시 nationwide 이동
- [ ] `yarn build` / `yarn lint` 통과
- [ ] **스크린샷**: 관리자 목록·상세, 신고 다이얼로그(Step1/2), 인기 더보기 페이지 (가능 시 첨부)

### 리뷰 시 유의

- #122 범위(관리자) 외에 동일 브랜치에 신고 UI·인기 더보기가 함께 포함됨
- 신고·관리자 API는 **dev mock BFF** 기준 — 실 백엔드 연동은 후속 PR 예정
- MR diff에 **`.omc/sessions/*.json`** 포함 여부 확인 (로컬 세션 파일이면 제거 권장)

### 관련 문서 (`frontend/cc/`)

| 문서 | 경로 |
|------|------|
| 이슈 #122 | [docs/260521-docs-004-관리자_페이지_이슈.md](./260521-docs-004-관리자_페이지_이슈.md) |
| 관리자 UI 계획 | [plan/260520-plan-006-admin_page_ui_implementation.md](../plan/260520-plan-006-admin_page_ui_implementation.md) |
| 신고 UI 계획 | [plan/260515-plan-003-report_ui_implementation.md](../plan/260515-plan-003-report_ui_implementation.md) |
| 인기 더보기 계획 | [plan/260519-plan-004-main_popular_more_pages.md](../plan/260519-plan-004-main_popular_more_pages.md) |
| 구현 결과 | [result/260518-result-005](../result/260518-result-005-report_ui_pr1_implementation.md) ~ [009](../result/260519-result-009-main_popular_more_pages_implementation.md) |
