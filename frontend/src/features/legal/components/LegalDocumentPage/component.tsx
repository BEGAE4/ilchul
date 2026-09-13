'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { SERVICE_ROUTES } from '@/shared/lib/constants/service';
import type { LegalBlock, LegalDocument } from '../../types/legalDocument';

interface LegalDocumentPageProps {
  document: LegalDocument;
}

const LegalBlockView = ({ block }: { block: LegalBlock }) => {
  if (block.type === 'paragraph') {
    return <p className="text-[13px] text-gray-700 leading-relaxed">{block.text}</p>;
  }

  if (block.type === 'list') {
    const ListTag = block.ordered ? 'ol' : 'ul';
    return (
      <ListTag
        className={`${block.ordered ? 'list-decimal' : 'list-disc'} pl-5 space-y-1.5 text-[13px] text-gray-700 leading-relaxed`}
      >
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ListTag>
    );
  }

  return (
    <div className="overflow-x-auto -mx-1 px-1">
      {/* break-keep: 좁은 첫 열에서 "회원가/입·로그/인"처럼 단어 중간이 끊기지 않게 한다 */}
      <table className="w-full min-w-[320px] border-collapse text-[12px] text-gray-700 break-keep">
        <thead>
          <tr>
            {block.headers.map((header) => (
              <th
                key={header}
                scope="col"
                className="border border-gray-200 bg-gray-50 px-2.5 py-2 text-left font-bold text-gray-900"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row) => (
            <tr key={row.join('|')}>
              {row.map((cell, i) => (
                <td key={i} className="border border-gray-200 px-2.5 py-2 align-top leading-relaxed">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// 로그인 화면·카카오 동의 화면 등에서 새 탭이나 직접 주소로 들어오면 돌아갈 기록이 없어 홈으로 보낸다.
export const LegalDocumentPage = ({ document }: LegalDocumentPageProps) => {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/');
  };

  return (
    <div className="flex flex-col min-h-dvh bg-white">
      <div className="bg-white sticky top-0 z-10 border-b border-gray-100">
        <div className="flex items-center p-4">
          <button
            type="button"
            onClick={handleBack}
            aria-label="뒤로가기"
            className="p-2 -ml-2 text-gray-700 rounded-full active:bg-gray-100"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="font-bold text-lg ml-2">{document.title}</h1>
        </div>
      </div>

      <article className="flex-1 px-5 py-6">
        <p className="text-xs text-gray-400 mb-4">시행일: {document.effectiveDate}</p>
        {document.intro && (
          <p className="text-[13px] text-gray-700 leading-relaxed mb-6">{document.intro}</p>
        )}
        <div className="space-y-7">
          {document.sections.map((section) => (
            <section key={section.title} className="space-y-2.5">
              <h2 className="text-[15px] font-bold text-gray-900">{section.title}</h2>
              {section.blocks.map((block, i) => (
                <LegalBlockView key={i} block={block} />
              ))}
            </section>
          ))}
        </div>

        <nav
          aria-label="다른 정책 문서"
          className="mt-10 pt-5 border-t border-gray-100 flex gap-4 text-xs text-gray-400"
        >
          <Link href={SERVICE_ROUTES.terms} className="hover:text-gray-600">
            이용약관
          </Link>
          <Link href={SERVICE_ROUTES.privacy} className="font-bold hover:text-gray-600">
            개인정보처리방침
          </Link>
        </nav>
      </article>
    </div>
  );
};
