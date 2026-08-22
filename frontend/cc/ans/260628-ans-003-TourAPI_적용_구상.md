# 한국관광공사 TourAPI — 일출 프로젝트 적용 구상

> 작성일: 2026-06-28  
> 근거 문서: `cc/input/260628-input-001-한국관광공사_TourAPI_개방데이터_매뉴얼_통합정리.md`  
> 수정일: 2026-06-28 — 공공데이터 DB 저장 금지 규약 반영, contentId 저장 방식 및 BFF 호출 구조 추가

---

## 오퍼레이션 요약 — 응답 주요 필드 & 일출 프로젝트 활용 방안

### 공통 오퍼레이션 (웰니스 · 의료 · 반려동물 3개 서비스 모두 제공)

| 오퍼레이션 | 주요 응답 필드 | 일출 프로젝트 활용 방안 |
|---|---|---|
| `areaBasedList` | `contentid`, `title`, `addr1`, `firstimage`, `mapx`, `mapy`, `contentTypeId` | 지역 선택 시 해당 지역 장소 목록 조회 (검색 필터 · 지역 탐색) |
| `locationBasedList` | `contentid`, `title`, `addr1`, `firstimage`, `mapx`, `mapy`, `dist`(거리m) | 사용자 GPS 기반 주변 장소 추천 (메인 화면 · 코스 생성 장소 추천) |
| `searchKeyword` | `contentid`, `title`, `addr1`, `firstimage`, `mapx`, `mapy`, `contentTypeId` | 키워드 검색 결과 목록 (검색 피처) |
| `detailCommon` | `title`, `addr1`, `addr2`, `tel`, `overview`, `firstimage`, `mapx`, `mapy`, `homepage` | 장소 상세 기본 정보 (이름·주소·전화·소개·좌표) |
| `detailIntro` | 콘텐츠 타입별 상이 (예: `usetime` 운영시간, `usefee` 입장료, `parking` 주차) | 장소 상세 탭 — 운영시간·이용요금 등 카테고리별 안내 |
| `detailImage` | `originimgurl`, `smallimageurl`, `imgname` | 장소 상세 이미지 갤러리 |

**응답 예시 (`locationBasedList` 단일 아이템)**
```json
{
  "contentid": "126508",
  "title": "북한산 국립공원",
  "addr1": "서울특별시 강북구 우이동",
  "firstimage": "http://tong.visitkorea.or.kr/cms/resource/image.jpg",
  "mapx": "127.0117",
  "mapy": "37.6596",
  "dist": "1240.5",
  "contentTypeId": "76"
}
```

---

### 서비스별 전용 오퍼레이션

| 서비스 | 오퍼레이션 | 주요 응답 필드 | 일출 프로젝트 활용 방안 |
|---|---|---|---|
| 웰니스 | `wellnessTursmSyncList` | `contentid`, `modifiedtime` | ⛔ DB 저장 금지 규약으로 사용 불가 |
| 웰니스 | `detailIntro` (웰니스 전용) | `goodstay`, `hanok`, `benikia` 등 웰니스 인증 정보 | 감정 상태 "지치고 기운없음" 장소 추천 시 웰니스 인증 배지 표시 |
| 반려동물 | `detailPetTour2` | `acmpyTypeCd`(동반유형), `acmpyPsblCpam`(동반가능동물), `acmpyNeedMtr`(준비물) | 반려동물 동반 가능 여부 뱃지 · 조건 안내 |
| 반려동물 | `petTourSyncList2` | `contentid`, `modifiedtime` | ⛔ DB 저장 금지 규약으로 사용 불가 |
| 반려동물 | `ldongCode2` | `ldongCd`(법정동코드), `ldongAddr`(법정동명) | 지역 필터 드롭다운 코드 목록 |
| 반려동물 | `lclsSystmCode2` | `code`, `name` (대·중·소분류) | 카테고리 필터 코드 목록 |

> **의료관광 서비스(`MdclTursmService`) 전용 오퍼레이션은 적용 제외** — 서비스 목적이 외국인 의료기관 안내로 일출 앱과 방향이 다름.

**응답 예시 (`detailCommon` 기반 장소 상세 통합)**
```json
{
  "contentid": "126508",
  "title": "북한산 국립공원",
  "addr1": "서울특별시 강북구 우이동",
  "addr2": "우이분소",
  "tel": "02-909-0497",
  "overview": "서울 도심 속 자연 치유 공간...",
  "firstimage": "http://tong.visitkorea.or.kr/cms/.../image.jpg",
  "mapx": "127.0117",
  "mapy": "37.6596"
}
```

