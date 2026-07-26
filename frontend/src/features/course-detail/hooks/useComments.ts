import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import * as commentApi from '../api/comment.api';
import type { ReplyItem, DeleteTarget } from '../types/comment.types';

export function useComments(planId: string) {
  const [comments, setComments] = useState<ReplyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasNext, setHasNext] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyTarget, setReplyTarget] = useState<{
    replyId: number;
    username: string;
    userId: number;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  const loadComments = useCallback(
    async (lastReplyId = 0, append = false) => {
      try {
        if (append) setIsFetchingMore(true);
        else setIsLoading(true);
        const res = await commentApi.fetchComments(planId, lastReplyId);
        setComments((prev) => (append ? [...prev, ...res.replies] : res.replies));
        setHasNext(res.hasNext);
      } catch {
        toast.error('댓글을 불러오지 못했어요.');
      } finally {
        setIsLoading(false);
        setIsFetchingMore(false);
      }
    },
    [planId]
  );

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const fetchMore = useCallback(() => {
    if (!comments.length || isFetchingMore || !hasNext) return;
    const lastId = comments[comments.length - 1].replyId;
    loadComments(lastId, true);
  }, [comments, isFetchingMore, hasNext, loadComments]);

  const submitComment = useCallback(async () => {
    const content = commentText.trim();
    if (!content) return;
    try {
      const body = replyTarget
        ? { content, parentReplyId: replyTarget.replyId, mentions: [replyTarget.userId] }
        : { content };
      await commentApi.postComment(planId, body);
      setCommentText('');
      setReplyTarget(null);
      await loadComments();
      toast.success(replyTarget ? '답글이 등록되었어요!' : '댓글이 등록되었어요!');
    } catch {
      toast.error('댓글 작성에 실패했어요.');
    }
  }, [commentText, planId, replyTarget, loadComments]);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await commentApi.deleteComment(deleteTarget.replyId);
      if (deleteTarget.parentId === null) {
        setComments((prev) => prev.filter((c) => c.replyId !== deleteTarget.replyId));
      } else {
        setComments((prev) =>
          prev.map((c) =>
            c.replyId === deleteTarget.parentId
              ? {
                  ...c,
                  replies: {
                    ...c.replies,
                    replies: c.replies.replies.filter((r) => r.replyId !== deleteTarget.replyId),
                  },
                  replyCount: c.replyCount - 1,
                }
              : c
          )
        );
      }
      setDeleteTarget(null);
      toast.success('댓글이 삭제되었어요.');
    } catch {
      toast.error('댓글 삭제에 실패했어요.');
    }
  }, [deleteTarget]);

  const toggleLike = useCallback(
    async (replyId: number, isLiked: boolean, parentId: number | null) => {
      // 서버 응답(number)에는 likeCount/isLiked가 없으므로 로컬 토글로 계산한다.
      const newIsLiked = !isLiked;
      const delta = newIsLiked ? 1 : -1;
      try {
        if (isLiked) await commentApi.unlikeComment(replyId);
        else await commentApi.likeComment(replyId);

        if (parentId === null) {
          setComments((prev) =>
            prev.map((c) =>
              c.replyId === replyId
                ? { ...c, likeCount: c.likeCount + delta, isLiked: newIsLiked }
                : c
            )
          );
        } else {
          setComments((prev) =>
            prev.map((c) =>
              c.replyId === parentId
                ? {
                    ...c,
                    replies: {
                      ...c.replies,
                      replies: c.replies.replies.map((r) =>
                        r.replyId === replyId
                          ? { ...r, likeCount: r.likeCount + delta, isLiked: newIsLiked }
                          : r
                      ),
                    },
                  }
                : c
            )
          );
        }
      } catch {
        toast.error('좋아요 처리에 실패했어요.');
      }
    },
    []
  );

  const hideComment = useCallback((replyId: string) => {
    setComments((prev) => prev.filter((c) => String(c.replyId) !== replyId));
  }, []);

  return {
    comments,
    isLoading,
    hasNext,
    isFetchingMore,
    commentText,
    setCommentText,
    replyTarget,
    setReplyTarget,
    deleteTarget,
    setDeleteTarget,
    submitComment,
    confirmDelete,
    toggleCommentLike: toggleLike,
    hideComment,
    fetchMore,
  };
}
