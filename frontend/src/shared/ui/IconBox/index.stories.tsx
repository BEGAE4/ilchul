import type { Meta, StoryObj } from '@storybook/react';
import IconBox from './component';
import { IconName } from './types';

const meta: Meta<typeof IconBox> = {
  title: 'UI/IconBox',
  component: IconBox,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'SVG 아이콘을 React 컴포넌트로 렌더링하는 컴포넌트입니다.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    name: {
      control: { type: 'select' },
      options: ['chat', 'share', 'heart', 'search', 'smile'],
      description: '아이콘의 종류'
    },
    size: {
      control: { type: 'number', min: 16, max: 64, step: 4 },
      description: '아이콘의 크기'
    },
    color: {
      control: { type: 'color' },
      description: '아이콘의 색상'
    },
    disabled: {
      control: { type: 'boolean' },
      description: '아이콘 비활성화 여부'
    }
  }
};

export default meta;
type Story = StoryObj<typeof IconBox>;

// 기본 아이콘
export const Default: Story = {
  args: {
    name: 'chat',
    size: 24
  }
};

// 다양한 크기
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <IconBox name="heart" size={16} />
      <IconBox name="heart" size={24} />
      <IconBox name="heart" size={32} />
      <IconBox name="heart" size={48} />
    </div>
  )
};

// 다양한 색상
export const Colors: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <IconBox name="heart" size={24} color="#ff4757" />
      <IconBox name="smile" size={24} color="#2ed573" />
      <IconBox name="chat" size={24} color="#3742fa" />
      <IconBox name="search" size={24} color="#ffa502" />
    </div>
  )
};

// 클릭 가능한 아이콘
export const Clickable: Story = {
  args: {
    name: 'heart',
    size: 24,
    color: '#ff4757',
    onClick: () => alert('좋아요!')
  }
};

// 비활성화된 아이콘
export const Disabled: Story = {
  args: {
    name: 'heart',
    size: 24,
    disabled: true
  }
};

// 모든 아이콘 보기
export const AllIcons: Story = {
  render: () => {
    const iconNames = ['chat', 'share', 'heart', 'search', 'smile', 'map', 'user-plus', 'circle-check'] as const;
    
    return (
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', 
        gap: '16px',
        maxWidth: '400px'
      }}>
        {iconNames.map(name => (
          <div key={name} style={{ textAlign: 'center' }}>
            <IconBox name={name as IconName} size={32} />
            <div style={{ fontSize: '12px', marginTop: '8px' }}>{name}</div>
          </div>
        ))}
      </div>
    );
  }
};