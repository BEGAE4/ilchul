import React from 'react';
import type { ReportStatus } from '@/features/report';

const STATUS_LABELS: Record<ReportStatus, string> = {
  PENDING: '대기',
  REVIEWING: '검토중',
  RESOLVED: '처리완료',
  REJECTED: '거절',
};

const STATUS_CLASS: Record<ReportStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-800 border-amber-200',
  REVIEWING: 'bg-blue-50 text-blue-700 border-blue-200',
  RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-gray-100 text-gray-600 border-gray-200',
};

interface ReportStatusBadgeProps {
  status: ReportStatus;
}

const ReportStatusBadge: React.FC<ReportStatusBadgeProps> = ({ status }) => (
  <span
    className={`inline-flex items-center px-2 py-0.5 text-xs font-medium border rounded ${STATUS_CLASS[status]}`}
  >
    {STATUS_LABELS[status]}
  </span>
);

export default ReportStatusBadge;
