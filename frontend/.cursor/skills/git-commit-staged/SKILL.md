---
name: git-commit-staged
description: Analyzes staged git changes, drafts commit messages aligned with repo style, and runs the commit when the user explicitly requests it. Use when the user asks to commit, write a commit message, review staged changes, or proceed with git commit after staging.
---

# Staged Changes → Commit Message → Commit

## When to apply

- User explicitly asks to **commit**, **write a commit message**, or **review staged changes**
- User has staged files and wants to proceed
- Do **not** commit unless the user clearly requested it in this turn

## Quick workflow

```
Progress:
- [ ] 1. Inspect repo state (parallel)
- [ ] 2. Summarize staged changes for the user
- [ ] 3. Draft commit message (why > what)
- [ ] 4. Commit only if user asked to proceed
- [ ] 5. Verify with git status
```

## Step 1 — Inspect (run in parallel)

From the git repository root (monorepo root if `.git` is above `frontend/`):

```bash
git status
git diff --staged
git log -10 --oneline
```

Also check unstaged diff only if it helps explain context; **commit scope is staged files only**.

## Step 2 — Summarize staged changes

Tell the user briefly:

1. **What** changed (feature / fix / refactor / test / docs / chore)
2. **Why** it matters (user-visible outcome or technical reason)
3. **Scope** — main areas (e.g. `features/report`, `shared/ui`)
4. **Risks** — secrets (`.env`, keys), unrelated files, or huge accidental staging

Exclude files that must not be committed; warn if `.env` or credentials are staged.

## Step 3 — Draft commit message

### Message rules

- **1–2 sentences**, focus on **why**, not a file list
- Use accurate verbs: `add` = new capability, `update` = enhancement, `fix` = bug fix, `refactor` = behavior-preserving structure change
- Match **recent `git log` style** in this repo (often Korean body, `feat` / `fix` prefix)
- Prefer consistency with nearby commits, e.g. `feat : …` or `fix : …` (note space before colon if that pattern dominates)

### Examples (ilchul-style)

```
feat : 신고 UI 1차 — ReportBottomSheet 및 공통 훅 연동

플랜/댓글/기록 진입점에서 동일 신고 플로우를 사용하도록 통합
```

```
fix : 로그인 페이지 useSearchParams Suspense 경계 오류 수정
```

```
refactor : 코스 명칭을 플랜으로 일괄 변경
```

Present the draft to the user. If they only asked for a message, **stop here**.

## Step 4 — Commit (only when user asked)

Run **sequentially**:

```bash
# Stage only relevant paths (not secrets)
git add <paths>

git commit -m "$(cat <<'EOF'
<subject line>

<optional body — why, not file list>
EOF
)"
```

### Git safety (mandatory)

- **Never** change `git config`
- **Never** `--no-verify`, `--no-gpg-sign`, or destructive commands (`push --force`, `reset --hard`) unless the user explicitly requests
- **Never** force-push to `main` / `master`; warn if asked
- **Avoid** `git commit --amend` unless ALL are true:
  1. User explicitly requested amend, OR pre-commit hook modified files after a successful commit you made
  2. HEAD commit was created by you in **this** conversation
  3. Commit has **not** been pushed (`git status` shows ahead only)
- If commit **fails** on a hook: fix issues and create a **new** commit — do **not** amend a failed commit
- **Never** push unless the user explicitly asks

## Step 5 — Verify

```bash
git status
```

Confirm clean working tree for committed paths or report remaining unstaged/untracked files.

## Response format

When reporting to the user:

1. **Staged summary** (2–4 bullets)
2. **Proposed commit message** (copy-paste ready)
3. **Next step** — “커밋 진행할까요?” only if they have not yet asked to commit

Respond in **Korean** unless the user writes in another language.
