import React from "react";
import { ArrowLeft, MoreVertical } from "lucide-react";
import { HeaderProps } from "./types";
import styles from "./style.module.scss";

const DefaultLeftIcon = () => (
  <ArrowLeft size={24} strokeWidth={2.2} style={{ color: 'rgb(55, 65, 81)' }} />
);
const DefaultRightIcon = () => (
  <MoreVertical size={24} strokeWidth={2.2} style={{ color: 'rgb(55, 65, 81)' }} />
);

const Header: React.FC<HeaderProps> = ({
  leftIcon,
  rightIcon,
  center,
  onLeftClick,
  onRightClick,
  className = "",
}) => {
  return (
    <header
      className={`${styles.header} ${className}`}
    >
      <button
        className={styles.leftButton}
        onClick={onLeftClick}
        aria-label="Left Icon"
        type="button"
      >
        {leftIcon || <DefaultLeftIcon />}
      </button>
      <div className={styles.center}>
        {center}
      </div>
      <button
        className={styles.rightButton}
        onClick={onRightClick}
        aria-label="Right Icon"
        type="button"
      >
        {rightIcon || <DefaultRightIcon />}
      </button>
    </header>
  );
};

export default Header;
