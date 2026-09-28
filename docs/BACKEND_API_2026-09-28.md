# 2026-09-28 백엔드 API 변경

## 비로그인 조회

다음 경로는 GET만 공개한다. 쓰기와 `/api/search/recent`, 마이페이지는 로그인 필수다.

- `/api/search`, `/api/search/popular`, `/api/search/autocomplete`, `/api/place/search`
- `/api/place/{placeId}`, `/api/place/{placeId}/review`, `/api/place/{placeId}/plan`
- `/api/plan/{planId}`, `/api/reply/{planId}`, `/api/reply/{replyId}/children`
- `/api/profile/{userId}`, `/api/profile/{userId}/summary`, `/api/profile/{userId}/plans`
- 기존 인기 장소·플랜 조회 및 신규 `/api/region`

비로그인 장소·플랜 상세의 `isLiked`, `isBookmarked`는 false다. 댓글 좋아요 여부도 false다. 비공개·블라인드 플랜과 해당 댓글의 접근 검사는 유지한다.

## 내 플랜·공개 플랜·저장 플랜 페이징

`GET /api/mypage/plans`, `/api/profile/{userId}/plans`, `/api/mypage/scrapped`에 `page=1&limit=20`을 지원한다. limit 최대 50, 0 이하나 offset이 정수 범위를 넘는 요청은 400이다.

```json
{"plans": [], "page": 1, "limit": 20, "hasNext": false, "totalCount": 0}
```

저장 플랜은 `plans` 대신 기존 `scrappedPlans`를 유지한다. 내 플랜·공개 플랜의 빈 페이지는 기존 204, 저장 플랜은 빈 배열을 담은 200이다. 내 플랜·공개 플랜은 `createAt DESC, planId DESC`, 저장 플랜은 `scrappedAt DESC, scrapId DESC`로 DB에서 페이지를 나눈다. totalCount는 각 목록의 공개·소유·스크랩 상태 조건을 적용한 전체 건수다. 조회 사이에 생성·삭제·재저장이 발생하면 offset 방식 특성상 페이지 경계는 이동할 수 있다.

재저장 시각 갱신은 현재 코드에 이미 구현돼 있다. 이번 변경에서는 해제·재저장 후 flush/clear를 거친 재조회와 최상단 정렬을 회귀 검증한다. 운영에서 관찰한 현상의 원인은 운영 버전·데이터와 대조하지 않았다.

## 지역 조회

- `광주`, `광주광역시`, `전남`, `전라남도`, `전남광주`, `전남광주통합특별시`는 조회 코드 `전남`으로 통합한다. 이는 서비스의 조회 그룹이며 행정구역 명칭에 대한 별도 판단은 아니다.
- 미지원 region은 200, 빈 `data`, totalCount=0, hasNext=false다.
- `/api/place/popular?region=전남&sigungu=동구,서구,남구,북구,광산구`
- `/api/plan/popular`도 같은 파라미터를 받는다. **한 경유 장소에서 지역과 시군구 조건이 함께 충족**되어야 한다.
- sigungu는 메타 API의 값을 그대로 사용한다. `수원시 영통구`처럼 시·구가 함께 있는 값도 지원한다. region 없이 sigungu만 보내면 400이다.
- region이 있으면 기존처럼 좌표보다 우선한다. 좌표 조회와 고정 20km 반경은 기존 동작을 유지한다. 가변 radius는 이번 범위에 포함하지 않았다.

장소의 `sido`, `sigungu`와 플랜 장소의 `snapshot_sido`, `snapshot_sigungu`를 저장하고 컬럼으로 검색한다. Kakao 응답에 `region_1depth_name`, `region_2depth_name`이 있으면 우선 사용한다. 이 필드가 없는 키워드 검색 응답은 저장 시 주소/도로명 주소에서 추출한다. 플랜 검색은 생성 당시의 주소 스냅샷 기준을 유지한다.

