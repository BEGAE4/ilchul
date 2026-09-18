import type { Meta, StoryObj } from '@storybook/nextjs';
import Avatar from './component';

const meta: Meta<typeof Avatar> = {
  title: 'Components/Avatar',
  component: Avatar,
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

const SIZES = [28, 32, 36, 40, 64, 96];

/** 사진이 없을 때 — 코드에서 쓰는 지름 6종 */
export const DefaultSizes: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      {SIZES.map((s) => (
        <Avatar key={s} src={null} alt="프로필" size={s} />
      ))}
    </div>
  ),
};

/** 사진이 있을 때 */
export const WithImage: Story = {
  render: () => (
    <Avatar
      src="https://img1.kakaocdn.net/thumb/R640x640.q70/?fname=http%3A%2F%2Ft1.kakaocdn.net%2Faccount_images%2Fdefault_profile.jpeg"
      alt="프로필"
      size={64}
    />
  ),
};

/** URL 은 있는데 로드가 실패하면 기본 아바타로 떨어진다 */
export const BrokenUrl: Story = {
  render: () => <Avatar src="https://example.invalid/missing.jpg" alt="프로필" size={64} />,
};

/** 마이페이지처럼 흰 테두리·그림자는 감싸는 요소가 준다 */
export const WithRing: Story = {
  render: () => (
    <div className="w-16 h-16 rounded-full border-2 border-white shadow-md overflow-hidden">
      <Avatar src={null} alt="프로필" size={60} />
    </div>
  ),
};
