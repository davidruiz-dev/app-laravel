import { Category } from "@/features/Categories/types/category.types";
import { Customer } from "@/features/customers/types/customer.types";
import OrderForm from "@/features/Orders/components/OrderForm";
import { Order } from "@/features/Orders/types/order.types";
import Layout from "@/layouts/Layout";

interface Props {
    customers: Customer[];
    categories: Category[];
    filters: {
        search?: string;
    };
    order: Order
}

export default function Update({ customers, categories, filters, order }: Props) {
    return (
        <Layout title="Actualizar pedido">
            <div className="w-full space-y-4">
                <div>
                    <h1 className="text-3xl font-semibold">Editar pedido</h1>
                    <p className="text-muted">Completa los datos requeridos para crear un nuevo pedido.</p>
                </div>
                <OrderForm 
                    customers={customers} 
                    categories={categories} 
                    search={filters.search ?? ''} 
                    order={order}
                />
            </div>
        </Layout>
    )
}
