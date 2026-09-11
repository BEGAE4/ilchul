# REPORT / ADMIN API (v5) 연동 결과

> 기준 명세: [cc/api/v5/260705-v5-008-report.md](../api/v5/260705-v5-008-report.md), [260705-v5-009-cs-inquiry.md](../api/v5/260705-v5-009-cs-inquiry.md)
> 작업일: 2026-07-05 / 브랜치: `feature-fe-admin`

## 개요

사용자 신고와 관리자 신고 관리를 v5 백엔드로 연동했다. 기존에는 둘 다 Next.js BFF 목 라우트(`/api/reports`, `/api/admin/reports`)만 호출했다.

- **사용자 신고**: 대상 id가 숫자(서버 데이터)면 v5 직접 호출, 목데이터 id면 기존 BFF 목 유지 (하이브리드)
- **관리자 신고**: v5 우선 호출, 실패(백엔드 미기동 등) 시 BFF 목으로 폴백해 관리자 화면 유지

## 수정 파일

### 1. `src/features/report/api/report.api.ts` — 사용자 신고
- `submitReport`: 대상 id가 숫자면 **v5 `POST /api/report`** 호출.
  - 요청 매핑: `target.type` `course→PLAN`, `comment→REPLY`, `user→USER` / `target.id` → `targetId`(number)
  - 응답 매핑: `CreateReportResponseDto` → 기존 `ReportResponse` (`isAutoBlinded` → `autoBlinded`, `reportId` 문자열화)
  - 목데이터 대상은 기존 BFF `/api/reports`(idempotency-key 헤더 포함) 유지 → `useReport`/`ReportDialog` 등 UI 무변경
- `fetchReportReasons(targetType)` 신규: **v5 `GET /api/report/reason?type=`** — 함수만 준비 (현재 사유 목록 UI는 로컬 상수 `reasonsByTarget` 사용, 전환은 선택 작업)

### 2. `src/features/admin-report/utils/serverReportMapper.ts` (신규) — v5 DTO 매퍼
- `TARGET_TYPE_TO_SERVER` / 역매핑, `SORT_TO_SERVER`(`createdAt:desc` → `CREATED_DESC` 등)
- `mapServerItem` / `mapServerDetail` / `mapServerList`: 서버 평면 `ReportTargetDto`를 프론트 discriminated union `ReportTarget`으로 변환
  - `REPLY` → `comment`: `courseId`는 `contextUrl`의 `/course/{id}` 파싱, `snippet`은 `title` 사용 (**서버 DTO에 전용 필드 없음 — best-effort**)
  - `USER` → `user`: `nickname`은 `title` 사용
  - `histories` → `history`, `reportId`/`reporterId` 문자열화, `assignedOperator` null 처리

### 3. `src/features/admin-report/api/adminReport.api.ts` — 관리자 신고
| 함수 | v5 엔드포인트 | 폴백 |
| --- | --- | --- |
| `fetchAdminReports` | GET `/api/admin/reports` (서버 enum으로 쿼리 변환) | BFF 목 |
| `fetchAdminReportDetail` | GET `/api/admin/reports/{reportId}` | BFF 목 |
| `patchAdminReportStatus` | PATCH `/api/admin/reports/{reportId}` (`{ status, note }`) | BFF 목 |
| `issueSanction` | **v5에 대응 엔드포인트 없음** | BFF 목 유지 |

- AbortSignal 취소는 폴백하지 않고 그대로 전파 (`axios.isCancel` 가드)
- 훅(`useAdminReportList`/`useAdminReportDetail`)과 화면은 무변경 — 응답을 기존 타입으로 매핑하므로

## 보류 항목 (백엔드 확인 필요)

| 항목 | 사유 |
| --- | --- |
| **관리자 문의(admin-inquiry) v5 전환** | v5 `GET /api/cs-inquiry`와 프론트 모델 괴리가 큼: ① 관리자용 **문의 상세 조회 엔드포인트 부재** ② 상태 enum 상이(`OPEN/ANSWERED/CLOSED` vs `OPEN/IN_PROGRESS/RESOLVED/CLOSED`) ③ 카테고리 enum 상이(`ACCOUNT/CONTENT/...` vs `GENERAL/BUG/SUGGESTION/OTHER`) ④ 커서 vs 오프셋 페이징 ⑤ 답변 수정/삭제/상태변경 엔드포인트 없음. → BFF 목 유지, 백엔드 보강 후 전환 권장 |
| 제재 발급 (`issueSanction`) | v5 명세에 제재 엔드포인트 없음 → BFF 목 유지 |
| 신고 사유 목록 서버 전환 | `fetchReportReasons` 준비 완료 — `ReportDialog`의 로컬 상수 대체는 선택 작업 |
| comment 대상의 `courseId`/`snippet`, user 대상의 `nickname` | 서버 `ReportTargetDto`에 전용 필드 없음 → `contextUrl`/`title`에서 best-effort 추출. 서버 필드 추가 요청 권장 |

## 검증

- `yarn tsc --noEmit` 통과
- `yarn build` 성공 (11.9s)
