# v6 API 정합화 — (연주) 담당 항목 반영 계획

> 근거 문서: [cc/input/현 적용 api 검토 및 반영 필요사항.md](../input/현%20적용%20api%20검토%20및%20반영%20필요사항.md) 중 **(연주)** 표시 항목만
> 대상 섹션: §2-1 댓글, §2-2 플랜, §2-3 플랜 장소, §2-5 신고, §3 횡단 이슈
> 기준 명세: [cc/api/v6/](../api/v6/) · 전체 계획과의 관계: [260723-plan-011](260723-plan-011-v6_api_alignment_plan.md)의 부분집합(§2-4 고객문의·§2-6 마이페이지·§2-7 최근검색어·§1 미구현은 타 담당 범위)
> **2026-07-25 코드 재검증 완료** — 검토 문서(7/23) 이후 커밋 반영, 모든 file:line은 현재 코드 기준

---

## 검증 중 발견된 검토 문서와의 차이 (착수 전 인지 필요)

1. **`planImages` 절반만 off-spec**: `plan.types.ts:50`(PlanDetail)만 명세 외 필드. `plan.types.ts:178`(PlanSummary)은 v6-002 mypage 명세(`260723-v6-002-mypage.md:60`)에 실존하는 유효 필드라 **유지**해야 함. 일괄 rename 금지.
2. **`imageIds` 직렬화의 검토 문서 권고안은 부정확**: axios 1.x 기본 직렬화는 `imageIds[]=1&imageIds[]=2`(대괄호)라 Spring 파라미터명과 불일치. `paramsSerializer: { indexes: null }`로 `imageIds=1&imageIds=2` 형태를 만들어야 함.
3. **admin 신고는 "mock 전용"이 아니라 부분 연동 상태**: 목록/상세/상태변경은 apiClient 백엔드 직행 후 실패 시 BFF mock 폴백. **제재 등록만** mock 전용.
4. **인기 API 이중 구현 중 place.api 쪽은 dead code**: `place.api.ts:30-51`의 popular 2개 함수는 호출처 0곳 — 삭제만 하면 됨(소비자는 전부 `main.api.ts` 경유).

---

## 작업 1 — 댓글 응답 DTO 전면 수정 (§2-1, v6-006) 【우선순위 1】

스펙 백엔드 연결 시 댓글 목록 로드 자체가 TypeError로 전면 파손되는 항목. `/api/reply` 계열은 BFF 라우트 없이 apiClient가 백엔드에 직접 붙으므로 클라 타입이 명세와 직접 일치해야 함.

### 1-1. 타입 재작성 — `src/features/course-detail/types/comment.types.ts`

- `GetRepliesResponse { status, data, hasNext }`(:24-28) → 명세대로 `ReplyListResponse { replies: ReplyItem[]; hasNext: boolean }`
- `ReplyItem`(:6-17)에 `replyCount: number`, `isDeleted: boolean`, `replies: ReplyListResponse`(중첩) 추가. `ParentReplyItem`(:19-22, 평면 배열)은 제거 또는 `type ParentReplyItem = ReplyItem` alias
- `ReplyMention.username`(:3) → `userNickname` (사용처 없음 — 타입만 수정)
- `PostCommentResponse`(:36-38)·`LikeCommentResponse`(:40-47) 삭제 — 명세는 raw `number` 반환

### 1-2. API — `src/features/course-detail/api/comment.api.ts`

- `fetchComments`(:9-18)·`fetchChildReplies`(:42-54) 반환 타입 → `ReplyListResponse`
- `postComment`·`likeComment`·`unlikeComment` → `Promise<number>` (`apiClient.post<number>` 등), import 정리

### 1-3. 훅 — `src/features/course-detail/hooks/useComments.ts`

- :4 import `ParentReplyItem` → `ReplyItem`, :7 state 타입 `ReplyItem[]`
- :21 `res.data` → `res.replies`
- confirmDelete(:72): 중첩 구조 반영 — `replies: { ...c.replies, replies: c.replies.replies.filter(...) }` (:73 `replyCount - 1`은 그대로 유효)
- toggleLike(:86-117): 서버 응답에서 `likeCount/isLiked`를 읽지 말고 **클라이언트 계산**(`!isLiked`, `likeCount ± 1`)으로 변경. 대댓글 브랜치(:99-110)도 `c.replies.replies.map(...)` 경로로 동일 적용

