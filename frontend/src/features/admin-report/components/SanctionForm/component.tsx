'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/shared/ui/admin';
import { useIssueSanction } from '../../hooks';
import type {
  AdminReportDetail,
  IssueSanctionPayload,
  ReportResolution,
  SanctionType,
} from '../../types';

interface SanctionFormProps {
  reportId: string;
  targetType: AdminReportDetail['target']['type'];
  onIssued: (next: AdminReportDetail) => void;
}

const TYPE_LABELS: Record<SanctionType, string> = {
  WARNING: '경고',
  CONTENT_BLINDED: '콘텐츠 블라인드',
  TEMP_BAN: '일시 정지',
  PERMANENT_BAN: '영구 정지',
};

const TYPE_DESC: Record<SanctionType, string> = {
  WARNING: '행동 변화 권고. 콘텐츠 제재 없음.',
  CONTENT_BLINDED: '해당 콘텐츠를 모든 사용자에게 가립니다.',
  TEMP_BAN: '계정 일부 기능을 일정 기간 제한합니다.',
  PERMANENT_BAN: '계정을 영구 정지합니다.',
};

const TYPE_TO_RESOLUTION: Record<SanctionType, ReportResolution> = {
  WARNING: 'WARNED',
  CONTENT_BLINDED: 'BLINDED',
  TEMP_BAN: 'BANNED',
  PERMANENT_BAN: 'BANNED',
};

const DURATION_OPTIONS = [7, 14, 21, 28, 35];

const SanctionForm: React.FC<SanctionFormProps> = ({ reportId, targetType, onIssued }) => {
  // 사용자 신고는 콘텐츠 블라인드가 의미 없으므로 디폴트를 WARNING.
  // 코스/댓글은 CONTENT_BLINDED가 가장 흔한 처분.
  const defaultType: SanctionType = targetType === 'user' ? 'WARNING' : 'CONTENT_BLINDED';

  const [type, setType] = useState<SanctionType>(defaultType);
  const [durationDays, setDurationDays] = useState<number>(7);
  const [message, setMessage] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { issue, isSubmitting } = useIssueSanction();

  const canOpenConfirm = !isSubmitting && message.trim().length > 0;

  const handleSubmit = async () => {
    const payload: IssueSanctionPayload = {
      reportId,
      type,
      durationDays: type === 'TEMP_BAN' ? durationDays : undefined,
      message: message.trim(),
      resolution: TYPE_TO_RESOLUTION[type],
    };
    try {
      const res = await issue(payload);
      toast.success('처분이 발급되었습니다.');
      setConfirmOpen(false);
      setMessage('');
      onIssued(res.report);
    } catch {
      toast.error('처분 발급에 실패했습니다.');
    }
  };

  return (
    <>
      <div className="space-y-4 border border-gray-200 bg-white rounded p-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">유저 처리</h3>
          <p className="mt-0.5 text-xs text-gray-500">
            처분은 즉시 사용자에게 적용됩니다.
          </p>
        </div>

        <fieldset>
          <legend className="text-xs font-medium text-gray-700 mb-2">처분 유형</legend>
          <div className="space-y-1.5">
            {(['WARNING', 'CONTENT_BLINDED', 'TEMP_BAN', 'PERMANENT_BAN'] as SanctionType[]).map((t) => (
              <label
                key={t}
                className={`flex gap-2.5 p-2.5 border rounded cursor-pointer transition-colors ${
                  type === t
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="sanction-type"
                  value={t}
                  checked={type === t}
                  onChange={() => setType(t)}
                  className="mt-0.5 accent-blue-600"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900">{TYPE_LABELS[t]}</p>
                  <p className="text-xs text-gray-600">{TYPE_DESC[t]}</p>
                </div>
              </label>
            ))}
          </div>
        </fieldset>

        {type === 'TEMP_BAN' && (
          <div>
            <label htmlFor="sanction-duration" className="block text-xs font-medium text-gray-700 mb-1">
              정지 기간
            </label>
            <select
              id="sanction-duration"
              value={durationDays}
              onChange={(e) => setDurationDays(Number(e.target.value))}
              className="w-full text-sm border border-gray-200 bg-white rounded px-2 py-1.5 text-gray-700"
            >
              {DURATION_OPTIONS.map((d) => (
                <option key={d} value={d}>{d}일</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label htmlFor="sanction-message" className="block text-xs font-medium text-gray-700 mb-1">
            사용자 노출 메시지 <span className="text-red-600">*</span>
          </label>
          <textarea
            id="sanction-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="사용자에게 노출될 처분 사유를 입력하세요."
            className="w-full text-sm border border-gray-200 bg-white rounded px-2 py-1.5 text-gray-900 placeholder:text-gray-400 resize-y"
          />
          <p className="mt-1 text-xs text-gray-500 text-right tabular-nums">
            {message.length}/500
          </p>
        </div>

        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          disabled={!canOpenConfirm}
          className="w-full px-3 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded disabled:opacity-40 disabled:cursor-not-allowed"
        >
          처분 발급
        </button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`${TYPE_LABELS[type]}을(를) 발급할까요?`}
        description="이 처분은 즉시 사용자에게 적용되며 처리 이력에 기록됩니다."
        confirmLabel="처분 발급"
        destructive
        isPending={isSubmitting}
        onConfirm={handleSubmit}
      />
    </>
  );
};

export default SanctionForm;
