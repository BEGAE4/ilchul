# v5 연동 — 백엔드 요청 필요 / 보류 / 미반영 항목 통합 정리

> 작업일: 2026-07-05 / 브랜치: `feature-fe-admin`
> 출처: [011](260705-result-011-plan_api_integration.md) · [012](260705-result-012-plan_api_v5_migration.md) · [013](260705-result-013-place_api_v5_integration.md) · [014](260705-result-014-report_admin_api_v5_integration.md) · [015](260705-result-015-plan_mock_removal_error_ui.md) · [016](260705-result-016-mycourse_stamp_preview_images.md)
> 기준 명세: [cc/api/v5/](../api/v5/260705-v5-000-overview.md)

---

## A. 백엔드 수정/추가 요청 필요 (프론트 작업이 막혀 있는 항목)

| # | 도메인 | 항목 | 내용 | 막힌 프론트 기능 |
| --- | --- | --- | --- | --- |
| A-1 | plan | **플랜 이미지 ID 부재** | `PlanDetailDto.planImages`가 URL 문자열 배열 → 삭제 API(`DELETE /api/plan/{planId}/images?imageIds=`)가 요구하는 ID와 매핑 불가. `{ imageId, url }[]` 형태로 변경 요청 | 플랜 사진 **삭제** (업로드는 연동 완료, 시트에 안내 문구 표기 중) |
| A-2 | plan | **여행 기록(리뷰) 저장 API 부재** | 플랜에 대한 사용자 여행 기록/후기 저장 엔드포인트 없음 | `MyCourseDetailPage` 여행 기록 섹션 — 현재 화면 로컬 상태로만 동작 (새로고침 시 소실) |
| A-3 | place | **장소 상세에 반응 상태 필드 부재** | `PlaceDetailResponseDto`에 `isLiked`/`likeCount`/`isBookmarked`/`bookmarkCount` 없음 | 장소 상세의 좋아요·스크랩 **초기값** — 첫 토글 응답 전까지 0/false로 표시 |
| A-4 | report | **신고 대상 컨텍스트 필드 부족** | `ReportTargetDto`에 comment의 `courseId`/`snippet`, user의 `nickname` 전용 필드 없음 | 관리자 신고 목록/상세의 대상 표시 — `contextUrl`/`title`에서 best-effort 추출 중 |
| A-5 | admin | **관리자 문의 상세 조회 엔드포인트 부재** | v5에 `GET /api/cs-inquiry/{inquiryId}` (관리자용 상세) 없음 | 관리자 문의 상세 화면 — BFF 목 유지 중 (B-1 참고) |
| A-6 | admin | **제재(sanction) 엔드포인트 부재** | 신고 처리 시 제재 발급 API 없음 | 관리자 신고 상세의 제재 발급 — BFF 목 유지 중 |

## B. 명세 괴리로 보류 (백엔드 협의 후 전환)

| # | 도메인 | 항목 | 괴리 내용 |
| --- | --- | --- | --- |
| B-1 | admin | **관리자 문의(admin-inquiry) v5 전환 전체 보류** | ① 상세 조회 엔드포인트 부재(A-5) ② 상태 enum 상이: 프론트 `OPEN/ANSWERED/CLOSED` vs 서버 `OPEN/IN_PROGRESS/RESOLVED/CLOSED` ③ 카테고리 enum 상이: `ACCOUNT/CONTENT/REPORT_APPEAL/BUG/FEATURE/ETC` vs `GENERAL/BUG/SUGGESTION/OTHER` ④ 페이징 방식: 오프셋(page/size) vs 커서(lastInquiryId) ⑤ 답변 수정/삭제/문의 상태변경 엔드포인트 없음 → 현재 BFF 목 유지 |
| B-2 | plan | **복제 시 시간 미지원** | `PlanCopyRequestDto`가 `scheduledDate`(날짜)만 지원 → 시작/종료 시간은 복제 후 `PATCH /api/plan/{planId}`로 우회 반영 중. 복제 요청에 시간 포함 검토 요청 |
| B-3 | plan-place | **스탬프 `location` 파트 형식 미확정** | multipart의 `location`을 JSON Blob(`application/json`)으로 전송 중 — 서버 `@RequestPart` 매핑 방식 확인 필요 |
| B-4 | cs-inquiry | **문의 작성/수정 요청 형식 이상** | OpenAPI상 `CreateCsInquiryRequestDto`/`UpdateCsInquiryRequestDto`가 **query 파라미터**로 정의됨(이미지 binary 포함) — 실제 multipart 여부 확인 필요 |
| B-5 | comment | **댓글 좋아요 응답 타입 확인** | v5 응답이 `Integer` 단일 값 — v4는 `{ likeCount, isLiked }` 객체였음. 현재 프론트는 객체 기준으로 동작 중이라 확인 필요 |

