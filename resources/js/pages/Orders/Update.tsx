import { Category } from "@/features/Categories/types/category.types";
import { Customer } from "@/features/customers/types/customer.types";
import OrderForm from "@/features/Orders/components/OrderForm";
import { Order } from "@/features/Orders/types/order.types";
import { Product } from "@/features/Products/types/product.type";
import Layout from "@/layouts/Layout";

interface Props {
    customers: Customer[];
    products: Product[];
    filters: {
        search_customer?: string;
        search_product?: string;
    };
    order: Order
}

export default function Update({ customers, products, filters, order }: Props) {
    return (
        <Layout title="Actualizar pedido">
            <div className="w-full space-y-4">
                <div>
                    <h1 className="text-3xl font-semibold">Editar pedido</h1>
                    <p className="text-muted">Completa los datos requeridos para crear un nuevo pedido.</p>
                </div>
                <OrderForm
                    customers={customers}
                    products={products}
                    searchCustomer={filters.search_customer ?? ''}
                    searchProduct={filters.search_product ?? ''}
                    order={order}
                />
            </div>
        </Layout>
    )
}
