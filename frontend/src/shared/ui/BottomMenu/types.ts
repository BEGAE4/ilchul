import React from "react";

export interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export interface BottomMenuProps {
  items: MenuItem[];
  isOpen: boolean;
  onClose?: () => void;
  title?: string;
  showCloseButton?: boolean;
  showHandle?: boolean;
  className?: string;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}
