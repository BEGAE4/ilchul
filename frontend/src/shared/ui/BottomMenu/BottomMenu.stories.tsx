import type { Meta, StoryObj } from "@storybook/react";
import BottomMenu from "./BottomMenu";
import { type MenuItem } from "./types";
import { Share2, Trash2, Edit } from "lucide-react";
import React, { useState } from "react";

const Template = () => {
	const [open, setOpen] = useState(true);
	const items: MenuItem[] = [
		{ id: "share", label: "공유", icon: <Share2 className="w-6 h-6" />, onClick: () => console.log("share") },
		{ id: "edit", label: "수정", icon: <Edit className="w-6 h-6" />, onClick: () => console.log("edit") },
		{ id: "delete", label: "삭제", icon: <Trash2 className="w-6 h-6" />, onClick: () => console.log("delete") },
	];

	return (
		<div className="h-[60vh] flex items-center justify-center">
			<button className="px-4 py-2 border rounded" onClick={() => setOpen(true)}>메뉴 열기</button>
			<BottomMenu
				items={items}
				isOpen={open}
				title="메뉴"
				onClose={() => setOpen(false)}
				showCloseButton
				showHandle
			/>
		</div>
	);
};

const meta: Meta<typeof BottomMenu> = {
	title: "Components/BottomMenu",
	component: BottomMenu,
	parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof BottomMenu>;

export const Default: Story = {
	render: () => <Template />,
};


