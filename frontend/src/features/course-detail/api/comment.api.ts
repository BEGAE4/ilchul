import apiClient from '@/shared/lib/api/apiClient';
import type { ReplyListResponse, PostCommentBody } from '../types/comment.types';

export async function fetchComments(
  planId: string,
  lastReplyId = 0,
  size?: number
): Promise<ReplyListResponse> {
  const params: Record<string, string | number> = { lastReplyId };
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
  lastReplyId = 0,
  size?: number
): Promise<ReplyListResponse> {
  const params: Record<string, string | number> = { lastReplyId };
  if (size !== undefined) params.size = size;
  const { data } = await apiClient.get<ReplyListResponse>(`/api/reply/${parentReplyId}/children`, {
    params,
  });
  return data;
}
