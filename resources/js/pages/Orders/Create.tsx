import Layout from "@/layouts/Layout";
import FormOrder from "../../features/Orders/components/Form";
import { Customer } from "@/features/customers/types/customer.types";
import { Category } from "@/features/Categories/types/category.types";

interface Props {
  customers: Customer[];
  categories: Category[];
  filters: {
    search?: string;
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
        <FormOrder customers={customers} categories={categories} search={filters.search ?? ''} />
      </div>
    </Layout>
  )
}
