# 프론트엔드 Mock 데이터 → 실제 API 연동 해결 계획

작성일: 2026-05-10
최종 수정일: 2026-05-10 (재검토: 백엔드 연동 가능 범위 분리)
작성 영역: `frontend`
관련 컨벤션: [cc/convention/260506-convention-001-convention_v1.0.md.md](../convention/260506-convention-001-convention_v1.0.md.md), [cc/convention/260506-convention-002-directory_structure_v1.0.md](../convention/260506-convention-002-directory_structure_v1.0.md)

---

## 0. 작업 가능 범위 재검토 (중요)

원래 식별한 3개 이슈 영역을 **실제 API 연동 여부**로 다시 분류한 결과:

| 영역 | API Route 존재 | feature API 존재 | 백엔드 스펙 존재 | 즉시 수정 가능? |
| --- | --- | --- | --- | --- |
| 2.1 마이페이지 하드코딩 닉네임/이메일 | ✅ `/api/mypage/profile` | ✅ `fetchMyPageProfile` | ✅ [cc/api/v1/mypage.md](../api/v1/mypage.md) | **O — 바로 가능** |
| 2.1 `useUserStore` 기본값 고정 | (스토어 단독) | — | — | **O — 바로 가능** (백엔드 무관) |
| 2.2 플랜 리스트 `mockPlans` | ✅ `/api/mypage/plans` | ✅ `fetchMyPlans` | ✅ | **O — 바로 가능** (백엔드 응답이 빈 배열일 수 있음) |
| 2.2 피드 `mockPosts` | ❌ 없음 | ❌ `features/feed/api` 폴더 없음 | ❌ [cc/api/v1/](../api/v1/) 에 피드 스펙 없음 | **X — 백엔드 선행 필요** |
| 2.3 API Route mock 폴백 제거 | (Route 단독) | — | — | **△ — 코드는 가능, 단 백엔드 안정화 전 운영 적용 시 화면 깨짐** |

**결론**:

- **즉시 작업 가능한 것은 2.1 (마이페이지 하드코딩 + 스토어 기본값)** 과 **2.2 의 플랜 리스트 일부**.
- 피드(2.2 mockPosts)는 백엔드 API 스펙 자체가 없으므로 본 plan 범위에서 **보류**한다. 더불어 [src/features/feed/components/FeedPage.tsx](../../src/features/feed/components/FeedPage.tsx)는 현재 앱 내 어느 메뉴/네비게이션에서도 진입 링크가 없는 사실상 데드 코드 상태(직접 URL 입력 시에만 접근 가능). 우선순위 매우 낮음.
- mock 폴백 제거(2.3)는 dev/prod 환경 구분(`NEXT_PUBLIC_USE_MOCK`)으로 **즉시 가드만 추가**하고, 완전 제거는 백엔드 안정화 이후로 미룬다.

---

## 1. 배경 및 문제 요약

현재 프로젝트 곳곳에 사용자 정보·플랜 등이 **하드코딩 또는 mock 데이터**로 박혀 있고, Next API Route 단에서도 백엔드 호출 실패 시 **mock 응답으로 조용히 폴백**한다. 이로 인해:

1. 화면이 항상 동일한 더미 정보를 보여주어 실서비스 검증이 불가능하다.
2. 백엔드 장애·미연결 상황을 사용자/개발자 모두 인지할 수 없다(**오류 은폐**).
3. 새로운 사용자가 로그인해도 `김여행`/`kong9434`처럼 고정된 프로필이 노출된다.

---

## 2. 현황 진단

### 2.1 UI 컴포넌트 내 사용자 정보 고정 ✅ 즉시 작업 가능

