import type { ReactNode } from "react";

const variantClasses = {
  primary: "bg-primary text-white hover:bg-primary-dark",
  danger: "bg-danger text-white hover:opacity-90",
  outline: "border border-border text-text hover:border-primary",
};

export default function Button({
  children,
  onClick,
  variant = "primary",
  type = "button",
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "danger" | "outline";
  type?: "button" | "submit";
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`px-5 py-3 text-base transition-colors ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
