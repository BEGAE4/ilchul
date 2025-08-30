import type { Meta, StoryObj } from "@storybook/react";
import Button from "./Button";

const meta: Meta<typeof Button> = {
	title: "Components/Button",
	component: Button,
	args: {
		children: "버튼",
		variant: "primary",
		size: "large",
	},
	argTypes: {
		variant: { control: { type: "radio" }, options: ["primary", "outlined", "secondary"] },
		size: { control: { type: "radio" }, options: ["large", "small"] },
		onClick: { action: "clicked" },
	},
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {};

export const Outlined: Story = {
	args: { variant: "outlined" },
};

export const Secondary: Story = {
	args: { variant: "secondary" },
};

export const Small: Story = {
	args: { size: "small" },
};


