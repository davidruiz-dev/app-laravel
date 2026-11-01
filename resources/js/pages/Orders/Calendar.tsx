import Button from "@/components/Button";
import { Order } from "@/features/Orders/types/order.types";
import Layout from "@/layouts/Layout";
import { Link, router } from "@inertiajs/react";
import {
    ChevronLeft,
    ChevronRight,
    CalendarDays,
    Clock3,
} from "lucide-react";


type CalendarView = "month" | "week" | "day";

interface Props {
    orders: Order[];
    selectedDate: string;
    calendarView: CalendarView;
}

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const statusStyles: Record<string, string> = {
    pending: "bg-blue-50 text-blue-700 border-blue-200",
    "in_progress": "bg-amber-50 text-amber-700 border-amber-200",
    completed: "bg-green-50 text-green-700 border-green-200",
    cancelled: "bg-red-50 text-red-700 border-red-200",
};

function parseDate(value: string) {
    const [year, month, day] = value.slice(0, 10).split("-").map(Number);
    return new Date(year, month - 1, day);
}

function formatDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function getMonthDays(date: Date) {
    const first = new Date(date.getFullYear(), date.getMonth(), 1);
    const start = new Date(first);

    // La semana empieza el lunes.
    start.setDate(first.getDate() - ((first.getDay() + 6) % 7));

    return Array.from({ length: 42 }, (_, index) => {
        const day = new Date(start);
        day.setDate(start.getDate() + index);
        return day;
    });
}

function getWeekDays(date: Date) {
    const start = new Date(date);
    start.setDate(date.getDate() - ((date.getDay() + 6) % 7));

    return Array.from({ length: 7 }, (_, index) => {
        const day = new Date(start);
        day.setDate(start.getDate() + index);
        return day;
    });
}

function formatMonth(date: Date) {
    return new Intl.DateTimeFormat("es-PE", {
        month: "long",
        year: "numeric",
    }).format(date);
}