`GET /api/region` 응답 예:

```json
{
  "regions": [{
    "region": "전남",
    "name": "광주·전남",
    "aliases": ["광주", "광주광역시", "전남", "전남광주", "전남광주통합특별시", "전라남도"],
    "placeCount": 3,
    "sigungu": [{"sigungu": "동구", "placeCount": 1}]
  }]
}
```

16개 시도 그룹을 항상 반환한다. 시군구 목록은 저장된 장소에서 관측된 값이다(전국 행정구역 전체 사전은 아님). placeCount는 공개되고 블라인드되지 않은 플랜에 포함된 장소 수로, 지역 인기 장소 목록과 같은 기준이다. 여러 플랜에 포함된 장소는 한 번만 센다. 알려진 시군구에 공개 조회 가능한 장소가 없으면 0이다. 시군구를 추출하지 못한 장소는 시도 총계에만 포함되므로 시군구 합계보다 시도 총계가 클 수 있다.

## 복제 일정

`POST /api/plan/{planId}/clone`은 로그인 필수다. 복제와 일정 저장은 같은 트랜잭션에서 처리한다.

```json
{"tripStartDate":"2026-10-01 09:30", "tripEndDate":"2026-10-01 12:00"}
```

두 값은 함께 전달하며 형식은 기존 수정 API와 같은 `yyyy-MM-dd HH:mm`이다. 한쪽만 보내거나 시작이 종료보다 늦으면 400이다. 응답에 기존 `planId`, `originalPlanId`, `createAt`과 함께 저장된 `tripStartDate`, `tripEndDate`를 같은 형식으로 반환한다. 새 플랜은 기존처럼 비공개·미인증 상태다.

기존 `scheduledDate`도 허용한다. 새 시각 필드가 없으면 해당 날짜 00:00부터 원본 requiredTime(분)만큼으로 저장한다. 두 시각이 있으면 scheduledDate보다 우선한다. `{}`는 일정 없는 복제를 유지한다. 프론트의 후속 수정 우회 호출은 새 계약으로 전환할 때 제거할 수 있다.

## 마이그레이션과 검증

신규 Flyway `V260928120000__normalize_place_regions_and_list_indexes.sql`은 nullable 컬럼·인덱스를 추가하고 기존 장소와 플랜 주소 스냅샷을 백필한다. 적용된 과거 마이그레이션은 수정하지 않았다. 미확인 주소는 null로 남겨 다른 지역에 잘못 포함하지 않는다.

구버전 앱은 새 컬럼 없이 계속 저장할 수 있다. 다만 마이그레이션 이후 구버전이 쓴 행에는 정규화 값이 없으므로 **전환 중 쓰기를 잠시 차단하거나, 구버전 쓰기를 중지한 뒤 추가 백필을 완료하고 지역 조회를 확인**해야 한다. 아래 명령은 신규 마이그레이션에서 null 행만 보정하는 트랜잭션 SQL을 출력하며 DB에 접속하지 않는다.

```sh
python3 backend/scripts/render-region-backfill.py > /tmp/ilchul-region-backfill.sql
```

운영 적용은 별도 승인·백업·전후 검증 대상이다. 백필 후 알려진 시도 주소의 null 잔여 건수, 시군구 누락, 메타 totalCount와 인기 목록의 totalCount, 비공개 제외를 확인한다. 롤백 시 nullable 추가 컬럼은 그대로 둔다.

로컬 검증:

```sh
JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home backend/gradlew -p backend build
python3 backend/scripts/verify-region-migration.py
```

MySQL 검증 스크립트는 임시 데이터 디렉터리·Unix socket만 사용하며 기존 DB에 접속하거나 TCP 포트를 열지 않는다. 합성 데이터로 백필, 별칭, 공백, 복합 시군구, 스냅샷 우선순위, 구버전 저장 호환성, 추가 백필 반복 실행을 검증하고 서버·임시 디렉터리를 정리한다.
