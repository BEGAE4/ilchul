# 디자인 토큰 (UI/UX 개선 1단계) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tailwind v4 `@theme` 블록에 디자인 토큰(컬러/타이포/라운드/그림자)을 단일 소스로 정의하고, 무시되고 있는 v3 `tailwind.config.js`를 이전·제거하며, 난립하는 브랜드 파랑 5종을 Primary 스케일로 수렴한다.

**Architecture:** 모든 토큰은 `frontend/src/app/globals.css`의 `@theme` 블록에 CSS 변수로 정의한다. Tailwind 유틸리티(`bg-primary-500` 등)와 SCSS 모듈(`var(--color-primary-500)`) 양쪽에서 같은 변수를 참조한다. 화면별 전면 이관은 3·4단계에서 하고, 이번 단계에서는 토큰 정의 + 깨진 설정 복구 + 브랜드 파랑 치환만 수행한다.

**Tech Stack:** Next.js 15 (App Router), Tailwind CSS v4 (`@tailwindcss/postcss`), SCSS Modules, Storybook 9

**설계 문서:** `frontend/cc/plan/260727-plan-014-ui_ux_redesign_design.md`

## Global Constraints

- 작업 디렉토리: `frontend/` (모든 경로는 frontend 기준)
- Tailwind v4 문법만 사용: 토큰은 `@theme` 블록, v3 `tailwind.config.js` 형식 금지
- 새 의존성 추가 금지
- 피드(`features/feed`)/매거진(`features/magazine`)/관리자(`shared/ui/admin`, `features/admin-*`) 코드는 이번 단계에서 수정 금지
- UI 카피는 한국어
- 커밋 메시지는 기존 컨벤션(`feat:`/`fix:`/`refactor:`/`docs:` + 한국어 요약) 준수
- 각 태스크 완료 시 `yarn build`가 성공해야 함 (빌드는 ESLint 에러를 무시하므로 빌드 성공 ≠ 린트 통과, `yarn lint`도 확인)

---

### Task 1: `@theme` 토큰 블록 정의 + 깨진 변수 참조 복구

**Files:**
- Modify: `src/app/globals.css` (1행 `@import 'tailwindcss';` 직후에 `@theme` 블록 삽입, 99~113행 `body` 블록 수정, 145~148행 focus-visible 수정)

**Interfaces:**
- Produces: 이후 모든 태스크·단계가 사용할 CSS 변수 및 Tailwind 유틸리티
  - 컬러: `--color-primary-{50..900}`, `--color-accent-{50..900}`, semantic `--color-bg`, `--color-surface`, `--color-border`, `--color-text-strong`, `--color-text-muted`, `--color-success`, `--color-warning`, `--color-danger` → 유틸리티 `bg-primary-500`, `text-accent-600`, `bg-surface`, `border-border`, `text-text-strong` 등 자동 생성
  - 타이포: `--text-display|title|heading|body|caption|label` → `text-display` 등
  - 라운드: `--radius-card`(16px), `--radius-field`(12px) → `rounded-card`, `rounded-field`
  - 그림자: `--shadow-card`, `--shadow-floating` → `shadow-card`, `shadow-floating`

- [ ] **Step 1: `@theme` 블록 삽입**

`src/app/globals.css`의 `@import 'tailwindcss';` 바로 아래에 다음 블록을 추가:

