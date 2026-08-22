# UI/UX 전면 개선 설계 (Design Spec)

- 작성일: 2026-07-27
- 상태: 사용자 승인 대기
- 목표: 일관성 확보 · 비주얼 품질 향상 · 사용성(플로우) 개선
- 벤치마크: 트리플(정돈된 카드·지도 UX), 오늘의집(따뜻한 톤, 절제된 감성 액센트)
- 범위 제외: 피드/매거진(비활성 기능), 관리자 콘솔(현행 유지)

## 배경 진단 (요약)

- 디자인 토큰 부재: 하드코딩 hex 108종, 브랜드 파랑 5종 난립(`#5188f1`, `#3b82f6`, `#0066cc`, sky 계열). `globals.css`의 `var(--background)`는 정의처 없는 깨진 참조. `tailwind.config.js`는 v3 형식이라 Tailwind v4에서 미적용.
- 공통 컴포넌트 미사용: `shared/ui`의 Button/InputField/Text 임포트 0회. raw `<button>` 66개 파일 산재. 모달/바텀시트 5종 개별 구현.
- 대형 인라인 화면: `CourseCreationFlow.tsx` 1,541줄, 홈 `page.tsx` 396줄 등.
- 접근성: `user-scalable=no`(핀치 줌 차단), 전역 `user-select: none` 등.

## 접근 방식: 토대 우선 (A안)

토큰 → 프리미티브 → 화면 순서로 쌓는다. 화면 적용 시 해당 화면의 raw 버튼·모달을 새 프리미티브로 이관하는 점진 전환. 빅뱅 치환 없음.

---

## 1단계 — 디자인 토큰

단일 소스: Tailwind v4 `@theme` 블록 (`globals.css`). SCSS도 동일 CSS 변수를 참조.

### 컬러

- **Primary (브랜드 블루)**: `#5188f1` 기준 50~900 스케일. 기존 4종 파랑 전부 이 스케일로 치환.
- **Accent (선라이즈 코럴)**: "일출" 컨셉의 웜 코럴/오렌지 계열 신설. 감정 설문, 스탬프 인증, 하이라이트 등 감성적 순간에만 절제 사용.
- **Neutral**: 기존 gray 계열(`#6b7280`/`#e5e7eb`/`#374151` 등)을 Tailwind gray 스케일로 공식화. 배경은 순백 대신 미세한 웜 그레이(`#fafaf9` 계열).
- **Semantic 토큰**: `--color-bg`, `--color-surface`, `--color-text-primary/secondary`, `--color-border`, `--color-success/warning/danger`. 컴포넌트는 semantic 토큰만 사용, raw 스케일 직접 참조 금지.

### 타이포·간격·라운드·그림자

- Pretendard 유지. 타이포 스케일 6단계: display / title / heading / body / caption / label. font-size 하드코딩 금지.
- 간격 4px 그리드.
- 라운드 3단계: 카드 16px / 버튼·인풋 12px / 칩 full.
- 그림자 2단계: 카드 / 플로팅.

### 기술 정리

- v3 형식 `tailwind.config.js` 제거 → `@theme`로 이전 (safe-area spacing, 390px 컨테이너 포함).
- `globals.css`의 깨진 `var(--background)`/`var(--foreground)` 참조 복구.

---

## 2단계 — 공통 컴포넌트 재생

### 프리미티브 (토큰 기반 재작성)

- **Button**: variant `primary / secondary / ghost / danger`, size `sm / md / lg`. `types.ts`·CLAUDE.md 문서 일치화. `.large { min-width: 320px }` 등 하드 사이즈 제거 → `w-full` 패턴. focus-visible 링·disabled·loading 내장.
- **Input/TextArea**: label·helper·error 상태 내장. iOS 줌 방지 16px 유지.
- **Modal / BottomSheet**: Radix Dialog 기반 2개 프리미티브. 기존 5종(`PlaceAddSheet`, `ShareBottomSheet`, `BottomMenu`, `ReportDialog`, `ConfirmDialog`)을 이 위에 재구성. 포커스 트랩·ESC·스크롤 락·스와이프 닫기 일괄 확보.
- **PlaceCard / PlanCard**: 홈 인라인 카드를 `shared/ui`로 추출. 홈·검색·인기 목록 공용.
- **배럴 파일**: `shared/ui/index.ts` 신설 (admin 키트 패턴 준용).

### 접근성 퀵윈 (이 단계 포함)

- `user-scalable=no` 제거, viewport 중복 선언 정리.
- 전역 `user-select: none` → 인터랙티브 요소로 범위 축소.
- 새 프리미티브에 시맨틱·키보드 접근성 내장.

