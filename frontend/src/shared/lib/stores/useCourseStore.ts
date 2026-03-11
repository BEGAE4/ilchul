import { create } from 'zustand';
import type { Course, Stop } from '@/shared/types';
import { MOCK_COURSES, MY_COURSES_DATA, NATIONWIDE_COURSES } from '@/shared/data/mockData';

interface CourseState {
  courses: Course[];
  myCourses: Course[];
  bookmarkedIds: Set<string>;
  likedIds: Set<string>;

  // 기존 호환 메서드
  toggleBookmark: (courseId: string) => void;
  toggleLike: (courseId: string) => void;
  addMyCourse: (course: Course) => void;
  getCourseById: (id: string) => Course | undefined;
  getBookmarkedCourses: () => Course[];

  // 샘플 호환 메서드
  isBookmarked: (courseId: string) => boolean;
  isLiked: (courseId: string) => boolean;
  getLikeCount: (courseId: string) => number;
  updateMyCourse: (id: string, updates: Partial<Course>) => void;
  deleteMyCourse: (id: string) => void;
  toggleVisibility: (id: string) => void;
  cloneCourseToMy: (courseId: string) => Course | null;
  addStopToMyCourse: (courseId: string, stop: Stop) => void;
}

export const useCourseStore = create<CourseState>((set, get) => ({
  courses: [...MOCK_COURSES, ...NATIONWIDE_COURSES],
  myCourses: MY_COURSES_DATA,
  bookmarkedIds: new Set<string>(),
  likedIds: new Set<string>(),

  toggleBookmark: (courseId) =>
    set((state) => {
      const next = new Set(state.bookmarkedIds);
      if (next.has(courseId)) {
        next.delete(courseId);
      } else {
        next.add(courseId);
      }
      return { bookmarkedIds: next };
    }),

  toggleLike: (courseId) =>
    set((state) => {
      const next = new Set(state.likedIds);
      if (next.has(courseId)) {
        next.delete(courseId);
      } else {
        next.add(courseId);
      }
      return { likedIds: next };
    }),

  addMyCourse: (course) =>
    set((state) => ({
      myCourses: [course, ...state.myCourses],
    })),

  getCourseById: (id) => {
    const { courses, myCourses } = get();
    return [...courses, ...myCourses].find((c) => c.id === id);
  },

  getBookmarkedCourses: () => {
    const { courses, myCourses, bookmarkedIds } = get();
    const all = [...courses, ...myCourses];
    return all.filter((c) => bookmarkedIds.has(c.id));
  },

  // 샘플 호환 메서드
  isBookmarked: (courseId) => get().bookmarkedIds.has(courseId),

  isLiked: (courseId) => get().likedIds.has(courseId),

  getLikeCount: (courseId) => {
    const { courses, likedIds } = get();
    const course = courses.find((c) => c.id === courseId);
    const base = course?.likes ?? 0;
    return likedIds.has(courseId) ? base + 1 : base;
  },

  updateMyCourse: (id, updates) =>
    set((state) => ({
      myCourses: state.myCourses.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    })),

  deleteMyCourse: (id) =>
    set((state) => ({
      myCourses: state.myCourses.filter((c) => c.id !== id),
    })),

  toggleVisibility: (id) =>
    set((state) => ({
      myCourses: state.myCourses.map((c) =>
        c.id === id ? { ...c, isPublic: !c.isPublic } : c
      ),
    })),

  cloneCourseToMy: (courseId) => {
    const { courses } = get();
    const original = courses.find((c) => c.id === courseId);
    if (!original) return null;

    const cloned: Course = {
      ...original,
      id: `my-${Date.now()}`,
      ownerId: 'me',
      isPublic: false,
      isVerified: false,
      likes: 0,
      bookmarks: 0,
      scheduledDate: '',
      review: '',
      createdAt: new Date().toISOString(),
      completedAt: undefined,
      stops: original.stops.map((s) => ({ ...s, isVerified: false, verifiedImage: undefined })),
    };

    set((state) => ({
      myCourses: [cloned, ...state.myCourses],
    }));

    return cloned;
  },

  addStopToMyCourse: (courseId, stop) =>
    set((state) => ({
      myCourses: state.myCourses.map((c) =>
        c.id === courseId ? { ...c, stops: [...c.stops, stop] } : c
      ),
    })),
}));
