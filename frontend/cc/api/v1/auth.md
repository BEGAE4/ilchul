# AUTH-1. 소셜 로그인 시작
## URL : GET /oauth2/authorization/{provider}

> [LoginPage](../../src/app/login/page.tsx)의 카카오/구글/네이버 버튼 클릭 시 `window.location.href`로 이동. provider는 `kakao` / `google` / `naver`.

### 쿼리 파라미터

| **이름** | **유형** | **필수/선택** | **설명** |
| --- | --- | --- | --- |
| provider | path parameter | 필수 | 소셜 제공자 (`kakao`, `google`, `naver`) |
| redirect_uri | query parameter | 선택 | 콜백 후 리다이렉트 URL (기본: `/`) |

### 응답 코드

| status | message |
| --- | --- |
| 302 | 소셜 제공자 인증 페이지로 리다이렉트 |
| 400 | 지원하지 않는 provider |
| 502 | 소셜 제공자 응답 실패 |

## 코드 예시

### 요청

```jsx
GET /oauth2/authorization/kakao
```

### 응답

```java
HTTP/1.1 302 Found
Location: https://kauth.kakao.com/oauth/authorize?client_id=...&redirect_uri=...
```

> 콜백 처리 후 실패 시 `/login?error=kakao_cancelled` 또는 `/login?error=kakao_failed` 등으로 리다이렉트 (UI에서 에러 메시지 매핑).

# AUTH-2. 로그아웃
## URL : POST /api/auth/logout

> `SettingsPage`의 로그아웃 버튼 클릭 시 호출. 세션 쿠키 무효화.

### 본문 파라미터

| **이름** | **유형** | **필수/선택** | **설명** |
| --- | --- | --- | --- |
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |

### 응답 코드

| status | message |
| --- | --- |
| 204 | 성공 (본문 없음, Set-Cookie로 세션 만료) |
| 401 | 이미 비로그인 상태 |

## 코드 예시

### 요청

```jsx
{
}
```

### 응답

```java
HTTP/1.1 204 No Content
Set-Cookie: SESSION=; Max-Age=0; Path=/; HttpOnly
```

# AUTH-3. 현재 로그인 사용자 조회
## URL : GET /api/auth/me

> 페이지 진입 시 세션 유효성 검사 + 헤더/마이페이지의 사용자 정보 표시에 사용. 비로그인 시 401을 받아 인트로/로그인 페이지로 리다이렉트.

### 응답 코드

| status | message |
| --- | --- |
| 200 | 성공 |
| 401 | 비로그인 또는 세션 만료 |

## 코드 예시

### 응답

```java
{
    "status": 200,
    "data": {
        "userId": "u-001",
        "userNickname": "김여행",
        "userImg": "https://i.pravatar.cc/150?u=me",
        "userIntro": "힐링 여행을 좋아하는 여행자입니다 🌿",
        "provider": "kakao",
        "createdAt": "2026-01-15T09:00:00Z"
    }
}
```

# AUTH-4. 계정 탈퇴
## URL : DELETE /api/user/account

> `SettingsPage`의 회원 탈퇴 진입 후 확인 단계에서 호출. 모든 본인 데이터 영구 삭제.

### 본문 파라미터

| **이름** | **유형** | **필수/선택** | **설명** |
| --- | --- | --- | --- |
| confirmText | String | 필수 | 사용자가 입력한 확인 문구 ("탈퇴" 등) |
| reason | String | 선택 | 탈퇴 사유 (통계용) |
|  |  |  |  |

### 응답 코드

| status | message |
| --- | --- |
| 200 | 성공 (세션 종료 + 데이터 삭제 큐잉) |
| 400 | 요청 데이터 오류 (확인 문구 불일치) |
| 401 | 인증 필요 |
| 409 | 처리 중인 결제/약속 등으로 탈퇴 불가 |

## 코드 예시

### 요청

```jsx
{
    "confirmText": "탈퇴",
    "reason": "서비스를 더 이상 이용하지 않아요"
}
```

### 응답

```java
{
    "status": 200,
    "data": {
        "deletedAt": "2026-05-06T13:00:00Z"
    }
}
```
