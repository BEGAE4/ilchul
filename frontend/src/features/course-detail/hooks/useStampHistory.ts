import { useState, useEffect } from 'react';
import { StampHistory, fetchStampHistory } from '../api/course-detail.api';

export const useStampHistory = (courseId: string, activeTab: 'plan' | 'stamp') => {
  const [stampHistory, setStampHistory] = useState<StampHistory[]>([]);
  const [stampLoading, setStampLoading] = useState(false);

  useEffect(() => {
    const loadStampHistory = async () => {
      if (activeTab === 'stamp' && courseId) {
        try {
          setStampLoading(true);
          const history = await fetchStampHistory(courseId);
          setStampHistory(history);
        } catch (err) {
          console.error('스탬프 이력 로드 실패:', err);
        } finally {
          setStampLoading(false);
        }
      }
    };

    loadStampHistory();
  }, [activeTab, courseId]);

  return {
    stampHistory,
    stampLoading
  };
};

