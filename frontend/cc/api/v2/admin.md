# ADMIN REPORT API (v2)

> 관리자(운영자)용 신고 처리 API. 일반 사용자 API(`report.md`)와 분리된 어드민 전용 엔드포인트.
> 현재 구현: BFF 라우트(`src/app/api/admin/reports/`) — `useMock = true` 상태, 프로덕션 백엔드 미연결.

| ID | 제목 | 메서드 | URL | 서버 | 클라이언트 | FE검토 |
| --- | --- | --- | --- | --- | --- | --- |
| ADM-1 | 신고 목록 조회 | GET | `/api/admin/reports` | 시작 전 | 완료 | Y |
| ADM-2 | 신고 상세 조회 | GET | `/api/admin/reports/{reportId}` | 시작 전 | 완료 | Y |
| ADM-3 | 신고 상태 변경 | PATCH | `/api/admin/reports/{reportId}` | 시작 전 | 완료 | Y |
| ADM-4 | 제재 발행 | POST | `/api/admin/reports/{reportId}/sanctions` | 시작 전 | 완료 | Y |

> `report.md` 인덱스 테이블의 ID 3, 31, 32, 33 = 본 문서 ADM-1 ~ ADM-4와 동일 엔드포인트.

---

# ADM-1. 신고 목록 조회
## URL : GET /api/admin/reports

> BFF: [src/app/api/admin/reports/route.ts](../../src/app/api/admin/reports/route.ts)
> FE 구현: [src/features/admin-report/](../../src/features/admin-report/)

운영자 어드민 화면에서 신고 목록을 조회한다. 상태·대상 유형·사유·키워드 등 복합 필터와 정렬을 지원한다.

### 쿼리 파라미터

| 이름 | 유형 | 필수/선택 | 기본값 | 설명 |
| --- | --- | --- | --- | --- |
| status | String | 선택 | — | `PENDING` / `REVIEWING` / `RESOLVED` / `REJECTED` / `all`. 미지정 시 전체 |
| targetType | String | 선택 | — | `course` / `comment` / `user` / `all`. 미지정 시 전체 |
| reasonCode | String | 선택 | — | 신고 사유 코드 (REP-1 enum 동일) / `all`. 미지정 시 전체 |
| q | String | 선택 | — | 키워드 검색. 검색 대상: reporterNickname, reasonLabel, target.title/ownerId/snippet/nickname |
| page | Integer | 선택 | `1` | 페이지 번호 (1-based) |
| size | Integer | 선택 | `20` | 페이지 크기 (최소 1, 최대 100) |
| sort | String | 선택 | `createdAt:desc` | `createdAt:desc` / `createdAt:asc` / `reportCount:desc` |
| autoBlindedOnly | Boolean | 선택 | `false` | `true` 시 자동 블라인드 처리된 신고만 조회 |

### 응답 코드

| status | message |
| --- | --- |
| 200 | 성공 |
| 401 | 인증 필요 |
| 403 | 관리자 권한 없음 |

## 코드 예시

### 응답 (200)

```json
{
  "data": [
    {
      "reportId": "r-1031",
      "target": {
        "type": "course",
        "id": "27",
        "ownerId": "힙스터김",
        "title": "성수동 힙플레이스 완전 정복",
        "contextUrl": "/course/27"
      },
      "reasonCode": "FAKE_INFO",
      "status": "PENDING",
      "reporterId": "u-042",
      "reporterNickname": "김여행",
      "createdAt": "2026-06-01T10:30:00Z",
      "updatedAt": "2026-06-01T10:30:00Z",
      "assignedOperator": null,
      "reportCount": 5,
      "autoBlinded": true
    }
  ],
  "totalCount": 31,
  "page": 1,
  "size": 20,
  "hasNext": true
}
```

### 응답 필드 (목록 항목)

| 필드 | 유형 | 설명 |
| --- | --- | --- |
| reportId | String | 신고 식별자 |
| target | Object | 신고 대상. REP-1의 target discriminated union과 동일 구조 |
| reasonCode | String | 신고 사유 코드 |
| status | String | 처리 상태. `PENDING` / `REVIEWING` / `RESOLVED` / `REJECTED` |
| reporterId | String | 신고자 내부 ID |
| reporterNickname | String | 신고자 닉네임 |
| createdAt | String | 신고 접수 시각 (ISO 8601) |
| updatedAt | String | 마지막 상태 변경 시각 (ISO 8601) |
| assignedOperator | String \| null | 담당 운영자 식별자. 미배정 시 null |
| reportCount | Integer | 동일 대상의 누적 신고 건수 (집계값) |
| autoBlinded | Boolean | 누적 임계치 도달로 자동 블라인드 처리 여부 |

---

# ADM-2. 신고 상세 조회
## URL : GET /api/admin/reports/{reportId}

> BFF: [src/app/api/admin/reports/[reportId]/route.ts](../../src/app/api/admin/reports/%5BreportId%5D/route.ts)

