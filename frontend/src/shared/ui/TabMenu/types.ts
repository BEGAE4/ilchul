export interface TabItem {
    id: string;
    label: string;
    disabled?: boolean;        // 선택사항: 탭 비활성화
    icon?: React.ReactNode;    // 선택사항: 아이콘
  }
  
  export interface TabMenuProps {
    // 필수 props
    tabs: TabItem[];                    // 탭 목록
    activeTabId: string;                // 현재 활성화된 탭 ID
    onTabChange: (tabId: string) => void; // 탭 변경 핸들러
    
    // 선택사항 props
    className?: string;                  // 추가 CSS 클래스
    size?: 'small' | 'medium' | 'large'; // 탭 크기
    variant?: 'default' | 'filled' | 'outlined'; // 탭 스타일 변형
    fullWidth?: boolean;                 // 전체 너비 사용 여부
    disabled?: boolean;                  // 전체 탭 메뉴 비활성화
    
    // 접근성 관련
    'aria-label'?: string;              // 스크린 리더용 라벨
  }