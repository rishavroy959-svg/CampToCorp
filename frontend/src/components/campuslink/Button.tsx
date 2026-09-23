import React from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive" | "outline";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "left",
  isLoading = false,
  className = "",
  disabled,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer";

  const sizeStyles = {
    sm: "text-xs px-3 py-1.5 rounded-lg gap-1.5",
    md: "text-sm px-4 py-2 rounded-button gap-2",
    lg: "text-base px-6 py-2.5 rounded-button gap-2.5 font-semibold",
  }[size];

  const variantStyles = {
    primary:
      "bg-campus-primary text-white hover:bg-campus-primary-hover focus:ring-campus-primary shadow-xs hover:shadow-sm",
    secondary:
      "bg-slate-100 text-campus-primary hover:bg-slate-200/80 focus:ring-campus-primary border border-slate-200",
    outline:
      "bg-transparent text-campus-primary border border-campus-border hover:bg-slate-50 focus:ring-campus-primary",
    ghost:
      "bg-transparent text-campus-text-secondary hover:text-campus-text-primary hover:bg-slate-100 focus:ring-slate-400",
    destructive:
      "bg-campus-danger text-white hover:bg-red-700 focus:ring-red-600 shadow-xs",
  }[variant];

  return (
    <button
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {icon && iconPosition === "left" && icon}
          {children}
          {icon && iconPosition === "right" && icon}
        </>
      )}
    </button>
  );
};
