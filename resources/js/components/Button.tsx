import type { ButtonHTMLAttributes } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
};

export default function Button({
    variant = 'primary',
    size = 'md',
    className = '',
    children,
    ...props
}: ButtonProps) {
    const variants = {
        primary: 'bg-primary text-white hover:bg-primary/80',
        secondary: 'bg-secondary text-white border border-border',
        danger: 'bg-destructive text-white hover:bg-danger-dark',
        ghost: 'bg-transparent text-foreground border border-border',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-5 py-2.5 text-base',
    };

    return (
        <button
            {...props}
            className={`
                inline-flex items-center justify-center cursor-pointer
                rounded-md font-medium
                transition-colors
                disabled:pointer-events-none disabled:opacity-50 gap-2 text-nowrap
                ${variants[variant]}
                ${sizes[size]}
                ${className}
            `}
        >
            {children}
        </button>
    );
}
