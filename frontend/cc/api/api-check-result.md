# cc/api/v1 명세 ↔ 현재 UI 갭 분석

- **검토일**: 2026-05-06
- **검토 범위**: [cc/api/v1/](v1/) 4개 파일(main/place/plan/comment) — 총 18개 엔드포인트
- **비교 대상**: 현재 구현된 모든 UI (홈/검색/장소/코스/마이/매거진/피드/로그인 등)
- **결론 요약**: **중복 1건, UI 미사용 2건, 신규 필요 ~30건**. 명세 보강이 시급한 영역은 **인증/마이페이지/플랜 생성·수정/장소 좋아요·후기**.

---

## 1. v1 명세 전수 목록

### main.md (4)
| 코드 | 메서드 | URL |
| --- | --- | --- |
| MAIN-57 | GET | `/api/plan/popular` |
| MAIN-58 | GET | `/api/plan/popular/nationwide` |
| MAIN-60 | GET | `/api/place/popular/nationwide` |
| MAIN-61 | GET | `/api/place/popular` |

### place.md (3)
| 코드 | 메서드 | URL |
| --- | --- | --- |
| PLACE-4 | GET | `/api/place/search` |
| PLACE-16 | POST | `/api/place/recommend` |
| PLACE-19 | POST | `/api/plan-place/{planId}` |

### plan.md (5)
| 이름 | 메서드 | URL |
| --- | --- | --- |
| 플랜-5 좋아요순 조회 | GET | `/api/plan/popular` |
| 플랜 좋아요 | POST/DELETE | `/api/like/{planId}` |
| 플랜 상세 조회 | GET | `/api/plan/{planId}` |
| 플랜 저장 전 시간계산 | POST | `/api/plan-place/duration` |
| 플랜 스크랩 | POST/DELETE | `/api/plan/scrapped/{planId}` |

### comment.md (6)
| 코드 | 메서드 | URL |
| --- | --- | --- |
| CMT-34 | POST | `/api/reply/{planId}` |
| CMT-35 | PATCH | `/api/reply/{replyId}` |
| CMT-36 | DELETE | `/api/reply/{replyId}` |
| CMT-37 | GET | `/api/reply/{planId}` |
| CMT-39 | POST | `/api/reply/like/{replyId}` |
| CMT-40 | DELETE | `/api/reply/like/{replyId}` |

---

## 2. 🔴 중복 / 통합 필요

### 2-1. `/api/plan/popular` 중복 정의 — **MAIN-57 ≡ 플랜-5**

| 비교 항목 | MAIN-57 (main.md) | 플랜-5 (plan.md) |
| --- | --- | --- |
| URL | `GET /api/plan/popular` | `GET /api/plan/popular` |
| 의도 | 내 주변 실시간 베스트 코스 (메인 페이지 섹션) | 좋아요순 플랜 조회 |
| 응답 | Course 배열 | planPlaceDtos 포함 Course 배열 |

- 동일 엔드포인트가 두 파일에서 서로 다른 응답 스키마로 정의되어 있음 → 백엔드 구현 시 충돌.
- **권장 조치**: `plan.md`의 "플랜-5"를 삭제하고 `main.md`의 MAIN-57로 일원화. 응답 스키마는 main.md v1 기준(`thumbnailUrl/duration/tags/likeCount`)을 사용.

---

## 3. 🟡 현재 UI에서 사용하지 않는 명세

### 3-1. **CMT-35 댓글 수정**, **CMT-36 댓글 삭제**
- [CourseViewPage](../../src/features/course-detail/components/CourseViewPage.tsx)의 댓글 영역에 수정/삭제 진입점이 전혀 없음.
- 작성자 본인 댓글에 대한 메뉴(... 버튼 등)도 없음.
- **권장 조치**: 향후 지원 예정 표기를 유지하거나 v2로 이동. 다만 백엔드 입장에서 표준 CRUD라 명세 자체는 가성비가 높음 — **유지 가능**.

> 이 외 v1에 정의된 명세 중 "현 UI에서 0% 사용"되는 항목은 없음 (실시간 좋아요 토글, 댓글 작성/조회/좋아요 등은 모두 사용됨).

---

## 4. 🟢 명세 누락 (UI에는 있으나 v1에 없음)

화면별로 정리. 우선순위는 **🔥 (필수)** > **⭐ (중요)** > **○ (있으면 좋음)** 으로 표기.

### 4-1. 인증 / 계정 — [src/app/login/page.tsx](../../src/app/login/page.tsx)

