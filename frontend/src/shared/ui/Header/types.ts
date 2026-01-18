import React from "react";

export type HeaderProps = {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  center?: React.ReactNode;
  onLeftClick?: () => void;
  onRightClick?: () => void;
  className?: string;
};
