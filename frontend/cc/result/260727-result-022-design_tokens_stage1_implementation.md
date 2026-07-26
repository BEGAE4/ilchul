# 디자인 토큰 (UI/UX 개선 1단계) 구현 결과

- 작업일: 2026-07-27
- 브랜치: `feature-fe-check-yj`
- 커밋 범위: `7fe8f95..a5e305c` (6개 커밋)
- 설계: `cc/plan/260727-plan-014-ui_ux_redesign_design.md`
- 플랜: `cc/plan/260727-plan-015-design_tokens_implementation.md`

## 결과 요약

디자인 토큰을 단일 소스로 세우고, 무시되던 스타일 설정을 정리하고, 난립하던 브랜드 파랑 5종을 하나의 `primary` 스케일로 수렴했다. 빌드 성공, 신규 린트 에러 없음.

| 커밋 | 내용 |
|---|---|
| `911ab53` | `globals.css`에 `@theme` 토큰 블록 신설, 깨진 CSS 변수 참조 복구 |
| `1ffa8c3` | v3 형식 `tailwind.config.js` 제거 |
| `e6f08b7` | 토큰 쇼케이스 Storybook 스토리 추가 |
| `72bf344` | 브랜드 파랑 5종 → primary 스케일 치환 (43개 파일) |
| `9ed7ca4` | 잔여 파랑 그라데이션 2건 치환 |
| `a5e305c` | 최종 리뷰 지적사항 수정 (십진수 rgb 표기, 호버 방향성, 중복 파일) |

## 1. 디자인 토큰 (`src/app/globals.css`의 `@theme`)

- **Primary**: `#5188f1` 기준 50~900 스케일. 기존 최다 사용 브랜드 색을 그대로 500에 앵커링.
- **Accent**: 선라이즈 코럴 50~900 신설 (감성적 순간 전용, 절제 사용). 아직 미사용 — 2~4단계에서 활용.
- **Semantic**: `--color-bg`(`#fafaf9` 웜 그레이), `--color-surface`, `--color-border`, `--color-text-strong`, `--color-text-muted`, `--color-success/warning/danger`.
  - 설계서의 `text-primary/secondary`는 Tailwind 클래스가 `text-text-primary`로 어색해져 `text-strong/muted`로 명명 확정.
- **타이포** 6단계(display/title/heading/body/caption/label), **라운드** 2종(card 16px / field 12px), **그림자** 2종(card/floating), `--font-sans`, safe-area spacing.

토큰 53개 전부가 실제 생성 CSS(`.next/static/css/*.css`)에 방출되는 것을 최종 리뷰에서 대조 검증했다. Tailwind v4의 미사용 토큰 트리셰이킹에도 `--color-bg`처럼 raw CSS에서만 참조되는 토큰이 살아남는 것까지 확인.

## 2. 설정 단일화

`tailwind.config.js`는 v3 CommonJS 형식이라 Tailwind v4에서 **무시되고 있었다**(= 선언된 xs 브레이크포인트, safe-area spacing, maxWidth가 실제로는 미적용). 사용처가 0건임을 확인한 뒤 삭제하고, 실제 필요한 `fontFamily`·safe-area만 `@theme`로 이전했다. 이제 토큰 변경 지점은 `globals.css` 한 곳뿐이다.

## 3. 브랜드 색 수렴

기존 5종(`#5188f1`, `#3b82f6`, `#0066cc`, `#0ea5e9`, `#38bdf8`) + Tailwind `sky-*`/`blue-*` 클래스를 매핑표에 따라 43개 파일에서 primary 스케일로 치환. 관리자 콘솔·피드·매거진은 범위 제외(의도적).

**최종 리뷰가 잡아낸 사각지대**: 플랜의 검증 grep이 hex 표기와 클래스명만 탐색해서, **십진수 `rgb()` 표기**로 쓰인 구 브랜드 블루가 라이브 화면에 남아 있었다(`ListPageShell` 2건 — 인기 플랜/장소 목록 페이지 전체가 사용, `DropdownMenu` 4건). `a5e305c`에서 수정하고 `rgb\(\s*\d` 패턴으로 전수 재스윕해 잔존 0건을 확인했다.

