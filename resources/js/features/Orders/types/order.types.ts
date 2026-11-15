import { Customer } from "@/features/customers/types/customer.types";
import { Payment } from "./expense.types";
import { Product, ProductVariant } from "@/features/Products/types/product.type";

export const OrderStatus = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  READY: 'ready',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export type DeliveryType = 'delivery' | 'pickup';
export type DeliveryShift = 'morning' | 'afternoon';

export interface Order {
  id: number;
  customer_id: number;
  customer?: Customer;
  status: OrderStatus

  order_date: string;
  delivery_shift: DeliveryShift;
  delivery_type: DeliveryType;
  delivery_address: string;
  delivered_at: string;

  subtotal: number;
  discount: number;
  total: number;

  items: OrderItem[];
  payments: Payment[];

  created_at: string;
  updated_at: string
}
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export interface OrderItem {
  id: number;
  product?: Product;
  variant_id: number;
  variant?: ProductVariant;
  product_variant?: ProductVariant;
  product_name: string;
  variant_name: string;
  quantity: number;
  unit_price: string
  line_total: number;
  details: string;
  reference_image_url: string;
  reference_image_public_id: string;
}

export interface OrdersOverview {
  total_in_progress: number;
  total_completed: number;
  total_cancelled: number;
  total_pending: number;
  total_delivered: number;
}

// Forms
export type PaymentMethod = "yape" | "plin" | "transferencia" | "efectivo" | "otro";

export interface OrderItemFormData {
    id?: number;
    _key: string;
    product_id: number | null; // Solo frontend
    variant_id: number | null;
    quantity: number;
    unit_price: string | number;
    line_total: string | number; // Solo cálculo frontend
    details: string;
    image: File | null;
    image_url: string | null;
    remove_image: boolean;
}
export type OrderPaymentFormData = {
  amount: string;
  method: PaymentMethod;
  paid_at: string;
};

export type NewCustomerFormData = {
  full_name: string;
  phone: string;
} | null;

export type OrderFormData = {
  customer_id: string;

  order_date: string;
  delivery_shift: DeliveryShift;
  delivery_type: DeliveryType;
  delivery_address: string;
  delivered_at: string;

  subtotal: number;
  discount: number;
  total: number;

  items: OrderItemFormData[];
  // Solo pagos nuevos que se registrarán al crear/actualizar el pedido.
  payments: OrderPaymentFormData[];
  customer: NewCustomerFormData;
};