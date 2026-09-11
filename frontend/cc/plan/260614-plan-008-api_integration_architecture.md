# API 연동 전략 및 전체 구조 설계

작성일: 2026-06-14
작업 영역: `frontend`
관련 API 스펙: [cc/api/v2/](../api/v2/)
관련 컨벤션: [cc/convention/260506-convention-001-convention_v1.0.md.md](../convention/260506-convention-001-convention_v1.0.md.md)
선행 계획: [cc/plan/260510-plan-001-mock_data_to_api_integration.md](260510-plan-001-mock_data_to_api_integration.md)

---

## 0. 배경

`cc/api/v2/` 하위에 main·plan·place·auth·user·search·report·comment·inquiry·admin 스펙이 확정되었다. 이번 계획은 **연동 구조 표준화**와 **도메인별 작업 우선순위**를 정의한다.

---

## 1. 현황 진단

### 1.1 main 피처 — 가장 앞서 있음

| 레이어 | 파일 | 상태 |
| --- | --- | --- |
| Next.js BFF Route | `src/app/api/plan/popular/route.ts` | ✅ 구현 완료 |
| Next.js BFF Route | `src/app/api/place/popular/route.ts` | ✅ 구현 완료 |
| Next.js BFF Route | `src/app/api/plan/popular/nationwide/route.ts` | ✅ 구현 완료 |
| Next.js BFF Route | `src/app/api/place/popular/nationwide/route.ts` | ✅ 구현 완료 |
| Feature API | `src/features/main/api/main.api.ts` | ✅ 구현 완료 |
| Custom Hooks | `src/features/main/hooks/useNearby*.ts` | ✅ 구현 완료 |
| Types | `src/features/main/types/` | ✅ 구현 완료 |
| Mock 게이팅 | `NEXT_PUBLIC_USE_MOCK` 분기 | ⚠️ **미적용** (항상 폴백) |

**문제**: 현재 4개 route 모두 `NEXT_PUBLIC_API_BASE_URL` 미설정 또는 백엔드 오류 시 **조용히 mock 반환**. plan-001에서 설계한 `USE_MOCK` 환경 변수 게이팅이 적용되지 않았다.

### 1.2 다른 도메인 현황

| 도메인 | API 스펙 (v2) | BFF Route | Feature API | Hook |
| --- | --- | --- | --- | --- |
| main (plan/place popular) | ✅ main.md | ✅ 4개 | ✅ | ✅ |
| auth | ✅ auth.md | ❌ | ⚠️ mock only | ❌ |
| user | ✅ user.md | ❌ `/api/mypage/profile` 일부만 | ⚠️ | ⚠️ |
| plan (CRUD) | ✅ plan.md | ❌ | ❌ | ❌ |
| place (detail) | ✅ place.md | ❌ | ⚠️ mock only | ❌ |
| search | ✅ search.md | ❌ | ❌ | ❌ |
| report | ✅ report.md | ✅ `/api/reports` | ✅ | ✅ |
| comment | ✅ comment.md | ❌ | ❌ | ❌ |
| inquiry | ✅ inquiry.md | ✅ admin 용 | ⚠️ admin only | ⚠️ |
| admin | ✅ admin.md | ✅ 전체 | ✅ | ✅ |

---

## 2. 표준 API 연동 패턴 (3-레이어 구조)

모든 도메인은 아래 3개 레이어를 동일한 패턴으로 구현한다.

```
UI Component
     │ uses
     ▼
Custom Hook           src/features/{feature}/hooks/use{Domain}.ts
     │ calls
     ▼
Feature API Fn        src/features/{feature}/api/{feature}.api.ts
     │ axios GET/POST
     ▼
Next.js BFF Route     src/app/api/{domain}/{endpoint}/route.ts
     │ fetch + cookie forward
     ▼
Backend               process.env.NEXT_PUBLIC_API_BASE_URL  (기본: localhost:3845)
```

### 2.1 Layer 1 — Next.js BFF Route 표준 템플릿

