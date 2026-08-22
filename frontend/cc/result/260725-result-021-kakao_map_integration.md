# 카카오맵 적용 구현 결과

- 작성일: 2026-07-25
- 근거 문서: [260725-ans-008-카카오맵_적용_필요_지점_파악.md](../ans/260725-ans-008-카카오맵_적용_필요_지점_파악.md), [260725-ans-009-카카오맵_도입_최신_절차.md](../ans/260725-ans-009-카카오맵_도입_최신_절차.md)
- 전제: Kakao Developers 앱 생성·카카오맵 사용 설정 ON·JavaScript SDK 도메인 등록·`NEXT_PUBLIC_KAKAO_MAP_APP_KEY` 환경변수 설정 완료 (사용자 확인)

---

## 1. 신규 파일

| 파일 | 내용 |
|------|------|
| `src/shared/lib/kakao/useKakaoMapLoader.ts` | 카카오맵 JS SDK 공용 로더 훅. `useKakaoLoader` 래핑, `libraries: ['services', 'clusterer']`. 여러 컴포넌트에서 호출해도 스크립트는 1회만 로드 |
| `src/shared/lib/kakao/local.ts` | 로컬 서비스 래퍼 — `coordToAddress`(좌표→주소 역지오코딩, 도로명 우선), `searchPlacesByKeyword`(키워드 장소 검색). SDK 미로드 시 null/[] 반환으로 폴백 처리 |
| `src/shared/lib/kakao/index.ts` | re-export |
| `src/types/kakao.d.ts` | `kakao.maps.d.ts` 전역 타입 참조 (tsconfig `include`의 `src/types/**/*.d.ts`로 포함됨) |

## 2. 수정 파일

### `src/shared/types/index.ts`
- `PlaceSchema`에 `coord: { lat, lng }` 옵셔널 필드 추가 (서버 x=경도, y=위도 변환값)

### `src/features/course-creation/components/RouteMap.tsx` — 전면 교체
- 가짜 SVG 지도 → **실제 카카오맵** (`Map` + `CustomOverlayMap` + `Polyline`)
- 출발지 파란 점 마커, 정거장 주황 순번 마커, `showRoute` 시 점선 경로
- `FitBounds` 내부 컴포넌트로 모든 마커가 보이도록 `setBounds` 자동 조정
- `onSelectCoord` prop 신설 — 지도 탭으로 좌표 선택 (출발지 설정 화면용)
- 장소 좌표는 `getStopCoord(stop)` = 서버 `coord` 우선, 목데이터는 `PLACE_COORDS` 폴백
- SDK 로드 실패 시(키 누락/도메인 미등록) 안내 문구 폴백, 로딩 중 스켈레톤

### `src/features/course-creation/components/CourseCreationFlow.tsx`
- **추천 응답 좌표 매핑**: `mapRecommendedPlaces`가 `location {x,y}` 또는 평면 `x/y`를 `coord {lat,lng}`로 변환해 보존
- **현재 위치로 설정**: 하드코딩 mock 주소(`'서울 용산구 한강대로 405 서울역'`) 제거 → GPS 좌표를 `coordToAddress`로 역지오코딩한 실제 주소 사용 (실패 시 `'현재 위치'`)
- **출발지 검색**: `MOCK_ADDRESSES` 필터 → 300ms 디바운스 후 `searchPlacesByKeyword` 호출, 장소명+주소 2줄 결과 표시. SDK 로드 실패 시에만 기존 정적 목록 폴백
- **지도 탭 선택**: 출발지 설정 화면의 RouteMap에 `onSelectCoord` 연결 — 지도를 탭하면 해당 좌표를 역지오코딩해 출발지로 설정
- finalPlan 단계의 `PLACE_COORDS` 직접 참조 → `getStopCoord` 교체 (서버 좌표 우선)
- 기존 `estimatedTotalMin` useMemo 의존성 누락(`recommendedPlaces`) 수정

### `src/features/place-detail/components/PlaceDetailPage.tsx`
- **길찾기 링크 버그 수정**: `link/to/{이름},{주소문자열}` (잘못된 형식) → 서버 장소는 `link/to/{이름},{y},{x}` (위도,경도), 목데이터 장소는 `link/search/{이름}` 폴백
- **위치 미니맵 추가**: 주소 섹션 아래에 서버 장소(x/y 보유)에 한해 160px 카카오맵 표시 (드래그/줌 비활성, 마커 1개)

### 의존성
- `kakao.maps.d.ts` devDependency 추가 — `react-kakao-maps-sdk`의 peerDependency인데 미설치 상태였음 (타입 체크 필수)

## 3. 검증

- `npx tsc --noEmit` 통과 (에러 0)
- `yarn lint` — 수정 파일 기준 신규 에러/경고 0 (기존 경고 1건은 의존성 추가로 해결)
- `yarn build` 통과

## 4. 이번 범위에서 제외한 것 (사유)

| 항목 | 사유 |
|------|------|
| 코스 상세/내 코스 경로 지도 (ans-008 ⑤) | 플랜 상세 응답에 장소 좌표(x/y)가 없음 — 좌표는 `plan-place/preview` 응답에만 존재. **백엔드에 플랜 상세 응답 장소 좌표 추가 요청 필요** |
| 도보/대중교통 경로 조회 API (실경로 폴리라인) | REST 키 서버 호출 필요 (신규 API, 일 1,000건 무료). 백엔드 경유로 붙이는 게 적절 — 후속 작업 |
| 이동시간 클라이언트 계산 대체 | 이미 `plan-place/preview` 서버 값(`requiredTime`/`totalDistance`)이 우선 표시되고 있음. 구간별 표시는 유클리드 근사 유지 |

## 5. 동작 확인 체크리스트 (수동)

1. `yarn dev` → `/create` 진입 → 설문 진행 → 출발지 설정 화면에서:
   - 지도가 실제 카카오맵으로 표시되는지
   - "현재 위치로 설정" 시 실제 주소가 뜨는지 (localhost는 위치 권한 필요)
   - 검색창에 "강남역" 등 입력 시 카카오 검색 결과가 뜨는지
   - 지도를 탭하면 해당 위치가 출발지로 설정되는지
2. 장소 선택/최종 플랜 화면에서 마커·경로선이 표시되는지
3. 서버 장소 상세(숫자 ID)에서 미니맵과 길찾기 링크가 정상 동작하는지
4. 지도가 안 뜨면: 앱 키/도메인 등록(`http://localhost:3000`) 및 [카카오맵] 사용 설정 ON 확인
