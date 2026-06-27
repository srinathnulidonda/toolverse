// components/ui/Button.tsx
import React from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    icon?: React.ReactNode;
}

export default function Button({
    variant = "primary",
    size = "md",
    icon,
    children,
    className = "",
    ...props
}: ButtonProps) {
    return (
        <button className={`btn btn-${variant} btn-${size} ${className}`} {...props}>
            {icon && <span className="btn-icon">{icon}</span>}
            {children}
        </button>
    );
}