```typescript
// src/app/api/{domain}/{endpoint}/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { build{Domain}Mock } from '@/features/{feature}/utils/{domain}-mock';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  // 파라미터 파싱
  const limit = Number(sp.get('limit') ?? 5);
  const page  = Number(sp.get('page')  ?? 1);

  // mock 모드: BASE_URL 없거나 USE_MOCK=true 일 때만
  if (USE_MOCK || !BASE_URL) {
    return NextResponse.json(build{Domain}Mock(limit, page));
  }

  try {
    const cookie = request.headers.get('cookie') ?? '';
    const url = new URL(`${BASE_URL}/api/{path}`);
    // 파라미터 세팅 ...

    const res = await fetch(url.toString(), {
      headers: cookie ? { cookie } : undefined,
      cache: 'no-store',
    });

    const data = await res.json().catch(() => null);
    if (!res.ok || !data) {
      return NextResponse.json(
        { error: 'upstream_error', status: res.status },
        { status: 502 }
      );
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'upstream_unavailable' }, { status: 502 });
  }
}
```

**핵심 변경 사항 (기존 대비):**
- mock 폴백 조건: `USE_MOCK || !BASE_URL` 로 **명시적 게이팅**
- 백엔드 오류 시 → mock 반환 ❌, **502 반환** ✅ (오류 은폐 방지)

### 2.2 Layer 2 — Feature API Function 표준 템플릿

```typescript
// src/features/{feature}/api/{feature}.api.ts
import axios from 'axios';
import type { SomeResponseType, SomeParams } from '../types';

// {API-ID}. {엔드포인트 설명}
export async function fetch{Domain}(
  params: SomeParams
): Promise<SomeResponseType> {
  const response = await axios.get<SomeResponseType>('/api/{path}', { params });
  return response.data;
}
```

규칙:
- `try-catch` 없음 — 에러는 Hook(Layer 3)에서 처리
- 반환값: `response.data` (응답 전체 아님)
- 함수명: `fetch{Domain}` 패턴 (예: `fetchNearbyPopularPlans`)

### 2.3 Layer 3 — Custom Hook 표준 템플릿

```typescript
// src/features/{feature}/hooks/use{Domain}.ts
'use client';

import { useState, useEffect } from 'react';
import { fetch{Domain} } from '../api/{feature}.api';
import type { SomeType } from '../types';

export function use{Domain}(params: SomeParams) {
  const [data, setData] = useState<SomeType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    fetch{Domain}(params)
      .then((res) => { if (!cancelled) setData(res); })
      .catch((err) => { if (!cancelled) setError(err); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [/* stable deps */]);

  return { data, isLoading, error };
}
```

페이지네이션이 필요한 목록은 기존 `usePaginatedList` 재사용.

---

## 3. 환경 변수 전략

| 변수 | 설명 | 로컬 dev | 운영(prd) |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | 백엔드 서버 주소 | `http://localhost:3845` | 실제 서버 URL |
| `NEXT_PUBLIC_USE_MOCK` | mock 강제 활성화 | `true` | 미설정 또는 `false` |

