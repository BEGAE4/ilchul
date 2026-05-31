'use client';

import React from 'react';
import { Paperclip, User } from 'lucide-react';
import InquiryStatusBadge from '../InquiryStatusBadge';
import type { AdminInquiryDetail } from '../../types';
import { INQUIRY_CATEGORY_LABELS } from '../../types';

interface InquiryDetailPanelProps {
  detail: AdminInquiryDetail;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('ko-KR');
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="border border-gray-200 bg-white rounded p-4">
    <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">{title}</h3>
    {children}
  </section>
);

const InquiryDetailPanel: React.FC<InquiryDetailPanelProps> = ({ detail }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <InquiryStatusBadge status={detail.status} />
        <span className="text-xs text-gray-700">
          {INQUIRY_CATEGORY_LABELS[detail.category]}
        </span>
        <span className="text-xs text-gray-500 tabular-nums ml-auto">#{detail.inquiryId}</span>
      </div>

      <Section title="작성자">
        <div className="flex items-center gap-2 text-sm text-gray-900">
          <User size={14} className="text-gray-500" />
          <span>{detail.author.nickname}</span>
          <span className="text-xs text-gray-500 tabular-nums">({detail.author.userId})</span>
        </div>
        {detail.author.email && (
          <p className="mt-1 text-xs text-gray-500">{detail.author.email}</p>
        )}
        <p className="mt-2 text-xs text-gray-500">
          접수 {formatDateTime(detail.createdAt)}
          {detail.assignedOperator && ` · 담당 ${detail.assignedOperator}`}
        </p>
      </Section>

      <Section title="제목">
        <h2 className="text-base font-medium text-gray-900">{detail.title}</h2>
      </Section>

      <Section title="본문">
        <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
          {detail.body}
        </p>
      </Section>

      {detail.attachments.length > 0 && (
        <Section title={`첨부파일 ${detail.attachments.length}개`}>
          <ul className="space-y-1">
            {detail.attachments.map((att) => (
              <li key={att.id}>
                <a
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-blue-700 hover:text-blue-800 hover:underline"
                >
                  <Paperclip size={12} />
                  {att.name}
                </a>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
};

export default InquiryDetailPanel;
