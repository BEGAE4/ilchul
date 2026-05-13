# cc/api/v1 명세 ↔ 현재 UI 구현 갭 분석 (2차)

- **검토일**: 2026-05-09
- **이전 검토**: [api-check-result.md](api-check-result.md) (2026-05-06)
- **검토 범위**: [cc/api/v1/](v1/) 8개 파일 — `auth / main / place / plan / comment / mypage / search / magazine` (총 ~50개 엔드포인트)
- **비교 대상**: 현재 [src/app/](../../src/app/) · [src/features/](../../src/features/) 전체 (홈/인트로/로그인/검색/장소/코스/생성/마이/프로필/매거진/피드)
- **결론 요약**:
  - 1차 검토에서 "신규 필요"로 분류된 30+ 엔드포인트 중 **대부분이 v1 명세에 추가됨** (auth/mypage/search/magazine 신규, place·plan·comment 보강).
  - 그러나 **명세는 작성되었지만 UI에서 호출하는 코드는 거의 없는 상태**. 즉 1차의 "명세 누락" 문제는 해결되었고, 이제 "**구현 누락(UI ↔ 백엔드 미연결)**"이 핵심 이슈.
  - 추가로 **명세 ↔ BFF/UI 간 필드명/스키마 불일치**가 다수 발견되어 즉시 정리 필요.

---

## 0. 1차 검토 대비 변경점 요약

| 영역 | 1차 결론 | 2차 현황 |
| --- | --- | --- |
| 인증 (AUTH-1~4) | 명세 부재 | ✅ [auth.md](v1/auth.md) 신규 작성 |
| 마이페이지 (MY-1~7) | 명세 부재 | ✅ [mypage.md](v1/mypage.md) 신규 작성 |
| 검색 (SEARCH-1~3) | 명세 부재 | ✅ [search.md](v1/search.md) 신규 작성 |
| 매거진 (MAG-1~3) | 명세 부재 | ✅ [magazine.md](v1/magazine.md) 신규 작성 |
| 플랜 생성/수정/삭제/clone/순서/스탬프/신고/공유 | 명세 부재 | ✅ [plan.md](v1/plan.md) 보강 |
| 장소 상세/좋아요/스크랩/후기 (PLACE-N1~N6) | 명세 부재 | ✅ [place.md](v1/place.md) 보강 |
| 댓글 신고 (CMT-N1) | 명세 부재 | ✅ [comment.md](v1/comment.md) 보강 |
| `/api/plan/popular` MAIN-57 ↔ 플랜-5 중복 | 1차 지적 | ⚠️ 여전히 중복(2-1 참고) |

---

## 1. 🔴 중복 / 충돌 (즉시 정리 필요)

### 1-1. `/api/plan/popular` 중복 (1차에서 이미 지적, 미해결)
- [main.md L2-60](v1/main.md) MAIN-57 vs [plan.md L1 좋아요](v1/plan.md) 부근 응답 스키마.
- 현행 [plan.md](v1/plan.md)는 더 이상 "플랜-5"라는 항목이 없고 GET 좋아요순 자체는 삭제됐으나, MAIN-57 응답에 `tags/likes/ranking`을 쓰는 데 반해 GET `/api/plan/{planId}` 상세는 `tags/likeCount/isLiked`를 사용 — **동일 도메인 응답 키 불일치**.
- **권장 조치**: `likes` ↔ `likeCount` 중 하나로 통일 (백엔드 표준 `likeCount` 권장).

### 1-2. 플랜 카드/상세 응답 키 불일치
v1 명세 내부에서도 동일 객체에 대해 키가 들쭉날쭉.