`.env.local` 기본 설정:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3845
NEXT_PUBLIC_USE_MOCK=true
```

운영 환경:
```
NEXT_PUBLIC_API_BASE_URL=https://api.ilchul.com
# NEXT_PUBLIC_USE_MOCK 미설정 → false로 동작
```

---

## 4. 에러 상태 UX 표준

| 상태 | 처리 방식 |
| --- | --- |
| `isLoading === true` | Skeleton UI 표시 |
| `error !== null` | 에러 메시지 + Retry 버튼 |
| 데이터 빈 배열 | Empty State UI ("아직 데이터가 없어요") |
| 인증 오류 (401) | 로그인 페이지로 리다이렉트 |

---

## 5. 도메인별 작업 목록

### Phase 0. 기반 작업 (선행 필수) — 약 1일

**목적**: 이후 모든 도메인 연동의 기준이 되는 환경 게이팅과 공통 유틸 정비.

| # | 작업 | 대상 파일 | 비고 |
| --- | --- | --- | --- |
| 0-1 | `.env.local` 에 `USE_MOCK`, `API_BASE_URL` 추가 | `.env.local` | 없으면 새로 생성 |
| 0-2 | main 4개 BFF Route에 `USE_MOCK` 게이팅 적용 | `src/app/api/plan/popular/route.ts` 外 3개 | 백엔드 오류 시 502 반환으로 수정 |
| 0-3 | 공통 BFF 프록시 헬퍼 함수 생성 | `src/shared/lib/api/bffProxy.ts` | 반복 로직 추출 (선택 사항) |

### Phase 1. main — 메인 화면 연동 — 약 0.5일

> BFF Route·Feature API·Hook이 이미 존재. 게이팅 패치만 하면 즉시 실제 API 연동 가능.

| # | 작업 | 대상 파일 |
| --- | --- | --- |
| 1-1 | Phase 0-2와 동일 (게이팅 패치) | 4개 route.ts |
| 1-2 | 메인 화면에서 에러 상태 UI 연결 확인 | main page 컴포넌트 |

**의존**: Phase 0 완료 후 즉시 가능.

---

### Phase 2. auth — 인증 연동 — 약 1일

관련 스펙: [cc/api/v2/auth.md](../api/v2/auth.md)

| # | 작업 | 생성/수정 파일 |
| --- | --- | --- |
| 2-1 | BFF Route 생성 (로그인, 로그아웃, 토큰 갱신) | `src/app/api/auth/login/route.ts` 外 |
| 2-2 | Feature API 함수 구현 | `src/features/authentication/api/authentication.api.ts` |
| 2-3 | `useLogin`, `useLogout` Hook 구현 | `src/features/authentication/hooks/` |
| 2-4 | `useUserStore` 기본값 비로그인 전환 | `src/shared/lib/stores/useUserStore.ts` |
| 2-5 | 401 에러 → 로그인 리다이렉트 처리 | axios interceptor 또는 각 hook |

**의존**: Phase 0 완료 후 가능. user(Phase 3)와 병렬 진행 가능.

---

### Phase 3. user (마이페이지) — 약 0.5일

관련 스펙: [cc/api/v2/user.md](../api/v2/user.md)
선행 계획: [plan-001](260510-plan-001-mock_data_to_api_integration.md) Phase 2~3

기존 `/api/mypage/profile`, `/api/mypage/plans` route 존재. 동일하게 게이팅 적용 후 `useMyPageProfile`, `useMyPlans` hook 연결.

| # | 작업 | 대상 파일 |
| --- | --- | --- |
| 3-1 | mypage 3개 route에 USE_MOCK 게이팅 | `src/app/api/mypage/*/route.ts` |
| 3-2 | `useMyPageProfile` hook 구현/검증 | `src/features/my-page/hooks/` |
| 3-3 | 마이페이지 하드코딩 닉네임 제거 | `src/app/my-page/page.tsx` |

**의존**: Phase 2(auth) 완료 필요 (로그인 상태에서 프로필 조회).

---

### Phase 4. plan (플랜 CRUD) — 약 2일

관련 스펙: [cc/api/v2/plan.md](../api/v2/plan.md)

| # | 작업 | 생성 파일 |
| --- | --- | --- |
| 4-1 | BFF Route 생성 (목록, 상세, 생성, 수정, 삭제) | `src/app/api/plan/[planId]/route.ts` 外 |
| 4-2 | Feature API 함수 구현 | `src/features/course-creation/api/plan.api.ts` |
| 4-3 | 플랜 상세 조회 hook | `src/features/course-detail/hooks/usePlanDetail.ts` |
| 4-4 | 플랜 생성/수정 hook | `src/features/course-creation/hooks/usePlanForm.ts` |

**의존**: Phase 2(auth) 완료 필요.

---

### Phase 5. place (장소 상세) — 약 1일

관련 스펙: [cc/api/v2/place.md](../api/v2/place.md)

| # | 작업 | 생성 파일 |
| --- | --- | --- |
| 5-1 | BFF Route 생성 (장소 상세) | `src/app/api/place/[placeId]/route.ts` |
| 5-2 | Feature API 함수 구현 | `src/features/place-detail/api/place.api.ts` |
| 5-3 | `usePlaceDetail` hook | `src/features/place-detail/hooks/usePlaceDetail.ts` |

**의존**: Phase 0. auth와 독립적으로 진행 가능.

---

### Phase 6. search — 약 1일

관련 스펙: [cc/api/v2/search.md](../api/v2/search.md)

| # | 작업 | 생성 파일 |
| --- | --- | --- |
| 6-1 | BFF Route 생성 | `src/app/api/search/route.ts` |
| 6-2 | Feature API 함수 구현 | `src/features/search/api/search.api.ts` |
| 6-3 | `useSearch` hook (debounce 포함) | `src/features/search/hooks/useSearch.ts` |

**의존**: Phase 0. 독립 진행 가능.

---

### Phase 7. report / comment / inquiry — 약 1일

관련 스펙: [cc/api/v2/report.md](../api/v2/report.md), [comment.md](../api/v2/comment.md), [inquiry.md](../api/v2/inquiry.md)

report는 BFF Route·Feature API·Hook 이미 존재. 게이팅 패치 후 검증.
comment·inquiry는 신규 구현.

**의존**: Phase 2(auth) 완료 필요 (로그인 사용자 액션).

---

## 6. 실행 순서 및 의존 관계

```
Phase 0 (기반: env + 게이팅 패치)
  ├─▶ Phase 1 (main — 즉시 완료 가능)
  ├─▶ Phase 2 (auth)
  │     └─▶ Phase 3 (user/마이페이지)
  │     └─▶ Phase 4 (plan CRUD)
  │     └─▶ Phase 7 (report/comment/inquiry)
  ├─▶ Phase 5 (place — auth 독립)
  └─▶ Phase 6 (search — auth 독립)
```

권장 실행 순서: **Phase 0 → 1 → 2 → 3 → 5,6 (병렬) → 4 → 7**

---

## 7. 공통 BFF 프록시 헬퍼 (선택 최적화)

4개 main route에서 동일한 패턴이 반복되므로, 아래 헬퍼를 `src/shared/lib/api/bffProxy.ts`에 추출하면 이후 신규 route 작성이 크게 단축된다.

```typescript
// src/shared/lib/api/bffProxy.ts
export interface ProxyOptions {
  request: NextRequest;
  backendPath: string;            // e.g. '/api/plan/popular'
  buildMock: () => unknown;       // mock 생성 함수
}

export async function bffProxy({ request, backendPath, buildMock }: ProxyOptions) {
  const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (USE_MOCK || !BASE_URL) {
    return NextResponse.json(buildMock());
  }

  try {
    const url = new URL(`${BASE_URL}${backendPath}`);
    request.nextUrl.searchParams.forEach((v, k) => url.searchParams.set(k, v));
    const cookie = request.headers.get('cookie') ?? '';
    const res = await fetch(url.toString(), {
      headers: cookie ? { cookie } : undefined,
      cache: 'no-store',
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data) {
      return NextResponse.json({ error: 'upstream_error' }, { status: 502 });
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'upstream_unavailable' }, { status: 502 });
  }
}
```

---

## 8. 산출물 체크리스트

### Phase 0
- [ ] `.env.local` — `NEXT_PUBLIC_USE_MOCK=true`, `NEXT_PUBLIC_API_BASE_URL` 추가
- [ ] main 4개 route에 USE_MOCK 게이팅 + 502 반환 적용
- [ ] (선택) `bffProxy.ts` 헬퍼 추출

### Phase 1
- [ ] main 페이지 에러 상태 UI 연결 확인

### Phase 2
- [ ] auth BFF Route 3개 이상
- [ ] `authentication.api.ts` 로그인/로그아웃 함수
- [ ] `useLogin`, `useLogout` hook
- [ ] `useUserStore` 기본값 비로그인 전환

### Phase 3
- [ ] mypage route 3개 USE_MOCK 게이팅
- [ ] `useMyPageProfile` hook
- [ ] 마이페이지 하드코딩 제거

### Phase 4~7
- [ ] 각 도메인 BFF Route, Feature API, Hook 신규 작성
- [ ] 에러/로딩/빈 상태 UX 통일

---

## 9. 참고 — 현재 구현 파일 목록

| 레이어 | 기존 파일 | 비고 |
| --- | --- | --- |
| BFF Route | `src/app/api/plan/popular/route.ts` | main ⚠️게이팅 필요 |
| BFF Route | `src/app/api/place/popular/route.ts` | main ⚠️ |
| BFF Route | `src/app/api/plan/popular/nationwide/route.ts` | main ⚠️ |
| BFF Route | `src/app/api/place/popular/nationwide/route.ts` | main ⚠️ |
| BFF Route | `src/app/api/mypage/profile/route.ts` | user ⚠️ |
| BFF Route | `src/app/api/mypage/plans/route.ts` | user ⚠️ |
| BFF Route | `src/app/api/mypage/summary/route.ts` | user ⚠️ |
| BFF Route | `src/app/api/reports/route.ts` | report ✅ |
| BFF Route | `src/app/api/admin/reports/route.ts` | admin ✅ |
| Feature API | `src/features/main/api/main.api.ts` | ✅ |
| Feature API | `src/features/my-page/api/my-page.api.ts` | ✅ |
| Feature API | `src/features/report/api/report.api.ts` | ✅ |
| Feature API | `src/features/admin-report/api/adminReport.api.ts` | ✅ |
