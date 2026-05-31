import type { Meta, StoryObj } from '@storybook/react';
import { ReportMenuItem } from './component';
import type { CurrentUser, ReportTarget } from '../../types';

const courseTarget: ReportTarget = {
  type: 'course',
  id: 'course-1',
  ownerId: '다른유저',
  title: '제주 힐링 여행 3일 코스',
  contextUrl: '/course/course-1',
};

const selfTarget: ReportTarget = {
  type: 'course',
  id: 'course-2',
  ownerId: '김여행', // 현재 유저와 동일 닉네임 → 자기 신고
  title: '내가 만든 플랜',
  contextUrl: '/course/course-2',
};

const loggedInUser: CurrentUser = {
  id: 'me',
  name: '김여행',
  isLoggedIn: true,
};

const notLoggedInUser: CurrentUser = {
  id: '',
  name: '',
  isLoggedIn: false,
};

const meta: Meta<typeof ReportMenuItem> = {
  title: 'Features/Report/ReportMenuItem',
  component: ReportMenuItem,
  parameters: {
    layout: 'padded',
  },
  args: {
    target: courseTarget,
    currentUser: loggedInUser,
    onSelect: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof ReportMenuItem>;

// 정상 — 신고하기 버튼 노출
export const Normal: Story = {
  args: {
    target: courseTarget,
    currentUser: loggedInUser,
  },
};

// 비로그인 — return null (컴포넌트가 렌더링되지 않음)
export const NotLoggedIn: Story = {
  name: '비로그인 (비노출)',
  args: {
    target: courseTarget,
    currentUser: notLoggedInUser,
  },
};

// 자기 신고 — return null (비노출)
export const SelfReport: Story = {
  name: '자기 신고 (비노출)',
  args: {
    target: selfTarget,
    currentUser: loggedInUser,
  },
};

// 이미 신고함 — disabled 버튼 노출
// hiddenReportsStorage는 localStorage 기반이라 Storybook에서 직접 세팅 필요.
// 이 스토리는 disabled prop 동작 확인용으로 컴포넌트 내부 eligibility 로직을 통과한 경우를 가정.
// 실제 "이미 신고함" 상태는 localStorage에 `report:hidden` 키로 `["course:course-1"]` 저장 시 재현.
export const AlreadyReported: Story = {
  name: '이미 신고함 (disabled)',
  decorators: [
    (Story) => {
      // localStorage에 직접 세팅하여 has() 반환값을 true로 만듦
      if (typeof window !== 'undefined') {
        localStorage.setItem('report:hidden', JSON.stringify(['course:course-1']));
      }
      return <Story />;
    },
  ],
  args: {
    target: courseTarget,
    currentUser: loggedInUser,
  },
};