---

### 코스 저장 시 DB 구조 (contentId만 저장)

```
plan_places 테이블
┌──────────┬───────────┬───────┐
│  planId  │ contentId │ order │
├──────────┼───────────┼───────┤
│   plan1  │  "126508" │   1   │  ← 숫자 식별자만 저장
│   plan1  │  "234719" │   2   │  ← 장소명·주소·이미지 없음
└──────────┴───────────┴───────┘
코스 조회 시 → contentId별 detailCommon 실시간 호출 → 렌더링
```

---

## 서비스별 예시 장소 — 실제 API 호출 흐름

### 웰니스 관광정보 서비스 (`WellnessTursmService`)

> 예시 장소: **센텀시티 스파랜드** (contentId: `702551`)

#### Step 1. 장소 목록 조회 (`locationBasedList` 또는 `searchKeyword`)

```
# 키워드 "스파"로 검색
GET http://apis.data.go.kr/B551011/WellnessTursmService/searchKeyword
  ?serviceKey=인증키&keyword=스파&contentTypeId=12&arrange=C&langDivCd=KOR&_type=json
```

```json
// 응답
{
  "response": {
    "body": {
      "items": {
        "item": [
          {
            "contentId": "702551",
            "contentTypeId": "12",
            "baseAddr": "부산광역시 해운대구 센텀남대로 35 (우동)",
            "zipCd": "48058",
            "orgImage": "http://tong.visitkorea.or.kr/cms/resource/02/3544802_image2_1.JPEG",
            "thumbImage": "http://tong.visitkorea.or.kr/cms/resource/02/3544802_image3_1.JPEG"
          }
        ]
      }
    }
  }
}
```

#### Step 2. 장소 상세 조회 (`detailCommon`)

```
GET http://apis.data.go.kr/B551011/WellnessTursmService/detailCommon
  ?serviceKey=인증키&contentId=702551&langDivCd=KOR&_type=json
```

```json
// 응답
{
  "response": {
    "body": {
      "items": {
        "item": [
          {
            "contentId": "702551",
            "contentTypeId": "12",
            "title": "센텀시티 스파랜드",
            "homepage": "https://www.shinsegae.com/store/entertainment/centum-spaland.do",
            "tel": "",
            "orgImage": "http://tong.visitkorea.or.kr/cms/..."
          }
        ]
      }
    }
  }
}
```

#### Step 3. 소개 정보 조회 (`detailIntro`)

```
GET http://apis.data.go.kr/B551011/WellnessTursmService/detailIntro
  ?serviceKey=인증키&contentId=702551&contentTypeId=12&langDivCd=KOR&_type=json
```

```json
// 응답
{
  "response": {
    "body": {
      "items": {
        "item": [
          {
            "contentId": "702551",
            "contentTypeId": "12",
            "infocenter": "055-***-****",
            "parking": "가능",
            "restdate": "연중무휴",
            "usetime": "상시 개방",
            "accomcount": ""
          }
        ]
      }
    }
  }
}
```

#### Step 4. 이미지 조회 (`detailImage`)

```
GET http://apis.data.go.kr/B551011/WellnessTursmService/detailImage
  ?serviceKey=인증키&contentId=702551&imageYN=Y&langDivCd=KOR&_type=json
```

```json
// 응답
{
  "response": {
    "body": {
      "items": {
        "item": [
          {
            "contentId": "702551",
            "orgImage": "http://tong.visitkorea.or.kr/cms/resource/62/2661062_image2_1.JPG",
            "imgname": "스파랜드 센텀시티_4",
            "thumbImage": "http://tong.visitkorea.or.kr/cms/resource/62/2661062_image2_1.JPG",
            "cpyrhtDivCd": "Type3",
            "serialnum": "2661062_4"
          }
        ]
      }
    }
  }
}
```

---

### 반려동물 동반여행 서비스 (`KorPetTourService2`)

> 예시 장소: **여의도한강공원** (contentId: `1059479`)

#### Step 1. 장소 목록 조회 (`locationBasedList2`)