```css
/* ========================================
   디자인 토큰 (단일 소스)
   - Tailwind 유틸리티와 SCSS 모듈 var() 양쪽에서 참조
   - 설계: cc/plan/260727-plan-014-ui_ux_redesign_design.md
   ======================================== */
@theme {
  /* Primary — 브랜드 블루 (#5188f1 기준) */
  --color-primary-50: #eef4fe;
  --color-primary-100: #d9e6fd;
  --color-primary-200: #bcd3fb;
  --color-primary-300: #8fb6f8;
  --color-primary-400: #6b9ef4;
  --color-primary-500: #5188f1;
  --color-primary-600: #3a6de0;
  --color-primary-700: #2f57c4;
  --color-primary-800: #2b489e;
  --color-primary-900: #28407d;

  /* Accent — 선라이즈 코럴 (감성적 순간에만 절제 사용) */
  --color-accent-50: #fff4ef;
  --color-accent-100: #ffe6da;
  --color-accent-200: #ffccb5;
  --color-accent-300: #ffa985;
  --color-accent-400: #fc8a5e;
  --color-accent-500: #f97147;
  --color-accent-600: #e75532;
  --color-accent-700: #c14226;
  --color-accent-800: #9a3722;
  --color-accent-900: #7c3120;

  /* Semantic — 컴포넌트는 가급적 이 토큰만 사용
     (설계서의 text-primary/secondary는 Tailwind 클래스가 text-text-primary로
      어색해져 text-strong/muted로 명명 확정 — 의도적 변경) */
  --color-bg: #fafaf9; /* 웜 그레이 배경 */
  --color-surface: #ffffff;
  --color-border: #e5e7eb;
  --color-text-strong: #1f2937;
  --color-text-muted: #6b7280;
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;

  /* 타이포 스케일 (6단계, font-size 하드코딩 금지) */
  --text-display: 1.75rem; /* 28px */
  --text-display--line-height: 1.35;
  --text-display--font-weight: 700;
  --text-title: 1.375rem; /* 22px */
  --text-title--line-height: 1.4;
  --text-title--font-weight: 700;
  --text-heading: 1.125rem; /* 18px */
  --text-heading--line-height: 1.45;
  --text-heading--font-weight: 600;
  --text-body: 1rem; /* 16px */
  --text-body--line-height: 1.6;
  --text-caption: 0.875rem; /* 14px */
  --text-caption--line-height: 1.5;
  --text-label: 0.75rem; /* 12px */
  --text-label--line-height: 1.4;
  --text-label--font-weight: 500;

  /* 라운드 3단계: 카드 / 버튼·인풋 / 칩(rounded-full 기본 유틸) */
  --radius-card: 16px;
  --radius-field: 12px;

  /* 그림자 2단계 */
  --shadow-card: 0 2px 8px rgb(17 24 39 / 0.06);
  --shadow-floating: 0 8px 24px rgb(17 24 39 / 0.14);

  /* 폰트 (tailwind.config.js fontFamily 이전) */
  --font-sans:
    'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    sans-serif;

  /* safe-area (tailwind.config.js spacing 이전) */
  --spacing-safe-top: env(safe-area-inset-top);
  --spacing-safe-bottom: env(safe-area-inset-bottom);
  --spacing-safe-left: env(safe-area-inset-left);
  --spacing-safe-right: env(safe-area-inset-right);
}
```

- [ ] **Step 2: 깨진 `var(--background)`/`var(--foreground)` 참조 복구**

같은 파일의 `body` 블록(현재 99~113행)에서:

```css
body {
  background: var(--color-bg);
  color: var(--color-text-strong);
  font-family: var(--font-sans);
  font-size: 16px; /* 모바일에서 최소 16px로 줌 방지 */
  line-height: 1.6;
  -webkit-text-size-adjust: 100%;
  -ms-text-size-adjust: 100%;
}
```

(`var(--background)` → `var(--color-bg)`, `var(--foreground)` → `var(--color-text-strong)`, 하드코딩 font-family 목록 → `var(--font-sans)`)

- [ ] **Step 3: focus-visible 색상 토큰화**

같은 파일 145~148행:

```css
*:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}
```

- [ ] **Step 4: 빌드 검증**

Run: `cd frontend && yarn build && yarn lint`
Expected: 빌드 성공. (경고는 허용, 에러 없어야 함)

- [ ] **Step 5: 토큰 유틸리티 생성 확인 (스모크)**

Run: `cd frontend && grep -rn "var(--background)\|var(--foreground)" src/ | grep -v node_modules`
Expected: 출력 0줄 (깨진 참조 소멸)

- [ ] **Step 6: Commit**

```bash
git add frontend/src/app/globals.css
git commit -m "feat: 디자인 토큰 @theme 블록 신설 및 깨진 CSS 변수 참조 복구"
```

---

### Task 2: v3 `tailwind.config.js` 이전·제거

**Files:**
- Delete: `tailwind.config.js`
- Modify: `src/app/globals.css` (필요 시 `@theme`에 항목 추가)

**Interfaces:**
- Consumes: Task 1의 `@theme` 블록 (fontFamily·safe-area는 이미 이전됨)
- Produces: 설정 단일화 — 이후 모든 토큰 변경은 `globals.css` 한 곳에서만

- [ ] **Step 1: 구 설정의 실사용 여부 확인**

Run (frontend에서):
```bash
grep -rn "xs:" src/ --include="*.tsx" | grep -v node_modules | head
grep -rn "max-w-mobile\|screen-safe\|safe-top\|safe-bottom\|safe-left\|safe-right" src/ --include="*.tsx" | grep -v node_modules
```
Expected: `xs:`·`max-w-mobile`·`screen-safe`는 0건(사전 조사 결과 미사용). `safe-bottom` 등 safe-area 유틸리티 사용처가 나오면 기록해 둔다 — Task 1에서 `--spacing-safe-*`로 이전했으므로 클래스명 그대로 동작해야 한다 (`pb-safe-bottom` = `padding-bottom: env(safe-area-inset-bottom)`).

