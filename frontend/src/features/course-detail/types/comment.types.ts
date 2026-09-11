// 댓글 API 타입 — 기준 명세: cc/api/v6/260723-v6-006-comment.md (swagger api-docs.json 대조)
// 응답은 wrapper 없이 raw 반환: 목록 → ReplyListResponse, 작성/수정/삭제/좋아요 → number

export interface ReplyMention {
  userId: number;
  userNickname: string;
}

export interface ReplyListResponse {
  replies: ReplyItem[];
  hasNext: boolean;
}

export interface ReplyItem {
  replyId: number;
  parentReplyId: number | null;
  user: string;
  userId: number;
  avatar: string;
  content: string;
  mentions: ReplyMention[];
  createdAt: string;
  likeCount: number;
  isLiked: boolean;
  replyCount: number;
  isDeleted: boolean;
  replies: ReplyListResponse;
}

/** @deprecated 명세상 부모/대댓글 구분 없이 ReplyItem 단일 타입. 하위 호환용 alias. */
export type ParentReplyItem = ReplyItem;

export interface PostCommentBody {
  content: string;
  parentReplyId?: number;
  mentions?: number[];
}

export interface DeleteTarget {
  replyId: number;
  content: string;
  parentId: number | null;
}
