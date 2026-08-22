# v6 API 정합화 구현 계획

> 근거 문서: [260723-ans-006-v6_API_클라이언트_적용_검토.md](../ans/260723-ans-006-v6_API_클라이언트_적용_검토.md)
> 기준 명세: [cc/api/v6/](../api/v6/)
> 범위: ① 미구현 엔드포인트 구현 ② 명세 불일치 수정 ③ 횡단 이슈 해결

---

## Phase 1 — 런타임 파손 위험 수정 (백엔드 연결 시 즉시 깨지는 것)

### 1-1. 댓글 응답 DTO 전면 수정 (검토 §2-1)

대상: `src/features/course-detail/types/comment.types.ts`, `api/comment.api.ts`, `hooks/useComments.ts`

1. `comment.types.ts` 재작성 — 명세 v6-006 기준:
   - `ReplyListResponse = { replies: ReplyResponse[]; hasNext: boolean }` (`data`/`status` 필드 제거)
   - `ReplyResponse`에 `replyCount`, `isDeleted` 추가, `replies`는 중첩 `ReplyListResponse` 타입으로
   - `ReplyMention.username` → `userNickname`
2. `comment.api.ts`:
   - 목록/대댓글 조회 반환 타입을 `ReplyListResponse`로 교체, 소비부는 `res.replies` 사용
   - 작성(POST)·수정·삭제·좋아요 응답을 raw `number`로 처리 (`{savedReplyId}`, `{status,data}` wrapper 제거)
3. `useComments.ts`:
   - `res.data` → `res.replies` (line 21 부근)
   - 좋아요 낙관적 업데이트(line 92 부근): 서버 응답에 `likeCount/isLiked`가 없으므로 로컬 계산(토글 + ±1)으로 변경
4. UI 컴포넌트에서 `username` 참조 전수 교체 (`grep -r "\.username" src/features/course-detail`)

검증: `yarn build`(tsc) + 댓글 목록/작성/좋아요 플로우 수동 확인.

### 1-2. 플랜 DTO 확정 버그 수정 (검토 §2-2, swagger 검증 완료)

대상: `src/features/plan/types/plan.types.ts`, `api/plan.api.ts`, `components/CourseCreationFlow.tsx`

1. `PlanDetail.userNickName` → `userNickname` (`plan.types.ts:44`) + 사용처 전수 교체
2. `planImages` 필드 제거, `planImageUrls`로 통일 (`plan.types.ts:50,178` + 사용처)
3. 이미지 삭제: `imageIds.join(',')` 제거, 배열 그대로 `params`에 전달해 axios 기본 직렬화(`imageIds=1&imageIds=2`) 사용 (`plan.api.ts:117`)
4. 플랜 생성 요청 보강 (`CourseCreationFlow.tsx:278-299`):
   - preview 응답(`CreatePlanPreviewResponseDto`)의 `requiredTime`, `totalDistance`, 장소별 `duration`(→`travelTime`)/`stayTime`을 생성 요청에 포함
   - `CreatePlanBody` 타입에서 명세 필수 필드의 optional 해제 (`plan.types.ts:61-71`)

### 1-3. plan-place 요청 보강 (검토 §2-3)

1. 수정 미리보기/확정 요청에 `departurePoint` 포함 (`MyCourseDetailPage.tsx:290,305`) — 플랜 상세 응답에 출발지가 없으므로, 상세 조회 시 보관 중인 값 또는 preview 응답의 `departurePoint`를 상태로 유지해 재전송
2. 스탬프: `location` null 시 요청을 막고 사용자에게 위치 권한 안내 (파트 생략 전송 금지, `MyCourseDetailPage.tsx:242-243`) — 백엔드 필수 여부는 백엔드 팀에 확인 후 완화 가능

---

## Phase 2 — 미구현 엔드포인트 구현 (검토 §1)

### 2-1. 인증: 토큰 재발급 + 회원 탈퇴

대상: `src/features/authentication/`, `src/app/api/sign/`

1. `GET /api/sign/reissue`
   - BFF 프록시 `src/app/api/sign/reissue/route.ts` 신설 (쿠키 전달, Set-Cookie 반영 — `logout/route.ts` 패턴 준용)
   - `authentication.api.ts`에 `reissueToken()` 추가
   - `apiClient` axios 인터셉터에 401 → reissue → 원요청 1회 재시도 로직 추가 (재시도 실패 시 로그아웃 처리). 무한루프 방지 플래그 필수
2. `DELETE /api/sign/delete`
   - BFF 프록시 `src/app/api/sign/delete/route.ts` 신설
   - `authentication.api.ts`에 `deleteAccount()` 추가
   - 마이페이지 설정 영역에 탈퇴 진입점 + 확인 모달 UI (기존 모달 컴포넌트 재사용), 성공 시 localStorage 정리 후 홈 이동

