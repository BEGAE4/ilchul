import React from "react";
import { ButtonProps } from "./types";
import styles from "./style.module.scss";

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "large",
  children,
  className = "",
  ...rest
}) => {
  return (
    <button
      className={`${styles.button} ${styles[variant]} ${styles[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