## C. 스키마 미정의로 보류

| # | 도메인 | 항목 | 내용 |
| --- | --- | --- | --- |
| C-1 | plan | `GET /api/plan` (좋아요순 목록) | 파라미터·응답 스키마 미정의(200만 명시). 확정 시 홈 목데이터 캐러셀 대체 후보 |
| C-2 | place | `POST /api/place/recommend` (설문 기반 추천) | 응답이 `object`로만 정의 → `recommendPlaces()`는 `unknown` 반환으로 준비만 완료. **코스 생성 플로우의 추천 장소(RECOMMENDED_PLACES 목데이터) 대체의 선결 조건** |
| C-3 | auth | `GET /api/sign/userinfo` | 응답 스키마 `object` — 실제 필드 확인 필요 |

## D. API 함수는 준비 완료, UI 연동 대기 (프론트 후속 작업)

| # | 도메인 | 항목 | 준비된 함수 | 남은 작업 |
| --- | --- | --- | --- | --- |
| ~~D-1~~ | place | ~~장소 후기 작성~~ | `writePlaceReview` | ✅ **처리 완료** (2026-07-05) — 장소 상세에 후기 작성 폼 추가 |
| ~~D-2~~ | place | ~~후기 더보기(커서 페이징)~~ | `fetchPlaceReviews` | ✅ **처리 완료** (2026-07-05) — "후기 더 보기" 버튼 추가 |
| D-3 | place | 장소 검색 | `searchPlaces` | 검색 페이지가 로컬스토리지+목데이터 기반 — 검색 결과 연동 별도 작업 |
| D-4 | place | 인기 장소 v5 직접 호출 | `fetchPopularPlaces`/`fetchNationwidePopularPlaces` | 현재 BFF 라우트(`src/app/api/place/popular`) 사용 화면의 교체 |
| D-5 | report | 신고 사유 목록 서버 전환 | `fetchReportReasons` | `ReportDialog`의 로컬 상수(`reasonsByTarget`) 대체 |
| D-6 | plan | 내 플랜/스크랩 목록 v5 직접 호출 | `fetchMyPlans`/`fetchMyScraps` | `ProfilePage`는 기존 BFF(`/api/mypage/plans`) 경유 중 — 직접 호출 전환 |

## E. 목데이터가 남아 있는 화면 (서버 전용 전환 후속 대상)

| # | 화면 | 상태 |
| --- | --- | --- |
| E-1 | 홈/검색의 플랜·장소 목록/캐러셀 | `MOCK_COURSES` 등 목데이터 기반. C-1(좋아요순)·D-4(인기 장소) 확정 시 대체 |
| E-2 | `ProfilePage` 'courses'/'bookmarks' 탭 | `useCourseStore` 기반 ('plans' 탭만 서버 연동됨). D-6과 함께 전환 권장 |
| E-3 | 코스 생성 플로우의 추천 장소 | `RECOMMENDED_PLACES` 목데이터 — C-2(추천 API 스키마) 확정이 선결 조건 |
| E-4 | 장소 상세의 목데이터 폴백 | plan과 달리 place는 아직 하이브리드(숫자 id만 서버) — 목 제거 + 에러 UI 전환은 plan 방식([015](260705-result-015-plan_mock_removal_error_ui.md)) 재적용 |
| E-5 | 사용자 신고의 목데이터 폴백 | 비숫자 대상 id는 BFF 목(`/api/reports`) 경유 — E-1~E-4 전환 완료 후 제거 가능 |
| E-6 | 관리자 신고의 BFF 폴백 | v5 실패 시 목 폴백 유지 중 — 백엔드 안정화 후 폴백 제거 검토 |

## F. 기타 참고

- 장소 상세의 **영업시간**: v5 응답에 없음 → 서버 장소는 `-`로 표시하도록 처리 완료 (2026-07-05). 서버에 영업시간 필드 추가 시 교체
- 후기 작성/더보기 UI 연동 시 확인된 사항: 후기 작성은 로그인 필요(401) — 실패 시 에러 토스트 처리, 서버 후기 응답에 별점 없음(기존 F 항목 동일)
- 서버 장소 **후기에 별점 없음**: `PlaceReviewResponseDto`에 rating 부재 → 별점 UI는 서버 후기에서 숨김 처리
- `CourseViewPage`의 "관련 플랜" 섹션: 목데이터 기반이라 제거함 — 대응 API(예: 동일 지역 인기 플랜) 생기면 복원 가능
