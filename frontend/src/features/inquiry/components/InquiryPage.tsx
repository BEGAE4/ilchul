'use client';

import React, { useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/shared/lib/stores/useUserStore';
import type { InquiryDetail, InquirySection } from '../types/inquiry.types';
import { InquiryListSection } from './InquiryListSection';
import { InquiryDetailSection } from './InquiryDetailSection';
import { InquiryFormSection } from './InquiryFormSection';
import { AdminInquiryListSection } from './AdminInquiryListSection';
import { AdminAnswerFormSection } from './AdminAnswerFormSection';

export const InquiryPage = () => {
  const router = useRouter();
  const { user } = useUserStore();
  const isAdmin = user.isAdmin ?? false;

  const defaultSection: InquirySection = isAdmin ? 'adminList' : 'list';
  const [section, setSection] = useState<InquirySection>(defaultSection);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editTarget, setEditTarget] = useState<InquiryDetail | null>(null);
  const prevSection = useRef<InquirySection>(defaultSection);

  const navigate = (next: InquirySection) => {
    prevSection.current = section;
    setSection(next);
  };

  const goBack = () => {
    const isRoot = section === 'list' || section === 'adminList';
    if (isRoot) {
      router.back();
    } else {
      setSection(prevSection.current);
    }
  };

  const headerTitle = () => {
    switch (section) {
      case 'list': return '고객센터 / 문의';
      case 'adminList': return '전체 문의 관리';
      default: return null;
    }
  };

  const title = headerTitle();

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {title !== null && (
        <div className="bg-white sticky top-0 z-10 border-b border-gray-100">
          <div className="flex items-center p-4">
            <button
              onClick={goBack}
              className="p-2 -ml-2 text-gray-700 rounded-full active:bg-gray-100"
            >
              <ArrowLeft size={24} />
            </button>
            <span className="font-bold text-lg ml-2">{title}</span>
            {isAdmin && section === 'list' && (
              <button
                onClick={() => navigate('adminList')}
                className="ml-auto text-xs text-sky-500 font-semibold px-3 py-1.5 rounded-full bg-sky-50 active:bg-sky-100"
              >
                전체 보기
              </button>
            )}
          </div>
        </div>
      )}

      {section === 'list' && (
        <InquiryListSection
          onSelectInquiry={(id) => {
            setSelectedId(id);
            navigate('detail');
          }}
          onCreateNew={() => navigate('create')}
        />
      )}

      {section === 'adminList' && (
        <AdminInquiryListSection
          onSelectInquiry={(id) => {
            setSelectedId(id);
            navigate('detail');
          }}
          onAnswerInquiry={(id) => {
            setSelectedId(id);
            navigate('adminAnswer');
          }}
        />
      )}

      {section === 'detail' && selectedId !== null && (
        <InquiryDetailSection
          inquiryId={selectedId}
          isAdmin={isAdmin}
          onBack={goBack}
          onEdit={(inquiry) => {
            setEditTarget(inquiry);
            navigate('edit');
          }}
          onDeleted={() => {
            setSection(prevSection.current);
          }}
        />
      )}

      {section === 'create' && (
        <InquiryFormSection
          mode="create"
          onSuccess={() => {
            setSection('list');
          }}
          onCancel={goBack}
        />
      )}

      {section === 'edit' && editTarget && (
        <InquiryFormSection
          mode="edit"
          existingInquiry={editTarget}
          onSuccess={() => {
            setSection('list');
          }}
          onCancel={goBack}
        />
      )}

      {section === 'adminAnswer' && selectedId !== null && (
        <AdminAnswerFormSection
          inquiryId={selectedId}
          onSuccess={() => {
            setSection('adminList');
          }}
          onCancel={goBack}
        />
      )}
    </div>
  );
};