만약 `min-h-screen-safe` 사용처가 발견되면 `@theme`에 다음을 추가:
```css
  --min-height-screen-safe: calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom));
```

- [ ] **Step 2: `tailwind.config.js` 삭제**

```bash
git rm tailwind.config.js
```
(Tailwind v4는 소스 자동 감지이므로 `content` 목록 이전 불필요. `screens`의 xs 커스텀은 미사용이므로 폐기 — sm/md/lg/xl은 v4 기본값과 동일.)

- [ ] **Step 3: 빌드·화면 검증**

Run: `cd frontend && yarn build`
Expected: 빌드 성공.

Run: `cd frontend && yarn dev` 후 `http://localhost:3000` 홈, `/search`, `/create` 1스텝을 브라우저에서 열어 스타일 깨짐 없는지 확인 (safe-area 하단 네비 포함).
Expected: 기존과 동일한 렌더링. `body` 배경만 순백 → `#fafaf9`로 미세하게 변한 것은 의도된 변화.

- [ ] **Step 4: Commit**

```bash
git add -A frontend/tailwind.config.js frontend/src/app/globals.css
git commit -m "refactor: v3 tailwind.config.js 제거 및 @theme 이전 완료"
```

---

### Task 3: 토큰 쇼케이스 Storybook 스토리 (시각 회귀 기준점)

**Files:**
- Create: `src/shared/ui/tokens/index.stories.tsx`

**Interfaces:**
- Consumes: Task 1의 전체 토큰
- Produces: 토큰 시각 문서 — 이후 단계(프리미티브/화면)에서 색·타이포 판단 기준. 팀원이 Storybook에서 팔레트를 눈으로 확인 가능

- [ ] **Step 1: 스토리 작성**

```tsx
import type { Meta, StoryObj } from '@storybook/nextjs';

const PRIMARY = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;

function Swatch({ name }: { name: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          width: 64,
          height: 48,
          borderRadius: 8,
          border: '1px solid var(--color-border)',
          background: `var(${name})`,
        }}
      />
      <div style={{ fontSize: 11, marginTop: 4 }}>{name}</div>
    </div>
  );
}

function TokenShowcase() {
  return (
    <div style={{ display: 'grid', gap: 24, padding: 16 }}>
      <section>
        <h3>Primary</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {PRIMARY.map((step) => (
            <Swatch key={step} name={`--color-primary-${step}`} />
          ))}
        </div>
      </section>
      <section>
        <h3>Accent (선라이즈 코럴)</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {PRIMARY.map((step) => (
            <Swatch key={step} name={`--color-accent-${step}`} />
          ))}
        </div>
      </section>
      <section>
        <h3>Semantic</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            '--color-bg',
            '--color-surface',
            '--color-border',
            '--color-text-strong',
            '--color-text-muted',
            '--color-success',
            '--color-warning',
            '--color-danger',
          ].map((name) => (
            <Swatch key={name} name={name} />
          ))}
        </div>
      </section>
      <section>
        <h3>Typography</h3>
        <p className="text-display">Display 28 — 오늘도 좋은 하루</p>
        <p className="text-title">Title 22 — 오늘도 좋은 하루</p>
        <p className="text-heading">Heading 18 — 오늘도 좋은 하루</p>
        <p className="text-body">Body 16 — 오늘도 좋은 하루</p>
        <p className="text-caption">Caption 14 — 오늘도 좋은 하루</p>
        <p className="text-label">Label 12 — 오늘도 좋은 하루</p>
      </section>
      <section>
        <h3>Radius & Shadow</h3>
        <div style={{ display: 'flex', gap: 16 }}>
          <div className="rounded-card shadow-card" style={{ width: 120, height: 80, background: 'var(--color-surface)' }} />
          <div className="rounded-field shadow-floating" style={{ width: 120, height: 80, background: 'var(--color-surface)' }} />
        </div>
      </section>
    </div>
  );
}

const meta: Meta<typeof TokenShowcase> = {
  title: 'Design/Tokens',
  component: TokenShowcase,
};
export default meta;

export const All: StoryObj<typeof TokenShowcase> = {};
```

주의: 기존 스토리 파일들의 임포트 형식(`@storybook/nextjs` vs `@storybook/react`)을 먼저 확인하고 동일하게 맞출 것 (`grep -l "from '@storybook" src/shared/ui -r` 후 아무 파일이나 열어 확인). Storybook이 `globals.css`를 로드하는지 `.storybook/preview.ts`를 확인하고, 없으면 `import '../src/app/globals.css';`를 추가.

