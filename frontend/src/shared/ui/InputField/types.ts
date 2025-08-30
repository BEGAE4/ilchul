import React from "react";

export type InputFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  status?: "default" | "success" | "error";
  statusMessage?: string;
  className?: string;
};
