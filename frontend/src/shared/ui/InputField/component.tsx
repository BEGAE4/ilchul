import React from "react";
import { InputFieldProps } from "./types";
import styles from "./styles.module.scss";

const InputField: React.FC<InputFieldProps> = ({
  label,
  status = "default",
  statusMessage = "",
  className = "",
  ...props
}) => {
  return (
    <div className={styles.container}>
      <label className={styles.label}>{label}</label>
      <input
        className={`${styles.input} ${styles[status]} ${className}`}
        {...props}
      />
      {statusMessage && (
        <div className={`${styles.statusMessage} ${styles[`${status}Text`]}`}>
          {statusMessage}
        </div>
      )}
    </div>
  );
};

export default InputField;
