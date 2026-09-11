# PLACE API (v5) 연동 결과

> 기준 명세: [cc/api/v5/260705-v5-003-place.md](../api/v5/260705-v5-003-place.md)
> 선행 작업: [260705-result-012-plan_api_v5_migration.md](260705-result-012-plan_api_v5_migration.md) (plan v5)
> 작업일: 2026-07-05 / 브랜치: `feature-fe-admin`

## 개요

PLACE v5 명세를 현재 UI(장소 상세 페이지)에 연동했다. plan과 동일한 하이브리드 전략:
**숫자 placeId(서버 장소) → 실제 API, 목데이터 id(`bp-...` 등) → 기존 목데이터 폴백.**

## 신규 파일 — `src/features/place/`

| 파일 | 내용 |
| --- | --- |
| `types/place.types.ts` | `PlaceDetail`, `SearchPlaceItem`, `PopularPlaceItem/Response`, `SurveyResult`, `PlaceLikeResponse`, `PlaceScrapResponse`, `PlaceReview/ListResponse`, `PlaceContainingPlan` |
| `api/place.api.ts` | 엔드포인트 함수 12개 (아래 표) |
| `hooks/usePlaceDetail.ts` | 상세 + 후기 + 포함 코스를 `Promise.all`로 병렬 조회 (후기/코스는 실패해도 상세 표시 유지) |
| `hooks/usePlaceActions.ts` | 좋아요/스크랩 토글 — 서버 응답값으로 상태 확정, pending 가드, 로컬 폴백 콜백 |
| `utils/placeId.ts` | `toNumericPlaceId(id)` |
| `index.ts` | 공개 API 재수출 |

### API 함수 ↔ 엔드포인트 매핑

| 함수 | 메서드/URL |
| --- | --- |
| `fetchPlaceDetail` | GET `/api/place/{placeId}` |
| `searchPlaces` | GET `/api/place/search?keyword=` |
| `fetchPopularPlaces` | GET `/api/place/popular?lat&lng&limit&page` |
| `fetchNationwidePopularPlaces` | GET `/api/place/popular/nationwide?limit&page` |
| `recommendPlaces` | POST `/api/place/recommend` (응답 스키마 서버 미확정 → `unknown`) |
| `likePlace` / `unlikePlace` | POST / DELETE `/api/place/{placeId}/likes` |
| `scrapPlace` / `unscrapPlace` | POST / DELETE `/api/place/{placeId}/scraps` |
| `fetchPlaceReviews` | GET `/api/place/{placeId}/review?lastReviewId&limit` (커서 페이징) |
| `writePlaceReview` | POST `/api/place/{placeId}/review` |
| `fetchPlansContainingPlace` | GET `/api/place/{placeId}/plan` |

## 수정 파일 — `src/features/place-detail/components/PlaceDetailPage.tsx`

- **상세**: `usePlaceDetail(placeId)` — 서버 장소면 `placeName`/`categoryName`/`roadAddressName`/`placeImageUrl`을 화면 표시용 `BestPlace` 형태로 매핑해 우선 사용. 전화번호는 서버 `phone`, 지도 버튼은 서버 `placeUrl` 우선.
- **좋아요/스크랩**: 상단 스탯 바, 히어로 북마크 버튼, `BottomActionBar` 전부 `usePlaceActions`의 `toggleLike`/`toggleScrap`으로 교체. 목데이터 장소는 기존 로컬 상태/스토어 토글 폴백.
- **방문자 후기**: 서버 장소면 v5 후기 API 데이터 렌더링(작성자/아바타/내용/날짜). 서버 후기에는 **별점 필드가 없어** 별점 UI는 목데이터일 때만 표시.
- **이 장소가 포함된 플랜**: 서버 장소면 `GET /api/place/{placeId}/plan` 결과를 캐러셀에 렌더링, 클릭 시 `/course/{planId}` 이동.

## 참고/보류 항목

| 항목 | 사유 |
| --- | --- |
| 상세의 좋아요/스크랩 **수** 초기값 | v5 `PlaceDetailResponseDto`에 likeCount/bookmarkCount/isLiked/isBookmarked가 없음 → 첫 토글 응답 전까지 0으로 표시. **서버에 상세 응답 필드 추가 요청 필요** |
| 후기 작성 UI | 현재 장소 상세에 후기 작성 폼이 없음 — `writePlaceReview` 함수만 준비 |
| 후기 더보기(커서 페이징) | `hasMoreReviews` 상태는 훅에 준비됨, UI 버튼은 미구현 |
| 장소 검색 (`searchPlaces`) | 검색 페이지가 로컬스토리지+목데이터 기반이라 별도 작업으로 분리 |
| 인기 장소 | 기존 BFF 라우트(`src/app/api/place/popular`) 사용 화면 유지 — v5 직접 호출 함수는 준비 완료 |
| 장소 추천 (`recommendPlaces`) | 응답 스키마가 `object`로만 정의 — 서버 확정 후 연동 |
| 영업시간 | v5 응답에 없음 → 카테고리별 목데이터 유지 |

## 검증

- `yarn tsc --noEmit` 통과
- `yarn build` 성공 (11.7s)
