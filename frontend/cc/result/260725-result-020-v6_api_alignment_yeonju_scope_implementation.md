# v6 API 정합화 — (연주) 담당 항목 구현 결과 (작업 3 제외)

> 근거 계획: [260725-plan-013](../plan/260725-plan-013-v6_api_alignment_yeonju_scope.md)
> 범위: 계획의 작업 1·2·4·5 전량. 작업 3(플랜 장소)은 백엔드 답변 대기로 미착수.
> 검증: `npx tsc --noEmit` **0 에러**. lint는 내 변경분에서 신규 오류 0건(기존 오류만 잔존, 빌드 시 무시됨).

---

## 작업 1 — 댓글 응답 DTO 전면 수정 (v6-006)

- `comment.types.ts`: `GetRepliesResponse{status,data}` → `ReplyListResponse{replies,hasNext}`; `ReplyItem`에 `replyCount`/`isDeleted`/중첩 `replies:ReplyListResponse` 추가; `ReplyMention.username`→`userNickname`; `PostCommentResponse`/`LikeCommentResponse` 삭제.
- `comment.api.ts`: 목록/대댓글 반환 `ReplyListResponse`; 작성·좋아요·좋아요취소 반환 `Promise<number>`(raw).
- `useComments.ts`: `res.data`→`res.replies`; state `ReplyItem[]`; 삭제/좋아요를 중첩 구조(`c.replies.replies`)로 갱신; **좋아요는 서버 number 응답을 읽지 않고 로컬 토글(±1)로 계산**; 답글 작성 시 `mentions:[userId]` 전송.
- `CourseViewPage.tsx`: 대댓글 렌더를 `comment.replies.replies`로; `isDeleted`면 "삭제된 댓글입니다" 표시 + 본문/좋아요/삭제·신고 숨김; 답글 대상에 `userId` 전달.

## 작업 2 — 플랜 확정 버그 (v6-004)

- `plan.types.ts`: `PlanDetail.userNickName`→`userNickname`; `PlanDetail.planImages` 삭제(PlanSummary.planImages는 유지); `CreatePlanBody.requiredTime/totalDistance`·`CreatePlanPlaceRequest.travelTime/stayTime` 필수화; 헤더 주석 v5→v6.
- `CourseViewPage.tsx`: `plan.userNickName`(3곳)→`userNickname`; 빠른 담기 clone에 `scheduledDate`(오늘) 기본 전송.
- `MyCourseDetailPage.tsx`: 사진 관리 시트 `plan.planImages`→`planImageUrls` (undefined 크래시 제거).
- `CourseCreationFlow.tsx`: 생성 요청에 프리뷰 응답의 `requiredTime`/`totalDistance` + 장소별 `travelTime(=duration)`/`stayTime`을 **order 기준 조인**으로 채움; 생성 프리뷰 요청에 `planDescription` 추가.
- `plan.api.ts`: `deletePlanImages` 직렬화 `join(',')`→`paramsSerializer:{indexes:null}`(반복 파라미터); 미사용 `fetchMyPlans`/`fetchMyScraps` 삭제.

## 작업 4 — 신고 admin 정합화 (v6-008)

- **PATCH 상태 타입 확대**: `adminReport.api.ts`·`useAdminReportDetail.ts`의 body status를 `'REVIEWING'|'REJECTED'`→`ReportStatus`(4종). BFF mock allowlist도 4종으로 확대, RESOLVED 직접 전이 시 `resolution` 기본값(NO_ACTION) 부여.
- **제재 등록 실연동**: `serverReportMapper.ts`에 `ServerSanctionResponse`+`mapServerSanction` 추가; `issueSanction`을 `apiClient.post('/api/admin/reports/{id}/sanctions', {type,durationDays,message,resolution})`(reportId 제거) 우선 호출 후 매핑, dev만 mock 폴백. (스웨거 확정: 200 / `sanctionId:int32` / 키 `adminReportDetailResponseDto`)
- **off-spec 정리**: `submitReport`를 `/api/report` 단일 경로로 단순화(비숫자 id 폴백·idempotency 제거); `useReport`에서 `reporterId`/`attemptId` 제거, 호출부 2곳(`CourseViewPage`/`UserProfilePage`) 인자 제거; `buildIdempotencyKey`를 배럴에서 제거.
- v5 주석 다수를 v6로 갱신.

