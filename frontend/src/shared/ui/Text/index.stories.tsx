import type { Meta, StoryObj } from '@storybook/react';
import Text from './component';
import { TextProps } from './types';

const meta: Meta<typeof Text> = {
  title: 'UI/Text',
  component: Text,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '텍스트 컴포넌트입니다. 다양한 크기, 굵기, 색상을 지원하며 웹 표준을 준수합니다.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['h1', 'h2', 'h3', 'body1', 'body2', 'caption', 'button'],
      description: '텍스트의 변형을 설정합니다'
    },
    size: {
      control: { type: 'select' },
      options: [10, 12, 14, 16, 18, 24, 26],
      description: '텍스트의 크기를 픽셀 단위로 설정합니다'
    },
    weight: {
      control: { type: 'select' },
      options: ['normal', 'medium', 'semibold', 'bold'],
      description: '텍스트의 굵기를 설정합니다'
    },
    align: {
      control: { type: 'select' },
      options: ['left', 'center', 'right'],
      description: '텍스트의 정렬을 설정합니다'
    },
    color: {
      control: { type: 'color' },
      description: '텍스트의 색상을 설정합니다'
    }
  }
};

export default meta;
type Story = StoryObj<typeof Text>;

// 사진의 텍스트 예시들을 보여주는 스토리
export const FontSizeExamples: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <span style={{ minWidth: '40px', fontSize: '12px', color: '#666' }}>26px:</span>
        <Text variant="h1" size={26}>
          지금 가장 나에게 어울리는<br />
          힐링 방법이 뭔지 알아볼까요 ;)
        </Text>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <span style={{ minWidth: '40px', fontSize: '12px', color: '#666' }}>24px:</span>
        <Text variant="h2" size={24}>
          일단 출발하는 나만의 힐링 여행 테마
        </Text>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <span style={{ minWidth: '40px', fontSize: '12px', color: '#666' }}>18px:</span>
        <Text variant="h3" size={18}>
          맑은 바다가 주는 청량감
        </Text>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <span style={{ minWidth: '40px', fontSize: '12px', color: '#666' }}>16px:</span>
        <Text variant="body1" size={16} color="#007AFF">
          더보기
        </Text>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <span style={{ minWidth: '40px', fontSize: '12px', color: '#666' }}>14px:</span>
        <Text variant="body2" size={14}>
          먼저, 일출님을 파악하고, 일출님에게 필요한 힐링 플랜을<br />
          추천해드릴게요.
        </Text>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <span style={{ minWidth: '40px', fontSize: '12px', color: '#666' }}>12px:</span>
        <Text variant="caption" size={12}>
          이용약관 | 사업자 정보 | 개인정보처리방침 | 입점문의
        </Text>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <span style={{ minWidth: '40px', fontSize: '12px', color: '#666' }}>10px:</span>
        <Text size={10}>
          이용약관 | 사업자 정보 | 개인정보처리방침 | 입점문의
        </Text>
      </div>
    </div>
  )
};

// 기본 사용법
export const Default: Story = {
  args: {
    children: '기본 텍스트입니다.',
    variant: 'body1'
  }
};

// 제목 예시
export const Headings: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Text variant="h1">메인 제목 (H1)</Text>
      <Text variant="h2">부제목 (H2)</Text>
      <Text variant="h3">소제목 (H3)</Text>
    </div>
  )
};

// 크기별 예시
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Text size={26}>26px 텍스트</Text>
      <Text size={24}>24px 텍스트</Text>
      <Text size={18}>18px 텍스트</Text>
      <Text size={16}>16px 텍스트</Text>
      <Text size={14}>14px 텍스트</Text>
      <Text size={12}>12px 텍스트</Text>
      <Text size={10}>10px 텍스트</Text>
    </div>
  )
};

// 굵기별 예시
export const Weights: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Text weight="normal">Normal 텍스트</Text>
      <Text weight="medium">Medium 텍스트</Text>
      <Text weight="semibold">Semibold 텍스트</Text>
      <Text weight="bold">Bold 텍스트</Text>
    </div>
  )
};

// 정렬 예시
export const Alignment: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '300px' }}>
      <Text align="left">왼쪽 정렬 텍스트</Text>
      <Text align="center">가운데 정렬 텍스트</Text>
      <Text align="right">오른쪽 정렬 텍스트</Text>
    </div>
  )
};

// 색상 예시
export const Colors: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Text color="#000000">검은색 텍스트</Text>
      <Text color="#007AFF">파란색 텍스트</Text>
      <Text color="#FF3B30">빨간색 텍스트</Text>
      <Text color="#34C759">초록색 텍스트</Text>
      <Text color="#FF9500">주황색 텍스트</Text>
    </div>
  )
};

// 클릭 가능한 텍스트
export const Clickable: Story = {
  args: {
    children: '클릭 가능한 텍스트',
    onClick: () => alert('텍스트가 클릭되었습니다!'),
    className: 'cursor-pointer'
  }
};

// 커스텀 HTML 태그 사용
export const CustomTag: Story = {
  args: {
    children: '이것은 span 태그입니다',
    as: 'span',
    variant: 'body1'
  }
};