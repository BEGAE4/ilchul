export interface CardAction {
  type: 'button' | 'price' | 'info';
  text: string;
  onClick?: () => void;
}

export interface CardPrice {
  label: string;
  value: string;
  discount?: string;
}

export interface CardProps {
  // 필수 props
  title: string;
  
  // 선택적 props
  image?: string;
  variant?: 'default' | 'service' | 'experience' | 'product';
  subtitle?: string;
  description?: string;
  action?: CardAction;
  price?: CardPrice;
  className?: string;
  onClick?: () => void;
  
  // 접근성 관련
  'aria-label'?: string;
  'aria-describedby'?: string;
}

// 기존 TabMenu 관련 타입들 (필요시 별도 파일로 분리)
export interface TabItem {
  id: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface TabMenuProps {
  tabs: TabItem[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'filled' | 'outlined';
  fullWidth?: boolean;
  disabled?: boolean;
  'aria-label'?: string;
}