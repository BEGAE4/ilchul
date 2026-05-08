import axios from 'axios';
import { UserInfo } from '../types/userinfo.types';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

// ── 소셜 로그인 ──────────────────────────────────────────────
const SOCIAL_LOGIN_PATHS = {
  kakao: '/oauth2/authorization/kakao',
  google: '/oauth2/authorization/google',
  naver: '/oauth2/authorization/naver',
} as const;

export type SocialProvider = keyof typeof SOCIAL_LOGIN_PATHS;

export const getSocialLoginUrl = (provider: SocialProvider): string =>
  `${BASE_URL}${SOCIAL_LOGIN_PATHS[provider]}`;

export const redirectToSocialLogin = (provider: SocialProvider): void => {
  window.location.href = getSocialLoginUrl(provider);
};

// ── 로그인 여부 확인 ─────────────────────────────────────────
// 200: 로그인 상태, 401: 미로그인
export const fetchUserInfo = async (): Promise<UserInfo> => {
  const response = await axios.get<UserInfo>('/api/sign/userinfo');
  return response.data;
};

// ── 로그아웃 ────────────────────────────────────────────────
export const logout = async (): Promise<void> => {
  await axios.post('/api/sign/logout');
};
