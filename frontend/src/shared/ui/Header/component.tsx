import React from "react";
import IconBox from "../IconBox";
import { HeaderProps } from "./types";
import styles from "./styles.module.scss";

const DefaultLeftIcon = () => (
  <IconBox name="arrow-left" size={24} color="rgb(55, 65, 81)" />
);
const DefaultRightIcon = () => (
  <IconBox name="more-vertical" size={24} color="rgb(55, 65, 81)" />
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
