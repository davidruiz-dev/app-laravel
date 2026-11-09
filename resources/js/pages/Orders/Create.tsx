import Layout from "@/layouts/Layout";
import { Customer } from "@/features/customers/types/customer.types";
import { Category } from "@/features/Categories/types/category.types";
import OrderForm from "../../features/Orders/components/OrderForm";

interface Props {
  customers: Customer[];
  categories: Category[];
  filters: {
    search_customer?: string;
    search_category?: string;
  };
}

export default function Create({ customers, categories, filters }: Props) {
  return (
    <Layout title="Nuevo pedido">
      <div className="w-full space-y-4">
        <div>
          <h1 className="text-3xl font-semibold">Nuevo pedido</h1>
          <p className="text-muted">Completa los datos requeridos para crear un nuevo pedido.</p>
        </div>
        <OrderForm customers={customers} categories={categories} searchCustomer={filters.search_customer ?? ''}
         searchCategory={filters.search_category ?? ''} />
      </div>
    </Layout>
  )
}
