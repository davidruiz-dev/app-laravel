
import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant =
    | "default"
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "secondary"
    | "outline";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: BadgeVariant;
    size?: "sm" | "md";
}

const variants: Record<BadgeVariant, string> = {
    default: "bg-gray-900 text-white",
    success: "bg-green-100 text-green-700",
    warning: "bg-yellow-100 text-yellow-700",
    danger: "bg-red-100 text-red-700",
    info: "bg-blue-100 text-blue-700",
    secondary: "bg-gray-100 text-gray-600",
    outline: "border border-gray-300 text-gray-700 bg-transparent",
};

const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
};

export default function Badge({
    children,
    variant = "default",
    size = "md",
    className,
    ...props
}: BadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center justify-center rounded-full font-medium whitespace-nowrap",
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {children}
        </span>
    );
}