---

## 3단계 — 메인·탐색 리디자인

### 홈 (`/`)

- 상단 히어로 신설: 따뜻한 인사말 + 시간대/감정 기반 카피 + **플랜 만들기 CTA 카드** (코럴 액센트). 핵심 퍼널 `/create` 진입점을 홈 최상단에.
- 4개 섹션을 `PlaceCard`/`PlanCard`로 통일, 캐러셀·그리드 교차 배치. 섹션 헤더 "타이틀 + 더보기" 패턴 통일.
- 위치 권한 거부/데이터 없음 빈 상태를 기존 에러 UI 패턴 문서(`260705-result-015`)와 통일된 톤으로.

### 검색 (`/search`, `/search/results`)

- 검색 홈: 최근 검색어 + 인기 키워드 칩 + 추천 섹션.
- 결과: 장소/코스 탭 유지, 카드 컴포넌트 공용화. 결과 없음 시 인기 장소 추천 대안 제시.

### 인기 목록 4개 라우트

- 동일 카드 + 동일 리스트 레이아웃 재사용으로 자동 통일.

### 하단 네비게이션

- 활성 상태 명확화(Primary 색 + 라벨), safe-area 점검. 4탭 구조 유지.

---

## 4단계 — 플랜 생성·코스 플로우

### 플랜 생성 (`/create`)

- **스텝 분해**: 감정 설문 → 이동수단/시간 → 일정 → 장소 추천 → 경로 확인 → 저장을 독립 컴포넌트로. 공통 `StepLayout`(헤더+진행 표시+하단 액션바), 기존 `StepIndicator` 재활용.
- **감정 설문 시그니처화**: 코럴 액센트 + 절제된 모션. "힐링 감성 앱 = 단순하고 가벼운 UX" 원칙(`260604-ans-002`) 준수.
- **일정 입력 재설계 (Survey 3)** — 현행 "시작 날짜/시각 + 종료 날짜/시각" 4필드 → 사후 에러 검증 구조를 폐기하고, **잘못된 입력이 불가능한 구조**로 변경:
  - 입력: ① 날짜 1개("언제 떠나세요?") ② 출발 시각(30분 단위) ③ 소요시간 칩("얼마나 다녀올까요?" — 반나절 4시간 / 하루 8시간 / 직접 설정(30분 단위, 최대 24시간)).
  - 종료 시각은 자동 계산해 요약 표시("오전 9시 출발 → 오후 5시 돌아옴"). 자정 넘김(야간 출발→새벽 일출)은 종료 날짜 자동 이월로 처리.
  - **API 변경 없음**: 서버 계약은 `tripStartDate`/`tripEndDate` datetime 그대로. 프론트에서 `종료 = 출발 + 소요시간`으로 조립해 기존과 동일한 페이로드 전송. UI에서 24시간 상한을 구조적으로 보장하므로 서버 검증과도 충돌 없음.
- **사용성 보강**: 스텝 뒤로가기 시 입력 유지, 중도 이탈 확인, 다음 버튼 활성 조건 명시.

### 코스 상세 라우트 정리

- 3개 중복 라우트(`/course/[id]`, `/search/course/[id]`, `/profile/course/[id]`) → `/course/[id]` 단일화, 나머지 리다이렉트. 진입 맥락은 쿼리/뒤로가기로 보존.

### 내 코스 진행 (`/my-course/[id]`)

- 상단 여정 단계 표시(출발 전 → 여행 중 → 다녀옴) 비주얼 명확화.
- 스탬프 인증 성공 시 코럴 액센트 + 가벼운 모션의 마이크로 인터랙션.
- phase별 컴포넌트 분리.

---

## 테스트·검증

- 프리미티브: Storybook 스토리 현행화(미사용 컴포넌트 스토리 정리 포함) + 기존 jest/testing-library로 상태·접근성 단위 테스트.
- 일정 입력 재설계: 소요시간 계산(자정 넘김 포함) 순수 함수로 분리해 단위 테스트. 서버 페이로드 조립 결과가 기존 형식과 동일함을 테스트로 고정.
- 화면 이관 단계마다 수동 QA: 모바일 뷰포트(390px) 기준 핵심 플로우(홈 → 생성 → 저장 → 내 코스) 회귀 확인.

## 리스크·완화

- Tailwind v4 설정 이전 시 기존 화면 스타일 회귀 가능 → 토큰 도입 직후 전 라우트 스모크 확인.
- 점진 이관 중 신·구 스타일 혼재 기간 발생 → 화면 단위로 완결 이관(반쪽 이관 금지)로 혼재 구간 최소화.