```
# 내 주변 1000m 이내
GET http://apis.data.go.kr/B551011/KorPetTourService2/locationBasedList2
  ?serviceKey=인증키&mapX=126.981611&mapY=37.568477&radius=1000&_type=json
```

```json
// 응답
{
  "response": {
    "body": {
      "items": {
        "item": [
          {
            "contentid": "264353",
            "contenttypeid": "12",
            "addr1": "서울특별시 종로구 인사동길 62 (관훈동)",
            "dist": "793.71",
            "firstimage": "http://tong.visitkorea.or.kr/cms/resource/03/3412103_image2_1.JPG",
            "firstimage2": "http://tong.visitkorea.or.kr/cms/resource/03/3412103_image3_1.JPG",
            "mapx": "126.985...",
            "mapy": "37.573..."
          }
        ]
      }
    }
  }
}
```

#### Step 2. 공통정보 조회 (`detailCommon2`)

```
GET http://apis.data.go.kr/B551011/KorPetTourService2/detailCommon2
  ?serviceKey=인증키&contentId=1059479&_type=json
```

```json
// 응답
{
  "response": {
    "body": {
      "items": {
        "item": [
          {
            "contentid": "1059479",
            "contenttypeid": "12",
            "title": "여의도한강공원",
            "tel": "",
            "homepage": "https://hangang.seoul.go.kr"
          }
        ]
      }
    }
  }
}
```

#### Step 3. 소개정보 조회 (`detailIntro2`)

```
GET http://apis.data.go.kr/B551011/KorPetTourService2/detailIntro2
  ?serviceKey=인증키&contentId=1059479&contentTypeId=12&_type=json
```

```json
// 응답
{
  "response": {
    "body": {
      "items": {
        "item": [
          {
            "contentid": "1059479",
            "restdate": "연중무휴",
            "usetime": "상시 개방",
            "parking": "가능 (1,7...)",
            "infocenter": "02-****-****~6"
          }
        ]
      }
    }
  }
}
```

#### Step 4. 반려동물 전용 정보 조회 (`detailPetTour2`) ← 핵심

```
GET http://apis.data.go.kr/B551011/KorPetTourService2/detailPetTour2
  ?serviceKey=인증키&contentId=1059479&_type=json
```

```json
// 응답 — 반려동물 서비스 전용 필드
{
  "response": {
    "body": {
      "items": {
        "item": [
          {
            "contentid": "1059479",
            "acmpyTypeCd": "전구역 동반가능",
            "acmpyPsblCpam": "전 견종 동반 가능",
            "acmpyNeedMtr": "목줄 착용",
            "etcAcmpyInfo": "- 목줄은 2m 이내로 유지\n- 맹견의 경우, 입마개 착용 필수\n- 배변봉투 지참 및 배변처리 필수",
            "relaAcdntRiskMtr": "",
            "relaPosesFclty": "",
            "relaPurcPrdlst": ""
          }
        ]
      }
    }
  }
}
```

> **일출 프로젝트 활용**: `acmpyTypeCd`(동반 가능 구역), `acmpyPsblCpam`(동반 가능 견종), `acmpyNeedMtr`(필요 준비물)을 장소 상세 카드에 "반려동물 동반 조건" 섹션으로 표시.

---

### 서비스별 오퍼레이션 명칭 차이 주의

| 오퍼레이션 | 웰니스 | 반려동물 |
|---|---|---|
| 지역기반 목록 | `areaBasedList` | `areaBasedList2` |
| 위치기반 목록 | `locationBasedList` | `locationBasedList2` |
| 키워드 검색 | `searchKeyword` | `searchKeyword2` |
| 공통정보 | `detailCommon` | `detailCommon2` |
| 소개정보 | `detailIntro` | `detailIntro2` |
| 이미지 | `detailImage` | `detailImage2` |
| 반복정보 | `detailInfo` | `detailInfo2` |
| 서비스 전용 | — | `detailPetTour2` |
| 법정동 코드 | `ldongCode` | `ldongCode2` |
| 분류체계 코드 | — | `lclsSystmCode2` |

> 반려동물 서비스는 모든 오퍼레이션명에 `2`가 붙는다. BFF route 구현 시 `service` 파라미터로 웰니스/반려동물 분기 처리 필요.

---

## 1. 현황 요약