| 우선 | 추천 코드 | 메서드 | URL | 비고 |
| --- | --- | --- | --- | --- |
| 🔥 | AUTH-1 | GET | `/oauth2/authorization/{provider}` | Kakao/Google/Naver 소셜 로그인 리다이렉트 |
| 🔥 | AUTH-2 | POST | `/api/auth/logout` | 세션 종료 ([SettingsPage](../../src/features/profile/components/SettingsPage.tsx)) |
| ⭐ | AUTH-3 | GET | `/api/auth/me` | 현재 로그인 사용자 조회 (세션 확인) |
| ○ | AUTH-4 | DELETE | `/api/user/account` | 계정 탈퇴 |

### 4-2. 마이페이지 — [src/features/my-page/](../../src/features/my-page/), [src/features/profile/](../../src/features/profile/)

> ⚠️ **이미 [src/app/api/mypage/](../../src/app/api/mypage/)에 Next.js BFF 라우트가 4개 구현되어 있는데 v1 명세에는 전혀 없음.** 해당 라우트가 호출하는 백엔드 API를 명세화해야 함.

| 우선 | 추천 코드 | 메서드 | URL | 비고 |
| --- | --- | --- | --- | --- |
| 🔥 | MY-1 | GET | `/api/mypage/plans` | 내 플랜 목록 (BFF 라우트 존재) |
| 🔥 | MY-2 | GET | `/api/mypage/profile` | 내 프로필 (BFF 라우트 존재) |
| 🔥 | MY-3 | PATCH | `/api/mypage/profile` | 닉네임/소개/아바타 수정 (BFF 라우트 존재) |
| 🔥 | MY-4 | GET | `/api/mypage/summary` | 프로필 통계 (publicPlanCount/savedCourseCount 등, BFF 라우트 존재) |
| 🔥 | MY-5 | POST | `/api/mypage/plan/visibility/{planId}` | 공개/비공개 토글 (BFF 라우트 존재) |
| ⭐ | MY-6 | GET | `/api/mypage/scrapped` | 스크랩한 코스 목록 |
| ⭐ | MY-7 | GET | `/api/users/{userId}` | 다른 유저 프로필 보기 ([profile/[id]](../../src/app/profile/)) |

### 4-3. 플랜 생성/관리 — [src/features/course-creation/components/CourseCreationFlow.tsx](../../src/features/course-creation/components/CourseCreationFlow.tsx), [src/features/my-course/](../../src/features/my-course/)