### 2-2. 댓글 수정 `PATCH /api/reply/{replyId}`

1. `comment.api.ts`에 `updateComment(replyId, { content, mentions? })` 추가 (응답 raw `number`)
2. `useComments.ts`에 수정 액션 + 로컬 상태 갱신
3. 댓글 아이템 UI에 본인 댓글일 때 "수정" 진입 → 인라인 편집 모드 (작성 입력 컴포넌트 재사용)

### 2-3. 문의 종료 `PATCH /api/cs-inquiry/{inquiryId}/close`

1. BFF `src/app/api/cs-inquiry/[id]/close/route.ts` 신설
2. `inquiry.api.ts`에 `closeInquiry(inquiryId)` 추가
3. 내 문의 상세에서 답변 존재 + 상태 `RESOLVED` 아닐 때 "문의 종료" 버튼 노출 (Phase 3-1 enum 정리와 함께 진행)

### 2-4. 최근 검색어 개별 삭제 `DELETE /api/recent` (body 포함)

1. `search.api.ts`: `deleteRecentSearch({ name, createdAt })` — `axios.delete(BASE, { data })` 패턴
2. BFF `recent/route.ts` DELETE 핸들러: body를 읽어 백엔드로 전달. 전체 삭제 UI는 유지하되 항목 순회 삭제로 구현하거나, 백엔드에 전체 삭제 지원 여부 확인 후 결정
3. `SearchPage.tsx`: 최근 검색어 칩에 개별 X 버튼 추가

### 2-5. `course-detail.api.ts` mock 정리

1. `fetchCourseDetail`/`fetchStampHistory` 소비처 확인 (`grep -r "course-detail.api" src`)
2. 소비처가 plan.api 기반으로 대체 가능하면 파일 삭제, 아니면 `GET /api/plan/{planId}` 연동으로 재작성. 스탬프 이력은 `PlanDetailDto.planPlaceDetailDtos[].isStamped` 기반으로 매핑

---

## Phase 3 — 체계 불일치 정합화

### 3-1. 고객 문의 경로/enum/필드 정합화 (검토 §2-4)

1. **enum 통일**: `InquiryStatus = OPEN | IN_PROGRESS | RESOLVED | CLOSED`를 `inquiry.types.ts`와 `adminInquiry.ts` 양쪽에 적용. UI 라벨/뱃지 매핑 갱신 (`PENDING/ANSWERED` 개념은 `hasAnswer` 필드로 대체)
2. **경로 수정**:
   - `fetchMyInquiries` → `GET /api/cs-inquiry/my` (BFF `cs-inquiry/my/route.ts` 신설, 기존 size-유무 분기 제거)
   - `createAnswer` → `POST /api/cs-inquiry/{id}/reply` (BFF `[id]/reply/route.ts` 신설, `[id]/route.ts`의 POST 핸들러 제거)
3. **필드 정리**: 수정 요청 `images` → `newImages`; `categoryId` 전송 제거; 목록 아이템 `categoryName` → `inquiryType` (+ `hasAnswer` 반영)
4. **admin-inquiry 이관**: `/api/admin/inquiries/**` mock 표면 폐기 →
   - 목록: `GET /api/cs-inquiry` (커서 `lastInquiryId` + `category`/`search`/`size`) — 페이지네이션을 page/size에서 커서로 전환 (무한스크롤 or "더보기")
   - 답변: `POST /api/cs-inquiry/{id}/reply` (`{ content }`)
   - 명세에 없는 기능(상태 직접 변경, 답변 수정/삭제)은 UI에서 제거하고 백엔드에 필요성 전달
   - `src/app/api/admin/inquiries/**` 라우트 삭제

### 3-2. 신고 admin 정합화 (검토 §2-5)

1. PATCH 상태 변경: 허용 status를 전체 `ReportStatus`로 확대 (`adminReport.api.ts:81`, BFF mock 제한 제거)
2. 제재 등록 실연동: `apiClient.post('/api/admin/reports/{id}/sanctions', { type, durationDays?, message, resolution })` — body에서 `reportId` 제거, 응답 매핑 `report` → `adminReportDetailResponseDto` (`serverReportMapper` 확장)
3. off-spec 정리: `POST /api/reports`(복수형) mock 라우트·폴백 삭제 (`src/app/api/reports/route.ts`, `report.api.ts:67`); `MySanctions` 타입은 대응 엔드포인트 확정 전까지 사용처 비활성 처리
4. Phase 4의 mock 폴백 정리와 함께 admin BFF mock(`useMock=true`) 제거

### 3-3. 마이페이지 DTO 정합화 (검토 §2-6)

