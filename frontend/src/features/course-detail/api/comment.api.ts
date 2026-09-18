import apiClient from '@/shared/lib/api/apiClient';
import type { ReplyListResponse, PostCommentBody } from '../types/comment.types';

// 서버 커서 조건은 `(:lastId IS NULL OR replyId < :lastId)` 다.
// 첫 페이지에 lastReplyId=0 을 보내면 `replyId < 0` 이 되어 항상 빈 목록이 돌아오므로,
// 커서가 없을 때는 파라미터 자체를 생략한다.
export async function fetchComments(
  planId: string,
  lastReplyId?: number,
  size?: number
): Promise<ReplyListResponse> {
  const params: Record<string, string | number> = {};
  if (lastReplyId !== undefined && lastReplyId > 0) params.lastReplyId = lastReplyId;
  if (size !== undefined) params.size = size;
  const { data } = await apiClient.get<ReplyListResponse>(`/api/reply/${planId}`, { params });
  return data;
}

export async function postComment(planId: string, body: PostCommentBody): Promise<number> {
  const { data } = await apiClient.post<number>(`/api/reply/${planId}`, body);
  return data;
}

export async function deleteComment(replyId: number): Promise<void> {
  await apiClient.delete(`/api/reply/${replyId}`);
}

export async function likeComment(replyId: number): Promise<number> {
  const { data } = await apiClient.post<number>(`/api/reply/like/${replyId}`);
  return data;
}

export async function unlikeComment(replyId: number): Promise<number> {
  const { data } = await apiClient.delete<number>(`/api/reply/like/${replyId}`);
  return data;
}

export async function fetchChildReplies(
  parentReplyId: number,
  lastReplyId?: number,
  size?: number
): Promise<ReplyListResponse> {
  const params: Record<string, string | number> = {};
  if (lastReplyId !== undefined && lastReplyId > 0) params.lastReplyId = lastReplyId;
  if (size !== undefined) params.size = size;
  const { data } = await apiClient.get<ReplyListResponse>(`/api/reply/${parentReplyId}/children`, {
    params,
  });
  return data;
}
