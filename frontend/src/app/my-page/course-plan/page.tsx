'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import PageLayout from '@/shared/ui/PageLayout';
import Header from '@/shared/ui/Header';
import IconBox from '@/shared/ui/IconBox';
import styles from './course-plan.module.scss';

// 플랜 데이터 타입 정의
interface PlanData {
  id: string;
  title: string;
  createdAt: string;
  performedAt: string;
  imageUrl: string;
}

// 목업 데이터
const mockPlans: PlanData[] = [
  {
    id: '1',
    title: '워킹 테라피',
    createdAt: '2025.07.24',
    performedAt: '2025.07.25',
    imageUrl: '/images/course-plan.png',
  },
  {
    id: '2',
    title: '워킹 테라피',
    createdAt: '2025.07.24',
    performedAt: '2025.07.25',
    imageUrl: '/images/course-plan.png',
  },
  {
    id: '3',
    title: '워킹 테라피',
    createdAt: '2025.07.24',
    performedAt: '2025.07.25',
    imageUrl: '/images/course-plan.png',
  },
];

const CoursePlanPage: React.FC = () => {
  const router = useRouter();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [showEditNameModal, setShowEditNameModal] = useState<boolean>(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>('');
  const [isPublic, setIsPublic] = useState<boolean>(true);

  const handlePlanClick = (planId: string) => {
    // 모달이 열려있으면 카드 클릭 무시
    if (selectedPlanId) return;
    // 플랜 상세 페이지로 이동
    console.log('플랜 클릭:', planId);
  };

  const handleMoreClick = (planId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedPlanId(planId);
  };

  const handleModalClose = () => {
    setSelectedPlanId(null);
  };

  const handleModalAction = (action: string, planId: string) => {
    setSelectedPlanId(null);

    if (action === '이름 수정') {
      const plan = mockPlans.find(p => p.id === planId);
      setEditName(plan?.title || '');
      setShowEditNameModal(true);
    } else if (action === '공개/비공개') {
      setShowPrivacyModal(true);
    } else if (action === '삭제') {
      console.log('삭제 클릭:', planId);
    }
  };

  const handleEditNameSubmit = () => {
    console.log('이름 수정:', editName);
    setShowEditNameModal(false);
    setEditName('');
  };

  const handlePrivacyToggle = () => {
    setIsPublic(!isPublic);
  };

  const handlePrivacyClose = () => {
    console.log('공개/비공개 설정:', isPublic);
    setShowPrivacyModal(false);
  };

  return (
    <PageLayout>
      <Header
        variant="backArrow"
        onBackClick={() => router.back()}
      />

      <div className={styles.content}>
        <h1 className={styles.pageTitle}>나의 플랜 리스트</h1>
        <div className={styles.planList}>
          {mockPlans.map(plan => (
            <div
              key={plan.id}
              className={styles.planCard}
              onClick={() => handlePlanClick(plan.id)}
            >
              <div className={styles.cardImage}>
                <Image
                  src={plan.imageUrl}
                  alt={plan.title}
                  fill
                  style={{ objectFit: 'cover' }}
                />
                <div className={styles.cardOverlay}>
                  <div className={styles.planInfo}>
                    <h3 className={styles.planTitle}>{plan.title}</h3>
                    <p className={styles.planDate}>생성일 {plan.createdAt}</p>
                    <p className={styles.planDate}>
                      진행한 날짜 {plan.performedAt}
                    </p>
                  </div>
                </div>
              </div>
              <button
                className={styles.moreButton}
                onClick={e => handleMoreClick(plan.id, e)}
                aria-label="더보기"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="6" r="2" fill="currentColor" />
                  <circle cx="12" cy="12" r="2" fill="currentColor" />
                  <circle cx="12" cy="18" r="2" fill="currentColor" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 메인 모달 */}
      {selectedPlanId && (
        <div className={styles.modalOverlay} onClick={handleModalClose}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <button
              className={styles.modalOption}
              onClick={() => handleModalAction('이름 수정', selectedPlanId)}
            >
              이름 수정
            </button>
            <button
              className={styles.modalOption}
              onClick={() => handleModalAction('공개/비공개', selectedPlanId)}
            >
              공개/비공개
            </button>
            <button
              className={styles.modalOptionDelete}
              onClick={() => handleModalAction('삭제', selectedPlanId)}
            >
              삭제
            </button>
          </div>
        </div>
      )}

      {/* 이름 수정 모달 */}
      {showEditNameModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowEditNameModal(false)}
        >
          <div className={styles.editModal} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>이름 수정</h3>
            <input
              type="text"
              value={editName}
              onChange={e => setEditName(e.target.value)}
              className={styles.nameInput}
              placeholder="플랜 이름을 입력하세요"
            />
            <button
              className={styles.closeButton}
              onClick={handleEditNameSubmit}
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* 공개/비공개 모달 */}
      {showPrivacyModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowPrivacyModal(false)}
        >
          <div
            className={styles.privacyModal}
            onClick={e => e.stopPropagation()}
          >
            <h3 className={styles.modalTitle}>플랜 공개/비공개 여부</h3>
            <div className={styles.toggleContainer}>
              <div className={styles.toggleSwitch}>
                <input
                  type="checkbox"
                  id="privacyToggle"
                  checked={isPublic}
                  onChange={handlePrivacyToggle}
                  className={styles.toggleInput}
                />
                <label htmlFor="privacyToggle" className={styles.toggleLabel}>
                  <span className={styles.toggleSlider}></span>
                </label>
              </div>
              <span className={styles.toggleText}>
                {isPublic ? '공개' : '비공개'}
              </span>
            </div>
            <p className={styles.privacyInfo}>
              ① 공개할 경우, 다른 사용자에게 플랜이 노출됩니다.
            </p>
            <button className={styles.closeButton} onClick={handlePrivacyClose}>
              닫기
            </button>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default CoursePlanPage;
