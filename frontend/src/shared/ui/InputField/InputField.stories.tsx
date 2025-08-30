import type { Meta, StoryObj } from "@storybook/react";
import InputField from "./InputField";

const meta: Meta<typeof InputField> = {
	title: "Components/InputField",
	component: InputField,
	args: {
		label: "라벨",
		placeholder: "입력하세요",
		status: "default",
		statusMessage: "",
	},
	argTypes: {
		status: { control: { type: "radio" }, options: ["default", "success", "error"] },
		onChange: { action: "changed" },
	},
};

export default meta;
type Story = StoryObj<typeof InputField>;

export const Default: Story = {};

export const Success: Story = {
	args: { status: "success", statusMessage: "정상입니다." },
};

export const Error: Story = {
	args: { status: "error", statusMessage: "오류가 발생했습니다." },
};


