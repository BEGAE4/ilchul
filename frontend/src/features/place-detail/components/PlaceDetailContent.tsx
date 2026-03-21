'use client';

import React from 'react';
import IconBox from '@/shared/ui/IconBox';
import { PlaceDetail, PlaceDetailTab } from '../types';
import styles from './PlaceDetailPage.module.scss';

interface PlaceDetailContentProps {
  place: PlaceDetail;
  activeTab: PlaceDetailTab;
  onTabChange: (tab: PlaceDetailTab) => void;
}

export const PlaceDetailContent: React.FC<PlaceDetailContentProps> = ({
  place,
  activeTab,
  onTabChange,
}) => {
  const tabs: { id: PlaceDetailTab; label: string }[] = [
    { id: 'dailylog', label: '데이로그' },
    { id: 'info', label: '정보' },
    { id: 'nearby', label: '주변' },
    { id: 'curation', label: '큐레이션' },
  ];

  return (
    <div className={styles.contentWrapper}>
      {/* 탭 메뉴 */}
      <div className={styles.tabMenu}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 탭별 콘텐츠 */}
      <div className={styles.tabContent}>
        {activeTab === 'dailylog' && (
          <div className={styles.dailylogContent}>
            <p>데이로그 콘텐츠가 표시됩니다.</p>
          </div>
        )}

        {activeTab === 'info' && (
          <div className={styles.infoContent}>
            {/* 정보 세부사항 */}
            <div className={styles.infoDetails}>
              {/* 주소 */}
              <div className={styles.infoItem}>
                <IconBox name="map" size={20} color="#6b7280" />
                <div className={styles.infoItemContent}>
                  <div className={styles.addressRow}>
                    <span>{place.location.address}</span>
                    <button className={styles.copyButton}>복사</button>
                  </div>
                </div>
              </div>

              {/* 운영시간 */}
              <div className={styles.infoItem}>
                <div className={styles.iconPlaceholder}>🕐</div>
                <div className={styles.infoItemContent}>
                  <div className={styles.operatingHours}>
                    {Object.entries(place.operatingHours).map(([day, hours]) => (
                      <div key={day} className={styles.hoursRow}>
                        <span className={styles.dayLabel}>
                          {day === 'monday' && '월'}
                          {day === 'tuesday' && '화'}
                          {day === 'wednesday' && '수'}
                          {day === 'thursday' && '목'}
                          {day === 'friday' && '금'}
                          {day === 'saturday' && '토'}
                          {day === 'sunday' && '일'}
                        </span>
                        <span>{hours}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 전화번호 */}
              <div className={styles.infoItem}>
                <div className={styles.iconPlaceholder}>📞</div>
                <div className={styles.infoItemContent}>
                  <span>{place.phone}</span>
                </div>
              </div>
            </div>

            {/* 해시태그 */}
            <div className={styles.hashtags}>
              {place.hashtags.map((tag, index) => (
                <span key={index} className={styles.hashtag}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'nearby' && (
          <div className={styles.nearbyContent}>
            <p>주변 장소 콘텐츠가 표시됩니다.</p>
          </div>
        )}

        {activeTab === 'curation' && (
          <div className={styles.curationContent}>
            <p>큐레이션 콘텐츠가 표시됩니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};