목록 항목 필드에 더해 신고 상세 텍스트, 처리 이력, 연관 신고 목록을 반환한다.

### 경로 파라미터

| 이름 | 유형 | 설명 |
| --- | --- | --- |
| reportId | String | 신고 식별자 |

### 응답 코드

| status | message |
| --- | --- |
| 200 | 성공 |
| 401 | 인증 필요 |
| 403 | 관리자 권한 없음 |
| 404 | 신고를 찾을 수 없음 |

## 코드 예시

### 응답 (200)

```json
{
  "reportId": "r-1031",
  "target": {
    "type": "course",
    "id": "27",
    "ownerId": "힙스터김",
    "title": "성수동 힙플레이스 완전 정복",
    "contextUrl": "/course/27"
  },
  "reasonCode": "FAKE_INFO",
  "status": "REVIEWING",
  "reporterId": "u-042",
  "reporterNickname": "김여행",
  "createdAt": "2026-06-01T10:30:00Z",
  "updatedAt": "2026-06-02T09:15:00Z",
  "assignedOperator": "operator:admin",
  "reportCount": 5,
  "autoBlinded": true,
  "detail": "장소 정보가 실제와 달라요.",
  "history": [
    {
      "status": "PENDING",
      "at": "2026-06-01T10:30:00Z",
      "actor": "system"
    },
    {
      "status": "REVIEWING",
      "at": "2026-06-02T09:15:00Z",
      "actor": "operator:admin",
      "note": "확인 중"
    }
  ],
  "relatedReports": [
    {
      "reportId": "r-1019",
      "reasonCode": "FAKE_INFO",
      "reporterNickname": "서울탐험가",
      "createdAt": "2026-05-28T14:20:00Z"
    }
  ],
  "resolution": null
}
```

### 응답 필드 (ADM-1 필드 외 추가분)

| 필드 | 유형 | 설명 |
| --- | --- | --- |
| detail | String \| null | 신고 시 입력한 상세 텍스트. 없으면 null |
| history | Array | 처리 이력 (시간순). 각 항목: `status`, `at`, `actor`, `note?` |
| history[].actor | String | 처리 주체. `system` / `operator:{id}` / `reporter` |
| history[].note | String (선택) | 운영자 메모 |
| relatedReports | Array | 동일 대상에 접수된 타 신고 요약 목록 |
| relatedReports[].reportId | String | 연관 신고 식별자 |
| relatedReports[].reasonCode | String | 연관 신고 사유 코드 |
| relatedReports[].reporterNickname | String | 연관 신고자 닉네임 |
| relatedReports[].createdAt | String | 연관 신고 접수 시각 |
| resolution | String \| null | 처리 결과. `BLINDED` / `WARNED` / `BANNED` / `NO_ACTION`. 미처리 시 null |

---

# ADM-3. 신고 상태 변경
## URL : PATCH /api/admin/reports/{reportId}

> BFF: [src/app/api/admin/reports/[reportId]/route.ts](../../src/app/api/admin/reports/%5BreportId%5D/route.ts)

운영자가 신고 상태를 변경한다. 제재 발행 없이 `REVIEWING`(검토 시작) 또는 `REJECTED`(각하) 처리에 사용.
제재를 동반한 `RESOLVED` 처리는 ADM-4 사용.

### 경로 파라미터

| 이름 | 유형 | 설명 |
| --- | --- | --- |
| reportId | String | 신고 식별자 |

### 본문 파라미터

| 이름 | 유형 | 필수/선택 | 설명 |
| --- | --- | --- | --- |
| status | String | 필수 | `REVIEWING` / `REJECTED`. 이 두 값만 허용 |
| note | String | 선택 | 운영자 처리 메모. history에 기록됨 |

### 응답 코드

| status | message |
| --- | --- |
| 200 | 상태 변경 성공. 변경된 `AdminReportDetail` 반환 |
| 400 | 허용되지 않은 status 값 (`PENDING`, `RESOLVED` 등) |
| 401 | 인증 필요 |
| 403 | 관리자 권한 없음 |
| 404 | 신고를 찾을 수 없음 |

## 코드 예시

### 요청

```json
{
  "status": "REVIEWING",
  "note": "자동 블라인드 건 우선 검토"
}
```

### 응답 (200)

ADM-2와 동일한 `AdminReportDetail` 구조 반환. `status`와 `history`가 갱신된 상태.

---

# ADM-4. 제재 발행
## URL : POST /api/admin/reports/{reportId}/sanctions

> BFF: [src/app/api/admin/reports/[reportId]/sanctions/route.ts](../../src/app/api/admin/reports/%5BreportId%5D/sanctions/route.ts)

신고를 처리 완료(`RESOLVED`)하고 피신고자에게 제재를 발행한다.
호출 성공 시 연결된 신고의 `status`가 `RESOLVED`로 자동 변경되고 `resolution`이 설정된다.

