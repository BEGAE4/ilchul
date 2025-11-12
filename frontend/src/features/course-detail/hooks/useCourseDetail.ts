import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CourseDetail } from '../api/course-detail.api';
import { fetchCourseDetail } from '../api/course-detail.api';

export const useCourseDetail = (courseId: string) => {
  const router = useRouter();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'plan' | 'stamp'>('plan');

  useEffect(() => {
    const loadCourse = async () => {
      try {
        setLoading(true);
        setError(null);
        const courseData = await fetchCourseDetail(courseId);
        setCourse(courseData);
      } catch (err) {
        setError(err instanceof Error ? err.message : '코스 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      loadCourse();
    }
  }, [courseId]);

  const handleTabChange = (tab: 'plan' | 'stamp') => {
    setActiveTab(tab);
  };

  const handleEditOrder = () => {
    // TODO: 순서 수정 기능 구현
    console.log('순서 수정');
  };

  const handleActivityClick = (activity: any) => {
    // TODO: 활동 상세 보기 또는 액션 처리
    console.log('활동 클릭:', activity);
  };

  const handleBack = () => {
    // 이전 페이지로 돌아가기
    router.back();
  };

  const handleShare = () => {
    // TODO: 공유 기능 구현
    console.log('공유');
  };

  const handleImage = () => {
    // TODO: 이미지 보기 기능 구현
    console.log('이미지 보기');
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
    handleImage
  };
};
