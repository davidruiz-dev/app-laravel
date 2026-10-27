import { Order } from "@/features/Orders/types/order.types";

export interface Customer {
    id: number;
    full_name: string;
    email?: string;
    social_network?: string;
    phone: string;
    orders_count?: number;
    orders: Order[] | null;
    last_order: string;
    created_at: string;
    updated_at: string;
}