### 1-4. UI — `src/features/course-detail/components/CourseViewPage.tsx`

- :403 `comment.replies.length` → `comment.replies.replies.length`, :405 `comment.replies.map` → `comment.replies.replies.map`
- `isDeleted` 처리 추가: 삭제된 댓글은 "삭제된 댓글입니다" 플레이스홀더(본문/좋아요/삭제·신고 숨김)

### 1-5. 선택 개선 (같은 파일을 여는 김에)

- **멘션 전송**: 답글 작성 시 `mentions: [userId]` 미전송 — 3개 지점 동시 수정 필요: `useComments.ts:12` replyTarget 타입에 `userId` 추가 → `CourseViewPage.tsx:365` setReplyTarget에 `comment.userId` 전달 → `useComments.ts:48` body에 `mentions` 추가
- **답글 더보기**: 데드코드인 `fetchChildReplies`를 `comment.replies.hasNext` 기반 "답글 더보기" 버튼에 연결
- 본인 댓글 판별(닉네임 문자열 비교 :370,:428)의 userId 전환은 **보류** — userinfo 응답에 숫자 userId가 없어 선행 작업 필요(사전 확인 Q6)

---

## 작업 2 — 플랜 DTO 확정 버그 수정 (§2-2, v6-004) 【우선순위 2】

### 2-1. `userNickName` → `userNickname` (확정 버그)

- `src/features/plan/types/plan.types.ts:44` rename
- 사용처는 정확히 3곳: `CourseViewPage.tsx:131`(신고 ownerId), `:216`(alt), `:223`(닉네임 표시) — 전부 수정 후 `rg -n 'userNickName' src/` 0건 확인

### 2-2. `PlanDetail.planImages` 삭제 (런타임 크래시 경로 실재)

- `plan.types.ts:50` 삭제 (`planImageUrls`만 유지). **`:178` PlanSummary는 유지**(위 차이 1번)
- `src/features/my-course/components/MyCourseDetailPage.tsx:992` `plan.planImages.length` → `plan.planImageUrls.length`, `:995` map 동일 교체 — 사진 관리 바텀시트 오픈 시 `undefined.length` 크래시 제거

### 2-3. 플랜 생성 요청 필수 필드 보강

- `plan.types.ts`: `CreatePlanPlaceRequest`(:54-59)의 `travelTime/stayTime`, `CreatePlanBody`(:61-71)의 `requiredTime/totalDistance` 필수화
- `src/features/course-creation/components/CourseCreationFlow.tsx` finalPlan(:272-314): `serverPreview`에서 `requiredTime/totalDistance` 채우고, places는 **order 기준으로 프리뷰 places와 조인**해 `travelTime: preview.duration, stayTime: preview.stayTime` 부여 (placeId 조인은 동일 장소 중복 시 모호 — 보조 검증용)
- 프리뷰 실패(serverPreview=null) 경로: 0 기본값 허용 여부는 사전 확인 Q1 이후 확정
- createPlanPreview 호출(:241-261)에 `planDescription` 함께 전송(명세 필드인데 미전송 중)

### 2-4. 이미지 삭제 `imageIds` 직렬화

- `src/features/plan/api/plan.api.ts:115-117`: `params: { imageIds }` + `paramsSerializer: { indexes: null }` (위 차이 2번). 현재 호출처 0곳이라 전파 없음

### 2-5. 부수 정리 (검증 중 신규 발견)

- `CourseViewPage.tsx:142` `clonePlan(plan.planId)` 바디 없이 호출 — 명세 `PlanCopyRequestDto.scheduledDate`는 optional 표기 없음. `plan.types.ts:110-112` `scheduledDate` 필수화 + `plan.api.ts:122-124` `body = {}` 기본값 제거로 tsc가 호출부를 잡게 한 뒤, 날짜 선택 모달 또는 기본값 전달 (`MyCourseDetailPage.tsx:323`은 이미 올바름)
- `CourseCreationFlow.tsx:1315` `총 이동 {totalDistance}km` — 명세상 m 단위면 1000배 오표기. 단위 확인(Q2) 후 변환
- `plan.types.ts:1` 헤더 주석 v5 → v6 갱신. `plan.api.ts:153-161` `fetchMyPlans/fetchMyScraps`는 my-page.api와 중복 + 호출처 0곳 — 삭제

---

## 작업 3 — 플랜 장소 (§2-3, v6-005) 【백엔드 확인 선행 — 우선순위 5】

