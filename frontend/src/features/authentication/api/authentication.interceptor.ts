import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { reissueToken } from './authentication.api';

// 재발급을 시도하지 않을 인증 엔드포인트 (무한 루프 방지)
const AUTH_BYPASS_PATHS = ['/api/sign/reissue', '/api/sign/userinfo', '/api/sign/logout'];

let isRegistered = false;

// 401 응답 시 액세스 토큰을 재발급받고 원 요청을 1회 재시도하는 인터셉터를 등록한다.
// 인증은 쿠키 기반이므로 재발급된 토큰은 Set-Cookie로 자동 반영되어 재시도 요청에 실린다.
export const setupAuthInterceptor = (): void => {
  if (isRegistered) return;
  isRegistered = true;

  axios.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as
        | (InternalAxiosRequestConfig & { _retry?: boolean })
        | undefined;

      const status = error.response?.status;
      const url = originalRequest?.url ?? '';
      const isBypass = AUTH_BYPASS_PATHS.some((path) => url.includes(path));

      // 401이 아니거나, 인증 엔드포인트거나, 이미 재시도한 요청이면 그대로 실패 처리
      if (status !== 401 || isBypass || !originalRequest || originalRequest._retry) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        await reissueToken();
        return axios(originalRequest);
      } catch (reissueError) {
        return Promise.reject(reissueError);
      }
    },
  );
};