현재 일출 앱의 장소 데이터는 전부 `src/shared/data/mockData.ts`의 하드코딩 목데이터에 의존하고 있다.  
TourAPI를 연동하면 **실데이터 기반의 장소 목록·검색·상세정보**를 제공할 수 있다.

**활용 TourAPI 서비스**

| 서비스 | 서비스ID | 특화 콘텐츠 | 적용 여부 |
|---|---|---|---|
| 웰니스 관광정보 | `WellnessTursmService` | 힐링·치유 여행 특화 장소 | ✅ 적용 |
| 반려동물 동반여행 | `KorPetTourService2` | 반려동물 동반 가능 장소 | ✅ 적용 |
| 의료 관광정보 | `MdclTursmService` | 의료관광 병원·클리닉 | ❌ 제외 |

> **의료관광 서비스 제외 이유**: 외국인 대상 국내 의료기관 정보 제공이 목적으로, 힐링 여행 코스 기획이라는 일출 앱의 서비스 방향과 결이 다름. 응답 데이터도 영문 기반이며 병원·클리닉 정보 위주로 코스 구성 요소로 부적합.

**공통 핵심 오퍼레이션 (3개 서비스 모두 제공)**

| 오퍼레이션 | 메서드 | 주요 파라미터 |
|---|---|---|
| `areaBasedList` | GET | areaCode, sigunguCode, contentTypeId |
| `locationBasedList` | GET | mapX, mapY, radius (GPS 기반) |
| `searchKeyword` | GET | keyword, areaCode, contentTypeId |
| `detailCommon` | GET | contentId → 이름, 주소, 전화, 좌표, 대표이미지 |
| `detailIntro` | GET | contentId → 운영시간, 입장료 등 카테고리별 소개 |
| `detailImage` | GET | contentId → 이미지 목록 |

---

## 2. 피처별 적용 구상

### 2-1. 장소 검색 (`features/search`)

**현재**: UI 컴포넌트만 존재, API 미연동  
**적용**: `searchKeyword` 오퍼레이션으로 실시간 검색 연동

```
사용자 키워드 입력
  → Next.js API route /api/tour/search?keyword=&areaCode=
  → TourAPI searchKeyword (웰니스 OR 반려동물 OR 공통)
  → 결과 카드 렌더링
```

**필터 구성안**
- 카테고리 필터: `contentTypeId` (관광지/숙박/음식점/레포츠 등)
- 지역 필터: `areaCode` (시도) + `sigunguCode` (시군구)
- 서비스 필터: 웰니스 전용 / 반려동물 동반 가능

---

### 2-2. 내 주변 인기 장소 (`features/main`)

**현재**: `/api/place/popular` → 목데이터 반환  
**적용**: `locationBasedList`로 사용자 GPS 기반 실데이터 교체

```
사용자 위치 (mapX, mapY) 획득
  → /api/tour/nearby?mapX=&mapY=&radius=5000
  → TourAPI locationBasedList
  → 기존 PopularPlace 타입에 매핑
```

**매핑 필드**
| TourAPI 응답 | 현재 PopularPlace 타입 |
|---|---|
| `title` | `name` |
| `firstimage` | `image` |
| `addr1` | `location` |
| `dist` | (거리 뱃지 신규 추가 가능) |
| `contentTypeId` | `category` |

---

### 2-3. 코스 생성 장소 추천 (`features/course-creation`)

**현재**: `RECOMMENDED_PLACES` 하드코딩 목데이터  
**적용**: 감정 설문 결과 → contentTypeId 매핑 → `locationBasedList` or `searchKeyword`

**감정 → 웰니스 카테고리 매핑 제안**

| 감정 상태 | 추천 장소 유형 | contentTypeId | 서비스 |
|---|---|---|---|
| 지치고 기운없음 | 온천·스파·자연치유 | 웰니스 소개정보 참고 | WellnessTursmService |
| 울적하고 속상함 | 공원·숲길·해안 | A01 (자연) | 공통 |
| 답답하고 짜증남 | 레포츠·액티비티 | A03 (레포츠) | 공통 |
| 무기력·재미없음 | 문화시설·전시 | A02 (문화시설) | 공통 |
| 기분 좋음 | 맛집·쇼핑·명소 | A05 (음식), A04 (쇼핑) | 공통 |
| 생각 정리 필요 | 사찰·한옥·서원 | A0201 (역사관광지) | 공통 |
| 멍한 느낌 | 바다·호수·섬 | A0101 (자연관광지) | 공통 |

