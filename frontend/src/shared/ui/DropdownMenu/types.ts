import React from "react";

export interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  divider?: boolean;
}

export interface DropdownMenuProps {
  items: MenuItem[];
  trigger?: React.ReactNode;
  triggerType?: "button" | "select" | "custom";
  placement?: "top" | "bottom" | "left" | "right";
  width?: "auto" | "sm" | "md" | "lg" | "full";
  variant?: "default" | "minimal" | "card";
  className?: string;
  onOpenChange?: (isOpen: boolean) => void;
  closeOnSelect?: boolean;
  closeOnClickOutside?: boolean;
}
