
import { Link } from "@inertiajs/react";
import * as React from "react";
import Button from "./Button";

type TableProps = React.ComponentProps<"table">;
type TableSectionProps = React.ComponentProps<"thead">;
type TableBodyProps = React.ComponentProps<"tbody">;
type TableRowProps = React.ComponentProps<"tr">;
type TableHeadProps = React.ComponentProps<"th">;
type TableCellProps = React.ComponentProps<"td">;

export function Table({ className = "", ...props }: TableProps) {
    return (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
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
            className={`border-b border-slate-200 bg-slate-50 text-xs tracking-wider text-slate-500 dark:border-neutral-800 dark:bg-neutral-800/60 dark:text-slate-400`}
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
            className={`[&_tr:last-child]:border-0 ${className} divide-y divide-slate-100 dark:divide-neutral-800`}
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
            className={`group bg-white transition-colors hover:bg-slate-50 dark:bg-neutral-900 dark:hover:bg-neutral-800/70`}
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
            className={`${className} px-3 py-3.5 `}
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
            className={`px-3 py-4 font-medium text-slate-900 dark:text-slate-50 whitespace-nowrap first-letter:uppercase ${className}`}
            {...props}
        />
    );
}


type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type Props = {
    links: PaginationLink[];
    last_page: number | null;
    current_page: number | null;
    total: number;
};

export default function TablePagination({
    links,
    last_page,
    current_page,
    total,
}: Props) {
    if (total === 0) {
        return null;
    }

    return (
        <div className="flex flex-col gap-4 sm:flex-row
                        sm:items-center sm:justify-between">
            <p className="text-sm text-muted">
                {total} registros
            </p>

            <nav
                aria-label="Navegación de páginas de la tabla"
                className="flex flex-wrap items-center gap-1"
            >
                {links.map((link, index) => {
                    const label = link.label
                        .replace('&laquo;', '«')
                        .replace('&raquo;', '»')
                        .replace(/<[^>]*>/g, '')
                        .trim();

                    return link.url ? (
                        <Link
                            key={`${link.url}-${index}`}
                            href={link.url}
                            preserveScroll
                            
                            aria-current={
                                link.active ? 'page' : undefined
                            }
                            aria-label={
                                label === '« Previous'
                                    ? 'Página anterior'
                                    : label === 'Next »'
                                        ? 'Página siguiente'
                                        : `Página ${label}`
                            }
                        >
                            <Button
                                variant={link.active ? 'primary' : 'ghost'}
                            >
                                {label}
                            </Button>

                        </Link>
                    ) : (
                        <Button
                            key={`disabled-${index}`}
                            aria-disabled="true"
                            variant="ghost"
                            disabled
                        >
                            {label}
                        </Button>
                    );
                })}
            </nav>
        </div>
    );
}