| 우선 | 추천 코드 | 메서드 | URL | 비고 |
| --- | --- | --- | --- | --- |
| 🔥 | PLAN-NEW-1 | POST | `/api/plan` | 플랜 신규 생성 ("힐링 플랜 생성 완료" 버튼) |
| 🔥 | PLAN-NEW-2 | PATCH | `/api/plan/{planId}` | 플랜 제목/설명/일정/공개여부/후기 수정 |
| 🔥 | PLAN-NEW-3 | DELETE | `/api/plan/{planId}` | 플랜 삭제 (마이페이지에서) |
| 🔥 | PLAN-NEW-4 | POST | `/api/plan/{planId}/clone` | 코스 담기/내 일정에 추가 ([useCourseStore.cloneCourseToMy](../../src/shared/lib/stores/useCourseStore.ts#L102)) |
| ⭐ | PLAN-NEW-5 | PATCH | `/api/plan-place/{planPlaceId}/order` | 플랜 장소 순서 변경 (finalPlan에서 ↑↓ 버튼) |
| ⭐ | PLAN-NEW-6 | DELETE | `/api/plan-place/{planPlaceId}` | 플랜 장소 제거 |
| ⭐ | PLAN-NEW-7 | POST | `/api/plan-place/{planPlaceId}/stamp` | 방문 인증 (Stop.isVerified, verifiedImage) |
| ⭐ | PLAN-NEW-8 | POST | `/api/plan/{planId}/report` | 코스 신고 ([REPORT_REASONS](../../src/shared/data/mockData.ts#L795) 사용) |
| ○ | PLAN-NEW-9 | POST | `/api/plan/{planId}/share` | 공유 링크 발급 ([ShareBottomSheet](../../src/shared/ui/ShareBottomSheet/)) |

### 4-4. 검색 — [src/features/search/](../../src/features/search/)

| 우선 | 추천 코드 | 메서드 | URL | 비고 |
| --- | --- | --- | --- | --- |
| 🔥 | SEARCH-1 | GET | `/api/search?q=&type=all\|plans\|places` | **장소+코스 통합 검색**. 현재 SearchPage·SearchResultsPage가 클라이언트에서 mock을 필터링 중. PLACE-4는 장소만 커버. |
| ⭐ | SEARCH-2 | GET | `/api/plan/search?keyword=&verified=` | 코스 단독 검색 (검증 필터, 정렬). type 분기로 SEARCH-1에 흡수 가능 |
| ○ | SEARCH-3 | GET | `/api/search/autocomplete?q=` | 자동완성 (현재 200ms 디바운스, 클라이언트에서 처리 중) |

### 4-5. 장소 상세 — [src/features/place-detail/components/PlaceDetailPage.tsx](../../src/features/place-detail/components/PlaceDetailPage.tsx)

| 우선 | 추천 코드 | 메서드 | URL | 비고 |
| --- | --- | --- | --- | --- |
| 🔥 | PLACE-N1 | GET | `/api/place/{placeId}` | 장소 상세 조회 (UI는 현재 mock + 카테고리별 fake detail 사용) |
| 🔥 | PLACE-N2 | POST/DELETE | `/api/place/like/{placeId}` | 장소 좋아요 토글 (`handleLike` Heart 버튼) |
| 🔥 | PLACE-N3 | POST/DELETE | `/api/place/scrapped/{placeId}` | 장소 스크랩 토글 (`handleBookmark` Bookmark 버튼) |
| ⭐ | PLACE-N4 | GET | `/api/place/{placeId}/review` | 방문자 후기 목록 (UI: 별점/사진/코멘트, 현재 [MOCK_PLACE_REVIEWS](../../src/features/place-detail/components/PlaceDetailPage.tsx#L97)) |
| ⭐ | PLACE-N5 | POST | `/api/place/{placeId}/review` | 후기 작성 (UI 진입점 추가 시) |
| ⭐ | PLACE-N6 | GET | `/api/place/{placeId}/plan` | 이 장소가 포함된 코스 ("이 장소가 포함된 코스" 섹션) |

### 4-6. 매거진 — [src/features/magazine/](../../src/features/magazine/), [src/app/magazine/](../../src/app/magazine/)

UI가 실제 렌더링되며 [MOCK_MAGAZINES](../../src/shared/data/mockData.ts#L703)를 사용 중.

| 우선 | 추천 코드 | 메서드 | URL | 비고 |
| --- | --- | --- | --- | --- |
| ⭐ | MAG-1 | GET | `/api/magazine` | 매거진 목록 |
| ⭐ | MAG-2 | GET | `/api/magazine/{magazineId}` | 매거진 상세 (sections 배열 포함) |
| ○ | MAG-3 | POST/DELETE | `/api/magazine/like/{magazineId}` | 매거진 좋아요 (UI 진입점 확인 후) |

### 4-7. 댓글 — 보강

| 우선 | 추천 코드 | 메서드 | URL | 비고 |
| --- | --- | --- | --- | --- |
| ⭐ | CMT-NEW-1 | POST | `/api/reply/{replyId}/report` | 댓글 신고 (현재 UI 없음, 코스 REPORT_REASONS와 일관성 위해 향후 추가 권장) |

### 4-8. 피드 — [src/features/feed/](../../src/features/feed/) (Scaffolded only)

> 현재 UI는 mock 게시물만 표시하며 실 데이터 연동 없음. 우선순위 낮음.

| 우선 | 추천 코드 | 메서드 | URL | 비고 |
| --- | --- | --- | --- | --- |
| ○ | FEED-1 | GET | `/api/feed` | 피드 목록 (팔로우 기반 또는 전체) |
| ○ | FEED-2 | POST/DELETE | `/api/feed/{postId}/like` | 게시물 좋아요 |
| ○ | FEED-3 | POST | `/api/follow/{userId}` | 작성자 팔로우 |

---

## 5. 종합

### 정리 권장 (즉시)
1. **`/api/plan/popular` 중복 제거** — `plan.md`의 "플랜-5" 삭제, `main.md` MAIN-57로 단일화.
2. **CMT-35/36 status 결정** — 향후 지원으로 두거나 v2로 이동.

### 명세 추가 권장 (우선순위순)
1. **🔥 인증 4개** (소셜 로그인/로그아웃/me) — 현재 백엔드 연동의 진입점. 가장 시급.
2. **🔥 마이페이지 5개** (MY-1~MY-5) — Next.js BFF 라우트가 이미 호출 중인데 명세 부재. 백엔드 구현 안 되어 있다면 즉시 합의 필요.
3. **🔥 플랜 생성/수정/삭제/clone 4개** (PLAN-NEW-1~4) — `CourseCreationFlow` 완료 버튼이 동작하려면 필수.
4. **🔥 장소 상세/좋아요/스크랩 3개** (PLACE-N1~N3) — 장소 상세 페이지 핵심 기능.
5. **🔥 통합 검색 1개** (SEARCH-1) — 현재 100% 클라이언트 mock 필터링.

### 통계
- v1 명세 총 18개 → 그중 1개 중복, 2개 미사용
- UI 기준 추가 필요 ~30개 (필수 17 + 중요 8 + 있으면 좋음 5)
- 즉, **현재 v1은 실제 필요한 백엔드 API의 약 35%만 커버**하고 있음

다음 단계로 위의 누락 항목을 v1.1 또는 v2 단위로 분배해 명세 작성을 권장합니다.
