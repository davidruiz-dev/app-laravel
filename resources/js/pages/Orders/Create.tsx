import Layout from "@/layouts/Layout";
import { Customer } from "@/features/customers/types/customer.types";
import { Category } from "@/features/Categories/types/category.types";
import OrderForm from "../../features/Orders/components/OrderForm";
import { Product } from "@/features/Products/types/product.type";

interface Props {
  customers: Customer[];
  products: Product[];
  filters: {
    search_customer?: string;
    search_product?: string;
  };
}

export default function Create({ customers, products, filters }: Props) {
  return (
    <Layout title="Nuevo pedido">
      <div className="w-full space-y-4">
        <div>
          <h1 className="text-3xl font-semibold">Nuevo pedido</h1>
          <p className="text-muted">Completa los datos requeridos para crear un nuevo pedido.</p>
        </div>
        <OrderForm customers={customers} products={products} searchCustomer={filters.search_customer ?? ''}
         searchProduct={filters.search_product ?? ''} />
      </div>
    </Layout>
  )
}