function formatLongDate(date: Date) {
    return new Intl.DateTimeFormat("es-PE", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(date);
}

export default function Calendar({
    orders,
    selectedDate,
    calendarView,
}: Props) {
    const selected = parseDate(selectedDate);

    const days =
        calendarView === "month"
            ? getMonthDays(selected)
            : calendarView === "week"
                ? getWeekDays(selected)
                : [selected];

    const ordersByDate = orders.reduce<Record<string, Order[]>>(
        (groups, order) => {
            const key = order.date.slice(0, 10);
            (groups[key] ??= []).push(order);
            return groups;
        },
        {},
    );

    function navigate(date: Date, view = calendarView) {
        router.get(
            "/calendar",
            {
                date: formatDate(date),
                view,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    }

    function changePeriod(direction: number) {
        const next = new Date(selected);

        if (calendarView === "month") {
            next.setDate(1);
            next.setMonth(next.getMonth() + direction);
        } else if (calendarView === "week") {
            next.setDate(next.getDate() + direction * 7);
        } else {
            next.setDate(next.getDate() + direction);
        }

        navigate(next);
    }

    function renderOrder(order: Order) {
        const style =
            statusStyles[order.status] ??
            "bg-slate-50 text-slate-700 border-slate-200";

        return (
            <Link href={`/orders/${order.id}`}>
                <a
                    key={order.id}
                    className={`block truncate cursor-pointer rounded-md border px-2 py-1 text-xs font-medium transition-opacity hover:opacity-75 ${style}`}
                    title={`Pedido #${order.id} — ${order.status}`}
                >
                    <span className="font-semibold">{order.items.map((item) => (
                        <div>
                            {item.quantity}x {item.name}
                        </div>
                    ))}</span>
                    {order.customer?.full_name && (
                        <span className="ml-1">
                            {order.customer.full_name}
                        </span>
                    )}
                </a>
            </Link>
        );
    }

    return (
        <Layout title="Calendario">
            <div className="space-y-5">
                {/* Cabecera */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-semibold">
                            Calendario de pedidos
                        </h1>
                        <p className="mt-1 text-muted">
                            Organiza y consulta tus pedidos por fecha.
                        </p>
                    </div>


                </div>

                {/* Navegación y vistas */}
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            variant="ghost"
                            onClick={() => navigate(new Date())}
                        >
                            Hoy
                        </Button>

                        <div className="flex items-center gap-1">
                            <Button
                                onClick={() => changePeriod(-1)}
                                aria-label="Periodo anterior"
                            >
                                <ChevronLeft size={18} />
                            </Button>

                            <Button
                                onClick={() => changePeriod(1)}
                                aria-label="Periodo siguiente"
                            >
                                <ChevronRight size={18} />
                            </Button>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold capitalize">
                        {calendarView === "day"
                            ? formatLongDate(selected)
                            : formatMonth(selected)}
                    </h2>

                    <div className="flex rounded-lg border border-border p-1">
                        {(
                            [
                                ["month", "Mes"],
                                ["week", "Semana"],
                                ["day", "Día"],
                            ] as const
                        ).map(([view, label]) => (
                            <button
                                key={view}
                                onClick={() => navigate(selected, view)}
                                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${calendarView === view
                                    ? "bg-foreground text-white dark:text-black"
                                    : "text-muted hover:bg-background"
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Calendario */}
                <div className="overflow-x-auto min-w-250 rounded border border-border bg-background">
                    {calendarView !== "day" && (
                        <div className="grid grid-cols-7 border-b border-border">
                            {WEEKDAYS.map((day) => (
                                <div
                                    key={day}
                                    className="py-3 text-center text-xs font-semibold text-foreground sm:text-sm"
                                >
                                    {day}
                                </div>
                            ))}
                        </div>
                    )}

                    <div
                        className={
                            calendarView === "month"
                                ? "grid grid-cols-7"
                                : calendarView === "week"
                                    ? "grid grid-cols-7"
                                    : "grid grid-cols-1"
                        }
                    >
                        {days.map((day, index) => {
                            const key = formatDate(day);
                            const dayOrders = ordersByDate[key] ?? [];
                            const isToday = key === formatDate(new Date());
                            const isCurrentMonth =
                                day.getMonth() === selected.getMonth();

                            return (
                                <div
                                    key={key}
                                    className={`min-w-0  ${isToday ? 'border-2 border-blue-300' : 'border-b border-r border-border'} ${calendarView === "month"
                                        ? "min-h-24 p-1 sm:min-h-32 sm:p-2"
                                        : "min-h-36 p-2 sm:p-3"
                                        } ${calendarView === "month" &&
                                            !isCurrentMonth
                                            ? "bg-surface"
                                            : "bg-background"
                                        }`}
                                >
                                    <button
                                        onClick={() => navigate(day, "day")}
                                        className={`mb-2 flex size-7 items-center justify-center rounded-full text-xs font-medium ${isToday
                                            ? "bg-foreground text-surface"
                                            : isCurrentMonth ||
                                                calendarView !== "month"
                                                ? "text-foreground hover:bg-surface"
                                                : "text-surface"
                                            }`}
                                        title="Ver pedidos de este día"
                                    >
                                        {day.getDate()}
                                    </button>

                                    <div className="space-y-1">
                                        {dayOrders
                                            .slice(
                                                0,
                                                calendarView === "month" ? 3 : 50,
                                            )
                                            .map(renderOrder)}

                                        {dayOrders.length > 3 &&
                                            calendarView === "month" && (
                                                <button
                                                    onClick={() =>
                                                        navigate(day, "day")
                                                    }
                                                    className="text-xs font-medium text-slate-500 hover:text-slate-900"
                                                >
                                                    +{dayOrders.length - 3} más
                                                </button>
                                            )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Leyenda */}
                <div className="flex flex-wrap gap-4">
                    {[
                        ["pending", "Pendiente"],
                        ["in_progress", "En producción"],
                        ["completed", "Completado"],
                        ["cancelled", "Cancelado"],
                    ].map(([status, label]) => (
                        <div key={status} className="flex items-center gap-2">
                            <span
                                className={`size-2.5 rounded-full ${status === "pending"
                                    ? "bg-blue-500"
                                    : status === "in_progress"
                                        ? "bg-amber-500"
                                        : status === "completed"
                                            ? "bg-green-500"
                                            : "bg-red-500"
                                    }`}
                            />
                            <span className="text-xs">
                                {label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    );
}