'use client';

import React, { useState } from 'react';
import { Pencil, Trash2, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/shared/ui/admin';
import { useAnswerMutations } from '../../hooks';
import type { AdminInquiryDetail, InquiryAnswer } from '../../types';

interface AnswerListProps {
  inquiryId: string;
  answers: InquiryAnswer[];
  onChange: (next: AdminInquiryDetail) => void;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('ko-KR');
}

const AnswerList: React.FC<AnswerListProps> = ({ inquiryId, answers, onChange }) => {
  const { update, remove, isPending } = useAnswerMutations(inquiryId);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const startEdit = (answer: InquiryAnswer) => {
    setEditingId(answer.answerId);
    setEditBody(answer.body);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditBody('');
  };

  const saveEdit = async () => {
    if (!editingId || editBody.trim().length === 0) return;
    try {
      const next = await update(editingId, editBody.trim());
      onChange(next);
      toast.success('답변이 수정되었습니다.');
      cancelEdit();
    } catch {
      toast.error('답변 수정에 실패했습니다.');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const next = await remove(deleteTarget);
      onChange(next);
      toast.success('답변이 삭제되었습니다.');
      setDeleteTarget(null);
    } catch {
      toast.error('답변 삭제에 실패했습니다.');
    }
  };

  if (answers.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-gray-500">
        아직 등록된 답변이 없습니다.
      </div>
    );
  }

  return (
    <>
      <ul className="space-y-3">
        {answers.map((answer) => {
          const isEditing = editingId === answer.answerId;
          const wasEdited = answer.updatedAt !== answer.createdAt;
          return (
            <li
              key={answer.answerId}
              className="border border-gray-200 bg-white rounded p-3"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-900">
                  {answer.authorOperatorName}
                </span>
                <span className="text-xs text-gray-500 tabular-nums">
                  ({answer.authorOperatorId})
                </span>
                <span className="ml-auto text-xs text-gray-500">
                  {formatDateTime(answer.createdAt)}
                  {wasEdited && <span className="ml-1 text-gray-400">(수정됨)</span>}
                </span>
              </div>

              {isEditing ? (
                <div className="space-y-2">
                  <textarea
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    rows={4}
                    maxLength={5000}
                    className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 resize-y"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={cancelEdit}
                      disabled={isPending}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs border border-gray-200 bg-white text-gray-700 rounded hover:bg-gray-50 disabled:opacity-40"
                    >
                      <X size={12} /> 취소
                    </button>
                    <button
                      type="button"
                      onClick={saveEdit}
                      disabled={isPending || editBody.trim().length === 0}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-40"
                    >
                      <Check size={12} /> 저장
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {answer.body}
                  </p>
                  <div className="mt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(answer)}
                      disabled={isPending}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-900 disabled:opacity-40"
                    >
                      <Pencil size={12} /> 수정
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(answer.answerId)}
                      disabled={isPending}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:text-red-700 disabled:opacity-40"
                    >
                      <Trash2 size={12} /> 삭제
                    </button>
                  </div>
                </>
              )}
            </li>
          );
        })}
      </ul>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="답변을 삭제할까요?"
        description="삭제된 답변은 복구할 수 없으며, 사용자에게는 변경 사실이 통보되지 않습니다."
        confirmLabel="삭제"
        destructive
        isPending={isPending}
        onConfirm={confirmDelete}
      />
    </>
  );
};

export default AnswerList;
