import type { Meta, StoryObj } from "@storybook/react";
import Header from "./component";
import IconBox from "../IconBox";

const meta: Meta<typeof Header> = {
	title: "Components/Header",
	component: Header,
	args: {
		center: <span className="font-semibold">헤더 타이틀</span>,
	},
	argTypes: {
		onLeftClick: { action: "left-click" },
		onRightClick: { action: "right-click" },
	},
};

export default meta;
type Story = StoryObj<typeof Header>;

export const Default: Story = {};

export const WithIcons: Story = {
	args: {
		leftIcon: <IconBox name="arrow-left" size={24} className="text-gray-700" />,
		rightIcon: <IconBox name="more-vertical" size={24} className="text-gray-700" />,
	},
};

export const WithCustomRightIcon: Story = {
	args: {
		rightIcon: <IconBox name="heart" size={22} className="text-gray-700" />,
	},
};


