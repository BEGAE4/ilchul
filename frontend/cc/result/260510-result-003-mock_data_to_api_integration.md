# Mock 데이터 → 실제 API 연동 구현 결과

작성일: 2026-05-10
작업 영역: `frontend`
관련 plan: [cc/plan/260510-plan-001-mock_data_to_api_integration.md](../plan/260510-plan-001-mock_data_to_api_integration.md)
브랜치: `api-check-yj`

---

## 1. 작업 범위

원래 식별한 3개 이슈 영역 중, 백엔드 API가 이미 존재하거나 코드 단독으로 해결 가능한 항목을 즉시 진행하고, 백엔드 의존 항목(피드)은 별도 plan으로 분리.

| 영역 | 처리 | 비고 |
| --- | --- | --- |
| 마이페이지 하드코딩 닉네임/이메일 | ✅ 완료 (Phase 2) | `fetchMyPageProfile` 연결 |
| `useUserStore` 기본값 고정 | ✅ 완료 (Phase 1) | 비로그인 초기 상태로 전환 |
| 플랜 리스트 `mockPlans` | ✅ 완료 (Phase 3) | `fetchMyPlans` + `setMyPlanVisibility` 연결 |
| API Route mock 폴백 | ✅ 완료 (Phase 4) | 환경 변수 게이팅 |
| 피드 `mockPosts` | ⏸️ 보류 | 백엔드 API/스펙 부재. FeedPage는 현재 진입 링크 없음 |

---

## 2. 변경 파일

### 신규 생성 (3)

- [src/features/my-page/hooks/useMyPageProfile.ts](../../src/features/my-page/hooks/useMyPageProfile.ts) — `fetchMyPageProfile` 호출 + `useUserStore` 동기화
- [src/features/my-page/hooks/useMyPlans.ts](../../src/features/my-page/hooks/useMyPlans.ts) — `fetchMyPlans` + `setMyPlanVisibility` 래퍼
- [src/features/my-page/hooks/index.ts](../../src/features/my-page/hooks/index.ts) — barrel export

### 수정 (6)

- [src/shared/lib/stores/useUserStore.ts](../../src/shared/lib/stores/useUserStore.ts) — 기본값을 비로그인 빈 프로필로 전환
- [src/app/my-page/page.tsx](../../src/app/my-page/page.tsx) — `kong9434` 하드코딩 제거, hook 사용, 로딩/에러 라벨, 아바타 `Image` 적용
- [src/app/my-page/course-plan/page.tsx](../../src/app/my-page/course-plan/page.tsx) — `mockPlans` 제거, `MyPlan` 필드 매핑, 로딩/에러/빈 상태 분기, 공개/비공개 모달이 실제 API 호출
- [src/app/api/mypage/profile/route.ts](../../src/app/api/mypage/profile/route.ts) — `NEXT_PUBLIC_USE_MOCK` 게이팅
- [src/app/api/mypage/summary/route.ts](../../src/app/api/mypage/summary/route.ts) — `NEXT_PUBLIC_USE_MOCK` 게이팅
- [src/app/api/mypage/plans/route.ts](../../src/app/api/mypage/plans/route.ts) — `NEXT_PUBLIC_USE_MOCK` 게이팅

---

## 3. Phase별 변경 내용

### Phase 4. API Route mock 폴백 환경 게이팅

각 라우트 상단에 `const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';` 추가.

| 상황 | 변경 전 | 변경 후 (`USE_MOCK=false`) | 변경 후 (`USE_MOCK=true`) |
| --- | --- | --- | --- |
| `BASE_URL` 미설정 | 200 + mock | 500 + 명시적 에러 | 200 + mock |
| 백엔드 응답 실패 | 200 + mock | 백엔드 status 그대로 전달 | 200 + mock |
| `fetch` 예외 | 200 + mock | 502 + `upstream_unavailable` | 200 + mock |

**효과**: 운영 빌드에서 백엔드 장애가 즉시 표면화. 로컬 개발은 `.env.local` 의 `NEXT_PUBLIC_USE_MOCK=true` 로 기존 mock 흐름 유지 가능.

### Phase 1. `useUserStore` 기본값 비로그인 전환

```diff
  user: {
-   id: 'me',
-   name: '김여행',
-   avatar: 'https://i.pravatar.cc/150?u=me',
-   title: '힐링 여행을 좋아하는 여행자입니다 🌿',
-   level: 3,
-   travelType: '힐링 마스터',
-   bio: '힐링 여행을 좋아하는 여행자입니다 🌿',
-   courseCount: 12,
-   ...
+   id: '',
+   name: '',
+   avatar: '',
+   title: '',
+   level: 0,
  },
- isLoggedIn: true,
+ isLoggedIn: false,
```

**호환성**: 소비자(`SettingsPage`, `ProfilePage`)는 `user.name` 등 필드를 직접 읽으므로 nullable 변경 없이 안전.

### Phase 2. 마이페이지 프로필 동적화

[my-page/page.tsx](../../src/app/my-page/page.tsx):

- `useMyPageProfile()` 으로 데이터 로드.
- `kong9434` / `kong9434@naver.com` 하드코딩 제거 → `profile?.userNickname` / `profile?.userIntro` 사용.
- 로딩 시 `"불러오는 중..."`, 에러 시 `"프로필을 불러오지 못했어요"` 노출.
- `userImg` 가 있으면 `next/image` 로 아바타 렌더, 없으면 placeholder.

