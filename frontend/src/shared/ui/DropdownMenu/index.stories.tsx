import type { Meta, StoryObj } from "@storybook/react";
import DropdownMenu from "./component";
import { type MenuItem } from "./types";
import IconBox from "../IconBox";

const items: MenuItem[] = [
	{ id: "profile", label: "프로필", icon: <IconBox name="user-plus" size={16} /> },
	{ id: "settings", label: "설정", icon: <IconBox name="search" size={16} /> },
	{ id: "divider-1", label: "", divider: true },
	{ id: "logout", label: "로그아웃", icon: <IconBox name="heart" size={16} /> },
];

const meta: Meta<typeof DropdownMenu> = {
	title: "Components/DropdownMenu",
	component: DropdownMenu,
	args: {
		items,
		triggerType: "button",
		placement: "bottom",
		variant: "default",
		width: "auto",
	},
	argTypes: {
		triggerType: { control: { type: "radio" }, options: ["button", "select", "custom"] },
		placement: { control: { type: "radio" }, options: ["top", "bottom", "left", "right"] },
		variant: { control: { type: "radio" }, options: ["default", "minimal", "card"] },
		width: { control: { type: "radio" }, options: ["auto", "sm", "md", "lg", "full"] },
		onOpenChange: { action: "open-change" },
	},
};

export default meta;
type Story = StoryObj<typeof DropdownMenu>;

export const Default: Story = {};

export const AsSelect: Story = {
	args: { triggerType: "select", width: "sm" },
};


