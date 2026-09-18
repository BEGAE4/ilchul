import { create } from 'zustand';

interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  title: string; // 한줄 소개
  isAdmin?: boolean; // 관리자 여부 (문의 답변 등 관리자 기능 게이트)
  bio?: string;
}

interface UserSettings {
  pushNotification: boolean;
  marketingNotification: boolean;
  darkMode: boolean;
  language: string;
  privateProfile: boolean;
}

// 로그인 여부 확인(GET /api/sign/userinfo) 결과
interface AuthResult {
  isLoggedIn: boolean;
  email?: string | null;
  isAdmin?: boolean;
}

interface UserState {
  user: UserProfile;
  isLoggedIn: boolean;
  authChecked: boolean; // 로그인 여부 확인 API 완료 여부 (가드/리다이렉트 판단용)
  email: string | null; // 로그인 계정 이메일 (userinfo 응답)
  settings: UserSettings;

  setUser: (user: Partial<UserProfile>) => void;
  setLoggedIn: (val: boolean) => void;
  setAuthResult: (result: AuthResult) => void;
  updateSettings: (key: keyof UserSettings, value: boolean | string) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  // 기존 호환
  logout: () => void;
}

// 초기값은 비어 있으며 GET /api/mypage/profile 응답으로 채워진다 (ProfilePage/SettingsPage).
const EMPTY_USER: UserProfile = {
  id: '',
  name: '',
  avatar: '',
  title: '',
  bio: '',
};

export const useUserStore = create<UserState>((set) => ({
  user: EMPTY_USER,
  isLoggedIn: false,
  authChecked: false,
  email: null,
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

  setAuthResult: ({ isLoggedIn, email, isAdmin }) =>
    set((state) => ({
      isLoggedIn,
      authChecked: true,
      ...(email !== undefined ? { email } : {}),
      ...(isAdmin !== undefined
        ? { user: { ...state.user, isAdmin } }
        : {}),
    })),

  updateSettings: (key, value) =>
    set((state) => ({
      settings: { ...state.settings, [key]: value },
    })),

  updateProfile: (updates) =>
    set((state) => ({
      user: { ...state.user, ...updates },
    })),

  logout: () => set({ isLoggedIn: false, email: null }),
}));