| 필드 의미 | MAIN-57 / MAIN-58 | GET `/api/plan/{planId}` | POST `/api/plan-place/duration` & PLACE-19 |
| --- | --- | --- | --- |
| 썸네일 | `thumbnail` | `thumbnailUrl` | (해당 없음) |
| 장소 이미지 | (해당 없음) | `placeImage` | `placeImageUrl` |
| 주소 | `location` (요약) | `address` | `roadAddressName` |
| 순서 | (해당 없음) | `orderIndex` | `order` |
| 좋아요 수 | `likes` | `likeCount` | (해당 없음) |
| 플랜 장소 ID | (해당 없음) | `planPlaceId` | (응답에 누락) |

→ 백엔드 구현 시 **DTO 일관성**이 깨질 위험이 큼. **명세 단위 회의 1회 권장**.

### 1-3. 검색 응답 스키마 내부 불일치
- [SEARCH-1](v1/search.md) 응답 `places[]` 항목에 `roadAddressName` 사용.
- [SEARCH-2 autocomplete](v1/search.md) 응답 `places[]` 항목에 `location` 사용.
- 같은 검색 엔드포인트군에서 같은 객체의 주소 키가 다름 → **`roadAddressName`로 통일 권장** (PLACE-4와도 일치).

### 1-4. MY-5 명세 ↔ BFF 응답 형태 충돌
- [mypage.md L194-201](v1/mypage.md) 응답: `{ status: 200, data: { planId, isPlanVisible } }`
- 실제 BFF [src/app/api/mypage/plan/visibility/[planId]/route.ts L33](../../src/app/api/mypage/plan/visibility/[planId]/route.ts#L33): `NextResponse.json({ status: data.status ?? res.status })` — `data.planId/isPlanVisible`을 **의도적으로 버림**.
- 클라이언트 [my-page.api.ts L17-23](../../src/features/my-page/api/my-page.api.ts#L17) 시그니처도 `Promise<{ status: number }>`만 받음.
- **권장 조치**: 명세 MY-5의 `data` 필드를 삭제하거나, BFF가 backend의 `data`를 그대로 forward하도록 수정. UI에서 토글 후 즉시 갱신을 위해 `data: { planId, isPlanVisible }` 형태가 더 유용 → **백엔드에 맞춰 전부 통일**.

---

## 2. 🟡 명세는 있으나 UI 미연결 (구현 누락)

> 1차에서 "명세 누락"으로 분류된 항목 대부분이 명세는 추가됐으나, UI는 여전히 mock/store에 의존. 우선순위 🔥 > ⭐ > ○.

### 2-1. 인증
| 우선 | 명세 | UI 위치 | 현재 상태 |
| --- | --- | --- | --- |
| 🔥 | AUTH-1 | [src/app/login/page.tsx L7-29](../../src/app/login/page.tsx#L7) | 리다이렉트는 동작. 단 `API_BASE_URL = 'http://localhost:8080'` **하드코딩** — BFF는 `NEXT_PUBLIC_API_BASE_URL`, [CLAUDE.md](../../CLAUDE.md)는 `:3845` 언급 — **3개 값 충돌**. 즉시 통일 필요. |
| 🔥 | AUTH-2 (logout) | [SettingsPage.tsx L65-69](../../src/features/profile/components/SettingsPage.tsx#L65) | `setLoggedIn(false)`만 호출 — **POST `/api/auth/logout` 미호출**. |
| 🔥 | AUTH-3 (me) | 어디에도 없음 | 페이지 진입 시 세션 검증 로직 부재. 인트로/홈 가드 미구현. |
| ○ | AUTH-4 (탈퇴) | [SettingsPage.tsx L34 `showDeleteModal`](../../src/features/profile/components/SettingsPage.tsx#L34) | 모달 state는 있으나 confirm 후 호출 코드 없음. |
| 🔥 | (신규 누락) `/login/success` 콜백 처리 | [src/app/login/success/page.tsx](../../src/app/login/success/page.tsx) | OAuth 콜백 후 1.5초 setTimeout 후 `/`로 이동 — **세션 토큰 처리/AUTH-3 호출 없음**. 명세 보강 권장 (예: `GET /api/auth/me`로 검증 후 라우팅). |

### 2-2. 플랜 생성·수정·삭제·복제
| 우선 | 명세 | UI 위치 | 현재 상태 |
| --- | --- | --- | --- |
| 🔥 | POST `/api/plan` | [CourseCreationFlow.tsx L153-191](../../src/features/course-creation/components/CourseCreationFlow.tsx#L153) | "힐링 플랜 생성 완료" 버튼이 `addMyCourse()` 로컬 store에만 저장. **백엔드 미호출** — 새로고침 시 데이터 소실. |
| 🔥 | POST `/api/plan/{planId}/clone` | [CourseViewPage.tsx L86](../../src/features/course-detail/components/CourseViewPage.tsx#L86) | `cloneCourseToMy(courseId)` 로컬 store 복제만. **API 미호출**. |
| 🔥 | DELETE `/api/plan/{planId}` | [ProfilePage.tsx L204](../../src/features/profile/components/ProfilePage.tsx#L204), [MyCourseDetailPage.tsx L760](../../src/features/my-course/components/MyCourseDetailPage.tsx#L760) | `deleteMyCourse()` store만. |
| 🔥 | PATCH `/api/plan/{planId}` | [MyCourseDetailPage.tsx L144 `handleSaveReview`](../../src/features/my-course/components/MyCourseDetailPage.tsx#L144) | 후기 저장이 `updateMyCourse()` store만 호출. |
| ⭐ | PATCH `/api/plan-place/{planPlaceId}/order` | finalPlan ↑↓ 버튼 | store 함수만. |
| ⭐ | DELETE `/api/plan-place/{planPlaceId}` | finalPlan / MyCourseDetail 플랜 장소 제거 | store 함수만. |
| ⭐ | POST `/api/plan-place/{planPlaceId}/stamp` | [course-detail.api.ts L34](../../src/features/course-detail/api/course-detail.api.ts#L34) | `fetchStampHistory`만 mock 반환 (TODO 주석). 스탬프 등록 함수는 없음. |
| ⭐ | POST `/api/plan/{planId}/report` | [CourseViewPage.tsx](../../src/features/course-detail/components/CourseViewPage.tsx) MoreVertical 메뉴 → 신고 | 모달 UI는 있으나 제출 핸들러 미구현. [REPORT_REASONS](../../src/shared/data/mockData.ts) 사용. |
| ○ | POST `/api/plan/{planId}/share` | [ShareBottomSheet](../../src/shared/ui/ShareBottomSheet/) | 클립보드 복사만, 단축 URL 발급 없음. |
| 🔥 | POST `/api/like/{planId}` | [CourseViewPage.tsx L215, L242, L376](../../src/features/course-detail/components/CourseViewPage.tsx#L215) | `toggleLike()` store만. |
| 🔥 | POST `/api/plan/scrapped/{planId}` | [CourseViewPage.tsx L388, L480](../../src/features/course-detail/components/CourseViewPage.tsx#L388) | `toggleBookmark()` store만. |
| 🔥 | GET `/api/plan/{planId}` | 모든 코스 상세 화면 | mock + `MOCK_COURSES` 의존. |
| 🔥 | POST `/api/plan-place/duration` | finalPlan 진입 시 자동 계산 | [CourseCreationFlow.tsx L285+](../../src/features/course-creation/components/CourseCreationFlow.tsx#L285) 클라이언트에서 단순 계산. |
| 🔥 | POST `/api/plan-place/{planId}` (PLACE-19) | finalPlan에서 플랜 장소 추가 | store 함수만. |

### 2-3. 장소 상세
| 우선 | 명세 | UI 위치 | 현재 상태 |
| --- | --- | --- | --- |
| 🔥 | PLACE-N1 GET `/api/place/{placeId}` | [PlaceDetailPage.tsx L36-88](../../src/features/place-detail/components/PlaceDetailPage.tsx#L36) | `PLACE_DETAILS` 카테고리 매핑 + `ALL_PLACES` 룩업 mock. **API 미호출**. |
| 🔥 | PLACE-N2 좋아요 토글 | [PlaceDetailPage.tsx L162-165](../../src/features/place-detail/components/PlaceDetailPage.tsx#L162) | `setIsLiked` 로컬 state만. |
| 🔥 | PLACE-N3 스크랩 토글 | [PlaceDetailPage.tsx L167-170](../../src/features/place-detail/components/PlaceDetailPage.tsx#L167) | `toggleBookmark()` store만. |
| ⭐ | PLACE-N4 후기 조회 | [PlaceDetailPage.tsx L97 `MOCK_PLACE_REVIEWS`](../../src/features/place-detail/components/PlaceDetailPage.tsx#L97) | mock. cursor 기반 페이지네이션 미구현. |
| ⭐ | PLACE-N5 후기 작성 | UI 진입점 없음 | 명세 선행 상태 — 1차 결론 그대로 유지. |
| ⭐ | PLACE-N6 장소 포함 코스 | [PlaceDetailPage.tsx L154-157 `relatedCourses`](../../src/features/place-detail/components/PlaceDetailPage.tsx#L154) | 클라이언트에서 `MOCK_COURSES` 필터링. |
| 🔥 | PLACE-4 검색 | [SearchPage.tsx L8-39](../../src/features/search/components/SearchPage.tsx#L8) | mock 필터링 (SEARCH-1로 흡수 검토). |
| 🔥 | PLACE-16 추천 | [CourseCreationFlow](../../src/features/course-creation/components/CourseCreationFlow.tsx) Survey | `RECOMMENDED_PLACES` mock 사용. |

### 2-4. 검색
| 우선 | 명세 | UI 위치 | 현재 상태 |
| --- | --- | --- | --- |
| 🔥 | SEARCH-1 통합 검색 | [SearchResultsPage.tsx L16-26](../../src/features/search/components/SearchResultsPage.tsx#L16) | `MOCK_COURSES + NATIONWIDE_COURSES + BEST_PLACES + NEARBY_POPULAR_PLACES + NATIONWIDE_PLACES` 클라이언트 필터링. |
| ⭐ | SEARCH-2 자동완성 | [SearchPage.tsx L8-39, L72-87](../../src/features/search/components/SearchPage.tsx#L8) | 200ms 디바운스 OK, **호출은 클라이언트 필터링**. 응답 형태도 `Suggestion {type, id, label, sub}`로 spec과 다름. |
| ○ | SEARCH-3 인기 키워드 | SearchPage 인기 검색어 영역 | `POPULAR_KEYWORDS` mock. |

### 2-5. 마이페이지
| 우선 | 명세 | UI 위치 | 현재 상태 |
| --- | --- | --- | --- |
| 🔥 | MY-1 내 플랜 목록 | [ProfilePage.tsx](../../src/features/profile/components/ProfilePage.tsx) (`/profile`) | BFF 라우트 [src/app/api/mypage/plans/route.ts](../../src/app/api/mypage/plans/route.ts) 통해 호출. **백엔드 미연결 시 mock 폴백**. |
| 🔥 | MY-2 내 프로필 | [ProfilePage.tsx L106](../../src/features/profile/components/ProfilePage.tsx#L106) | BFF 통해 호출 ✓ |
| 🔥 | MY-3 프로필 수정 | [SettingsPage.tsx](../../src/features/profile/components/SettingsPage.tsx) | `updateMyPageProfile` 호출 ✓ |
| 🔥 | MY-4 요약 통계 | [ProfilePage.tsx L85](../../src/features/profile/components/ProfilePage.tsx#L85) | BFF 호출 ✓ |
| 🔥 | MY-5 공개여부 토글 | [ProfilePage.tsx L191](../../src/features/profile/components/ProfilePage.tsx#L191) | BFF 호출 ✓ — 단 응답 스키마 불일치(1-4 참고). |
| ⭐ | MY-6 스크랩 코스 | [SavedCoursesTab.tsx](../../src/features/profile/components/SavedCoursesTab.tsx) | **API 호출 없음** — `useCourseStore` 의 `getBookmarkedCourses()` mock에서 끌어옴. |
| ⭐ | MY-7 다른 유저 프로필 | [src/app/profile/[userId]/page.tsx](../../src/app/profile/[userId]/page.tsx) → [UserProfilePage](../../src/features/profile/components/UserProfilePage.tsx) | **API 호출 없음**. mock 데이터로 렌더. |

### 2-6. 매거진
| 우선 | 명세 | UI 위치 | 현재 상태 |
| --- | --- | --- | --- |
| ⭐ | MAG-1 목록 | [src/app/magazine/page.tsx](../../src/app/magazine/page.tsx) | `MOCK_MAGAZINES` 직참조. |
| ⭐ | MAG-2 상세 | [src/app/magazine/[id]/page.tsx](../../src/app/magazine/[id]/page.tsx) → [MagazineDetailPage](../../src/features/magazine/components/MagazineDetailPage.tsx) | mock. |
| ○ | MAG-3 좋아요 | UI 진입점 없음 | 명세 선행 상태 유지. |

### 2-7. 댓글
| 우선 | 명세 | UI 위치 | 현재 상태 |
| --- | --- | --- | --- |
| 🔥 | CMT-34 작성 | [CourseViewPage 댓글 영역](../../src/features/course-detail/components/CourseViewPage.tsx) | 로컬 state만. |
| 🔥 | CMT-37 조회 | 동상 | `MOCK_COMMENTS` mock. |
| ⭐ | CMT-39 / CMT-40 좋아요 | [CourseViewPage.tsx L116, L321 `handleLikeComment`](../../src/features/course-detail/components/CourseViewPage.tsx#L116) | 로컬 state만. |
| ○ | CMT-35 / CMT-36 수정·삭제 | UI 진입점 없음 | 1차 결론 그대로 — v2 보류 또는 향후 지원. |
| ○ | CMT-N1 신고 | UI 진입점 없음 | 명세 선행 상태 유지. |

---

## 3. 🟢 신규 발견: 명세에 없는 UI / 데이터 흐름

> 1차 검토 이후 추가된 라우트/컴포넌트 또는 1차에서 누락된 항목.

### 3-1. `/feed`, `/feed/[id]` — 피드 상세 mock 페이지
- [src/app/feed/[id]/page.tsx L10-31](../../src/app/feed/[id]/page.tsx#L10): `mockPosts` 하드코딩, [FeedPost](../../src/features/feed/types/) 타입은 `{ id, username, images[], location, description, currentImageIndex }`.
- v1 명세 어디에도 피드 도메인 없음. 1차에서도 우선순위 ○로 둠.
- **권장 조치**: 인스타그램형 피드 도입 여부 PO 컨펌 후 v1.1에 `/api/feed`, `/api/feed/{postId}` 신규 명세 추가 또는 라우트 자체 비활성.

### 3-2. `/my-page` (Korean menu page) — `/profile`과 별개의 두 번째 마이페이지
- [src/app/my-page/page.tsx](../../src/app/my-page/page.tsx)는 [src/app/profile/page.tsx](../../src/app/profile/page.tsx)와 **완전히 다른 UI/구현**.
- 사용자 정보가 `kong9434/kong9434@naver.com` 하드코딩. **MY-2/4 BFF 미사용**.
- 메뉴 항목: "나의 플랜 리스트", "좋아요한 장소", "감정 설문 결과 확인", "감정 설문 다시 하기", "계정 관리".
- 이 중 "**좋아요한 장소**", "**감정 설문 결과/다시 하기**"는 **v1 명세에 대응 엔드포인트 없음**.
- **권장 조치**:
  1. `/my-page`와 `/profile` 중 하나로 단일화 결정 (PO 확인).
  2. 단일화 결과에 따라 다음 신규 명세 검토:
     - `GET /api/place/liked` (좋아요한 장소 목록) — 🔥
     - `GET /api/survey/result` / `POST /api/survey` (감정 설문 결과 보관/재시도) — ⭐
     - `GET /api/account` (계정 관리) — 기존 AUTH-3로 흡수 가능

### 3-3. `/my-page/course-plan` — 신규 페이지
- [src/app/my-page/course-plan/page.tsx](../../src/app/my-page/course-plan/page.tsx): 자체 mockPlans `{ id, title, createdAt, performedAt, imageUrl }` 사용.
- 응답 형태가 [MY-1](v1/mypage.md) 응답(`planId, planTitle, thumbnailUrl, location, duration, tags, scheduledDate, isPlanVisible, isVerified, likeCount, bookmarkCount, createAt`)과 **필드 매핑이 다름**.
- **권장 조치**: 화면이 MY-1을 사용한다면 mockPlans 형태를 MY-1 응답에 맞춰 정렬, 또는 별도 엔드포인트가 필요한지 검토.

### 3-4. `/profile/course/[id]` — `/my-course/[id]` 별칭
- [src/app/profile/course/[id]/page.tsx](../../src/app/profile/course/[id]/page.tsx)가 `MyCourseDetailPage`를 그대로 렌더.
- 동일 컴포넌트를 두 라우트에서 노출 → URL 일관성 점검 필요. 백엔드 영향은 없음.

### 3-5. 코스 상세 자체 도메인(activity/stamp) — 명세에 미존재
- [course-detail.api.ts L1-145](../../src/features/course-detail/api/course-detail.api.ts) `CourseDetail = { id, title, date, description, isPublic, activities[] }` + `Stamp = { id, order, title, type, isCompleted, needsVerification }` + `StampHistory[]`.
- v1 GET `/api/plan/{planId}` 응답은 `planPlaceDetailDtos` 사용 — **shape 불일치**. activities 도메인은 어디에서도 정의되지 않음.
- **권장 조치**: 두 가지 중 택1
  1. UI를 v1의 `planPlaceDetailDtos` 형태로 마이그레이션 후 `course-detail.api.ts`의 mock-only 코드 제거.
  2. activity/stamp가 별도 도메인이라면 `GET /api/plan/{planId}/activity`, `GET /api/plan/{planId}/stamp-history` 등을 **신규 명세화**.

### 3-6. 1차에서 누락된 부수 엔드포인트 (재발견)
| 우선 | 추천 코드 | 메서드 | URL | 비고 |
| --- | --- | --- | --- | --- |
| ⭐ | PLACE-LIKED | GET | `/api/place/liked` | "좋아요한 장소" 메뉴 (3-2) |
| ⭐ | SURVEY-RESULT | GET | `/api/survey/result` | 감정 설문 결과 (3-2 / [emotion-analysis](../../src/features/emotion-analysis/)) |
| ⭐ | SURVEY-RESET | POST | `/api/survey` | 감정 설문 재시도 |
| ○ | PLAN-INVITE | POST | `/api/plan/{planId}/invite` | 동행자 초대 (현재 UI 없음, [src/features/community/](../../src/features/community/) 비어 있음) |
| ○ | NOTIFICATION-* | GET/PATCH | `/api/notifications` | 알림 미구현, 향후 검토 |

---

## 4. ⚪ 사용처 없는 명세 / 보류 상태

| 명세 | 1차 결론 | 2차 현황 | 권장 |
| --- | --- | --- | --- |
| CMT-35 / CMT-36 | UI 진입점 없음 — 유지 | 변동 없음 | v2 보류 또는 표준 CRUD로 유지 |
| CMT-N1 | 신규 추가됨 | UI 미사용 | 코스 신고와 동일 정책 도입 시 활용 |
| MAG-3 | 신규 추가됨 | UI 미사용 | 매거진 좋아요 UI 추가 시 활용 |
| PLACE-N5 | 신규 추가됨 | UI 미사용 | 후기 작성 진입점 마련 후 |
| AUTH-4 | 신규 추가됨 | UI 모달 state만 | 탈퇴 플로우 확정 후 |

---

## 5. 정리 권장 (즉시)

1. **MY-5 BFF 응답 스키마 통일** — 명세 또는 BFF 중 하나를 수정 (1-4).
2. **AUTH-1 BASE URL 일원화** — `localhost:8080` 하드코딩 제거, `NEXT_PUBLIC_API_BASE_URL` 단일 출처화 (2-1, 첫 행).
3. **DTO 키 정합성 회의** — `thumbnail/thumbnailUrl`, `likes/likeCount`, `placeImage/placeImageUrl`, `address/roadAddressName`, `order/orderIndex` 통일 (1-1, 1-2, 1-3).
4. **`/my-page` ↔ `/profile` 단일화 결정** — 두 화면 중 하나 deprecate (3-2).
5. **course-detail activity/stamp 도메인 처리 결정** — 마이그레이션 vs 신규 명세화 (3-5).

---

## 6. 구현 우선순위 (백엔드 연동 작업 순서)

### 🔥 1순위 — MVP 진입에 필수
1. **AUTH-1/2/3** (3개) — 로그인/로그아웃/세션검증.
2. **POST `/api/plan`** — 코스 생성 완료 버튼 동작.
3. **GET `/api/plan/{planId}`** — 코스 상세 페이지 데이터 소스 전환.
4. **POST/DELETE `/api/like/{planId}`, `/api/plan/scrapped/{planId}`** — 좋아요/스크랩.
5. **PLACE-N1/N2/N3** — 장소 상세 + 좋아요/스크랩.
6. **SEARCH-1/2** — 검색 진입.
7. **MY-5 응답 스키마 정리** (1-4 결정 후).

### ⭐ 2순위 — 사용성/완성도
- POST `/api/plan/{planId}/clone`, PATCH/DELETE `/api/plan/{planId}`, 플랜 장소 PATCH/DELETE.
- POST `/api/plan-place/{planPlaceId}/stamp`, POST `/api/plan/{planId}/report`.
- PLACE-N4/N6, MY-6/7, MAG-1/2, CMT-34/37/39/40.

### ○ 3순위 — 향후
- AUTH-4, MAG-3, PLACE-N5, CMT-35/36/N1, SEARCH-3.
- 신규 도메인(피드/감정설문/좋아요한 장소) PO 확정 후 명세 작성.

---

## 7. 통계

- v1 명세 총 ~50개 엔드포인트 (1차 18개 → 2차 50개로 약 **2.8배 증가**).
- UI에서 실제 백엔드 호출 코드를 가진 엔드포인트: **MY-1/2/3/4/5 (5개, BFF 경유)** + **AUTH-1 리다이렉트** = **사실상 5~6개**.
- → **명세 커버율 ≈ 100%, 구현 커버율 ≈ 12%**. 1차의 "명세 보강 단계"는 끝났고, 다음은 **구현 연결 단계**.
- 추가 명세 필요 후보: 감정설문 / 좋아요한 장소 / 피드 등 **5개 내외** (3-6).

---

## 8. 다음 단계 제안

1. 본 문서를 PO·백엔드와 공유 후 **DTO 통일 회의** (1-1 ~ 1-4).
2. 🔥 1순위 7개를 v1.0 백엔드 작업 큐에 등록.
3. 프런트는 **순차적으로 mock → 실 API 마이그레이션** 진행 — 가장 격리된 MY-1/2/4 (이미 BFF 있음)부터 실 백엔드 검증 → AUTH → PLACE-N1~N3 → 검색 순.
4. 신규 도메인(피드/감정설문) **PO 확정 후** v1.1로 별도 명세 추가.