### 3-1. `departurePoint` 누락 (수정 미리보기/확정)

`MyCourseDetailPage.tsx:289-291,:305`가 `{ places }`만 전송하는데, **현재 클라이언트에는 기존 플랜의 출발지를 얻을 소스가 없음** (GET /api/plan/{planId} 응답 PlanDetailDto에 departurePoint 없음). 프리뷰 응답 재사용안도 프리뷰 요청 자체가 departurePoint를 생략해 에코형 응답이면 null(순환 의존) — **백엔드 확인 없이는 완결 수정 불가**.

- 선행: 사전 확인 Q3 — (a) PlanDetailDto에 departurePoint 추가 또는 (b) 생략 시 저장된 출발지 fallback(+프리뷰 응답에 채워 반환) 확인
- (a) 시: `plan.types.ts` PlanDetail에 `departurePoint` 추가 → 두 호출 모두 body에 전달
- (b) 시: confirmReorder(:301-316) body를 `{ departurePoint: reorderPreview.departurePoint ?? undefined, places }`로, 가드에 `!reorderPreview` 추가
- 확정 후 `plan.types.ts:101` `departurePoint?` → 필수로 타입 정렬 (전파: `plan.api.ts:47-68` 시그니처 + 이 화면 2곳뿐)

### 3-2. 스탬프 `location` null 시 파트 생략

- 사전 확인 Q4(필수 여부) 후: 필수면 `MyCourseDetailPage.tsx` handleStampFileSelected(:237-263)에서 `!location`이면 위치 권한 안내 토스트 후 차단 + `plan.api.ts:85-101` 시그니처 non-null화(:92-94 분기 제거). 선택이면 현행 유지 + 주석 명시

### 3-3. 부수: 생성 프리뷰 요청 필수 필드

`plan.api.ts:71-79` 인라인 타입 전부 optional + `CourseCreationFlow.tsx:241-261` departurePoint/날짜 조건부 생략 — 수정 경로와 같은 클래스의 누락 가능성. 2-3 작업 시 함께 타입 필수화 검토.

---

## 작업 4 — 신고 admin 정합화 (§2-5, v6-008) 【우선순위 3】

### 4-1. PATCH 상태 변경 허용 범위 확대

- `adminReport.api.ts:81` + `useAdminReportDetail.ts:12`의 body 타입 `'REVIEWING'|'REJECTED'` → `ReportStatus` (`@/features/report/types/report`에서 type import — 클라 enum은 이미 명세와 동일). UI 리터럴은 그대로 할당 가능해 변경 불요
- BFF mock `admin/reports/[reportId]/route.ts:57` allowlist → 전체 4개 status. 단 `_mock.ts:224-227`이 REJECTED에만 resolution을 설정하므로 RESOLVED 전이 허용 시 resolution 처리(기본값 NO_ACTION 등)를 mock에 함께 반영
- RESOLVED 직접 전이 허용 여부는 사전 확인 Q7 — 타입은 명세대로 넓히되 UI 버튼 추가는 별도 판단

### 4-2. 제재 등록 실연동 (mock 전용 → 백엔드 호출) — **이 작업의 핵심**

현재 제재가 어떤 백엔드에도 기록되지 않는데 UI는 성공으로 표시됨.

- `serverReportMapper.ts`에 `ServerSanctionResponse { sanctionId: number; adminReportDetailResponseDto: ServerAdminReportDetail }` + `mapServerSanction()` 추가 → `{ sanctionId: String(...), report: mapServerDetail(...) }` 변환 (스웨거 확정: 응답 200, `sanctionId`는 int32, 키 이름 `adminReportDetailResponseDto` 그대로). 클라 내부 타입·`SanctionForm`·`useIssueSanction`은 무수정
- `adminReport.api.ts:100-108` issueSanction 재작성: fetch/patch와 동일 패턴으로 `apiClient.post('/api/admin/reports/${id}/sanctions', { type, durationDays, message, resolution })` 우선(**body에서 reportId 제거** — 명세 외 필드) → 실패 시 기존 BFF mock 폴백. 스웨거상 required는 `type`/`resolution`뿐(`message`는 minLength 1만) — 현행대로 4필드 전송 유지
- `:99`의 낡은 주석("v5 명세에 대응 엔드포인트 없음") 갱신 — v6에서 신설됨

### 4-3. off-spec 정리