이동수단·이동시간 파라미터 → `locationBasedList`의 `radius` 값으로 변환  
(도보 1시간 → radius 약 3000m, 자가용 상관없음 → radius 50000m)

---

### 2-4. 장소 상세 (`features/place-detail`)

**현재**: `PlaceDetail` 타입이 수동 정의, mock 데이터  
**적용**: contentId 기반으로 3개 오퍼레이션 병렬 호출

```
/api/tour/place/[contentId]
  → Promise.all([
      detailCommon(contentId),   // 기본 정보
      detailIntro(contentId),    // 운영시간·입장료
      detailImage(contentId),    // 이미지 목록
    ])
  → PlaceDetail 타입으로 통합 반환
```

**현재 PlaceDetail 타입 ↔ TourAPI 필드 매핑**

| 현재 타입 필드 | TourAPI 필드 |
|---|---|
| `name` | `detailCommon.title` |
| `images` | `detailImage.originimgurl[]` |
| `location.address` | `detailCommon.addr1 + addr2` |
| `coordinates.lat/lng` | `detailCommon.mapy / mapx` |
| `phone` | `detailCommon.tel` |
| `operatingHours` | `detailIntro` (콘텐츠 타입별 상이) |
| `description` | `detailCommon.overview` |

---

### 2-5. 반려동물 동반 필터 (신규 기능 제안)

`KorPetTourService2`는 반려동물 동반 가능 여부·조건을 별도 필드로 제공.  
`detailPetTour` 오퍼레이션에서 `acmpyTypeCd`(동반유형), `relaAcmpyAt`(동반가능여부) 등 반환.

**적용 위치**: 검색 필터에 "반려동물 동반 가능" 토글 추가 → 해당 서비스로 라우팅

---

## 3. 공공데이터 이용 규약

> **공공데이터포털 API는 응답 데이터를 서비스 DB에 직접 저장·복제하는 것이 금지되어 있다.**  
> 모든 장소 정보는 사용자 요청 시점에 TourAPI를 실시간 호출하여 제공해야 한다.

### 허용 / 금지 기준

| 구분 | 허용 | 금지 |
|---|---|---|
| 캐싱 | 요청 단위 인메모리 캐시 (React Query staleTime, Redis TTL 수 분) | 장소명·주소·이미지 등 TourAPI 응답값을 서비스 DB 테이블에 저장 |
| 식별자 저장 | 코스에 연결된 `contentId`(숫자 식별자)만 DB 저장 | contentId로 조회한 상세 데이터(title, addr, image 등) DB 저장 |
| 동기화 | — | `syncList` 오퍼레이션으로 데이터를 주기적으로 수집·적재하는 파이프라인 |

### 아키텍처 영향

- **코스 저장 방식**: 코스 내 장소는 `contentId`만 저장. 코스 조회 시 각 contentId로 TourAPI를 실시간 호출해 장소 정보 렌더링.
- **일 1,000건 한도가 더 중요해짐**: DB 버퍼 없이 실시간 호출이므로, React Query `staleTime` 설정으로 동일 contentId의 중복 호출 최소화 필수.
- **장소 상세 3개 병렬 호출**: 상세 페이지 1회 진입 = 3건 소모(`detailCommon` + `detailIntro` + `detailImage`). 페이지 이탈 후 재진입 시 캐시 재활용 필수.
- **`syncList` 오퍼레이션 사용 불가**: 변경된 항목을 탐지해 DB에 적재하는 용도이므로, 이 규약 하에서 실질적 활용 방법이 없음.

### contentId 저장 방식 상세

`contentId`는 TourAPI 내부의 숫자 키(예: `126508`)로, 콘텐츠(장소명·주소·이미지)가 아닌 **식별자**이므로 DB 저장이 허용된다.  
유튜브 영상 URL을 즐겨찾기에 저장하는 것이 콘텐츠 복제가 아닌 것과 같은 원리.

```
DB에 저장되는 것 (허용)
├── plan { id, userId, name, date }
└── plan_places { planId, contentId: "126508", order: 1 }
                            ↑ 숫자 식별자만 (장소명·주소·이미지 없음)

코스 조회 시 (실시간 호출)
└── contentId → /api/tour/place/[contentId] → TourAPI → 장소 정보 렌더링
```

