# 공공 API(한국관광공사) 프로젝트 적용 계획 초안

> 근거 문서: [cc/input/공공데이터_활용방안분류.md](../input/공공데이터_활용방안분류.md)
> 작성일: 2026-07-15 / 상태: 초안 (팀 검토 전)

## 1. 목표

한국관광공사 공공 API 18종 중 MVP 범위(1, 2, 5, 7, 12, 16, 17)를 일출(힐링 여행 코스 플래닝 PWA)의 기존 기능 흐름에 통합한다. MVP 이후 항목(3, 4, 8, 9, 13, 14, 18)은 확장 로드맵으로만 정의한다.

## 2. 기능 매핑 (공공 API → 기존 feature)

| 적용 영역 | 대상 feature | 활용 API | 내용 |
| --- | --- | --- | --- |
| 메인 "이달의 인기 여행지" | `features/main` | 1 (자원 수요), 2 (수요 강도) | 지역 카드 3~5개 (수요 순위 배지) |
| 지역 관광 리포트 | `features/report` 또는 신규 `features/region-report` | 1, 2 (+MVP 후 3, 4) | 수요 지수 요약, 추천 레이블, 지역 플랜 목록 |
| 코스 생성 장소 추천 | `features/course-creation`, `features/emotion-analysis` | 5 (웰니스), 7 (반려동물), 12 (두루누비) | 감정 설문 결과 → contentTypeId 매핑 → 주변 힐링 장소 추천 |
| 장소 검색 | `features/search` | 5, 7, 12 | 힐링 키워드 검색 + "반려동물 동반" 토글 |
| 장소 상세 | `features/place-detail` | 5 (detailCommon/Intro/Image), 7 (detailPetTour2) | 상세 정보 + 반려동물 동반 조건 섹션 |
| 장소 이미지 보강 | `features/main`, `features/place` | 16 (관광사진), 17 (생태) | 이미지 없는 장소 카드 fallback |

## 3. 아키텍처 방침

