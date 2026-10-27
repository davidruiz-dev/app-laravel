import { OrderStatus } from "@/features/Orders/types/order.types";

export const orderStatusTypeLabels = {
    [OrderStatus.PENDING]: 'pendiente',
    [OrderStatus.IN_PROGRESS]: 'en progreso',
    [OrderStatus.COMPLETED]: 'completado',
    [OrderStatus.DELIVERED]: 'entregado',
    [OrderStatus.CANCELLED]: 'cancelado',
} as const