## 작업 5 — 횡단 이슈 (§3)

- **userinfo mock 폴백 제거**: 비401 에러·예외를 mock 200으로 위장하지 않고 status 전파(로그인 오판 제거). `!baseUrl`은 dev만 mock, production→502.
- **mypage GET(profile/summary/scrapped/plans)·recent**: 동일 원칙 — 에러 시 mock 대신 status 전파, `!baseUrl` dev-only mock. plans/scrapped는 **204→빈 목록** 정규화.
- **admin 신고 클라 폴백 dev-gate**: fetch/detail/patch/sanction 폴백을 `NODE_ENV==='production'`이면 재throw(에러 표면화), dev는 mock 유지.
- **인기 API 단일화**: `place.api.ts`의 미사용 `fetchPopularPlaces`/`fetchNationwidePopularPlaces` + `place.types.ts`의 `PopularPlaceItem`/`PopularPlaceResponse`(dead code) 삭제 — 표준은 `main.api.ts`+BFF.

---

## 계획 대비 조정 사항 (구현 중 판단)

1. **인기 항목 `id:string→number` 교정은 보류**: 프론트 도메인(`BestPlace`/`Course`)·mock catalog가 string id에 결합돼 있어(usePaginatedList 제네릭 제약, page.tsx 핸들러·`BestPlace` 캐스트, 목 생성기까지 연쇄) 도메인 타입 동반 리팩터가 필요 → 별도 작업으로 분리. 타입에 NOTE 주석 추가(런타임은 문자열 강제라 무해). 인기 API의 **dead code 제거·단일화 자체는 완료**.
2. **삭제하지 못한 orphan 2개** (`rm` 권한 차단): `src/features/report/utils/buildIdempotencyKey.ts`, `src/app/api/reports/route.ts`. 모든 참조는 제거 완료(inert) — **수동 `git rm` 필요**.

## 작업 3 (플랜 장소) — 백엔드 답변 후 부분 반영

- **출발지(departurePoint) 해결·반영 완료**: 백엔드 확인 결과 "수정 요청에 담긴 출발지로 이동시간을 계산"(생략 불가) + "상세 응답에 departurePoint 추가하기로 결정". 이에 따라 프론트 배선 완료 —
  - `plan.types.ts` `PlanDetail`에 `departurePoint?: DeparturePoint | null` 추가.
  - `MyCourseDetailPage`의 순서 편집 미리보기·저장 요청에 `departurePoint: plan.departurePoint ?? undefined` 포함.
  - forward-compatible: 백엔드 필드 배포 전엔 undefined(현행 동일), 배포 후 자동 동작. tsc 0 에러.
  - 남은 것: 백엔드가 상세 응답에 departurePoint를 실제 배포하면 end-to-end 동작(배포 후 수동 확인).
- **미결(스탬프 location)**: "위치 없으면 프론트 block" 방향으로 논의 중 — 실내·timeout 사용자도 막히는 UX 확정 후 반영 예정.

## 미착수 / 유보

- 작업 2의 유보분: `totalDistance` 단위(km 표기 1000배 여부) 사용자 데이터 확인 후 라벨 수정, 본인 댓글 판별 userId 전환(userinfo userId 수급 선행).

## 검증

- `npx tsc --noEmit -p tsconfig.json` → **0 에러**.
- `yarn lint` → 내 변경분 신규 오류 0건. (잔존 오류는 전부 기존 코드: storybook renderer import, `<img>`, UserProfilePage rules-of-hooks, serverReportMapper의 기존 dead const 등 — 빌드 시 무시)
- 런타임 수동 확인은 백엔드(`localhost:3845`) 기동 + `NEXT_PUBLIC_API_BASE_URL` 설정 후 필요(현재 저장소에 `.env` 없음).
