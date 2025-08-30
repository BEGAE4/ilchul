import type { Meta, StoryObj } from "@storybook/react";
import Header from "./Header";
import { Bell, ArrowLeft, MoreVertical } from "lucide-react";

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
		leftIcon: <ArrowLeft size={24} strokeWidth={2.2} className="text-gray-700" />,
		rightIcon: <MoreVertical size={24} strokeWidth={2.2} className="text-gray-700" />,
	},
};

export const WithCustomRightIcon: Story = {
	args: {
		rightIcon: <Bell size={22} className="text-gray-700" />,
	},
};


