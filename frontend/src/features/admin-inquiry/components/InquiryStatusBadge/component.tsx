import React from 'react';
import type { InquiryStatus } from '../../types';
import { INQUIRY_STATUS_LABELS } from '../../types';

const STATUS_CLASS: Record<InquiryStatus, string> = {
  OPEN: 'bg-amber-50 text-amber-800 border-amber-200',
  ANSWERED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CLOSED: 'bg-gray-100 text-gray-600 border-gray-200',
};

interface InquiryStatusBadgeProps {
  status: InquiryStatus;
}

const InquiryStatusBadge: React.FC<InquiryStatusBadgeProps> = ({ status }) => (
  <span
    className={`inline-flex items-center px-2 py-0.5 text-xs font-medium border rounded ${STATUS_CLASS[status]}`}
  >
    {INQUIRY_STATUS_LABELS[status]}
  </span>
);

export default InquiryStatusBadge;