### 3.1 BFF(Next.js API Route) 경유 원칙
- 공공 API 서비스 키를 클라이언트에 노출하지 않기 위해 **모든 공공 API 호출은 `src/app/api/public-data/*` 라우트를 경유**한다.
- 백엔드(localhost:3845)에서 프록시할지, 프론트 BFF에서 직접 호출할지 **백엔드 팀과 합의 필요** (미결 사항 #1).
- 라우트 초안:
  - `GET /api/public-data/popular-regions` — API 1+2 조합, 랭킹 계산 포함
  - `GET /api/public-data/wellness?type={locationBased|areaBased|keyword|detail}` — API 5
  - `GET /api/public-data/pet-tour?...` — API 7
  - `GET /api/public-data/durunubi/courses?...` — API 12
  - `GET /api/public-data/photos?keyword=...` — API 16, 17 (이미지 fallback)

### 3.2 캐싱 전략
- API 1, 2는 월 단위 데이터(`baseYm`) → 라우트에서 장기 캐시(revalidate 24h 이상) 또는 스케줄러 사전 집계.
- API 5, 7 위치기반 조회는 짧은 캐시(수 분) + 좌표 반올림으로 캐시 히트율 확보.
- 공공 API 일일 트래픽 제한 확인 필요 (미결 사항 #2).

### 3.3 응답 정규화
- 공공 API 필드명이 서비스마다 상이(`contentId` vs `contentid`, `firstimage` vs `orgImage`) → BFF 레이어에서 **공용 `Place` DTO로 정규화** 후 클라이언트에 전달.
- 정규화 타입은 `src/shared/lib/types/publicData.ts`(가칭)에 정의, feature별 types와 분리.

## 4. 단계별 실행 계획

### Phase 1 — 기반 구축 (1주 내 목표)
1. 공공데이터포털 서비스 키 발급·환경변수 세팅 (`PUBLIC_DATA_API_KEY`)
2. BFF 라우트 골격 + 공용 fetch 유틸(에러/타임아웃/재시도) 작성
3. `Place` DTO 정규화 레이어 + 각 API 응답 매퍼
4. 트래픽 제한·데이터 최신성 검증(실호출 테스트)

### Phase 2 — 코스 생성 장소 추천 (핵심, MVP 필수)
1. `features/emotion-analysis` 설문 결과 → 웰니스 `contentTypeId`/키워드 매핑 테이블 정의 (예: 지치고 기운없음 → 온천·스파, 멍한 느낌 → 바다·자연)
2. `features/course-creation`에 추천 장소 리스트 연동 (API 5 `locationBasedList`)
3. "반려동물과 함께" 설문 옵션 추가 시 API 7로 추천 소스 전환
4. 두루누비(API 12) 걷기 코스를 코스 작성 시 "코스 통째로 추가" 옵션으로 제공 (GPX·거리·난이도 표시)

### Phase 3 — 검색·장소 상세 보강
1. `features/search`에 힐링 키워드 검색(API 5 `searchKeyword`) 및 "반려동물 동반 가능" 필터 토글
2. `features/place-detail`에 상세 정보(API 5 detail 3종 병렬 호출), 반려동물 동반 조건 섹션(API 7 `detailPetTour2`)
3. 이미지 없는 장소의 fallback 이미지(API 16, 17) — 단, 관광 명소 위주라는 한계로 키워드 매칭 실패 시 기존 placeholder 유지

### Phase 4 — 메인 "이달의 인기 여행지" (메인 콘텐츠)
1. API 1(주지표) + API 2(가중치)로 지역 랭킹 산출 로직 확정
2. `features/main`에 지역 카드 섹션 추가 (기존 인기 장소/코스 섹션 패턴 재사용)
3. 지역 카드 → 지역 관광 리포트 페이지 (`app/region/[code]/page.tsx` 신설, thin wrapper + feature 컴포넌트)
4. 리포트 내 해당 지역 플랜 목록 → 기존 플랜 상세로 연결

### Phase 5 — MVP 이후 (로드맵만 정의, 구현 보류)
- API 3, 4: 리포트 고도화("이런 여행자에게 추천" 레이블, 수상작 이미지)
- API 8, 9: 장소 선택 시 연관 관광지 추천, 중심 관광지 스케줄러 집계
- API 13: "덜 붐비는 힐링 여행지" 혼잡도 인사이트
- API 14: 장소 상세 오디오 가이드
- API 18: 접근성 필터(무장애 여행)

## 5. 카카오맵 융합

> 연계 문서: [260710-plan-009-map_integration_proposal.md](260710-plan-009-map_integration_proposal.md)
> 원칙: 공공 API는 "어떤 장소를 보여줄지(콘텐츠)", 카카오맵은 "어디에 어떻게 보여줄지(캔버스)"를 담당한다. 양쪽 모두 WGS84 좌표(`mapX/mapY` ↔ `x/y`)라 좌표 변환 없이 결합 가능.

### 5.1 융합 지점

1. **코스 생성 — 지도 위 이중 소스 추천 (최대 시너지)**
   - plan-009 placeSelect 스텝(카카오맵 마커 + 백엔드 `POST /api/place/recommend`)에 공공 API 추천을 추가.
   - 출발지 좌표를 웰니스(API 5)/반려동물(API 7) `locationBasedList`에 전달 → 백엔드 추천과 공공 데이터 힐링 장소를 **같은 지도에 다른 스타일 마커**로 표시 (백엔드 추천 = 기본 마커, 웰니스 = "힐링" 배지 마커).

2. **두루누비 GPX → 카카오맵 Polyline**
   - API 12의 `gpxpath`를 BFF에서 파싱해 좌표 배열로 변환 (라우트 초안: `GET /api/public-data/durunubi/courses/{id}/path`).
   - plan-009 finalPlan 스텝의 `Polyline`에 그대로 전달 → "걷기 코스 통째로 추가" 시 실제 코스 경로가 지도에 그려짐. 마커만 찍는 일반 여행 앱과의 차별화 포인트.

3. **공공 데이터 장소 ↔ 카카오 장소 매칭 (핵심 기술 과제)**
   - 문제: 공공 API 장소는 `contentId`만 있고 카카오 `placeId`/`placeUrl`이 없음. 백엔드 장소 스키마는 카카오 로컬 기반.
   - 해결: 공공 데이터 장소를 코스에 담을 때 카카오 SDK `services.Places.keywordSearch()`를 **장소명 + 좌표 반경**으로 호출해 카카오 장소와 매칭 → 매칭 성공 시 기존 백엔드 플로우(`plan/create`의 `x/y`)와 길찾기 링크(`map.kakao.com/link/...`) 재사용.
   - 매칭 실패 시 좌표만으로 저장하는 fallback. 이 매칭 레이어는 3.3의 `Place` DTO 정규화에 포함.
   - MVP에서는 "매칭 시도 → 실패 시 좌표-only"의 느슨한 수준으로 제한 (SDK 쿼터 소비·이름 매칭 부정확성 리스크).

4. **검색 — 지도 bounds 기반 탐색**
   - 카카오맵 현재 viewport의 중심좌표·반경을 API 5/7 `locationBasedList` 파라미터로 전달 → "이 지역에서 재검색" 패턴.
   - 3.2의 좌표 반올림 캐싱이 그대로 캐시 키가 되어 지도 이동에 따른 호출 폭증 방지.

5. **지역 리포트 — 지역 코드 → 지도 영역**
   - API 1·2의 `areaCd`/`signguCd`는 행정구역 코드 → 시군구 중심좌표 매핑 테이블(정적 상수, 17개 시도 + 필요 시군구)을 두고 카카오맵을 해당 지역으로 센터링.
   - 그 위에 해당 지역의 웰니스 장소·기존 플랜을 마커로 표시해 리포트를 시각적 콘텐츠로 격상.

6. **장소 상세 — 소형 지도 + 부가 정보 결합**
   - plan-009 Phase 2의 장소 상세 소형 지도에 반려동물 동반 조건(API 7) 섹션 병치.
   - MVP 이후: 무장애 정보(API 18)의 `route`(대중교통 경로 텍스트)를 지도 옆 접근 안내 섹션으로 배치.

### 5.2 데이터 흐름 및 작업 순서

- **데이터 흐름**: 공공 API → BFF(`/api/public-data/*`, 캐시 + `Place` DTO 정규화 — 이때 필드명을 `x/y`로 통일해 카카오 관례를 따름) → feature hooks → `shared/ui/KakaoMap`(markers, path, center props).
  plan-009의 KakaoMap 컴포넌트 인터페이스를 그대로 소비하므로 두 계획은 서로 수정 없이 조립된다.
- **작업 순서**: plan-009 Phase 0~1(지도 인프라 + 백엔드 연동) 선행 → 본 계획 Phase 2(공공 데이터 추천)를 지도 위에 얹는 순서. 지도가 먼저 있어야 공공 데이터의 가치(마커, 경로)가 시각화된다.

## 6. 컨벤션 준수 사항

- FSD 구조 유지: 페이지는 thin wrapper, 로직은 feature hooks
- feature API 파일 패턴: `features/{feature}/api/{feature}.api.ts` → axios로 Next.js API 라우트 호출
- 비활성화 기능(피드, 매거진)은 적용 범위에서 제외

## 7. 미결 사항 (팀 논의 필요)

1. **호출 주체**: 공공 API를 프론트 BFF에서 직접 호출 vs 백엔드(3845) 프록시 — 키 관리·캐싱 위치 결정
2. **트래픽 제한**: 각 API의 일일 호출 한도 및 초과 시 fallback 정책
3. **지역 리포트 페이지**: 기존 `features/report`(신고/리포트) 와 도메인 충돌 여부 → 신규 feature 분리 권장
4. **이미지 저작권**: API 4, 16의 `cpyrhtDivCd` 타입별 사용 범위 확인
5. **랭킹 산출식**: API 1 주지표 + API 2 가중치의 구체적 계산식 (백엔드 스케줄러 vs 프론트 계산)