- [ ] **Step 2: Storybook 기동 확인**

Run: `cd frontend && yarn storybook`
Expected: `Design/Tokens` 스토리에서 Primary/Accent 스케일, Semantic, 타이포 6단계, 라운드·그림자가 렌더링됨. 타이포 유틸리티(`text-display` 등)가 적용 안 되면 Task 1 `@theme` 정의 오탈자 확인.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/shared/ui/tokens frontend/.storybook
git commit -m "feat: 디자인 토큰 쇼케이스 스토리 추가"
```

---

### Task 4: 브랜드 파랑 5종 → Primary 스케일 치환

**Files:**
- Modify: `src/features/**`, `src/shared/**`, `src/app/**`, `src/widgets/**`의 SCSS·TSX 중 파랑 사용처 전부 (admin·feed·magazine 제외)

**Interfaces:**
- Consumes: Task 1의 `--color-primary-*` 및 Tailwind 유틸리티
- Produces: 브랜드 컬러 단일화 — grep으로 구 파랑이 0건임을 보장

**치환 매핑 (이 표를 기계적으로 적용):**

| 기존 | 치환 (SCSS) | 치환 (Tailwind 클래스) |
|---|---|---|
| `#5188f1` | `var(--color-primary-500)` | — |
| `#3b82f6` / `blue-500` | `var(--color-primary-500)` | `primary-500` |
| `#0ea5e9` / `sky-500` | `var(--color-primary-500)` | `primary-500` |
| `#0284c7` / `sky-600` / `blue-600` | `var(--color-primary-600)` | `primary-600` |
| `#0066cc` | `var(--color-primary-700)` | — |
| `#38bdf8` / `sky-400` | `var(--color-primary-400)` | `primary-400` |
| `sky-300` 이하 (`sky-50/100/200`) | — | 같은 단계의 `primary-*` |
| `sky-700` | `var(--color-primary-700)` | `primary-700` |

- [ ] **Step 1: 사용처 전수 목록화**

Run (frontend에서):
```bash
grep -rln "#5188f1\|#3b82f6\|#0066cc\|#0ea5e9\|#38bdf8\|#0284c7" src/ --include="*.scss" --include="*.tsx" | grep -v "admin\|feed\|magazine"
grep -rln "sky-[0-9]\|blue-[0-9]" src/ --include="*.tsx" | grep -v "admin\|feed\|magazine"
```
목록을 확보하고 파일 수를 기록한다.

- [ ] **Step 2: 매핑표에 따라 전 파일 치환**

위 목록의 각 파일에서 매핑표대로 치환. 예시 — `text-sky-500` → `text-primary-500`, `bg-sky-50` → `bg-primary-50`, `border-sky-100` → `border-primary-100`, `shadow-sky-100` → `shadow-primary-100`, SCSS `color: #5188f1;` → `color: var(--color-primary-500);`. 그라데이션(`from-sky-400 to-blue-500` 등)도 같은 규칙 적용.

- [ ] **Step 3: 잔존 0건 검증**

Run:
```bash
grep -rn "#5188f1\|#3b82f6\|#0066cc\|#0ea5e9\|#38bdf8\|#0284c7" src/ --include="*.scss" --include="*.tsx" | grep -v "admin\|feed\|magazine"
grep -rn "sky-[0-9]\|blue-[0-9]" src/ --include="*.tsx" | grep -v "admin\|feed\|magazine"
```
Expected: 두 명령 모두 출력 0줄.

- [ ] **Step 4: 빌드·시각 스모크**

Run: `cd frontend && yarn build && yarn lint`
Expected: 성공.

`yarn dev`로 홈 → `/create` 전 스텝 → `/search` → `/my-course` 진입해 파랑 톤이 `#5188f1` 계열로 통일됐는지, 깨진 스타일 없는지 육안 확인. 390px 모바일 뷰포트 기준.

- [ ] **Step 5: Commit**

```bash
git add frontend/src
git commit -m "refactor: 브랜드 파랑 5종을 primary 토큰 스케일로 치환"
```

---

## 후속 플랜 (이 플랜 범위 아님)

- 2단계: 공통 컴포넌트 재생 (Button/Input/Modal/BottomSheet/Card, 접근성 퀵윈) — Task 4 완료 후 별도 플랜 작성
- 3단계: 메인·탐색 리디자인 / 4단계: 플랜·코스 플로우 — 각 전 단계 완료 후 작성
