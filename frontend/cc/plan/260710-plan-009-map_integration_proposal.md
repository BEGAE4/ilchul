# 플랜 생성 지도 기능 적용 제안 (카카오맵 vs 네이버맵)

- 작성일: 2026-07-10
- 기준 API 명세: `cc/api/v5/api-docs.json`
- 대상 UI: `src/features/course-creation/components/CourseCreationFlow.tsx`, `RouteMap.tsx`

---

## 1. 결론: **카카오맵(Kakao Maps SDK) 권장**

| 판단 기준 | 카카오맵 | 네이버맵 |
| --- | --- | --- |
| 백엔드 데이터 정합성 | ✅ v5 API의 장소 스키마(`placeUrl`, `addressName`, `roadAddressName`, `categoryName`, `x`, `y`)가 **카카오 로컬 API 응답 포맷과 동일** → 백엔드가 카카오 기반으로 장소 데이터를 다루고 있음 | ⚠️ 좌표는 호환(WGS84)되나 placeUrl 등 부가 정보가 네이버 생태계와 단절 |
| 기존 UI 연계 | ✅ `PlaceDetailPage`가 이미 `map.kakao.com/link/...` 외부 링크 사용 → 앱 내 지도와 길찾기 링크의 브랜드/데이터 일관성 유지 | ⚠️ 지도는 네이버, 길찾기는 카카오로 갈라짐 |
| React 지원 | ✅ `react-kakao-maps-sdk` — 커뮤니티 성숙, 문서 풍부, 선언적 컴포넌트(Map/MapMarker/Polyline) | `react-naver-maps` 존재하나 상대적으로 활용 사례 적음 |
| 요금/키 발급 | 무료 쿼터 넉넉(일 30만 건), JS 키 + 도메인 등록만으로 사용 | 2025년 이후 NCP 콘솔 등록 필요, 과금 체계가 상대적으로 복잡 |
| 모바일 웹(PWA) 성능 | 양쪽 모두 충분. 차이 없음 | 동일 |

핵심 근거는 **백엔드가 이미 카카오 로컬 데이터 모델을 쓰고 있다는 점**이다. `SearchPlaceResponseDto`/`PlaceDetailResponseDto`의 `x`(경도), `y`(위도), `placeUrl` 필드는 카카오 로컬 API의 관례를 그대로 따르며, `DeparturePointDto`도 `x/y` 좌표를 받는다. 카카오맵을 쓰면 좌표·장소 ID·상세 URL이 변환 없이 그대로 흐른다.

---

## 2. 현재 상태 진단

### 2.1 UI (플랜 생성 플로우)

`CourseCreationFlow.tsx` — 9단계 스텝 기반 플로우 (Zustand `useSurveyStore`):

| 스텝 | 화면 | 지도 관련 현황 |
| --- | --- | --- |
| startPoint | 출발지 설정 | `RouteMap` 목업 SVG + `MOCK_ADDRESSES` 목데이터 검색. GPS 성공 시에도 주소는 하드코딩("서울역") |
| placeSelect | 추천 장소 선택 | `RECOMMENDED_PLACES` 목데이터, `RouteMap`에 선택 장소 마커 표시 |
| finalPlan | 최종 플랜 | `RouteMap`에 경로선 표시. 이동시간은 좌표 유클리드 거리 기반 가짜 계산(`getTravelMinutes`) |

`RouteMap.tsx`는 실제 지도가 아니라 **격자+가짜 도로를 그린 SVG**이며, 좌표를 `PLACE_COORDS` 목데이터에서 조회한다.

### 2.2 API (v5 기준, 지도에 쓸 수 있는 것)

| 엔드포인트 | 지도 기능에서의 역할 |
| --- | --- |
| `GET /api/place/search?keyword=` | 출발지/장소 검색. 응답에 `x`, `y` 좌표 포함 → 지도 마커·이동 즉시 가능 |
| `GET /api/place/{placeId}` | 장소 상세. `x`, `y`, `placeUrl`(카카오 장소 페이지), 주소 포함 |
| `POST /api/place/recommend` | 설문 결과(`SurveyResultDto` — emotion, transport, `location{x,y}`) 기반 추천. **generating 스텝의 setTimeout 목업을 대체** |
| `POST /api/plan-place/preview` | 서버 계산 프리뷰. 응답 `places[].x/y` + `requiredTime`, `totalDistance` → 최종 플랜 지도의 마커/경로 데이터 소스 |
| `POST /api/plan/create` | `departurePoint{name, address, x, y}` 저장 (이미 연동됨) |
| `GET /api/plan/{planId}` | 플랜 상세. 단, `PlanPlaceDetailDto`에 **좌표(x,y)가 없음** → 플랜 조회 화면 지도에는 백엔드 스키마 보강 필요 (아래 4장) |

**갭 요약**: 좌표 데이터는 검색/추천/프리뷰 API가 이미 제공한다. 프론트에 없는 것은 (1) 실제 지도 렌더러, (2) 목데이터를 API로 교체하는 작업 두 가지다.

---

## 3. 적용 방향 제안

### 3.1 공통 인프라 (Phase 0)

