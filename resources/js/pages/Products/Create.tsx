import { Category } from '@/features/Categories/types/category.types'
import ProductForm from '@/features/Products/components/ProductForm';
import Layout from '@/layouts/Layout';

interface Props {
  categories: Category[];
  filters: {
    search_category: string
  }
}

export default function Create({ categories, filters }: Props) {
  return (
    <Layout title='Crear producto'>
        <ProductForm categories={categories} searchCategory={filters.search_category} />
    </Layout>
  )
}
