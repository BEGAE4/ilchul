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
  status: 'available' | 'unavailable' | 'move';
  imageUrl?: string;
  duration?: string;
  route?: string; 
}

export interface Stamp {
  id: string;
  order: number;
  title: string;
  type: 'train' | 'car' | 'walk';
  isCompleted: boolean;
  needsVerification: boolean;
}

export interface StampHistory {
  date: string;
  stamps: Stamp[];
}

export const fetchStampHistory = async (courseId: string): Promise<StampHistory[]> => {
  // TODO: 실제 API 호출 구현
  return [
    {
      date: '2025.07.24',
      stamps: [
        {
          id: '1',
          order: 1,
          title: '무계획 기차여행',
          type: 'train',
          isCompleted: true,
          needsVerification: false
        },
        {
          id: '2',
          order: 2,
          title: '무계획 기차여행',
          type: 'train',
          isCompleted: true,
          needsVerification: false
        },
        {
          id: '3',
          order: 3,
          title: '무계획 기차여행',
          type: 'train',
          isCompleted: false,
          needsVerification: true
        },
        {
          id: '4',
          order: 4,
          title: '무계획 기차여행',
          type: 'train',
          isCompleted: false,
          needsVerification: false
        }
      ]
    },
    {
      date: '2025.07.24',
      stamps: [
        {
          id: '5',
          order: 1,
          title: '무계획 기차여행',
          type: 'train',
          isCompleted: true,
          needsVerification: false
        },
        {
          id: '6',
          order: 2,
          title: '무계획 기차여행',
          type: 'train',
          isCompleted: true,
          needsVerification: false
        },
        {
          id: '7',
          order: 3,
          title: '무계획 기차여행',
          type: 'train',
          isCompleted: false,
          needsVerification: true
        }
      ]
    },
    {
      date: '2025.07.24',
      stamps: [
        {
          id: '8',
          order: 1,
          title: '무계획 기차여행',
          type: 'train',
          isCompleted: true,
          needsVerification: false
        },
        {
          id: '9',
          order: 2,
          title: '무계획 기차여행',
          type: 'train',
          isCompleted: true,
          needsVerification: false
        },
        {
          id: '10',
          order: 3,
          title: '무계획 기차여행',
          type: 'train',
          isCompleted: false,
          needsVerification: true
        },
        {
          id: '11',
          order: 4,
          title: '무계획 기차여행',
          type: 'train',
          isCompleted: false,
          needsVerification: false
        }
      ]
    }
  ];
};

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
        status: 'move',
        duration: '40분',
        route: '아산 외암마을 에서 청주 까지'
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
