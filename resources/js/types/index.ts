export type * from './auth';

export interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;

    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
    from: number | null;
    to: number | null;
    total: number;
}

export interface Payment {
    id: number;
    amount: number;
    method: string;
    type: string;
    paid_at: string;
}