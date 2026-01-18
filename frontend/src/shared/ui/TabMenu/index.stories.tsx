import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { TabMenu } from './component';
import { TabItem } from './types';

const meta: Meta<typeof TabMenu> = {
  title: 'UI/TabMenu',
  component: TabMenu,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '탭 메뉴 컴포넌트입니다. 여러 탭 중 하나를 선택할 수 있습니다.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      description: '탭의 크기를 설정합니다'
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'filled', 'outlined'],
      description: '탭의 스타일 변형을 설정합니다'
    },
    fullWidth: {
      control: { type: 'boolean' },
      description: '전체 너비를 사용할지 설정합니다'
    },
    disabled: {
      control: { type: 'boolean' },
      description: '전체 탭 메뉴를 비활성화합니다'
    },
    'aria-label': {
      control: { type: 'text' },
      description: '접근성을 위한 라벨을 설정합니다'
    }
  }
};

export default meta;
type Story = StoryObj<typeof TabMenu>;

// 기본 탭 데이터
const defaultTabs: TabItem[] = [
  { id: 'plan', label: '계획 상세 보기' },
  { id: 'stamp', label: '스탬프 이력 보기' }
];

const iconTabs: TabItem[] = [
  { id: 'home', label: '홈', icon: '🏠' },
  { id: 'profile', label: '프로필', icon: '👤' },
  { id: 'settings', label: '설정', icon: '⚙️' }
];

const disabledTabs: TabItem[] = [
  { id: 'active', label: '활성 탭' },
  { id: 'disabled', label: '비활성 탭', disabled: true },
  { id: 'another', label: '다른 탭' }
];

// 기본 스토리
export const Default: Story = {
  args: {
    tabs: defaultTabs,
    activeTabId: 'plan',
    onTabChange: () => {}
  }
};

// 아이콘이 있는 탭
export const WithIcons: Story = {
  args: {
    tabs: iconTabs,
    activeTabId: 'home',
    onTabChange: () => {}
  }
};

// 비활성화된 탭
export const WithDisabledTabs: Story = {
  args: {
    tabs: disabledTabs,
    activeTabId: 'active',
    onTabChange: () => {}
  }
};

// 전체 너비
export const FullWidth: Story = {
  args: {
    tabs: defaultTabs,
    activeTabId: 'plan',
    onTabChange: () => {},
    fullWidth: true
  }
};

// 작은 크기
export const SmallSize: Story = {
  args: {
    tabs: defaultTabs,
    activeTabId: 'plan',
    onTabChange: () => {},
    size: 'small'
  }
};

// 큰 크기
export const LargeSize: Story = {
  args: {
    tabs: defaultTabs,
    activeTabId: 'plan',
    onTabChange: () => {},
    size: 'large'
  }
};

// filled 스타일
export const FilledVariant: Story = {
  args: {
    tabs: defaultTabs,
    activeTabId: 'plan',
    onTabChange: () => {},
    variant: 'filled'
  }
};

// outlined 스타일
export const OutlinedVariant: Story = {
  args: {
    tabs: defaultTabs,
    activeTabId: 'plan',
    onTabChange: () => {},
    variant: 'outlined'
  }
};

// 전체 비활성화
export const FullyDisabled: Story = {
  args: {
    tabs: defaultTabs,
    activeTabId: 'plan',
    onTabChange: () => {},
    disabled: true
  }
};

// 인터랙티브 예시 (상태 변경)
export const Interactive: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState('plan');
    
    return (
      <div style={{ width: '400px' }}>
        <TabMenu
          tabs={defaultTabs}
          activeTabId={activeTab}
          onTabChange={setActiveTab}
        />
        <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#f5f5f5' }}>
          <p>현재 선택된 탭: <strong>{activeTab}</strong></p>
        </div>
      </div>
    );
  }
};

// 여러 탭이 있는 예시
export const MultipleTabs: Story = {
  args: {
    tabs: [
      { id: 'tab1', label: '첫 번째 탭' },
      { id: 'tab2', label: '두 번째 탭' },
      { id: 'tab3', label: '세 번째 탭' },
      { id: 'tab4', label: '네 번째 탭' },
      { id: 'tab5', label: '다섯 번째 탭' }
    ],
    activeTabId: 'tab1',
    onTabChange: () => {}
  }
};