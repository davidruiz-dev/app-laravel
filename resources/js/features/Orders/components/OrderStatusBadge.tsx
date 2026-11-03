import { OrderStatus } from "../types/order.types";

const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string }> = {
    [OrderStatus.PENDING]: {
        label: 'Pendiente',
        className: 'bg-amber-100 text-amber-800 ring-amber-600/20',
    },
    [OrderStatus.IN_PROGRESS]: {
        label: 'En preparación',
        className: 'bg-blue-100 text-blue-800 ring-blue-600/20',
    },
    [OrderStatus.COMPLETED]: {
        label: 'Completado',
        className: 'bg-emerald-100 text-emerald-800 ring-emerald-600/20',
    },
    [OrderStatus.DELIVERED]: {
        label: 'Entregado',
        className: 'bg-gray-100 text-gray-700 ring-gray-500/20',
    },
    [OrderStatus.CANCELLED]: {
        label: 'Cancelado',
        className: 'bg-red-100 text-red-800 ring-red-600/20',
    },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
    const config = STATUS_CONFIG[status];

    if (!config) return null;

    return (
        <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${config.className}`}
        >
            {config.label}
        </span>
    );
}