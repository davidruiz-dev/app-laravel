import { ReactNode } from 'react'

interface AlertProps {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'destructive' | 'ghost'
    className?: string
}

export default function Alert({ children, variant = 'primary', className }: AlertProps) {
    const variants = {
        primary: 'bg-background border border-border text-white',
        secondary: 'bg-secondary text-white border border-border',
        destructive: 'bg-destructive text-white',
        ghost: 'bg-transparent text-foreground border border-border',
    };
    return (
        <div className={`p-3 rounded-md ${variants[variant]} ${className}`}>
            {children}
        </div>
    )
}
