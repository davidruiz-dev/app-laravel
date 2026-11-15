import Layout from "@/layouts/Layout";
import { Paginated } from "@/types";
import { Link, router } from "@inertiajs/react";
import Button from "@/components/Button";
import { Calendar, Plus, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Product } from "@/features/Products/types/product.type";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import ProductCard from "@/features/Products/components/ProductCard";
import Input from "@/components/Input";
import TablePagination from "@/components/TablePagination";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/DropdownMenu";
import { DateRange, DateRangePicker } from "@/components/DateRange";

interface ProductIndexProps {
  products: Paginated<Product>;
  filters: {
    search?: string;
    per_page?: number;
    date_from?: string;
    date_to?: string;
  }
}

export default function ProductsIndex({ products, filters }: ProductIndexProps) {
  const [search, setSearch] = useState(filters.search ?? '');
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string } | null>(null);

  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    const timeout = setTimeout(() => {
      router.get(
        '/products',
        {
          search: search || undefined,
          status: status || undefined,
          date_from: dateRange?.startDate || undefined,
          date_to: dateRange?.endDate || undefined,
        },
        {
          preserveState: true,
          preserveScroll: true,
          replace: true,
        }
      );
    }, 700);

    return () => clearTimeout(timeout);
  }, [search, status, dateRange]);

  const clearFilters = () => {
    setSearch('');
    setDateRange(null);
  };

  function handleApply(range: DateRange) {
    setDateRange(range);
  }

  const handlePerPage = (perPage: number) => {
    router.get(
      '/products',
      { ...filters, per_page: perPage, page: 1 },
      {
        preserveState: true,
        preserveScroll: true,
      }
    );
  };

  return (
    <Layout title="productos">
      <div className="flex justify-between mb-6 items-center gap-10 relative">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold">Productos</h1>
          <p className="text-muted text-sm md:text-base">
            Lista de todos tus productos registrados en el sistema.
          </p>
        </div>
        <Link href={`/products/create`} className="fixed bottom-6 right-6 z-50 md:static">
          <Button><Plus size={17} /> <span className="hidden md:block">Nuevo producto</span></Button>
        </Link>
      </div>

      <div className="flex gap-3 mb-6">
        <Input
          leftIcon={<Search size={18} className="text-muted" />}
          type="text"
          placeholder="Buscar por nombre"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Calendar size={15} /> Fechas
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <div className="w-60">
              <DateRangePicker onApply={handleApply} />
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button onClick={clearFilters}>
          Limpiar filtros
        </Button>
      </div>

      <div className="space-y-4">
        {products.data.length === 0 ? (
          <Card>
            <CardContent>
              <p className="text-center text-muted">
                {search
                  ? 'No se encontraron productos con esa búsqueda.'
                  : 'No hay productos registrados.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-1  xl:grid-cols-3 gap-3 items-start">
            {products.data.map((product) => (
              <ProductCard product={product} key={product.id} />
            ))}
          </div>
        )}

        <TablePagination
          paginator={products}
          filters={filters}
          onPerPageChange={handlePerPage}
        />
      </div>
    </Layout>
  )
}
