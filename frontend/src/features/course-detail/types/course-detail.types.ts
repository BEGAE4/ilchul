// 코스 상세 관련 타입 정의
import { CourseDetail, Activity, StampHistory, Stamp } from '../api/course-detail.api';

export type TabType = 'plan' | 'stamp';

export type ActivityType = 'train' | 'car' | 'walk';

export type ActivityStatus = 'available' | 'unavailable' | 'move';

// Page Props
export interface CourseDetailPageProps {
  courseId: string;
}

// Header Component Props
export interface CourseDetailHeaderProps {
  onBack: () => void;
  onShare: () => void;
  onImage: () => void;
}

// Hero Component Props
export interface CourseDetailHeroProps {
  backgroundImage: string;
}

// TabMenu Component Props
export interface Tab {
  id: string;
  label: string;
}

export interface TabMenuProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tab: 'plan' | 'stamp') => void;
}

// ActivityCard Component Props
export interface ActivityCardProps {
  activity: Activity;
  order: number;
  onClick: () => void;
}

// StampCard Component Props
export interface StampCardProps {
  stamp: Stamp;
  onClick: () => void;
}

// StampHistoryGroup Component Props
export interface StampHistoryGroupProps {
  history: StampHistory;
  onStampClick: (stamp: Stamp) => void;
}

// Content Component Props
export interface CourseDetailContentProps {
  course: CourseDetail;
  activeTab: 'plan' | 'stamp';
  onTabChange: (tab: 'plan' | 'stamp') => void;
  onEditOrder: () => void;
  onActivityClick: (activity: Activity) => void;
  onMoreClick: () => void;
  stampHistory: StampHistory[];
  stampLoading: boolean;
  onStampClick: (stamp: Stamp) => void;
}