**실용적 리스크**: TourAPI에서 해당 장소가 삭제되면 contentId로 정보를 불러올 수 없음.  
→ 조회 실패 시 "장소 정보를 불러올 수 없습니다" fallback 처리로 대응.

---

## 4. API 호출 방향 — BFF vs 클라이언트 직접 호출

**서버(BFF) 경유를 권장한다.**

### 결정적 이유: 서비스키 보안

클라이언트에서 TourAPI를 직접 호출하면 브라우저 네트워크 탭에 `serviceKey`가 그대로 노출된다.  
유출된 키로 타인이 일 1,000건 한도를 소진하면 **서비스 전체가 당일 TourAPI를 사용할 수 없게 된다.**

```
# 클라이언트 직접 호출 시 — 누구나 키를 볼 수 있음
https://apis.data.go.kr/B551011/WellnessTursmService/locationBasedList
  ?serviceKey=ABC123XYZ...   ← 노출
```

### 비교

| 항목 | 클라이언트 직접 | 서버(BFF) 경유 |
|---|---|---|
| 서비스키 보안 | 노출됨 | `.env`에서만 관리 |
| CORS | TourAPI 허용 여부에 따라 불안정 | 서버→서버 호출로 CORS 무관 |
| 응답 가공 | TourAPI 원본 구조 그대로 사용 | 프로젝트 타입에 맞게 변환 후 반환 |
| 캐싱 | 브라우저 캐시만 | `Cache-Control` 헤더로 서버 레벨 캐싱 추가 가능 |
| API 교체 | 모든 feature 파일 수정 필요 | BFF route 1곳만 수정 |

> 현재 프로젝트가 이미 `/api/place/popular`, `/api/plan/popular` 등 BFF 패턴을 사용 중이므로 기존 구조와도 일치한다.

---

## 5. BFF API Route 설계안 (Next.js API Route)

Next.js API route를 프록시로 두어 서비스키를 서버에서만 관리.

```
src/app/api/tour/
├── search/route.ts            # searchKeyword (서비스 파라미터로 분기)
├── nearby/route.ts            # locationBasedList
├── area/route.ts              # areaBasedList
└── place/[contentId]/route.ts # detailCommon + detailIntro + detailImage 통합
```

> `sync/route.ts`는 DB 저장 금지 규약으로 인해 설계에서 제외.

**공통 처리 사항**
- `serviceKey`는 `.env`의 `TOUR_API_KEY`로 관리 (클라이언트 노출 금지)
- 응답은 JSON(`&_type=json`)으로 요청
- `MobileApp=ilchul`, `MobileOS=ETC` 고정
- BFF route 응답에 `Cache-Control: max-age=300` 헤더 설정으로 서버 레벨 단기 캐싱 활용

---

## 5. 구현 우선순위 제안

| 순위 | 피처 | 이유 |
|---|---|---|
| 1 | 코스 생성 장소 추천 | 앱의 핵심 가치, 감정→장소 흐름이 실데이터로 완성됨 |
| 2 | 장소 검색 | UI가 이미 존재, API만 연결하면 즉시 동작 |
| 3 | 내 주변 인기 장소 | 메인 화면 실데이터화, GPS 연동 이미 있음 |
| 4 | 장소 상세 | contentId 기반 상세정보 완성 |
| 5 | 반려동물 동반 필터 | 차별화 기능, 추후 확장 |

---

## 6. 주의사항

- **DB 저장 금지**: TourAPI 응답 데이터(장소명, 주소, 이미지 등)를 서비스 DB에 저장하지 않는다. `contentId`(식별자)만 저장 허용
- **개발계정 한도**: 오퍼레이션별 일 1,000건. DB 버퍼 없이 실시간 호출이므로 React Query `staleTime` 설정으로 중복 호출 최소화 필수
- **XML→JSON**: 반드시 `&_type=json` 추가, 누락 시 XML 파싱 오류
- **contentTypeId 분류**: 웰니스·의료 서비스는 일반 관광 contentTypeId와 다를 수 있음 (서비스별 코드표 별도 확인 필요)
- **syncList 사용 불가**: `wellnessTursmSyncList`, `petTourSyncList`는 DB 적재 파이프라인용 오퍼레이션 — DB 저장 금지 규약으로 활용 불가
- **운영계정 전환**: 실서비스 전 한국관광공사 담당자 승인 필요 (1~3일), 미리 신청 권장
