// 코스 상세 관련 유틸리티 함수들

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

export const formatTime = (timeString: string): string => {
  return timeString;
};

export const getActivityStatusColor = (status: string): string => {
  switch (status) {
    case 'available':
      return '#0066cc';
    case 'unavailable':
      return '#ff4444';
    default:
      return '#666';
  }
};

export const getActivityStatusLabel = (status: string): string => {
  switch (status) {
    case 'available':
      return '이용 가능';
    case 'unavailable':
      return '이용 불가';
    default:
      return '';
  }
};

export const getActivityTypeLabel = (type: string): string => {
  switch (type) {
    case 'train':
      return '무계획 기차여행';
    case 'car':
      return '자가용';
    case 'walk':
      return '도보';
    default:
      return '';
  }
};

export const getActivityActionButton = (activity: { status: string; type: string }): string | null => {
  if (activity.status === 'available') {
    if (activity.type === 'car') {
      return '경로 보기';
    }
    return '방문 가능';
  }
  if (activity.status === 'move') {
    return '경로 보기';
  }
  return null;
};
