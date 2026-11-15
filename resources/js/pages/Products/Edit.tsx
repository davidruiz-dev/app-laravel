import { Category } from '@/features/Categories/types/category.types'
import ProductForm from '@/features/Products/components/ProductForm';
import { Product } from '@/features/Products/types/product.type';
import Layout from '@/layouts/Layout';

interface Props {
  categories: Category[];
  filters: {
    search_category: string
  }
  product: Product
}

export default function Edit({ categories, filters, product }: Props) {
  return (
    <Layout title='Editar producto'>
      <ProductForm categories={categories} searchCategory={filters.search_category} product={product} />
    </Layout>
  )
}
