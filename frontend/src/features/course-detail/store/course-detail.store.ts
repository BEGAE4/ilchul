import { create } from 'zustand';
import { CourseDetail } from '../api/course-detail.api';

interface CourseDetailState {
  course: CourseDetail | null;
  loading: boolean;
  error: string | null;
  activeTab: 'plan' | 'stamp';
  
  setCourse: (course: CourseDetail | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setActiveTab: (tab: 'plan' | 'stamp') => void;
  reset: () => void;
}

export const useCourseDetailStore = create<CourseDetailState>((set) => ({
  course: null,
  loading: false,
  error: null,
  activeTab: 'plan',
  
  setCourse: (course) => set({ course }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setActiveTab: (activeTab) => set({ activeTab }),
  reset: () => set({ 
    course: null, 
    loading: false, 
    error: null, 
    activeTab: 'plan' 
  })
}));
