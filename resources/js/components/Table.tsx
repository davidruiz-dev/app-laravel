
import { Link } from "@inertiajs/react";
import * as React from "react";
import Button from "./Button";
import { ChevronLeft, ChevronRight } from "lucide-react";

type TableProps = React.ComponentProps<"table">;
type TableSectionProps = React.ComponentProps<"thead">;
type TableBodyProps = React.ComponentProps<"tbody">;
type TableRowProps = React.ComponentProps<"tr">;
type TableHeadProps = React.ComponentProps<"th">;
type TableCellProps = React.ComponentProps<"td">;

export function Table({ className = "", ...props }: TableProps) {
    return (
        <div className="overflow-x-auto rounded-xl border border-border shadow-sm">
            <table
                className={`w-full text-left text-sm`}
                {...props}
            />
        </div>
    );
}

export function TableHeader({
    className = "",
    ...props
}: TableSectionProps) {
    return (
        <thead
            className={`border-b border-border bg-background/50 text-xs tracking-wider ${className}`}
            {...props}
        />
    );
}

export function TableBody({
    className = "",
    ...props
}: TableBodyProps) {
    return (
        <tbody
            className={`[&_tr:last-child]:border-0 ${className} divide-y divide-border`}
            {...props}
        />
    );
}

export function TableRow({
    className = "",
    ...props
}: TableRowProps) {
    return (
        <tr
            className={`group bg-transparent transition-colors hover:bg-background  `}
            {...props}
        />
    );
}

export function TableHead({
    className = "",
    ...props
}: TableHeadProps) {
    return (
        <th
            className={`${className} px-3 py-3.5 bg-gray-100/60 dark:bg-background/50`}
            {...props}
        />
    );
}

export function TableCell({
    className = "",
    ...props
}: TableCellProps) {
    return (
        <td
            className={`p-3 font-medium whitespace-nowrap first-letter:uppercase ${className}`}
            {...props}
        />
    );
}


