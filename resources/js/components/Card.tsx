import { ReactNode, ComponentPropsWithoutRef } from "react";

type CardProps = ComponentPropsWithoutRef<"div">;
type CardTitleProps = ComponentPropsWithoutRef<"h3">;

export const Card = ({ children, ...props }: CardProps) => {
    return (
        <div
            {...props}
            className={`rounded-lg bg-surface border border-border shadow-sm ${props.className ?? ""}`}
        >
            {children}
        </div>
    );
};

export const CardHeader = ({ children, ...props }: CardProps) => {
    return (
        <div
            {...props}
            className={`px-5 py-4 border-b border-border ${props.className ?? ""}`}
        >
            {children}
        </div>
    );
};

export const CardTitle = ({ children, ...props }: CardTitleProps) => {
    return (
        <h3
            {...props}
            className={`text-md font-semibold text-foreground ${props.className ?? ""}`}
        >
            {children}
        </h3>
    );
};

export const CardContent = ({ children, ...props }: CardProps) => {
    return (
        <div
            {...props}
            className={`p-5 ${props.className ?? ""}`}
        >
            {children}
        </div>
    );
};

export const CardFooter = ({ children, ...props }: CardProps) => {
    return (
        <div
            {...props}
            className={`p-5 border-t border-border ${props.className ?? ""}`}
        >
            {children}
        </div>
    );
};