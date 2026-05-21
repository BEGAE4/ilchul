'use client';

import React from 'react';
import { AlertOctagon, ExternalLink, FileText, MessageSquare, User } from 'lucide-react';
import { REASON_LABELS } from '@/features/report/types/report';
import type { ReportStatus, ReportTarget } from '@/features/report/types/report';
import ReportStatusBadge from '../ReportStatusBadge';
import type { AdminReportDetail, HistoryEntry } from '../../types';

interface ReportDetailPanelProps {
  detail: AdminReportDetail;
}

const STATUS_LABELS: Record<ReportStatus, string> = {
  PENDING: '대기',
  REVIEWING: '검토중',
  RESOLVED: '처리완료',
  REJECTED: '거절',
};

const RESOLUTION_LABELS: Record<NonNullable<AdminReportDetail['resolution']>, string> = {
  BLINDED: '블라인드 처리',
  WARNED: '경고',
  BANNED: '정지',
  NO_ACTION: '조치 없음',
};

function targetIcon(type: ReportTarget['type']) {
  if (type === 'course') return <FileText size={14} />;
  if (type === 'comment') return <MessageSquare size={14} />;
  return <User size={14} />;
}

const TARGET_TYPE_LABELS: Record<ReportTarget['type'], string> = {
  course: '코스',
  comment: '댓글',
  user: '사용자',
};

function targetTitle(target: ReportTarget): string {
  if (target.type === 'course') return target.title;
  if (target.type === 'comment') return target.snippet;
  return target.nickname;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('ko-KR');
}

function actorLabel(actor: string): string {
  if (actor === 'system') return '시스템';
  if (actor.startsWith('operator:')) return `운영자 ${actor.replace('operator:', '')}`;
  if (actor === 'reporter') return '신고자';
  return actor;
}

const Section: React.FC<{ title: string; action?: React.ReactNode; children: React.ReactNode }> = ({
  title,
  action,
  children,
}) => (
  <section className="border border-gray-200 bg-white rounded p-4">
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{title}</h3>
      {action}
    </div>
    {children}
  </section>
);

const HistoryItem: React.FC<{ entry: HistoryEntry; isLast: boolean }> = ({ entry, isLast }) => (
  <li className="flex gap-3">
    <div className="flex flex-col items-center">
      <span className="w-2 h-2 mt-1.5 rounded-full bg-gray-400" />
      {!isLast && <span className="flex-1 w-px bg-gray-200 my-1" />}
    </div>
    <div className="flex-1 pb-3">
      <div className="flex items-center gap-2">
        <ReportStatusBadge status={entry.status} />
        <span className="text-xs text-gray-500">{actorLabel(entry.actor)}</span>
      </div>
      <p className="mt-0.5 text-xs text-gray-500">{formatDateTime(entry.at)}</p>
      {entry.note && (
        <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{entry.note}</p>
      )}
    </div>
  </li>
);

const ReportDetailPanel: React.FC<ReportDetailPanelProps> = ({ detail }) => {
  return (
    <div className="space-y-3">
      {/* 헤더 */}
      <div className="flex items-center gap-2 flex-wrap">
        <ReportStatusBadge status={detail.status} />
        {detail.autoBlinded && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium border border-red-200 bg-red-50 text-red-700 rounded">
            <AlertOctagon size={12} />
            자동 블라인드
          </span>
        )}
        <span className="text-xs text-gray-500 tabular-nums ml-auto">#{detail.reportId}</span>
      </div>

      {/* 대상 정보 */}
      <Section
        title="신고 대상"
        action={
          <a
            href={detail.target.contextUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-blue-700 hover:text-blue-800"
          >
            원본 보기 <ExternalLink size={12} />
          </a>
        }
      >
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-500 text-xs">
            {targetIcon(detail.target.type)}
            <span>{TARGET_TYPE_LABELS[detail.target.type]}</span>
            <span>·</span>
            <span className="tabular-nums">{detail.target.id}</span>
          </div>
          <p className="text-gray-900 whitespace-pre-wrap">{targetTitle(detail.target)}</p>
          <p className="text-xs text-gray-500">작성자: {detail.target.ownerId}</p>
        </div>
      </Section>

      {/* 신고 사유 + 상세 */}
      <Section title="신고 사유">
        <p className="text-sm font-medium text-gray-900">
          {REASON_LABELS[detail.reasonCode]}
        </p>
        <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
          {detail.detail ?? <span className="text-gray-400">(상세 사유 없음)</span>}
        </p>
      </Section>

      {/* 신고자 */}
      <Section title="신고자">
        <p className="text-sm text-gray-900">
          {detail.reporterNickname}{' '}
          <span className="text-xs text-gray-500 tabular-nums">({detail.reporterId})</span>
        </p>
        <p className="mt-1 text-xs text-gray-500">
          접수 {formatDateTime(detail.createdAt)}
          {detail.assignedOperator && ` · 담당 ${detail.assignedOperator}`}
        </p>
      </Section>

      {/* 처리 결과 (해당될 때만) */}
      {detail.resolution && (
        <Section title="처리 결과">
          <p className="text-sm font-medium text-gray-900">
            {RESOLUTION_LABELS[detail.resolution]}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {STATUS_LABELS[detail.status]} · {formatDateTime(detail.updatedAt)}
          </p>
        </Section>
      )}

      {/* 처리 이력 */}
      <Section title="처리 이력">
        {detail.history.length === 0 ? (
          <p className="text-sm text-gray-400">이력이 없습니다.</p>
        ) : (
          <ol className="space-y-0">
            {detail.history.map((h, i) => (
              <HistoryItem
                key={`${h.status}-${h.at}-${i}`}
                entry={h}
                isLast={i === detail.history.length - 1}
              />
            ))}
          </ol>
        )}
      </Section>

      {/* 동일 대상 누적 신고 */}
      {detail.relatedReports.length > 0 && (
        <Section title={`동일 대상 누적 신고 ${detail.relatedReports.length}건`}>
          <ul className="space-y-1.5">
            {detail.relatedReports.map((r) => (
              <li key={r.reportId}>
                <a
                  href={`/admin/reports/${r.reportId}`}
                  className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-700 hover:underline"
                >
                  <span className="text-xs text-gray-500 tabular-nums shrink-0">{r.reportId}</span>
                  <span className="truncate">
                    {REASON_LABELS[r.reasonCode]} · {r.reporterNickname}
                  </span>
                  <span className="ml-auto text-xs text-gray-400 shrink-0">
                    {formatDateTime(r.createdAt)}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
};

export default ReportDetailPanel;