**제약**: `MyPageProfile` 타입에 `email` 필드가 없어 임시로 `userIntro` 를 sub 라벨에 노출. 향후 백엔드에서 email 필드 추가 시 교체 필요.

### Phase 3. 플랜 리스트 API 연동

[course-plan/page.tsx](../../src/app/my-page/course-plan/page.tsx):

- `useMyPlans()` 으로 데이터 로드.
- `mockPlans` 완전 제거.
- `MyPlan` 필드 매핑: `planId` (number, 키), `planTitle`, `createAt`, `tripDate`, `planImages[0]`.
- 로딩 / 에러 / 빈 배열 상태 분기 추가.
- `selectedPlanId` 타입을 `string | null` → `number | null` 로 변경 (planId 가 number).
- 공개/비공개 모달의 "닫기" 버튼이 `setMyPlanVisibility(planId)` 를 호출하도록 결선. 저장 중 disabled + `"저장 중..."` 라벨.

**ID 0 안전성**: `if (selectedPlanId)` falsy 체크가 `planId === 0` 을 잘못 처리하던 문제 → `!== null` 명시 비교로 수정.

---

## 4. 검증 결과

| 항목 | 결과 | 비고 |
| --- | --- | --- |
| `npx tsc --noEmit` | ✅ 통과 | |
| `yarn build` 컴파일 | ✅ Compiled successfully | |
| `yarn build` prerender | ❌ `/login` `useSearchParams` suspense 누락 | **사전 존재 이슈** — git stash 상태에서도 동일 실패 확인 |
| `yarn lint` | ⚠️ 경고/에러 다수 | **모두 사전 존재**, 본 작업 파일에는 없음 |
| `yarn format:check` | ✅ 본 작업 파일 정리 완료 | 그 외 119개 사전 존재 |
| `grep "kong9434"` | ✅ 0건 | |
| `grep "mockPlans"` | ✅ 0건 | |
| `grep "김여행"` | ⚠️ 잔존 8건 — 모두 의도적 | `MOCK_PROFILE` 상수(USE_MOCK 게이팅 뒤) + 본 plan 범위 외 (`CourseViewPage`, `CourseCreationFlow`, `mockData.ts`, `ProfilePage` 폴백) |

---

## 5. 알려진 이슈 / 후속 조치

### 5.1 `/` 진입 시 500 에러 (사용자 보고 스크린샷)

```
GET http://localhost:3000/                                500
GET http://localhost:3000/_next/static/chunks/main.js     500
GET http://localhost:3000/_next/static/chunks/...         500
```

**진단 필요**:

- `/_next/static/chunks/*.js` 가 500을 반환한다는 점에서 **본 작업의 API Route 변경과 직접적 인과 가능성은 낮음** (정적 자산 라우트라 mypage api 게이팅과 무관).
- 가능성:
  1. dev 서버가 빌드/HMR 단계에서 컴파일 실패 → 모든 응답이 500
  2. Next.js 캐시 손상 → `.next` 폴더 삭제 후 재시도
  3. 사전 존재한 `/login` prerender 에러가 dev 서버에서도 영향
- 후속 액션: `rm -rf .next && yarn dev` 로 캐시 초기화 후 재현 여부 확인. 문제가 지속되면 dev 서버 콘솔 로그에서 컴파일 실패 메시지 확인.

### 5.2 환경 변수 설정 안내

로컬에서 mock 폴백을 유지하려면 `.env.local` 에 추가:

```
NEXT_PUBLIC_USE_MOCK=true
```

미설정 시 백엔드 미연결/실패가 명확히 노출됨 (의도된 동작).

### 5.3 보류 항목 (별도 plan 필요)

- **피드 화면 API 연동** — 백엔드 스펙 부재. `cc/api/v1/` 에 피드 엔드포인트 미정의, `features/feed/api/` 폴더 자체가 없음. 추가로 [FeedPage.tsx](../../src/features/feed/components/FeedPage.tsx) 는 앱 내 진입 링크가 없는 사실상 데드 코드 (`/feed` URL 직접 입력 시에만 접근 가능). → 노출/제거 의사 결정 선행 필요.
- **mock 폴백 완전 제거** — Phase 4 의 환경 게이팅으로 운영 위험은 차단됨. 백엔드 안정화 이후 일괄 제거 권장.
- **마이페이지 이메일 노출** — `MyPageProfile` 타입에 `email` 필드 추가 필요 (또는 디자인에서 이메일 표시 제거). 현재는 임시로 `userIntro` 를 노출 중.

---

## 6. 산출물 체크리스트

- [x] `useUserStore` 기본값 비로그인 전환 (Phase 1)
- [x] `useMyPageProfile`, `useMyPlans` hook 추가 (Phase 2, 3)
- [x] `my-page/page.tsx`, `course-plan/page.tsx` 하드코딩/mock 제거 (Phase 2, 3)
- [x] `api/mypage/*/route.ts` 의 mock 폴백 환경 게이팅 (Phase 4)
- [x] 로딩 / 에러 / 빈 상태 UI 분기
- [x] tsc / build 컴파일 / grep 검증 (Phase 5)
- [ ] `.env.local` 작성 (사용자 액션 — 본 문서 5.2 참고)
- [ ] dev 서버 500 에러 원인 확인 (본 문서 5.1 참고)
- [ ] QA 시나리오 수동 점검 (백엔드 정상/장애, 로그아웃 상태)
