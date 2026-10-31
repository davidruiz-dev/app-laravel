export type PaymentMethod = 'yape' | 'plin' | 'transferencia' | 'efectivo' |'otro'

export interface Payment {
    id: number;
    amount: number;
    method: PaymentMethod;
    type: string;
    paid_at: string;
    note?: string;
    order_id: number;
    created_at: string;
    updated_at: string;
}

export interface PaymentFormData {
    amount?: number;
    type?: 'advance' | 'balance';
    method?: 'yape' | 'plin' | 'transferencia' | 'efectivo' |'otro';
    paid_at?: string;
    note?: string;
    order_id?: number;
}