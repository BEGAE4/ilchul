import apiClient from '@/shared/lib/api/apiClient';
import type {
  GetRepliesResponse,
  PostCommentBody,
  PostCommentResponse,
  LikeCommentResponse,
} from '../types/comment.types';

export async function fetchComments(
  planId: string,
  lastReplyId = 0,
  size?: number
): Promise<GetRepliesResponse> {
  const params: Record<string, string | number> = { lastReplyId };
  if (size !== undefined) params.size = size;
  const { data } = await apiClient.get<GetRepliesResponse>(`/api/reply/${planId}`, { params });
  return data;
}

export async function postComment(
  planId: string,
  body: PostCommentBody
): Promise<PostCommentResponse> {
  const { data } = await apiClient.post<PostCommentResponse>(`/api/reply/${planId}`, body);
  return data;
}

export async function deleteComment(replyId: number): Promise<void> {
  await apiClient.delete(`/api/reply/${replyId}`);
}

export async function likeComment(replyId: number): Promise<LikeCommentResponse> {
  const { data } = await apiClient.post<LikeCommentResponse>(`/api/reply/like/${replyId}`);
  return data;
}

export async function unlikeComment(replyId: number): Promise<LikeCommentResponse> {
  const { data } = await apiClient.delete<LikeCommentResponse>(`/api/reply/like/${replyId}`);
  return data;
}

export async function fetchChildReplies(
  parentReplyId: number,
  lastReplyId = 0,
  size?: number
): Promise<GetRepliesResponse> {
  const params: Record<string, string | number> = { lastReplyId };
  if (size !== undefined) params.size = size;
  const { data } = await apiClient.get<GetRepliesResponse>(
    `/api/reply/${parentReplyId}/children`,
    { params }
  );
  return data;
}
