# 댓글 API 연동 구현 결과 (v3 CMT-52~57, 59)

> 기준 명세: `cc/api/v3/260623-v3-001-comment.md`

## 생성/수정 파일

| 파일 | 상태 | 설명 |
|------|------|------|
| `src/features/course-detail/types/comment.types.ts` | 신규 | API 응답 타입 (ParentReplyItem, ReplyItem 등) |
| `src/features/course-detail/api/comment.api.ts` | 신규 | 댓글 API 함수 6종 |
| `src/features/course-detail/hooks/useComments.ts` | 신규 | 댓글 상태 관리 훅 |
| `src/features/course-detail/components/CourseViewPage.tsx` | 수정 | mock → 실 API 연결 |

## 구현 내용

### API 함수 (`comment.api.ts`)
- `fetchComments(planId, lastReplyId, size?)` — CMT-55 커서 페이지네이션
- `postComment(planId, body)` — CMT-52 댓글/대댓글 작성 (parentReplyId 포함)
- `deleteComment(replyId)` — CMT-54
- `likeComment(replyId)` — CMT-56
- `unlikeComment(replyId)` — CMT-57
- `fetchChildReplies(parentReplyId, lastReplyId, size?)` — CMT-59 (추가 로드용, 현재 미사용)

### useComments 훅
- 초기 로드 (`loadComments`) + 커서 기반 더보기 (`fetchMore`)
- 답글 모드: `replyTarget` 상태로 parentReplyId 전달
- 낙관적 업데이트 없이 서버 응답 기반 상태 갱신 (delete/like)
- `toggleCommentLike` — 부모/대댓글 모두 처리 (parentId 파라미터로 구분)
- `hideComment(id)` — 신고 후 즉시 숨기기 지원

### CourseViewPage 변경
- `MOCK_COMMENTS` 제거, `useComments(courseId)` 훅으로 교체
- 댓글 로딩 스켈레톤 추가
- 부모 댓글 아래 대댓글 인덴트 표시 (`replies[]`)
- 답글 모드 UI: 타겟 배너 + textarea placeholder 변경
- "댓글 더 보기" 버튼 (`hasNext` 기반)
- 삭제 확인 모달: `Comment` → `DeleteTarget` 타입으로 교체

## 미구현 (명세 범위 외)
- CMT-53 댓글 수정 (현재 UI에 진입점 없음 — 명세 주석과 동일)
- 대댓글 추가 로드 (CMT-59): fetchChildReplies 함수는 준비됨, UI 트리거 미구현
- `@멘션` 자동완성 UI
