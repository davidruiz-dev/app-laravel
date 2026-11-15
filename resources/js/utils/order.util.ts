import { OrderStatus } from "@/features/Orders/types/order.types";

export const orderStatusTypeLabels = {
    [OrderStatus.PENDING]: 'pendiente',
    [OrderStatus.IN_PROGRESS]: 'en preparación',
    [OrderStatus.READY]: 'listo',
    [OrderStatus.DELIVERED]: 'entregado',
    [OrderStatus.CANCELLED]: 'cancelado',
} as const