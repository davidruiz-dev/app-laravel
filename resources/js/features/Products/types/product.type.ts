import { Category } from "@/features/Categories/types/category.types";

export type PricingType = 'fixed' | 'variant' | 'custom';

export type Product = {
    id: number;
    category_id: number;
    category?: Category;
    name: string;
    description: string | null;
    image_url: string | null;
    is_active: boolean;
    is_customizable: boolean,
    variants: ProductVariant[];
};

export type ProductVariant = {
    id: number;
    product_id: number;
    product: Product;
    attributes: Record<string, string> | null;
    price: string | null;
    created_at: string;
    updated_at: string;
}

export type VariantRow = { 
    values: string[]; 
    price: string; 
};

export type ProductFormData = {
    category_id: string;
    name: string;
    description: string;
    image: File | null;
    is_active: boolean;
    attributes: string[];
    variants: VariantRow[];
    is_customizable: boolean;
};