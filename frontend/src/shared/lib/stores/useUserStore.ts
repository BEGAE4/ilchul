import { create } from 'zustand';

interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  title: string; // 한줄 소개 (샘플 호환)
  level: number;
  // 기존 User 타입 호환 필드
  bio?: string;
  travelType?: string;
  courseCount?: number;
  certCount?: number;
  savedCount?: number;
  followerCount?: number;
  followingCount?: number;
}

interface UserSettings {
  pushNotification: boolean;
  marketingNotification: boolean;
  darkMode: boolean;
  language: string;
  privateProfile: boolean;
}

interface UserState {
  user: UserProfile;
  isLoggedIn: boolean;
  followingIds: Set<string>;
  settings: UserSettings;

  setUser: (user: Partial<UserProfile>) => void;
  setLoggedIn: (val: boolean) => void;
  toggleFollow: (userId: string) => void;
  isFollowing: (userId: string) => boolean;
  updateSettings: (key: keyof UserSettings, value: boolean | string) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  // 기존 호환
  logout: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: {
    id: 'me',
    name: '김여행',
    avatar: 'https://i.pravatar.cc/150?u=me',
    title: '힐링 여행을 좋아하는 여행자입니다 🌿',
    level: 3,
    travelType: '힐링 마스터',
    bio: '힐링 여행을 좋아하는 여행자입니다 🌿',
    courseCount: 12,
    certCount: 8,
    savedCount: 24,
    followerCount: 156,
    followingCount: 89,
  },
  isLoggedIn: true,
  followingIds: new Set<string>(),
  settings: {
    pushNotification: true,
    marketingNotification: false,
    darkMode: false,
    language: '한국어',
    privateProfile: false,
  },

  setUser: (updates) =>
    set((state) => ({ user: { ...state.user, ...updates } })),

  setLoggedIn: (isLoggedIn) => set({ isLoggedIn }),

  toggleFollow: (userId) =>
    set((state) => {
      const next = new Set(state.followingIds);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return { followingIds: next };
    }),

  isFollowing: (userId) => get().followingIds.has(userId),

  updateSettings: (key, value) =>
    set((state) => ({
      settings: { ...state.settings, [key]: value },
    })),

  updateProfile: (updates) =>
    set((state) => ({
      user: { ...state.user, ...updates },
    })),

  logout: () => set({ isLoggedIn: false }),
}));
