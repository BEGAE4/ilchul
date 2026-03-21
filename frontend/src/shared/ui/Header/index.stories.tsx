import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs';
import Header from './component';
import IconBox from '../IconBox';

const meta: Meta<typeof Header> = {
  title: 'Components/Header',
  component: Header,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: '헤더 컴포넌트입니다. 3가지 variant(logo, backArrow, profile)를 지원합니다.\n\n- **logo**: 왼쪽 로고(30x30), 오른쪽 프로필 이미지(32x32)\n- **backArrow**: 왼쪽 뒤로가기 화살표만\n- **profile**: 왼쪽 뒤로가기 화살표, 프로필 이미지(32x32), 사용자명',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['logo', 'backArrow', 'profile'],
      description: '헤더의 스타일 변형',
      table: {
        type: { summary: "'logo' | 'backArrow' | 'profile'" },
        defaultValue: { summary: "'logo'" },
      },
    },
    logo: {
      control: false,
      description: '왼쪽 로고 (logo variant에서 사용, 30x30 권장)',
    },
    profileImage: {
      control: { type: 'text' },
      description: '프로필 이미지 URL 또는 React 노드 (logo, profile variant에서 사용, 32x32 권장)',
    },
    username: {
      control: { type: 'text' },
      description: '사용자명 (profile variant에서 사용, 소문자로 표시됨)',
    },
    onProfileClick: { 
      action: 'profile-click',
      description: '프로필 이미지 클릭 핸들러',
    },
    onBackClick: { 
      action: 'back-click',
      description: '뒤로가기 버튼 클릭 핸들러',
    },
    onUsernameClick: { 
      action: 'username-click',
      description: '사용자명 클릭 핸들러',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Header>;

// Logo variant - 기본 (기본 로고와 프로필 이미지)
export const Logo: Story = {
  args: {
    variant: 'logo',
  },
  parameters: {
    docs: {
      description: {
        story: '기본 logo variant. 왼쪽에 기본 로고(IconBox), 오른쪽에 기본 프로필 이미지(IconBox)가 표시됩니다.',
      },
    },
  },
};

// Logo variant - 커스텀 로고
export const LogoWithCustomLogo: Story = {
  args: {
    variant: 'logo',
    logo: (
      <div style={{ 
        width: 30, 
        height: 30, 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '18px',
        fontWeight: 'bold'
      }}>
        일
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: '커스텀 로고를 사용하는 logo variant 예시입니다.',
      },
    },
  },
};

// Logo variant - 프로필 이미지 URL
export const LogoWithProfileImage: Story = {
  args: {
    variant: 'logo',
    profileImage: 'https://via.placeholder.com/32',
  },
  parameters: {
    docs: {
      description: {
        story: '프로필 이미지 URL을 사용하는 logo variant 예시입니다.',
      },
    },
  },
};

// Logo variant - 커스텀 프로필 이미지
export const LogoWithCustomProfile: Story = {
  args: {
    variant: 'logo',
    logo: (
      <div style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <IconBox name="smile" size={30} />
      </div>
    ),
    profileImage: (
      <div style={{ 
        width: 32, 
        height: 32, 
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '14px',
        fontWeight: 'bold'
      }}>
        U
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: '커스텀 로고와 커스텀 프로필 이미지를 모두 사용하는 예시입니다.',
      },
    },
  },
};

// BackArrow variant - 기본
export const BackArrow: Story = {
  args: {
    variant: 'backArrow',
  },
  parameters: {
    docs: {
      description: {
        story: '기본 backArrow variant. 왼쪽에 뒤로가기 화살표만 표시됩니다.',
      },
    },
  },
};

// Profile variant - 기본 (프로필 이미지와 사용자명)
export const Profile: Story = {
  args: {
    variant: 'profile',
    profileImage: 'https://via.placeholder.com/32',
    username: 'username',
  },
  parameters: {
    docs: {
      description: {
        story: '기본 profile variant. 왼쪽에 뒤로가기 화살표, 프로필 이미지, 사용자명이 표시됩니다.',
      },
    },
  },
};

// Profile variant - 사용자명 없이
export const ProfileWithoutUsername: Story = {
  args: {
    variant: 'profile',
    profileImage: 'https://via.placeholder.com/32',
  },
  parameters: {
    docs: {
      description: {
        story: '사용자명 없이 프로필 이미지만 표시하는 profile variant 예시입니다.',
      },
    },
  },
};

