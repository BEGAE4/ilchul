export interface IconProps {
  size?: number;
  color?: string;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
  'aria-label'?: string;
}

export type IconName = 
  | 'chat' 
  | 'share' 
  | 'arrow-left' 
  | 'user-plus' 
  | 'map'
  | 'thumbs-up' 
  | 'image' 
  | 'smile' 
  | 'heart' 
  | 'heart-fill' 
  | 'more-vertical' 
  | 'search' 
  | 'chevron-right';