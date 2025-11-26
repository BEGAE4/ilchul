// 코스 상세 관련 타입 정의

export type TabType = 'plan' | 'stamp';

export type ActivityType = 'train' | 'car' | 'walk';

export type ActivityStatus = 'available' | 'unavailable';

export interface CourseDetailProps {
  courseId: string;
}

export interface CourseDetailHeaderProps {
  title: string;
  date: string;
  backgroundImage: string;
  onBack: () => void;
  onShare: () => void;
  onImage: () => void;
}

export interface CourseDetailContentProps {
  course: any; // CourseDetail 타입은 api에서 import
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onEditOrder: () => void;
  onActivityClick: (activity: any) => void;
}

export interface ActivityCardProps {
  activity: any; // Activity 타입은 api에서 import
  order: number;
  onClick: () => void;
}

export interface TabMenuProps {
  tabs: Array<{
    id: string;
    label: string;
  }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
}