- `src/app/api/reports/route.ts`(복수형) **삭제 확정** — 스웨거 paths 전수 확인 결과 백엔드에 `/api/reports` 경로 자체가 없음(단수 `/api/report`만 존재). "URL만 교정" 대안도 성립 안 함(전달 body가 클라 내부 ReportPayload 형태 + 비숫자 mock id는 백엔드로 보낼 수 없는 데이터). 함께 정리: `report.api.ts:66-77` 폴백 분기, `buildIdempotencyKey.ts` + 배럴 export, `useReport.ts:65-68`의 ctx 인자
- MySanctions(하드코딩 mock 화면): "내 제재 목록" API는 스웨거 48개 경로에 **현재 없음 확정** — 신설 요청 vs 명시적 비활성은 팀 결정(사전 확인 Q5). 확정 전 타입 유지
- fetch/patch의 catch→mock 폴백(:47-55,:68-76,:89-95)은 작업 5-3에서 일괄 처리

### 4-4. 부수 정리

- v5 명세 참조 주석 일괄 갱신: `report.api.ts:12,43,80`, `adminReport.api.ts:20,49,70,90`, `serverReportMapper.ts:1`
- `SanctionType`/`Resolution` enum 3곳 중복 정의 — 단일 소스 통합(선택)

---

## 작업 5 — 횡단 이슈 (§3) 【5-1은 우선순위 2와 동시 착수】

원칙: **에러를 에러로 전달**. mock은 dev(`!baseUrl` + non-production)에서만.

### 5-1. `userinfo` mock 폴백 제거 (최우선 — 로그인 오판 제거)

- `src/app/api/sign/userinfo/route.ts`: 비401 에러(:30-33)·catch(:36-39)의 MOCK_USER_INFO 반환 제거 → status 전파/502. `!baseUrl`(:11-13)은 production이면 502 (`reports/route.ts:8-17` 패턴 준용)
- 영향: `useAuth.ts:23-27` catch가 이미 미로그인 처리 — 백엔드 다운 시 "로그인 오판" 대신 안전한 미로그인 폴백, 추가 수정 불요. 5xx를 401과 구분하려면 `authentication.api.ts:25-28`에서 status 노출(선택)

### 5-2. mypage GET 계열 + recent mock 폴백 제거

- 대상: `mypage/profile`(GET)·`summary`·`scrapped`·`plans` + `recent` 라우트 — `!res.ok`→status 전파, catch→502, `!baseUrl`→dev만 mock
- `plans/route.ts`는 추가로 :24의 `body.status >= 400` mock 폴백 분기 제거 + **204 명시 처리**(204 → `{ plans: [] }` 200)
- 영향 확인: ProfilePage는 plans/summary/scrapped error state 이미 존재(:35,:45,:49) — **profile 로드 catch(:145-147, console만)만 보강**. `SearchPage.tsx`(:51,:101,:251)는 best-effort 처리(실패 시 목록 숨김, 401 조용히 무시)
- 제외: `mypage/profile` PATCH·`plan/visibility`는 이미 에러 전파, popular 4종은 이미 502 처리

### 5-3. admin 신고 폴백 정리 (작업 4와 연계)

- `adminReport.api.ts`의 catch→BFF mock 폴백 3곳 제거 또는 dev 전용 게이트 — 특히 patchAdminReportStatus 폴백은 백엔드 실패를 mock 성공으로 위장
- BFF 3종의 `useMock = true` 하드코딩(`admin/reports/route.ts:16`, `[reportId]/route.ts:7`, `sanctions/route.ts:6`) → env 기반 전환 또는 직행 확정 후 라우트 제거
- 영향: `useAdminReportList.ts:87`, `useAdminReportDetail.ts:25,38`, `useIssueSanction.ts:17`의 error state 렌더링 확인
- **경계**: cs-inquiry admin(`admin/inquiries/*`, `cs-inquiry/*`)은 타 담당 범위 — 동일 패턴 존재 사실만 인계

### 5-4. 인기 API 이중 구현 단일화

- `place.api.ts:30-51` popular 2개 함수 + `place.types.ts:27-45` 타입 삭제 (dead code — 호출처 0곳 확인됨). 표준은 `main.api.ts` + BFF 유지
- 항목 타입 교정: `main/types/popular-place.types.ts:2`·`popular-plan.types.ts:2`의 `id: string` → `number`로 **교정 확정** (스웨거 PopularPlanItemDto/PopularPlaceItemDto 모두 `id: int32`) — 라우팅 파라미터·key 사용처 점검 포함

