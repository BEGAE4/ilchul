import type { Meta, StoryObj } from "@storybook/react";
import TabBar from "./component";

const meta: Meta<typeof TabBar> = {
	title: "Components/TabBar",
	component: TabBar,
	parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof TabBar>;

export const Default: Story = {};