**함께 고친 것**: 앱 최상위 CTA(`BottomActionBar`)의 호버가 혼자 밝아지는 방향(primary-400)이라 나머지 컨트롤(어두워짐)과 역방향이던 문제 → primary-600으로 정렬, 글로우 색도 버튼 자기 색으로 정합화. `CourseDetailPage`의 호버가 색상 계열을 이탈하던 문제(`#0052a3`) → primary-800.

## 4. 알려진 이슈 / 후속 조치

### Storybook 빌드 실패 (기존 문제, 이번 작업과 무관)

`yarn build-storybook`이 `SB_BUILDER-WEBPACK5_0002`로 실패한다. 스토리 파일을 제거한 상태에서도 동일하게 실패하는 것을 확인했으므로 **기존 문제**다. 근본 원인은 `.storybook/main.ts`가 `@storybook/addon-essentials`를 사용하는데 **Storybook 9에서 essentials가 core로 통합**되어 별도 애드온으로 존재하지 않기 때문으로 보인다(`package.json`에 9.0.0-alpha.12 / 9.1.0-alpha.5 / 9.0.15가 혼재).

→ 이 때문에 **토큰 쇼케이스 스토리를 현재 볼 수 없다**. 디자이너·팀원이 팔레트를 확인하는 통로이므로 2단계 착수 전 별건으로 고치는 것을 권장.

### 브라우저 시각 확인 미실시

이번 작업의 어떤 에이전트도 브라우저 접근이 없었다. 특히 `body`가 **배경 선언 없음 → `#fafaf9` 웜 그레이 + `#1f2937` 텍스트**로 바뀌어 전 화면에 동시 영향을 준다(설계 의도대로지만, 브라우저 기본 흰 배경에 암묵적으로 의존하던 화면이 있을 수 있음). 2단계 착수 전 첫 조치로 권장.

### 2단계에서 처리할 이월 항목

1. **인터랙션 상태 토큰 부재** — 현재 semantic 레이어에 hover/active/disabled/focus-ring/surface-subtle이 없다. 프리미티브를 먼저 만들고 나중에 채우면 컴포넌트마다 제각각 정의해서 **5종 파랑 문제가 그대로 재발**한다. `@theme`에 먼저 추가할 것.
2. **`text-primary-500` 52곳 일괄 정리** — 아래 대비비 규칙 참조.
3. 구 팔레트 기준 hover 틴트 hex 일부(`#3b7ae8`, `#2d68d4` 등)가 primary 스케일과 미세 불일치. 육안상 거의 동일해 이월했으나 프리미티브 작업 시 정렬 권장.
4. 토큰 쇼케이스 스토리의 `PRIMARY` 상수명이 accent 루프에도 재사용됨 → `SCALE_STEPS` 등으로 개명 (동작 문제 없음).
5. z-index 스케일 부재 — 2단계에서 모달·시트가 쌓이면 필요해진다.
6. 다크 모드 미대응 — semantic 토큰으로 이미 간접화돼 있어 나중에 추가해도 파급이 제한적. 현 시점 이월이 적절.

## 5. 색상 사용 규칙 (측정 기반)

플랜 문서 `cc/plan/260727-plan-015-design_tokens_implementation.md`의 `## 토큰 사용 규칙` 절에 대비비 측정값과 함께 기록했다. 요지:

- **`primary-500`은 브랜드·장식용.** 본문 크기 텍스트와 흰 글씨 CTA 배경에는 **`primary-600` 이상**을 쓴다 (500 = 3.42:1로 WCAG AA 본문 기준 4.5:1 미달, 600 = 4.73:1 통과). 아이콘·테두리·큰 텍스트(3:1 기준)에는 500도 적합.
- **`success`(2.28:1) / `warning`(2.15:1)** 은 흰 글씨를 얹거나 흰 배경 위 텍스트 색으로 쓰지 않는다. 어두운 글씨와 함께 배경(칩·뱃지)으로만.

## 검증

- `yarn build` 성공 (41/41 페이지)
- `yarn lint` — 기존 베이스라인(unused vars, `UserProfilePage.tsx`의 rules-of-hooks, storybook renderer-import)과 동일, 신규 에러 없음
- 브랜드 파랑 잔존 검증: hex·Tailwind 클래스·십진수 rgb 3개 패턴 모두 0건 (관리자/피드/매거진 제외)
- 태스크별 리뷰 4회 + 브랜치 전체 리뷰 1회 + 수정 재리뷰 1회 통과
