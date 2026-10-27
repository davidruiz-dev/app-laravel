import { Category } from "@/features/Categories/types/category.types";
import { Customer } from "@/features/customers/types/customer.types";
import { Payment } from "@/types";

export const OrderStatus = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;


export interface  Order {
    id: number;
    customer_id: number;
    customer?: Customer;
    total: number;
    status: OrderStatus
    date: string;
    shift: string;
    items: OrderItem[];
    payments: Payment[];
}
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export interface OrderItem {
    id: number;
    category_id: string;
    category: Category;
    name: string;
    description: string;
    quantity: number;
    subtotal: number;
    customization: string;
    image_url: string;
    image_public_id: string;
}

export interface OrdersOverview {
    total_in_progress: number;
    total_completed: number;
    total_cancelled: number;
    total_pending: number;
}