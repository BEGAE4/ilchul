# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

- `frontend/` — Next.js PWA (Feature-Sliced Design). See `frontend/CLAUDE.md` for commands and architecture.
- `backend/` — Spring Boot API server. **Do not modify.**

## Scope rule: frontend only

**코드 수정은 `frontend/` 디렉터리 안에서만 한다.** `backend/` 아래의 파일(Java, Gradle, 설정, 테스트 포함)은 읽고 참고하는 것은 괜찮지만 절대 수정·생성·삭제하지 않는다.

- 작업 중 백엔드 변경이 필요해 보이면(DTO 필드, 응답 형식, 검증 규칙 등) 직접 고치지 말고, 필요한 변경 내용을 사용자에게 정리해 전달한다. 백엔드는 별도 담당자가 수정한다.
- 백엔드 응답 형식이 프론트 기대와 다르면 **프론트 파서/타입을 응답에 맞춘다**. 백엔드를 프론트에 맞추지 않는다.
- 머지 컨플릭트 해결 시 `backend/` 파일에 충돌이 있으면 로직을 새로 쓰지 말고, 양쪽 중 하나를 그대로 택한 뒤 그 선택 근거를 사용자에게 보고한다.
- 커밋·PR에 `backend/` 변경이 섞여 들어가지 않도록 `git status`로 확인한 뒤 커밋한다.

## Git

- Work branch: `dev-fe`. PR flow: `dev-fe` → `dev` → `main`.
- `.omc/`, `.DS_Store`, `frontend/cc/` 메모 파일은 커밋에 포함하지 않는다.