// Profile variant - 커스텀 프로필 이미지
export const ProfileWithCustomImage: Story = {
  args: {
    variant: 'profile',
    profileImage: (
      <div style={{ 
        width: 32, 
        height: 32, 
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '14px',
        fontWeight: 'bold'
      }}>
        U
      </div>
    ),
    username: 'username',
  },
  parameters: {
    docs: {
      description: {
        story: '커스텀 프로필 이미지를 사용하는 profile variant 예시입니다.',
      },
    },
  },
};

// Profile variant - 긴 사용자명
export const ProfileWithLongUsername: Story = {
  args: {
    variant: 'profile',
    profileImage: 'https://via.placeholder.com/32',
    username: 'verylongusername',
  },
  parameters: {
    docs: {
      description: {
        story: '긴 사용자명을 사용하는 profile variant 예시입니다.',
      },
    },
  },
};

// 모든 variant 비교
export const AllVariants: Story = {
  render: () => (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '3rem', 
      padding: '2rem', 
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <div>
        <h3 style={{ 
          marginBottom: '1rem', 
          fontSize: '16px', 
          fontWeight: 600, 
          color: '#374151' 
        }}>
          Logo Variant
        </h3>
        <p style={{ 
          marginBottom: '1rem', 
          fontSize: '14px', 
          color: '#6b7280' 
        }}>
          왼쪽 로고(30x30), 오른쪽 프로필 이미지(32x32)
        </p>
        <Header
          variant="logo"
          logo={
            <div style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconBox name="smile" size={30} />
            </div>
          }
          profileImage="https://via.placeholder.com/32"
        />
      </div>
      
      <div>
        <h3 style={{ 
          marginBottom: '1rem', 
          fontSize: '16px', 
          fontWeight: 600, 
          color: '#374151' 
        }}>
          BackArrow Variant
        </h3>
        <p style={{ 
          marginBottom: '1rem', 
          fontSize: '14px', 
          color: '#6b7280' 
        }}>
          왼쪽 뒤로가기 화살표만
        </p>
        <Header variant="backArrow" />
      </div>
      
      <div>
        <h3 style={{ 
          marginBottom: '1rem', 
          fontSize: '16px', 
          fontWeight: 600, 
          color: '#374151' 
        }}>
          Profile Variant
        </h3>
        <p style={{ 
          marginBottom: '1rem', 
          fontSize: '14px', 
          color: '#6b7280' 
        }}>
          왼쪽 뒤로가기 화살표, 프로필 이미지(32x32), 사용자명
        </p>
        <Header
          variant="profile"
          profileImage="https://via.placeholder.com/32"
          username="username"
        />
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: '모든 variant를 한 화면에서 비교할 수 있습니다.',
      },
    },
  },
};

// 인터랙티브 예시
export const Interactive: Story = {
  render: () => {
    const [variant, setVariant] = React.useState<'logo' | 'backArrow' | 'profile'>('logo');
    const [username, setUsername] = React.useState('username');
    
    return (
      <div style={{ padding: '2rem', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
            Variant:
          </label>
          <select 
            value={variant} 
            onChange={(e) => setVariant(e.target.value as 'logo' | 'backArrow' | 'profile')}
            style={{ 
              padding: '0.5rem', 
              borderRadius: '4px', 
              border: '1px solid #d1d5db',
              fontSize: '14px'
            }}
          >
            <option value="logo">Logo</option>
            <option value="backArrow">BackArrow</option>
            <option value="profile">Profile</option>
          </select>
        </div>
        
        {variant === 'profile' && (
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
              Username:
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ 
                padding: '0.5rem', 
                borderRadius: '4px', 
                border: '1px solid #d1d5db',
                fontSize: '14px',
                width: '200px'
              }}
            />
          </div>
        )}
        
        <Header
          variant={variant}
          profileImage={variant !== 'backArrow' ? 'https://via.placeholder.com/32' : undefined}
          username={variant === 'profile' ? username : undefined}
          onProfileClick={() => alert('프로필 클릭!')}
          onBackClick={() => alert('뒤로가기 클릭!')}
          onUsernameClick={() => alert('사용자명 클릭!')}
        />
      </div>
    );
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: '인터랙티브하게 variant를 변경하고 테스트할 수 있습니다.',
      },
    },
  },
};