1. 카카오 개발자 콘솔에서 JavaScript 키 발급, 서비스 도메인(localhost:3000, 운영 도메인) 등록
2. `.env.local`에 `NEXT_PUBLIC_KAKAO_MAP_APP_KEY` 추가
3. `yarn add react-kakao-maps-sdk` + `useKakaoLoader` 훅으로 SDK 지연 로드 (autoload=false, `libraries: ['services']`)
4. 공용 지도 컴포넌트 신설 — 기존 shared/ui 컨벤션 준수:

```
src/shared/ui/KakaoMap/
├── component.tsx      # Map 래퍼 (로딩/에러 폴백 포함)
├── types.ts           # markers, path, center props
├── styles.module.scss
├── index.ts
└── index.stories.tsx
```

폴백 전략: SDK 로드 실패(키 미설정·네트워크) 시 기존 `RouteMap` SVG를 그대로 렌더 → 점진적 전환이 가능하고 Storybook에서도 키 없이 동작.

### 3.2 플랜 생성 플로우 적용 (Phase 1 — 우선순위 높음)

**(a) startPoint 스텝**
- `MOCK_ADDRESSES` 검색 → `GET /api/place/search?keyword=` 로 교체 (debounce 300ms)
- 지도 프리뷰를 `KakaoMap`으로 교체: 선택 좌표로 `panTo`, 마커 1개
- "현재 위치로 설정": geolocation 좌표를 그대로 쓰되, 하드코딩 주소 대신 SDK `services.Geocoder.coord2Address()`로 역지오코딩 (백엔드에 역지오코딩 API가 없으므로 SDK services 라이브러리 활용이 최선)
- 선택: 지도 탭/드래그로 출발지 지정 → 동일하게 역지오코딩

**(b) generating → placeSelect 스텝**
- `setTimeout(3000)` 목업 → `POST /api/place/recommend` 호출로 교체. 요청 바디는 이미 스토어에 있는 값으로 구성: `emotion=mindState`, `transport`, `startTime/endTime`, `location={x: startingPoint.coord.lng, y: startingPoint.coord.lat}`
- 추천 결과의 좌표로 `KakaoMap` 마커 표시, `PLACE_COORDS` 의존 제거
- 마커 탭 → 해당 카드로 스크롤(또는 placeDetail 진입)로 지도-리스트 상호작용

**(c) finalPlan 스텝**
- `KakaoMap` + `Polyline`으로 출발지→장소 순서 경로 표시, bounds 자동 fit
- 가짜 `getTravelMinutes` 제거 → 이미 연동된 `POST /api/plan-place/preview` 응답(`places[].duration`, `requiredTime`, `totalDistance`)을 구간 표기에 사용
- 순서 변경(moveStop) 시 `setTimeout(800)` 대신 preview API 재호출로 실제 재계산

### 3.3 조회 화면 확장 (Phase 2)

- 플랜 상세/내 플랜(`/course/[id]` 계열): `PlanDetailDto` 기반 지도 표시 — 단 좌표 부재 이슈(4장) 해결 필요
- 장소 상세(`PlaceDetailPage`): `GET /api/place/{placeId}`의 `x/y`로 소형 지도 삽입, 기존 `map.kakao.com` 길찾기 링크는 유지
- 스탬프(`POST /api/plan-place/{id}/stamp`)의 `location{x,y}` 검증 UX: 지도에 현재 위치 vs 장소 위치 표시

### 3.4 구현 시 컨벤션 체크

- 컴포넌트 PascalCase·화살표 함수, interface 기반 Props (cc/convention 준수)
- API 호출은 `src/features/plan/api/`, `src/features/place/api/` 도메인 파일에 axios로 추가, `response.data` 반환
- 스타일은 styles.module.scss (BEM, 1~2 depth) — 단 course-creation 내부는 기존 Tailwind 관성을 따름

---

## 4. 백엔드 협의 필요 사항

1. **`PlanPlaceDetailDto`에 `x`, `y` 좌표 추가 요청** — 현재 플랜 상세 조회 응답에 좌표가 없어 저장된 플랜을 지도에 그릴 수 없음. (프리뷰 DTO에는 있음 → 동일하게 노출 요청)
2. `POST /api/place/recommend` 응답 스키마가 명세상 `type: object`로 비어 있음 — 실제 응답 형태(추천 장소 배열 + 좌표 포함 여부) 확인 필요
3. 역지오코딩(좌표→주소) API 제공 여부 — 없으면 프론트에서 카카오 SDK services로 처리(본 문서 기준안)

---

## 5. 단계별 작업 순서 요약

| 단계 | 작업 | 예상 규모 |
| --- | --- | --- |
| 0 | 키 발급, SDK 설치, `shared/ui/KakaoMap` + 폴백 | 소 |
| 1a | 출발지: 장소검색 API + 실지도 + 역지오코딩 | 중 |
| 1b | 추천: recommend API 연동 + 마커 | 중 (백엔드 응답 확인 선행) |
| 1c | 최종 플랜: Polyline 경로 + preview 재계산 연동 | 중 |
| 2 | 플랜/장소 상세 지도 | 소~중 (백엔드 DTO 보강 선행) |
