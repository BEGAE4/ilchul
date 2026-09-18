export interface AvatarProps {
  /** 서버 응답 그대로 — null / 빈 문자열 / 무효 URL 모두 허용. 없거나 깨지면 기본 아바타를 그린다 */
  src?: string | null;
  alt: string;
  /** 지름(px). 감싸는 요소의 테두리 안쪽 크기로 준다 */
  size: number;
  className?: string;
}
