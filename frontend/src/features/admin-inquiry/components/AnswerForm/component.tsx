'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { useAnswerMutations } from '../../hooks';
import type { AdminInquiryDetail } from '../../types';

interface AnswerFormProps {
  inquiryId: string;
  onCreated: (next: AdminInquiryDetail) => void;
}

const AnswerForm: React.FC<AnswerFormProps> = ({ inquiryId, onCreated }) => {
  const { create, isPending } = useAnswerMutations(inquiryId);
  const [body, setBody] = useState('');
  const [closeAfter, setCloseAfter] = useState(false);

  const canSubmit = !isPending && body.trim().length > 0;

  const handleSubmit = async () => {
    try {
      const next = await create(body.trim(), closeAfter);
      onCreated(next);
      toast.success('답변이 등록되었습니다.');
      setBody('');
      setCloseAfter(false);
    } catch {
      toast.error('답변 등록에 실패했습니다.');
    }
  };

  return (
    <div className="border border-gray-200 bg-white rounded p-4 space-y-3">
      <h3 className="text-sm font-semibold text-gray-900">답변 등록</h3>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={5}
        maxLength={5000}
        placeholder="사용자에게 전달될 답변을 작성하세요."
        className="w-full text-sm border border-gray-200 bg-white rounded px-2 py-1.5 text-gray-900 placeholder:text-gray-400 resize-y"
      />
      <div className="flex items-center justify-between text-xs">
        <label className="inline-flex items-center gap-1.5 text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={closeAfter}
            onChange={(e) => setCloseAfter(e.target.checked)}
            className="accent-blue-600"
          />
          이 답변으로 문의 마감
        </label>
        <span className="tabular-nums text-gray-500">{body.length}/5000</span>
      </div>
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="w-full px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isPending ? '등록 중...' : '답변 등록'}
      </button>
    </div>
  );
};

export default AnswerForm;