### 경로 파라미터

| 이름 | 유형 | 설명 |
| --- | --- | --- |
| reportId | String | 신고 식별자 |

### 본문 파라미터

| 이름 | 유형 | 필수/선택 | 설명 |
| --- | --- | --- | --- |
| reportId | String | 필수 | 경로 파라미터와 동일. 서버 측 일관성 검증용 |
| type | String | 필수 | 제재 유형. `WARNING` / `CONTENT_BLINDED` / `TEMP_BAN` / `PERMANENT_BAN` |
| durationDays | Integer | 선택 | 정지 기간(일). **`TEMP_BAN` 일 때만 유효**. 미지정 시 정책 기본값 적용 |
| message | String | 필수 | 피신고자에게 노출되는 제재 사유 메시지. 빈 문자열 불허 |
| resolution | String | 필수 | 신고 처리 결과. `BLINDED` / `WARNED` / `BANNED` / `NO_ACTION` |

### 제재 유형 × 처리 결과 권장 조합

| type | 권장 resolution | 설명 |
| --- | --- | --- |
| WARNING | WARNED | 경고만 발행. 콘텐츠 제재 없음 |
| CONTENT_BLINDED | BLINDED | 특정 콘텐츠(플랜/댓글) 숨김 처리 |
| TEMP_BAN | BANNED | 계정 일시 정지. durationDays 필수 |
| PERMANENT_BAN | BANNED | 계정 영구 정지 |

### 응답 코드

| status | message |
| --- | --- |
| 201 | 제재 발행 성공 |
| 400 | 허용되지 않은 type / resolution 값, 또는 message 누락 |
| 401 | 인증 필요 |
| 403 | 관리자 권한 없음 |
| 404 | 신고를 찾을 수 없음 |

## 코드 예시

### 요청 — CONTENT_BLINDED

```json
{
  "reportId": "r-1031",
  "type": "CONTENT_BLINDED",
  "message": "신고 다수 누적으로 해당 플랜이 블라인드 처리되었습니다.",
  "resolution": "BLINDED"
}
```

### 요청 — TEMP_BAN

```json
{
  "reportId": "r-991",
  "type": "TEMP_BAN",
  "durationDays": 7,
  "message": "반복적인 욕설/비방으로 7일간 일시 정지되었습니다.",
  "resolution": "BANNED"
}
```

### 응답 (201)

```json
{
  "sanctionId": "s-201",
  "report": {
    "reportId": "r-1031",
    "status": "RESOLVED",
    "resolution": "BLINDED",
    "...": "ADM-2 AdminReportDetail 전체 필드 포함"
  }
}
```

### 응답 필드

| 필드 | 유형 | 설명 |
| --- | --- | --- |
| sanctionId | String | 발행된 제재 식별자 |
| report | Object | 처리 완료된 신고 상세 (`AdminReportDetail`). `status === 'RESOLVED'`, `resolution` 값 포함 |

---

# 공통 타입 참고

## ReportStatus enum

| 값 | 설명 |
| --- | --- |
| PENDING | 접수됨, 미검토 |
| REVIEWING | 운영자 검토 중 |
| RESOLVED | 처리 완료 (제재 발행) |
| REJECTED | 각하 (신고 기각) |

## SanctionType enum

| 값 | 설명 |
| --- | --- |
| WARNING | 경고 |
| CONTENT_BLINDED | 콘텐츠 블라인드 |
| TEMP_BAN | 일시 정지 |
| PERMANENT_BAN | 영구 정지 |

## ReportResolution enum

| 값 | 설명 |
| --- | --- |
| BLINDED | 콘텐츠 블라인드 처리 |
| WARNED | 경고 조치 |
| BANNED | 계정 정지 |
| NO_ACTION | 조치 없음 (REJECTED 시 사용) |

---

# 백엔드 협의 필요 사항

| # | 항목 | 우선순위 |
| --- | --- | --- |
| A1 | 관리자 인증 방식 — 세션 쿠키 공유 vs 별도 어드민 토큰 | P0 |
| A2 | `PATCH` 허용 status 값 확정 — 현재 FE는 `REVIEWING` / `REJECTED`만 허용. `RESOLVED` 직접 변경(제재 없이) 필요 여부 | P1 |
| A3 | `assignedOperator` 배정 방식 — 자동 배정 vs `PATCH` 요청 시 명시 | P1 |
| A4 | `reportCount` 집계 기준 — 동일 `target.id` 전체 신고 수 vs 동일 사유 신고 수 | P1 |
| A5 | `relatedReports` 반환 상한 — 연관 신고 건수 많을 경우 일부만 반환 시 페이지네이션 정책 필요 | P2 |
| A6 | 제재 발행 시 피신고자 알림(푸시/이메일) 처리 주체 — 서버 내부 처리 여부 | P1 |
