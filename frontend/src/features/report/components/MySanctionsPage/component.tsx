'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PageLayout from '@/shared/ui/PageLayout';
import Header from '@/shared/ui/Header';
import { SanctionItem } from '../SanctionItem';
import type { Sanction } from '../../types';
import styles from './styles.module.scss';

const MOCK_SANCTIONS: Sanction[] = [
  {
    sanctionId: 's-201',
    type: 'CONTENT_BLINDED',
    target: {
      type: 'course',
      id: '27',
      title: '성수동 힙플레이스 완전 정복',
      contextUrl: '/course/27',
    },
    reasonCode: 'FAKE_INFO',
    message: '신고 다수 누적으로 해당 플랜이 블라인드 처리되었습니다.',
    issuedAt: '2026-05-16T14:00:00Z',
    expiresAt: null,
    isActive: true,
    relatedReportIds: ['r-1019', 'r-1023', 'r-1031'],
    appealStatus: 'NONE',
  },
  {
    sanctionId: 's-198',
    type: 'TEMP_BAN',
    target: {
      type: 'user',
      id: 'me',
      nickname: '김여행',
      contextUrl: '/profile/me',
    },
    reasonCode: 'ABUSE',
    message: '반복적인 욕설/비방으로 일시 정지되었습니다.',
    issuedAt: '2026-04-20T09:30:00Z',
    expiresAt: '2026-04-27T09:30:00Z',
    isActive: false,
    relatedReportIds: ['r-980', 'r-991'],
    appealStatus: 'RESOLVED',
  },
  {
    sanctionId: 's-190',
    type: 'WARNING',
    target: {
      type: 'comment',
      id: 'cm5',
      courseId: '27',
      snippet: '이 코스 따라갔는데 진짜 완벽했어요!',
      contextUrl: '/course/27#comment-cm5',
    },
    reasonCode: 'OBSCENE',
    message: '커뮤니티 이용 규칙 위반으로 경고 조치되었습니다.',
    issuedAt: '2026-03-10T08:00:00Z',
    expiresAt: null,
    isActive: false,
    relatedReportIds: ['r-870'],
    appealStatus: 'NONE',
  },
];

type FilterTab = 'all' | 'active' | 'expired';

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'active', label: '진행 중' },
  { key: 'expired', label: '종료' },
];

export function MySanctionsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const filtered = MOCK_SANCTIONS.filter((s) => {
    if (activeTab === 'active') return s.isActive;
    if (activeTab === 'expired') return !s.isActive;
    return true;
  });

  return (
    <PageLayout>
      <Header variant="backArrow" onBackClick={() => router.back()} />

      <div className={styles.content}>
        <h1 className={styles.pageTitle}>받은 제재</h1>

        {/* 필터 탭 */}
        <div className={styles.tabs} role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={activeTab === tab.key}
              className={`${styles.tab} ${activeTab === tab.key ? styles['tab--active'] : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 리스트 */}
        {filtered.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🛡️</span>
            <p className={styles.emptyText}>받은 제재가 없어요</p>
          </div>
        ) : (
          <div className={styles.list}>
            {filtered.map((sanction) => (
              <SanctionItem key={sanction.sanctionId} sanction={sanction} />
            ))}
          </div>
        )}

        <p className={styles.footerNote}>
          제재 내역은 계정 보호와 투명한 운영을 위해 제공됩니다.
          <br />
          이의제기 기능은 곧 제공될 예정이에요.
        </p>
      </div>
    </PageLayout>
  );
}
