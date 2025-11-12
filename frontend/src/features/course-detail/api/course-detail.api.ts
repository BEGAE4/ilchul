// 코스 상세 정보 API
export interface CourseDetail {
  id: string;
  title: string;
  date: string;
  description: string;
  isPublic: boolean;
  activities: Activity[];
}

export interface Activity {
  id: string;
  order: number;
  startTime: string;
  endTime: string;
  type: 'train' | 'car' | 'walk';
  title: string;
  description: string;
  status: 'available' | 'unavailable';
  imageUrl?: string;
}

export const fetchCourseDetail = async (courseId: string): Promise<CourseDetail> => {
  // TODO: 실제 API 호출 구현
  return {
    id: courseId,
    title: '워킹 테라피',
    date: '2025.07.24',
    description: '기획하다 박차고 일어나 반차쓰고 떠난 휴식',
    isPublic: true,
    activities: [
      {
        id: '1',
        order: 1,
        startTime: '08:30',
        endTime: '10:30',
        type: 'train',
        title: '무계획 기차여행',
        description: '아산 외암마을 도착',
        status: 'available',
        imageUrl: '/course_plan.png'
      },
      {
        id: '2',
        order: 2,
        startTime: '08:30',
        endTime: '10:30',
        type: 'car',
        title: '이동시간 예상 40분',
        description: '아산 외암마을 에서 청주 까지',
        status: 'available'
      },
      {
        id: '3',
        order: 3,
        startTime: '08:30',
        endTime: '10:30',
        type: 'train',
        title: '무계획 기차여행 (이용불가)',
        description: '우천으로 인한 일부 열차 미운행',
        status: 'unavailable',
        imageUrl: '/course_plan.png'
      },
      {
        id: '4',
        order: 4,
        startTime: '08:30',
        endTime: '10:30',
        type: 'train',
        title: '무계획 기차여행',
        description: '아산 외암마을 도착',
        status: 'available',
        imageUrl: '/course_plan.png'
      }
    ]
  };
};
