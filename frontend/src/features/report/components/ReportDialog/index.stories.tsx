import type { Meta, StoryObj } from '@storybook/react';
import { ReportDialog } from './component';
import type { ReportResponse, ReportTarget } from '../../types';

const courseTarget: ReportTarget = {
  type: 'course',
  id: 'course-1',
  ownerId: '다른유저',
  title: '제주 힐링 여행 3일 코스',
  contextUrl: '/course/course-1',
};

const commentTarget: ReportTarget = {
  type: 'comment',
  id: 'comment-1',
  ownerId: '다른유저',
  courseId: 'course-1',
  snippet: '이 플랜 정말 좋네요! 다음에 꼭 가봐야겠어요.',
  contextUrl: '/course/course-1#comment-comment-1',
};

const userTarget: ReportTarget = {
  type: 'user',
  id: 'user-1',
  ownerId: '다른유저',
  nickname: '다른유저',
  contextUrl: '/profile/user-1',
};

// MSW 없이 onSubmit 람다로 모킹 (계획서 §12-1, Critic M-5)
const mockSubmitSuccess = async (): Promise<ReportResponse> => ({
  reportId: 'mock-report-1',
  status: 'PENDING',
  alreadyReported: false,
});

const mockSubmitAlreadyReported = async (): Promise<ReportResponse> => ({
  alreadyReported: true,
});

const mockSubmitError = async (): Promise<ReportResponse> => {
  const err = Object.assign(new Error('server error'), { response: { status: 500 } });
  throw err;
};

const meta: Meta<typeof ReportDialog> = {
  title: 'Features/Report/ReportDialog',
  component: ReportDialog,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    isOpen: true,
    target: courseTarget,
    isSubmitting: false,
    onSubmit: mockSubmitSuccess,
    onClose: () => {},
    onSubmitted: () => {},
    onHideContent: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof ReportDialog>;

// 플랜 신고 — Step 1
export const CoursePlan: Story = {
  args: {
    target: courseTarget,
    onSubmit: mockSubmitSuccess,
  },
};

// 댓글 신고 — 사유 목록이 달라짐
export const Comment: Story = {
  args: {
    target: commentTarget,
    onSubmit: mockSubmitSuccess,
  },
};

// 사용자 신고
export const User: Story = {
  args: {
    target: userTarget,
    onSubmit: mockSubmitSuccess,
  },
};

// 제출 중 (로딩 상태)
export const Submitting: Story = {
  args: {
    target: courseTarget,
    isSubmitting: true,
    onSubmit: mockSubmitSuccess,
  },
};

// 이미 신고한 경우 — 제출 시 toast 후 닫힘
export const AlreadyReported: Story = {
  args: {
    target: courseTarget,
    onSubmit: mockSubmitAlreadyReported,
  },
};

// 서버 에러 케이스
export const ServerError: Story = {
  args: {
    target: courseTarget,
    onSubmit: mockSubmitError,
  },
};

// Step 2 진입 시뮬레이션:
// onSubmit이 성공을 반환하면 실제 사용 시 Step 2로 전환됨.
// Storybook에서는 CoursePlan 스토리에서 사유 선택 후 "신고하기" 클릭으로 확인.
export const Step2Preview: Story = {
  name: 'Step 2 (완료 뷰) — 제출 후 자동 전환',
  args: {
    target: courseTarget,
    onSubmit: mockSubmitSuccess,
  },
};
