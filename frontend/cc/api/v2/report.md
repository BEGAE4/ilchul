# REPORT API (v2)

> Notion [엔드포인트 (3)](https://www.notion.so/3740e945fc0980c29284f38e962359db) 기준. 엔드포인트 6건.

| ID | 제목 | 메서드 | URL | 서버 | 클라이언트 | FE검토 |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 신고 제출 | POST | `/api/reports` | 시작 전 | 시작 전 | Y |
| 2 | 신고 사유 목록 조회 | GET | `/api/report/reasons?type=\{reportType\}` | 시작 전 | 시작 전 | N |
| 3 | 신고 목록 조회(관리자) | GET | `/api/admin/reports` | 시작 전 | 시작 전 | Y |
| 31 | 신고 상세 조회(관리자) | GET | `/api/admin/reports/\{reportId\}` | 시작 전 | 시작 전 | Y |
| 32 | 신고 상태 변경(관리자) | PATCH | `/api/admin/reports/\{reportId\}` | 시작 전 | 시작 전 | Y |
| 33 | 제재 발행(관리자) | POST | `/api/admin/reports/\{reportId\}/sanctions` | 시작 전 | 시작 전 | Y |

---

# REP-1. 신고 제출
## URL : POST /api/reports

> [src/app/api/reports/route.ts](../../src/app/api/reports/route.ts) BFF POST 라우트. baseUrl 미설정 시 dev 한정 mock 응답(201), 프로덕션은 502. baseUrl 있을 시 백엔드 프록시, fetch 예외는 5xx로 그대로 전파.
> [src/features/report/](../../src/features/report/) feature가 사용. 플랜(course)/댓글(comment)/사용자(user) 신고 모두 본 엔드포인트 단일 사용 (target.type으로 분기).

**현재 UI 기준 결정 사항** (v2 계획서 §✅):

- 신고 대상은 **`target.type`** 으로 분기. 사유 라벨은 클라이언트에서 한글 표기, 서버는 **`reasonCode`** 로 통계 추적.
- `ETC` 사유 선택 시 `detail` 필수. 그 외 사유는 `detail` 선택.
- **자기 신고 차단은 서버 측에서도 `403 self-report-forbidden`** 으로 강제. 클라이언트 닉네임 매칭은 best-effort일 뿐 (Q1).
- **`idempotency-key` 헤더** 로 더블 클릭 / 정상 재시도 시 중복 신고 차단. 동일 사용자의 동일 대상 동일 사유 재시도는 같은 키로 멱등 처리되어 `200 + alreadyReported:true` 반환.
- 클라이언트는 자동 블라인드 임계치 N값을 강제하지 않고, 서버 응답의 `autoBlinded`/`alreadyReported` 신호에만 반응 (정책 변경 비용 최소화).
- 검토 범위 외: 매거진(magazine), 피드(feed), healing-diary는 본 엔드포인트 사용 안 함.

### 요청 헤더

| **이름** | **필수/선택** | **설명** |
| --- | --- | --- |
| Content-Type | 필수 | `application/json` |
| Cookie | 필수 | 세션 인증 |
| idempotency-key | 필수 | `{reporterId}:{target.type}:{target.id}:{reasonCode}:{attemptId}` 형식. attemptId는 클라이언트 컴포넌트 마운트 시 1회 생성한 UUID. 정상 재시도 시 동일 키 유지 → 중복 신고 방지 |

### 본문 파라미터

| **이름** | **유형** | **필수/선택** | **설명** |
| --- | --- | --- | --- |
| target | Object | 필수 | 신고 대상. `target.type`에 따라 필수 필드가 다른 discriminated union. 아래 §타겟 유형별 페이로드 참고 |
| reasonCode | String | 필수 | 신고 사유 코드. enum: `SPAM_AD` / `FAKE_INFO` / `OBSCENE` / `ABUSE` / `COPYRIGHT` / `IMPROPER_PROFILE` / `IMPERSONATION` / `PERSONAL_INFO_LEAK` / `ETC` |
| detail | String | 선택 | 상세 설명 (최대 500자). **`reasonCode === 'ETC'` 일 때 필수** |

### 타겟 유형별 페이로드

| **target.type** | **필수 필드** | **설명** |
| --- | --- | --- |
| `course` | `id`, `ownerId`, `title`, `contextUrl` | 플랜 신고 |
| `comment` | `id`, `ownerId`, `courseId`, `snippet`, `contextUrl` | 댓글 신고. snippet은 댓글 본문 앞 60자 |
| `user` | `id`, `ownerId`, `nickname`, `contextUrl` | 사용자 프로필 신고. `id === ownerId` |

- `ownerId` 는 작성자/소유자 식별자. **현재는 닉네임 문자열** (P0 임시안, Q1). 백엔드 안정 식별자(UUID/DB PK) 응답 도입 시 클라이언트가 즉시 교체 가능.
- `contextUrl` 은 운영자 큐에서 즉시 이동 가능한 프론트 경로 (예: `/course/123`, `/course/123#comment-cm5`, `/profile/u-001`).

### 사유 코드 ↔ 한글 라벨 매핑

| reasonCode | 한글 라벨 (클라이언트) |
| --- | --- |
| SPAM_AD | 스팸/광고 |
| FAKE_INFO | 허위정보 |
| OBSCENE | 음란성 |
| ABUSE | 욕설/비방 |
| COPYRIGHT | 저작권 침해 |
| IMPROPER_PROFILE | 부적절한 닉네임/프로필 |
| IMPERSONATION | 타인 사칭 |
| PERSONAL_INFO_LEAK | 개인정보 노출 |
| ETC | 기타(직접 입력) |

### 대상별 노출 사유 (클라이언트 UI)

| target.type | 노출 사유 |
| --- | --- |
| course | SPAM_AD, FAKE_INFO, OBSCENE, ABUSE, COPYRIGHT, ETC |
| comment | ABUSE, OBSCENE, SPAM_AD, PERSONAL_INFO_LEAK, ETC |
| user | COPYRIGHT, IMPROPER_PROFILE, IMPERSONATION, ETC |

### 응답 코드

| status | message |
| --- | --- |
| 201 | 신고 접수 (신규) |
| 200 | 동일 사용자가 동일 대상에 이미 신고함 (`alreadyReported: true` 동봉) |
| 400 | 요청 데이터 오류 (target.type 비정상, reasonCode 미정의, ETC인데 detail 누락) |
| 401 | 인증 필요 |
| 403 | 자기 신고 시도 (self-report-forbidden) |
| 404 | 신고 대상(course/comment/user)을 찾을 수 없음 |
| 429 | 단시간 다수 신고 — 어뷰징 방지 |
| 502 | 백엔드 미연결 (BFF 라우트 `NEXT_PUBLIC_API_BASE_URL` 미설정 시 프로덕션 환경) |

## 코드 예시

### 요청 — 플랜 신고

```jsx
{
  "target": {
    "type": "course",
    "id": "27",
    "ownerId": "힙스터김",
    "title": "성수동 힙플레이스 완전 정복",
    "contextUrl": "/course/27"
  },
  "reasonCode": "FAKE_INFO",
  "detail": "장소 정보가 실제와 달라요."
}
```

### 요청 — 댓글 신고

```jsx
{
  "target": {
    "type": "comment",
    "id": "cm5",
    "ownerId": "맛집헌터",
    "courseId": "27",
    "snippet": "이 코스 따라갔는데 진짜 완벽했어요! 특히 두 번째 장소가 최고",
    "contextUrl": "/course/27#comment-cm5"
  },
  "reasonCode": "ABUSE"
}
```

### 요청 — 사용자 신고

```jsx
{
  "target": {
    "type": "user",
    "id": "u-001",
    "ownerId": "u-001",
    "nickname": "힙스터김",
    "contextUrl": "/profile/u-001"
  },
  "reasonCode": "IMPERSONATION",
  "detail": "다른 사람 사진을 도용했어요."
}
```

### 응답 — 신규 접수 (201)

```java
{
  "status": 201,
  "data": {
    "reportId": "r-1024",
    "status": "PENDING",
    "alreadyReported": false,
    "autoBlinded": false
  }
}
```

### 응답 — 이미 신고함 (200)

```java
{
  "status": 200,
  "data": {
    "reportId": "r-1019",
    "status": "REVIEWING",
    "alreadyReported": true
  }
}
```

### 응답 — 자동 블라인드 발화 (201 + autoBlinded:true)

```java
{
  "status": 201,
  "data": {
    "reportId": "r-1031",
    "status": "PENDING",
    "alreadyReported": false,
    "autoBlinded": true
  }
}
```

> 클라이언트는 P0에서 `autoBlinded`를 **수신만 하고 UI 분기는 수행하지 않는다** (Q3). Phase 3에서 콘텐츠 즉시 숨김 + 재진입 가드 도입.

### 응답 필드

| **필드** | **유형** | **설명** |
| --- | --- | --- |
| reportId | String | 신고 식별자. 운영자 큐 추적용 |
| status | String | enum: `PENDING` / `REVIEWING` / `RESOLVED` / `REJECTED`. P0 응답은 대부분 `PENDING` |
| alreadyReported | Boolean | 동일 사용자의 동일 대상 중복 신고 여부 |
| autoBlinded | Boolean | 누적 신고 임계치 도달로 자동 블라인드 처리됐는지. Phase 3에서 UI 분기 |

---

# REP-4. 신고 상세 조회
## URL : GET /api/reports/{reportId}

> **현재 UI 진입점은 없음.** Phase 3 — 마이페이지 "내 신고 내역"(REP-2)에서 항목 탭 시 상세 화면 진입용.
> 본인이 제출한 신고만 조회 가능. 운영자 어드민 조회는 별도 admin API 사용.

**응답 구조**:

- REP-2 목록 응답의 단일 항목 구조를 그대로 따르되, **추가로 `detail`(신고 시 입력한 상세 텍스트)과 `history`(처리 이력 timeline)** 를 포함한다.
- `history`는 시간순 정렬. 운영자 메모/공개 메시지는 P1 이후 단계에서 추가.

### 응답 코드

| status | message |
| --- | --- |
| 200 | 성공 |
| 401 | 인증 필요 |
| 403 | 본인 신고가 아님 |
| 404 | 신고를 찾을 수 없음 |

## 코드 예시

### 응답 — 진행 중인 신고

```java
{
  "status": 200,
  "data": {
    "reportId": "r-1024",
    "target": {
      "type": "course",
      "id": "27",
      "ownerId": "힙스터김",
      "title": "성수동 힙플레이스 완전 정복",
      "contextUrl": "/course/27"
    },
    "reasonCode": "FAKE_INFO",
    "detail": "장소 정보가 실제와 달라요.",
    "status": "REVIEWING",
    "createdAt": "2026-05-18T12:30:00Z",
    "updatedAt": "2026-05-19T09:15:00Z",
    "history": [
      {
        "status": "PENDING",
        "at": "2026-05-18T12:30:00Z",
        "actor": "system"
      },
      {
        "status": "REVIEWING",
        "at": "2026-05-19T09:15:00Z",
        "actor": "operator"
      }
    ],
    "resolution": null
  }
}
```

### 응답 — 처리 완료된 신고

```java
{
  "status": 200,
  "data": {
    "reportId": "r-1019",
    "target": {
      "type": "comment",
      "id": "cm5",
      "ownerId": "맛집헌터",
      "courseId": "27",
      "snippet": "이 코스 따라갔는데...",
      "contextUrl": "/course/27#comment-cm5"
    },
    "reasonCode": "ABUSE",
    "detail": null,
    "status": "RESOLVED",
    "createdAt": "2026-05-15T08:20:00Z",
    "updatedAt": "2026-05-16T14:00:00Z",
    "history": [
      { "status": "PENDING", "at": "2026-05-15T08:20:00Z", "actor": "system" },
      { "status": "REVIEWING", "at": "2026-05-15T10:00:00Z", "actor": "operator" },
      { "status": "RESOLVED", "at": "2026-05-16T14:00:00Z", "actor": "operator" }
    ],
    "resolution": "BLINDED"
  }
}
```

### 응답 필드

| **필드** | **유형** | **설명** |
| --- | --- | --- |
| reportId | String | 신고 식별자 |
| target | Object | 신고 대상 (REP-1 페이로드와 동일 구조) |
| reasonCode | String | 신고 사유 코드 |
| detail | String \| null | 신고 시 입력한 상세 텍스트 (없으면 null) |
| status | String | 현재 처리 상태 |
| createdAt | String | 신고 접수 시각 |
| updatedAt | String | 마지막 상태 변경 시각 |
| history | Array | 상태 변경 이력 (시간순). 각 항목: `status`, `at`, `actor`(system/operator/reporter) |
| resolution | String \| null | 처리 결과. `status === 'RESOLVED' \| 'REJECTED'` 일 때만 값 존재 (`BLINDED` / `WARNED` / `BANNED` / `NO_ACTION`) |

---

# REP-5. 내 제재 내역 조회 (피신고자)
## URL : GET /api/sanctions/me

> **현재 UI 진입점은 없음.** Phase 3 — 마이페이지에 "받은 제재 내역" 화면 도입 시 사용 예정.
> REP-2와 다른 점: **REP-2는 "내가 한 신고"**, **REP-5는 "내가 받은 제재"**. 두 화면이 마이페이지에 나란히 배치될 가능성.

**현재 UI 기준 결정 사항**:

- 본인이 다른 사용자/시스템으로부터 **받은 제재 처분** 을 조회. 신고 자체가 아니라 신고의 결과로 발생한 제재가 대상.
- 제재 유형(SanctionType):
  - `WARNING` — 경고 (행동 변화 권고, 콘텐츠 제재 없음)
  - `CONTENT_BLINDED` — 특정 콘텐츠(플랜/댓글) 블라인드 처리
  - `TEMP_BAN` — 일시 정지 (계정 일부 기능 제한, expiresAt 존재)
  - `PERMANENT_BAN` — 영구 정지 (expiresAt null)
- 본인의 콘텐츠/계정이 제재되었음을 사용자가 인지할 수 있는 **유일한 공식 채널**.
- 이의제기(appeal) 기능은 Phase 3 후속.

### 쿼리 파라미터

| **이름** | **유형** | **필수/선택** | **설명** |
| --- | --- | --- | --- |
| status | String | 선택 | `all` / `active` / `expired` (기본 `all`). active는 현재 효력 있는 제재만 |
| type | String | 선택 | SanctionType 단일 필터링 (`WARNING` / `CONTENT_BLINDED` / `TEMP_BAN` / `PERMANENT_BAN`) |
| page | Integer | 선택 | 페이지 번호 (기본 1) |
| size | Integer | 선택 | 페이지 크기 (기본 20) |

### 응답 코드

| status | message |
| --- | --- |
| 200 | 성공 |
| 400 | 요청 데이터 오류 (status/type 값 비정상) |
| 401 | 인증 필요 |

## 코드 예시

### 응답

```java
{
  "status": 200,
  "data": [
    {
      "sanctionId": "s-201",
      "type": "CONTENT_BLINDED",
      "target": {
        "type": "course",
        "id": "27",
        "title": "성수동 힙플레이스 완전 정복",
        "contextUrl": "/course/27"
      },
      "reasonCode": "FAKE_INFO",
      "message": "신고 다수 누적으로 해당 플랜이 블라인드 처리되었습니다.",
      "issuedAt": "2026-05-16T14:00:00Z",
      "expiresAt": null,
      "isActive": true,
      "relatedReportIds": ["r-1019", "r-1023", "r-1031"],
      "appealStatus": "NONE"
    },
    {
      "sanctionId": "s-198",
      "type": "TEMP_BAN",
      "target": {
        "type": "user",
        "id": "me",
        "nickname": "김여행",
        "contextUrl": "/profile/me"
      },
      "reasonCode": "ABUSE",
      "message": "반복적인 욕설/비방으로 일시 정지되었습니다.",
      "issuedAt": "2026-04-20T09:30:00Z",
      "expiresAt": "2026-04-27T09:30:00Z",
      "isActive": false,
      "relatedReportIds": ["r-980", "r-991"],
      "appealStatus": "RESOLVED"
    }
  ],
  "totalCount": 2,
  "hasNext": false
}
```

### 응답 필드 (각 항목)

| **필드** | **유형** | **설명** |
| --- | --- | --- |
| sanctionId | String | 제재 식별자 |
| type | String | 제재 유형 (위 enum) |
| target | Object | 제재 대상 (본인의 콘텐츠 또는 본인 계정). REP-1 페이로드와 유사 구조 |
| reasonCode | String | 제재 사유 코드 (신고 사유 코드와 동일 enum 재사용) |
| message | String | 사용자 노출 메시지. 운영자가 공개적으로 적시한 사유 |
| issuedAt | String | 제재 시작 시각 (ISO 8601) |
| expiresAt | String \| null | 제재 종료 시각. `PERMANENT_BAN`은 null, `WARNING`/`CONTENT_BLINDED`는 정책별 |
| isActive | Boolean | 현재 효력 여부. `expiresAt < now`면 false |
| relatedReportIds | Array&lt;String&gt; | 본 제재의 근거가 된 신고 ID 목록. 단, 신고자 본인이 아니므로 신고 상세는 조회 불가 |
| appealStatus | String | 이의제기 상태. `NONE` / `PENDING` / `RESOLVED` / `REJECTED` (Phase 3 후속) |

---

# 백엔드 협의 필요 사항

본 명세는 [신고 UI 구현 계획서 v2](../../plan/260515-plan-003-report_ui_implementation.md)의 §✅ 결정 완료 항목을 기준으로 작성된 클라이언트 측 제안이다. 다음 항목은 백엔드 팀 협의 후 확정 필요:

| # | 항목 | 우선순위 |
| --- | --- | --- |
| O1 | `POST /api/reports` 명세 확정 — 특히 `403 self-report-forbidden` 포함 여부, `200 alreadyReported`/`201 신규` 응답 분기, `autoBlinded` 발화 정책 | **P0** (PR 머지 전후) |
| O2 | 댓글 신고 사유 코드 (Q2) — 기획자/운영팀 확정 | P1 |
| O3 | **`course.authorId` / `comment.userId` / `user.id` 안정 식별자(UUID·DB PK)** API 응답 포함 — Q1 결정의 핵심. 도입 시 클라이언트는 `isSelfReport()` 1줄 교체로 흡수 | **P0** (요청 발송 즉시) |
| O4 | 자동 블라인드 N값, 중복 신고 제한 주기 (`autoBlinded` 발화 정책) | P1 (Phase 3에서 필요) |
| O5 | `GET /api/reports/me` 응답 페이지네이션 방식 (cursor vs offset) | P1 |
| O6 | **ReportStatus enum에 `CANCELED` 추가** (REP-3 soft cancel). 또는 hard delete 채택 시 정책 합의 | P1 (Phase 3 REP-3 도입 시) |
| O7 | 신고 처리 이력(`history`) 노출 정책 — `actor` 공개 범위 (`system` / `operator` 익명 / 운영자 식별 노출 여부) | P1 (Phase 3 REP-4 도입 시) |
| O8 | **`/api/sanctions/me` 엔드포인트 + `SanctionType` enum 확정** — `WARNING` / `CONTENT_BLINDED` / `TEMP_BAN` / `PERMANENT_BAN` 외 추가 유형 여부, `expiresAt` 정책 | P1 (Phase 3 REP-5 도입 시) |
| O9 | 이의제기(appeal) 정책 — `appealStatus` 상태 머신, 별도 엔드포인트(`POST /api/sanctions/{id}/appeal`) 필요 여부 | P2 |

---

# 관련 명세 / Deprecated 안내

- 본 v1 `comment.md`의 **`CMT-N1. 댓글 신고`** (`POST api/reply/{replyId}/report`) 는 본 통합 엔드포인트(`POST /api/reports` + `target.type: 'comment'`) 도입과 **동등 기능을 중복 정의**한다. 백엔드 합의 후 어느 한 쪽을 deprecated 처리하고 정리 필요.
- 본 계획에서는 **`POST /api/reports` 단일 엔드포인트**가 P0 채택안이다.

