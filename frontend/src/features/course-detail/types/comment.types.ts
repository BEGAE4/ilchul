export interface ReplyMention {
  userId: number;
  username: string;
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
}

export interface ParentReplyItem extends ReplyItem {
  replyCount: number;
  replies: ReplyItem[];
}

export interface GetRepliesResponse {
  status: 200;
  data: ParentReplyItem[];
  hasNext: boolean;
}

export interface PostCommentBody {
  content: string;
  parentReplyId?: number;
  mentions?: number[];
}

export interface PostCommentResponse {
  savedReplyId: number;
}

export interface LikeCommentResponse {
  status: 200;
  data: {
    replyId: number;
    likeCount: number;
    isLiked: boolean;
  };
}

export interface DeleteTarget {
  replyId: number;
  content: string;
  parentId: number | null;
}
