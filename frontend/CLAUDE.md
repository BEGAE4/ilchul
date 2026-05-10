# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**일출 (Ilchul)** — A Korean mobile web app (PWA) for healing travel course planning, discovery, and recording. The app is Korean-language and mobile-first.

## Commands

```bash
yarn dev          # Start dev server on port 3000
yarn build        # Production build (ESLint errors are ignored during build)
yarn lint         # Run ESLint
yarn format       # Format with Prettier
yarn format:check # Check formatting without writing
yarn storybook    # Start Storybook on port 6006
yarn build-storybook
```

The backend API server is expected at `localhost:3845`.

## Architecture

This project follows **Feature-Sliced Design (FSD)**:

```
src/
├── app/           # Next.js App Router: pages, layouts, API routes
├── features/      # Feature domains (each with api/, components/, hooks/, types/)
├── shared/        # Cross-feature shared code
│   ├── ui/        # Design system components
│   ├── assets/    # SVG icons
│   └── lib/       # Constants, utilities
├── widgets/       # Composite UI blocks (mostly scaffolded, not yet populated)
└── mocks/         # MSW mock handlers (scaffolded, not yet populated)
```

### Page → Feature pattern

Next.js pages in `src/app/` are thin wrappers that render feature components from `src/features/`. Business logic lives in feature hooks, not page components.

Example: `src/app/place/[id]/page.tsx` → renders `PlaceDetailPage` from `src/features/place-detail/`.

### API layer

- Feature API files: `src/features/{feature}/api/{feature}.api.ts` — currently return mock data with `// TODO` comments
- Next.js API routes: `src/app/api/` — proxy or BFF endpoints (e.g., `/api/mypage/plans`)
- HTTP client: `axios` for feature API calls hitting Next.js API routes

### Styling

Both **Tailwind CSS v4** and **SCSS Modules** are used together. Tailwind is imported via `@import 'tailwindcss'` in `globals.css` (v4 syntax). SCSS modules use `styles.module.scss` co-located with components.

- Font: Pretendard (loaded from `/public/fonts/pretendard/`)
- Mobile-first; uses `env(safe-area-inset-*)` for notch/home bar support

### Shared UI components

Located in `src/shared/ui/`. Each component follows this structure:

```
ComponentName/
├── component.tsx      # Implementation
├── types.ts           # Props interface
├── styles.module.scss # Scoped styles
├── index.ts           # Re-export
└── index.stories.tsx  # Storybook stories
```

Key shared components:

- `PageLayout` — wraps pages; accepts optional `bottomNavItems` for the bottom nav
- `Header` — 3 variants: `logo`, `backArrow`, `profile`
- `BottomNavigation` — 4-tab nav (홈/검색/코스작성/마이)
- `IconBox` — renders custom SVG icons from `src/shared/assets/icons/` via SVGR
- `Button` — variants: `primary`; sizes: `large`

### Icons

Custom SVG icons live in `src/shared/assets/icons/` and are registered in `src/shared/ui/IconBox/icons/index.ts`. Use `<IconBox name="icon-name" size={24} />` to render them. Nav icons use `lucide-react`.

### Navigation

Bottom nav tabs are defined in `src/shared/lib/constants/navItems.ts`. The active tab is passed as a string (`'home' | 'search' | 'create' | 'profile'`). Pages use `getNavItems(activeTab, onNavigate)` and pass the result to `PageLayout`.

### Path aliases

```json
"@/*"        → "./src/*"
"@/shared/*" → "./src/shared/*"
"@/assets/*" → "./src/assets/*"
```

### Intro flow

On first visit, `src/app/page.tsx` checks `localStorage` for `ilchul_intro_seen`. If not set, it redirects to `/intro`.

## 프로젝트 컨벤션 (cc/convention)

**모든 agent는 작업을 수행하기 전에 `cc/convention/` 폴더 내의 모든 `.md` 파일을 반드시 읽고, 해당 규칙을 엄격히 준수해야 한다.**

해당 폴더에는 코드 컨벤션, 디렉토리 구조 규칙 등 프로젝트 전반의 표준이 정의되어 있다.

- 위치: [cc/convention/](cc/convention/)
- 적용 대상: 코드 작성, 파일/폴더 생성, 리팩토링, 리뷰 등 모든 작업
- 우선순위: `cc/convention/` 내 규칙이 일반 관행보다 우선한다
- 신규 파일 추가 또는 기존 규칙 갱신 시에도 해당 폴더의 최신 문서를 기준으로 판단한다

**작업 시작 시 체크리스트**:

1. `cc/convention/` 폴더 내 `.md` 파일 목록 확인
2. 작업 영역에 해당하는 컨벤션 문서 읽기
3. 컨벤션과 충돌이 있는 경우 사용자에게 확인 후 진행

## Markdown 파일 명명 규칙

**모든 agent는 `.md` 파일 생성 시 아래 네이밍 규칙을 반드시 따라야 한다.**

형식:

```
생성일-상위폴더명-고유ID-파일명.md
```

- **생성일**: `YYMMDD` (6자리, 예: `260506`)
- **상위폴더명**: 파일이 위치할 바로 위 폴더명 (예: `test`, `api`, `plan`)
- **고유ID**: 세 자리 숫자 (`001`, `002`, `003`, ...). 같은 상위 폴더 내에서 순차적으로 증가
- **파일명**: 공백 대신 언더스코어(`_`)로 단어 구분 (예: `ilchul_test`)

예시:

```
260506-test-001-ilchul_test.md
260506-api-002-plan_endpoint_spec.md
260507-plan-001-course_creation_flow.md
```

**규칙 적용 시 주의사항**:

- 새 `.md` 파일 생성 전, 동일한 상위 폴더 내 기존 파일들의 고유 ID를 확인하고 다음 번호를 사용한다
- 날짜는 파일 생성 시점의 날짜를 `YYMMDD` 형식으로 기록한다
- README.md, CLAUDE.md 등 프로젝트 표준 파일은 이 규칙에서 제외된다
