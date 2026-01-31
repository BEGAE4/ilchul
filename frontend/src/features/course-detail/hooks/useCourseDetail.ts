import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CourseDetail, Activity, fetchCourseDetail } from '../api/course-detail.api';

export const useCourseDetail = (courseId: string) => {
  const router = useRouter();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'plan' | 'stamp'>('plan');

  useEffect(() => {
    const loadCourseDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const courseData = await fetchCourseDetail(courseId);
        setCourse(courseData);
      } catch (err) {
        setError(err instanceof Error ? err.message : '코스 정보를 불러오는데 실패했습니다.');
        console.error('코스 상세 정보 로드 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      loadCourseDetail();
    }
  }, [courseId]);

  const handleTabChange = (tab: 'plan' | 'stamp') => {
    setActiveTab(tab);
  };

  const handleEditOrder = () => {
    // TODO: 순서 수정 기능 구현
    console.log('순서 수정');
  };

  const handleActivityClick = (activity: Activity) => {
    // TODO: 활동 상세 보기 기능 구현
    console.log('활동 클릭:', activity);
  };

  const handleBack = () => {
    router.back();
  };

  const handleShare = () => {
    // TODO: 공유 기능 구현
    console.log('공유하기');
  };

  const handleImage = () => {
    // TODO: 이미지 기능 구현
    console.log('이미지');
  };

  return {
    course,
    loading,
    error,
    activeTab,
    handleTabChange,
    handleEditOrder,
    handleActivityClick,
    handleBack,
    handleShare,
    handleImage,
  };
};
