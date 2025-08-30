import type { Meta, StoryObj } from "@storybook/react";
import DropdownMenu from "./DropdownMenu";
import { type MenuItem } from "./types";
import { Settings, LogOut, User } from "lucide-react";

const items: MenuItem[] = [
	{ id: "profile", label: "프로필", icon: <User className="w-4 h-4" /> },
	{ id: "settings", label: "설정", icon: <Settings className="w-4 h-4" /> },
	{ id: "divider-1", label: "", divider: true },
	{ id: "logout", label: "로그아웃", icon: <LogOut className="w-4 h-4" /> },
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