| 위치 | 문제 | 비고 |
| --- | --- | --- |
| [src/app/my-page/page.tsx:43-44](../../src/app/my-page/page.tsx#L43-L44) | 닉네임 `kong9434`, 이메일 `kong9434@naver.com` JSX에 직접 박힘 | `fetchMyPageProfile` 사용한 [ProfilePage.tsx:106](../../src/features/profile/components/ProfilePage.tsx#L106) 참조 패턴 존재 |
| [src/shared/lib/stores/useUserStore.ts:43-58](../../src/shared/lib/stores/useUserStore.ts#L43-L58) | 기본값 `id: 'me'`, `name: '김여행'`, `isLoggedIn: true` 고정 | 백엔드 무관, 스토어 단독 수정 |

### 2.2 피드 / 플랜 리스트 Mock 사용

| 위치 | 문제 | 즉시 가능? |
| --- | --- | --- |
| [src/app/my-page/course-plan/page.tsx:21-43](../../src/app/my-page/course-plan/page.tsx#L21-L43) | `mockPlans` 사용 | ✅ `fetchMyPlans` 이미 존재 ([my-page.api.ts:11](../../src/features/my-page/api/my-page.api.ts#L11)) |
| [src/features/feed/components/FeedPage.tsx:14-31](../../src/features/feed/components/FeedPage.tsx#L14-L31) | `mockPosts` 사용 | ❌ 백엔드/API/스펙 모두 부재. 게다가 진입 링크 없는 사실상 비활성 화면 |

### 2.3 API Route 의 Mock 폴백 (오류 은폐 위험)

| 위치 | 문제 |
| --- | --- |
| [src/app/api/mypage/profile/route.ts](../../src/app/api/mypage/profile/route.ts) | `BASE_URL` 미설정 또는 백엔드 응답 실패 시 `MOCK_PROFILE` 반환 |
| [src/app/api/mypage/summary/route.ts](../../src/app/api/mypage/summary/route.ts) | `MOCK_SUMMARY` 폴백 |
| [src/app/api/mypage/plans/route.ts](../../src/app/api/mypage/plans/route.ts) | `MOCK_PLANS_RESPONSE` 폴백 |

→ 운영 환경에서 백엔드 장애가 발생해도 클라이언트는 **정상 200 응답에 mock 데이터**를 받게 됨. 모니터링·alert 측면에서 매우 위험.

---

## 3. 해결 목표 (스코프 조정)

**이번 plan 범위 (즉시 진행)**

1. 하드코딩된 사용자 정보 제거 — UI는 store/API에서만 데이터를 가져온다.
2. `useUserStore` 기본값을 비로그인(빈 프로필)으로 전환.
3. 마이페이지 플랜 리스트 → 기존 `fetchMyPlans` 연결.
4. API Route mock 폴백을 **환경 변수 게이팅** 처리 (운영 빌드에서는 폴백 비활성화).
5. 로딩 / 에러 / 빈 상태 UX 통일.

**다음 단계로 분리 (별도 plan 또는 추후 진행)**

- 피드 화면 API 연동 — 백엔드 스펙(엔드포인트·응답 포맷) 확정 후 진행.
- FeedPage 자체의 운영 노출 방향 결정 (제거 vs 노출).

---

## 4. 작업 단계 (Phase)

### Phase 1. 전역 사용자 상태 정리 (`useUserStore`) — 즉시 가능

**대상**: [src/shared/lib/stores/useUserStore.ts](../../src/shared/lib/stores/useUserStore.ts)

작업 내용:

- `user` 기본값을 `null`(또는 비어 있는 `UserProfile`)로 변경하고 `isLoggedIn: false`로 초기화.
- `setUser`, `setLoggedIn`을 활용해 **인증 응답 또는 `fetchMyPageProfile` 응답으로만** 채워지도록 한다.
- 기존 mock 필드(`courseCount`, `certCount` 등)는 `MyPageSummary` 응답으로 대체.
- 타입 정의에 `User | null`을 허용하도록 수정 (consumer에 null guard 추가 필요).

수용 기준:
- 앱 첫 진입 시 `useUserStore.getState().user === null`이 보장된다.
- 로그인/프로필 조회 후에만 user 정보가 채워진다.

---

### Phase 2. 마이페이지 프로필 영역 동적화 — 즉시 가능

**대상**: [src/app/my-page/page.tsx](../../src/app/my-page/page.tsx)

작업 내용:

1. `src/features/my-page/hooks/useMyPageProfile.ts` 신규 작성
   - `fetchMyPageProfile()` 호출, `loading / error / data` 상태 반환.
   - 성공 시 `useUserStore.setUser(...)` 동기화.
   - 참조 패턴: [ProfilePage.tsx:106](../../src/features/profile/components/ProfilePage.tsx#L106) 의 호출 방식.
2. [src/app/my-page/page.tsx:43-44](../../src/app/my-page/page.tsx#L43-L44) 의 하드코딩된 닉네임/이메일을 hook 결과로 치환.
3. 로딩/에러 상태에 대해 `Skeleton` / `EmptyState` UI 노출.
4. 아바타 이미지도 `userImg` 응답값으로 교체.
5. **이메일 노출**: 현재 `MyPageProfile` 타입에는 `email` 필드가 없음. → 백엔드 협의 후 추가 또는 마이페이지 디자인에서 이메일 표시를 제거.

수용 기준:
- HTML 출력에 `kong9434` 문자열이 더 이상 등장하지 않는다 (`grep` 검증).
- 백엔드 미연결 시 mock 데이터가 아니라 명확한 에러 UI가 보인다.

---

### Phase 3. 플랜 리스트 API 연동 — 즉시 가능

**대상**: [src/app/my-page/course-plan/page.tsx](../../src/app/my-page/course-plan/page.tsx)

작업 내용:

1. `src/features/my-page/hooks/useMyPlans.ts` 신규 작성 (`fetchMyPlans` 래핑).
2. `mockPlans` 제거 후 hook 결과 사용.
3. `MyPlan` 타입의 필드명(`planId`, `planTitle`, `createAt`, `tripDate`, `planImages[]`)으로 매핑 정리.
4. 빈 배열 응답 시 빈 상태 UI(예: "아직 등록된 플랜이 없어요") 노출.
5. `setMyPlanVisibility` 도 모달의 "공개/비공개" 액션과 연결.

주의:
- 백엔드가 아직 빈 응답만 반환하더라도, 코드 레벨 mock 제거는 정상 동작 (빈 상태 UI가 노출됨).

수용 기준:
- `mockPlans` 식별자가 코드에서 완전히 제거됨.
- 플랜 0개 / N개 / API 실패 3가지 상태가 모두 정상 렌더링됨.

---

### Phase 4. API Route mock 폴백의 환경 게이팅 — 즉시 가능

**대상**:
- [src/app/api/mypage/profile/route.ts](../../src/app/api/mypage/profile/route.ts)
- [src/app/api/mypage/summary/route.ts](../../src/app/api/mypage/summary/route.ts)
- [src/app/api/mypage/plans/route.ts](../../src/app/api/mypage/plans/route.ts)

작업 내용 (즉시 적용):

1. 각 route 상단에서 `const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';` 판정.
2. 기존 mock 폴백 분기를 `if (USE_MOCK) { ... }` 로 감싼다.
3. `USE_MOCK === false` 인 경우 백엔드 status code/에러 메시지를 그대로 전달하거나, 명시적인 `502 Bad Gateway` + `{ error: 'upstream_unavailable' }` JSON 반환.
4. `BASE_URL` 미설정인 경우 `USE_MOCK=true` 일 때만 mock, 아니면 `500` + 명확한 에러 메시지 반환.
5. `.env.local`(개발용)에 `NEXT_PUBLIC_USE_MOCK=true` 기본 설정. `.env.production` 또는 운영 배포에서는 누락/false 처리.

향후 작업 (백엔드 안정화 이후):
- `MOCK_*` 상수 및 게이팅 분기 자체를 완전 제거.

수용 기준:
- 로컬 dev에서는 백엔드 미연결이어도 mock 응답으로 화면 작동.
- 운영 빌드(`NEXT_PUBLIC_USE_MOCK !== 'true'`)에서는 백엔드 장애 시 즉시 에러가 노출됨.

---

### Phase 5. 검증 및 회귀 테스트

작업 내용:

1. `yarn lint`, `yarn format:check`, `yarn build` 통과 확인.
2. 다음 시나리오 수동 QA:
   - 백엔드 정상 → 마이페이지/플랜 리스트가 실제 데이터로 채워지는지
   - 백엔드 다운 + `USE_MOCK=true` → mock 데이터로 화면 작동
   - 백엔드 다운 + `USE_MOCK=false` → 에러 UI / 토스트 노출
   - 로그아웃 상태 → 마이페이지 진입 시 로그인 유도 흐름
3. `grep -r "kong9434\|mockPlans" src/` 결과가 비어있는지 확인 (피드 mockPosts는 보류 영역이므로 잔존 허용).

---

## 5. 보류 항목 (별도 plan에서 다룸)

### 보류 1. 피드 화면 API 연동

- 사유: 백엔드 스펙 부재(`cc/api/v1/`에 피드 엔드포인트 없음), `features/feed/api/` 자체가 미구현.
- 추가로, [FeedPage.tsx](../../src/features/feed/components/FeedPage.tsx)는 현재 앱 내 진입 링크가 없는 사실상 데드 코드 (`/feed` URL 직접 입력 시에만 접근 가능).
- 후속 액션:
  1. 기획/PM 측에 피드 화면의 운영 노출 여부 확인.
  2. 노출 결정 시 → 백엔드 팀과 엔드포인트 스펙 협의 후 별도 plan 작성.
  3. 미노출 결정 시 → `/app/feed/`, `features/feed/` 디렉터리 제거 작업으로 전환.

### 보류 2. mock 폴백 완전 제거

- 사유: Phase 4에서 환경 게이팅으로 운영 위험은 차단했지만, 코드 클린업 차원의 mock 상수·분기 제거는 백엔드 안정화 후 일괄 진행이 안전.

---

## 6. 작업 우선순위 / 의존 관계

```
Phase 1 (Store 정리)
   └─> Phase 2 (마이페이지 프로필)
   └─> Phase 3 (플랜 리스트)
Phase 4 (API Route 환경 게이팅)  ← 다른 Phase와 독립적, 동시 진행 가능
Phase 5 (검증)
```

권장 순서: **Phase 4 (게이팅 가드 먼저) → Phase 1 → 2 → 3 → 5**.

---

## 7. 백엔드 협의 필요 항목

- **마이페이지 이메일 노출 여부** — 현재 `MyPageProfile` 타입에 `email` 없음. 정책상 노출 필요한지 확인 후 응답에 추가 또는 디자인 조정.
- **`setMyPlanVisibility` 응답 포맷** — `isPublic` 토글 후 응답 구조 명세.
- (별도 plan에서 다룰 항목) 피드 화면 운영 노출 여부 및 API 스펙.

---

## 8. 산출물 체크리스트

- [ ] `useUserStore` 기본값 비로그인 전환 (Phase 1)
- [ ] `useMyPageProfile`, `useMyPlans` hook 추가 (Phase 2, 3)
- [ ] `my-page/page.tsx`, `course-plan/page.tsx` 하드코딩/mock 제거 (Phase 2, 3)
- [ ] `api/mypage/*/route.ts` 의 mock 폴백 환경 게이팅 (Phase 4)
- [ ] `.env.local` / 배포 환경 변수에 `NEXT_PUBLIC_USE_MOCK` 정의 (Phase 4)
- [ ] 로딩 / 에러 / 빈 상태 UI 컴포넌트 재사용 (`shared/ui`)
- [ ] QA 체크리스트 통과 (Phase 5)
