// resources/js/Components/TablePagination.tsx
import { Paginated } from '@/types';
import { Link, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';


interface Props<T> {
    paginator: Paginated<T>;
    /** Query string extra que quieras preservar (filtros, orden, búsqueda...) */
    filters?: Record<string, string | number | undefined>;
    /** Opciones de tamaño de página */
    perPageOptions?: number[];
    onPerPageChange?: (perPage: number) => void;
}

export default function TablePagination<T>({
    paginator,
    filters = {},
    perPageOptions = [10, 25, 50, 100],
    onPerPageChange,
}: Props<T>) {
    const { from, to, total, current_page, last_page, prev_page_url, next_page_url, per_page } = paginator;

    if (total === 0) return null;

    // Construye URL preservando filtros
    const buildUrl = (url: string) => {
        const u = new URL(url, window.location.origin);
        Object.entries(filters).forEach(([k, v]) => {
            if (v !== undefined && v !== '') u.searchParams.set(k, String(v));
        });
        return u.pathname + u.search;
    };

    // Páginas a mostrar (con elipsis)
    const pageNumbers = buildPageNumbers(current_page, last_page);

    return (
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <div className="flex items-center gap-8 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
                {/* Info + per page */}
                {onPerPageChange && (
                    <div className="flex items-center gap-2">
                        <span className="hidden md:block text-sm text-gray-600 dark:text-gray-400">Filas por página:</span>
                        <select
                            value={String(per_page)}
                            onChange={(e) => onPerPageChange(Number(e.target.value))}
                            className="rounded-md p-1 border border-border outline-none"
                        >
                            {perPageOptions.map((opt) => (
                                <option key={opt} value={String(opt)}>
                                    {opt}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
                <span>
                    Mostrando <span className="font-medium">{from ?? 0}</span> - {' '}
                    <span className="font-medium">{to ?? 0}</span> de{' '}
                    <span className="font-medium">{total}</span> resultados
                </span>
            </div>

            {/* Navegación */}
            <nav className="flex items-center gap-1" aria-label="Pagination">
                <PageLink
                    href={prev_page_url ? buildUrl(prev_page_url) : null}
                    label="Anterior"
                    icon={<ChevronLeft className="h-4 w-4" />}
                />

                {pageNumbers.map((p, i) =>
                    p === '...' ? (
                        <span
                            key={`ellipsis-${i}`}
                            className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400"
                        >
                            …
                        </span>
                    ) : (
                        <Link
                            key={p}
                            href={buildUrl(
                                // reconstruye URL con ?page=p
                                `${window.location.pathname}?page=${p}`,
                            )}
                            preserveScroll
                            preserveState
                            className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${p === current_page
                                ? 'bg-primary text-white'
                                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                                }`}
                        >
                            {p}
                        </Link>
                    ),
                )}

                <PageLink
                    href={next_page_url ? buildUrl(next_page_url) : null}
                    label="Siguiente"
                    icon={<ChevronRight className="h-4 w-4" />}
                    iconRight
                />
            </nav>
        </div>
    );
}

/* Subcomponente para prev/next */
function PageLink({
    href,
    label,
    icon,
    iconRight = false,
}: {
    href: string | null;
    label: string;
    icon: React.ReactNode;
    iconRight?: boolean;
}) {
    const classes = `inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition ${href
        ? 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
        : 'cursor-not-allowed text-gray-300 dark:text-gray-600'
        }`;

    if (!href) {
        return (
            <span className={classes} aria-disabled="true">
                {!iconRight && icon}
                <span className="hidden sm:inline">{label}</span>
                {iconRight && icon}
            </span>
        );
    }

    return (
        <Link href={href} preserveScroll preserveState className={classes}>
            {!iconRight && icon}
            <span className="hidden sm:inline">{label}</span>
            {iconRight && icon}
        </Link>
    );
}

/* Lógica de elipsis estilo Laravel */
function buildPageNumbers(current: number, last: number): (number | '...')[] {
    if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1);

    const pages: (number | '...')[] = [];
    const delta = 1;

    if (current <= 3) {
        pages.push(1, 2, 3, 4, '...', last);
    } else if (current >= last - 2) {
        pages.push(1, '...', last - 3, last - 2, last - 1, last);
    } else {
        pages.push(1, '...', current - delta, current, current + delta, '...', last);
    }
    return pages;
}