---

## 실행 순서

| 순서 | 작업 | 비고 |
| --- | --- | --- |
| 1 | 작업 1 (댓글 DTO) | 즉시 착수 가능, 런타임 전면 파손 방지 |
| 2 | 작업 2 (플랜 확정 버그) + 5-1 (userinfo) | 즉시 착수 가능 |
| 3 | 작업 4 (신고: PATCH 확대·제재 실연동·off-spec 정리) | 즉시 착수 가능 |
| 4 | 작업 5-2, 5-3, 5-4 (mock 폴백 일괄·popular 단일화) | 4 이후 (admin 폴백은 4와 연계) |
| 5 | 작업 3 (plan-place) | **백엔드 답변(Q1, Q2) 대기** — 질의는 1번과 동시에 발송 |

## 스웨거(api-docs.json) 재검토로 해소된 항목 — 질의 불필요 (2026-07-25 확정)

- **댓글 응답 wrapper 없음**: 전 reply 엔드포인트가 raw 반환 확정 — GET → `ReplyListResponse`, POST 201 → `integer`, PATCH/DELETE/좋아요 200 → `integer`. 실응답 샘플 없이 작업 1 착수 가능
- **제재 등록**: 응답 200 + `{ sanctionId: int32, adminReportDetailResponseDto }` 확정. 요청 required는 `type`/`resolution`뿐, `reportId` 없음
- **신고 상태 PATCH**: enum 전체 4종(`PENDING|REVIEWING|RESOLVED|REJECTED`) 스키마 확정
- **인기 목록 항목 `id`**: 플랜/장소 모두 `int32` 확정 → 클라 `string` 교정 확정
- **`/api/reports`(복수형) 백엔드에 없음**: 스웨거 48개 경로 전수 확인 — BFF 라우트 삭제 확정
- **사용자 "내 제재 목록" API 없음**: 경로 전수 확인 — MySanctions는 팀 결정 사안으로 이동
- **`imageIds`**: query `int32[]` required 확정. **`PlanDetailDto`에 departurePoint 없음** 재확정(21개 필드 전수) — Q1 블로킹 유지
- (타 담당 참고) `GET /api/mypage/plans` 204 정의 확정, `DELETE /api/recent` body `{name, createdAt}` 확정, `POST /api/recent` 응답 200 확정

## 사전 확인 필요 (백엔드 팀 질의 — 착수 시점에 일괄 발송)

> 주의: 스웨거 `required` 배열은 75개 스키마 중 4개에만 정의됨 — required 부재를 "optional 확정"으로 읽으면 안 됨.

1. **plan-place preview/update의 `departurePoint`** (작업 3 블로킹): 생략 시 저장된 출발지 유지/덮어쓰기 여부, PlanDetailDto에 departurePoint 추가 가능 여부
2. **스탬프 `location` 파트 필수 여부** (작업 3 블로킹): 생략 시 400인지, 위치 검증 생략 승인인지
3. `POST /api/plan/create`가 requiredTime 등 누락 바디를 400 처리하는지, 프리뷰 실패 시 0 기본값 허용되는지 + `totalDistance` 단위(스웨거 int32 — m 방증) 및 프리뷰 `duration` = 요청 `travelTime` 동일 의미·단위 여부
4. `GET /api/sign/userinfo` 응답 스키마(스웨거는 빈 object) — 숫자 `userId` 포함 여부 (본인 댓글 판별 userId 전환의 선행 조건)
5. 세부 런타임 동작 (구현과 병행 확인 가능): 최상위 댓글 `parentReplyId` 값(null/0/생략), `lastReplyId=0` 첫 페이지 해석, isDeleted 댓글의 content 마스킹 여부, RESOLVED 직접 전이 비즈니스 규칙, clone `scheduledDate` 실제 필수 여부, 삭제용 이미지 `imageId` 노출 방법, "내 제재 목록" API 신설 계획

## 공통 검증

- 작업 단위마다 `yarn build`(tsc) + `yarn lint`
- 백엔드(`localhost:3845`) 기동 상태에서 해당 플로우 수동 확인: 댓글 목록/작성/대댓글/좋아요, 플랜 생성·상세·사진 시트, 순서 편집 저장, 스탬프, admin 신고 목록/상태변경/제재, 로그인 판정
- mock 폴백 제거 라우트는 백엔드 다운 시 에러 UI 정상 노출 확인 (성공 위장 재발 방지)