1. `MyPlan` → 명세 `PlanSummary`로 재정의: `planId, planTitle, createAt, tripStartDate, tripEndDate, isPlanVisible, requiredTime, planImages` (`plan.types.ts:2-11`). `tripDate`/`placeCount`/`isPublic` 사용 UI를 새 필드로 매핑 (기간 표기 = start~end, placeCount 표기는 제거 또는 requiredTime으로 대체)
2. `GET /api/mypage/plans` 204 처리: BFF에서 204 → 빈 배열 응답으로 정규화하고 mock 제거
3. `UpdateProfileRequest` 3필드 optional화 (`profile.types.ts:7-11`) — 변경된 필드만 전송하도록 호출부 수정
4. 공개 토글: BFF가 백엔드 200/304를 그대로 status로 전달하거나 `{ changed: boolean }`으로 명시 변환 (`plan/visibility/[planId]/route.ts:33`)
5. 스크랩 목록 날짜 nullability는 백엔드 실응답 확인 후 non-null로 좁힘 (저위험, 마지막에)

### 3-4. 최근 검색어 소소한 정합 (검토 §2-7)

1. `POST /api/recent` 요청 body에서 `createdAt` 제거 (`search.api.ts:14-17`)
2. BFF 응답 status 201 → 200 (`recent/route.ts:38,54`)

---

## Phase 4 — 횡단 이슈 해결 (검토 §3)

### 4-1. mock 폴백 제거/게이팅

원칙: **에러를 에러로 전달**. BFF는 백엔드 응답 status/body를 투명하게 전달하고, mock은 환경변수로만 활성화.

1. 공통 유틸 `src/app/api/_lib/proxy.ts` 신설: 쿠키 전달 + 백엔드 fetch + status/body 그대로 반환 + `USE_API_MOCK=true`일 때만 mock 반환
2. 적용 대상 라우트: `sign/userinfo`, `mypage/profile`, `mypage/summary`, `mypage/scrapped`, `mypage/plans`, `recent`, `admin/reports/**`, `admin/inquiries(→폐기)`, `cs-inquiry/**`
3. **최우선**: `userinfo`의 비401 에러 → mock 반환 제거 (`sign/userinfo/route.ts:28-38`). 5xx는 5xx로 전달하고 `useAuth`는 401만 비로그인, 그 외 에러는 "확인 실패" 상태로 구분 (`useAuth.ts:19-22`)
4. 클라이언트 측 mock 폴백(`report.api.ts:67` 등)도 동일 원칙으로 제거

### 4-2. 인기 장소/플랜 API 단일화

1. 표준을 `place.api.ts`/`plan.api.ts`(apiClient 직행)로 정하고, `main.api.ts:11-52`의 중복 구현을 해당 함수 재사용으로 교체
2. 사용처(`src/features/main` 컴포넌트/훅) import 전환 후 BFF `src/app/api/place/popular*`, `plan/popular*` 라우트 삭제
   - 단, 비로그인 메인 노출을 위해 쿠키/인증 경유가 필요하면 BFF 유지 방향으로 반전 — 착수 전 확인 1건

### 4-3. admin 실연동 (3-1, 3-2에 포함)

admin-inquiry 이관과 신고 제재 실연동 완료 시 해소. 별도 작업 없음.

---

## 실행 순서·의존성 요약

| 순서 | 작업 | 의존성 |
| --- | --- | --- |
| 1 | Phase 1 (댓글 DTO, 플랜 확정버그, plan-place) | 없음 — 즉시 착수 가능 |
| 2 | Phase 4-1 중 userinfo 폴백 제거 | 없음 (인증 오판 위험 조기 제거) |
| 3 | Phase 2 (미구현: reissue/탈퇴/댓글수정/문의close/recent 개별삭제) | 2-3은 3-1 enum과 동시 진행 권장 |
| 4 | Phase 3 (cs-inquiry, 신고, 마이페이지 정합화) | 3-1 → 2-3 |
| 5 | Phase 4 나머지 (mock 폴백 일괄, popular 단일화) | Phase 3의 라우트 정리 이후 |

## 사전 확인 필요 (백엔드 팀)

1. 스탬프 `location` 필수 여부 (1-3)
2. `DELETE /api/recent` 전체 삭제 지원 여부 (2-4)
3. admin 문의의 상태 직접 변경·답변 수정/삭제 엔드포인트 추가 계획 (3-1)
4. `MySanctions` 대응 엔드포인트 존재 여부 (3-2)
5. 인기 API를 비로그인으로 직접 호출 가능한지 — BFF 유지 판단 (4-2)

## 공통 검증

- 각 Phase 완료 시 `yarn build` (tsc) + `yarn lint`
- 백엔드(`localhost:3845`) 기동 상태에서 해당 플로우 수동 확인
- mock 제거 라우트는 백엔드 다운 시 에러 UI가 정상 노출되는지 확인
