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
