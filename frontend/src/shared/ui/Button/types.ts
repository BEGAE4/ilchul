import React from "react";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outlined" | "secondary";
  size?: "large" | "small";
  children: React.ReactNode;
};
