import Button from '@/components/Button'
import Input from '@/components/Input'
import Layout from '@/layouts/Layout'
import { Ban, Check, Clock, LoaderCircle, PlusIcon, Search, Timer, Truck } from 'lucide-react'
import { Link, router } from '@inertiajs/react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/Table'
import { formatDate, formatDateTime } from '@/utils/date'
import { OrderStatCard } from '@/features/Orders/components/OrderStatCard'
import { orderStatusTypeLabels } from '@/utils/order.util'
import { Order, OrdersOverview, OrderStatus } from '@/features/Orders/types/order.types'
import { Paginated } from '@/types'
import OrdersFilter from '@/features/Orders/components/OrdersFilter'
import TablePagination from '@/components/TablePagination'
import { useEffect, useRef, useState } from 'react'
import { DateRange } from '@/components/DateRange'
import { OrderStatusBadge } from '@/features/Orders/components/OrderStatusBadge'
import { formatCurrency } from '@/utils/currency.util'
import Badge from '@/components/Badge'

interface Props {
  orders: Paginated<Order>;
  overview: OrdersOverview;
  filters: {
    search?: string;
    per_page?: number;
    status?: OrderStatus;
    date_from?: string;
    date_to?: string;
  };
}


export default function Index({ orders, overview, filters }: Props) {
  const [search, setSearch] = useState(filters.search ?? '');
  const [status, setStatus] = useState<OrderStatus | ''>(filters.status ?? '');
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string } | null>(null);

  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    const timeout = setTimeout(() => {
      router.get(
        '/orders',
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
    setStatus('');
    setDateRange(null);
  };

  function handleApply(range: DateRange) {
    setDateRange(range);
  }

  const handlePerPage = (perPage: number) => {
    router.get(
      '/orders',
      { ...filters, per_page: perPage, page: 1 },
      {
        preserveState: true,
        preserveScroll: true,
      }
    );
  };

  const toCents = (value: number | string) => Math.round(Number(value) * 100);


  const pending = (order: Order) => {
    const totalCents = toCents(order.total);
    const paidCents = order.payments.reduce(
      (acc, payment) => acc + toCents(payment.amount), 0
    );
    const pendingCents = Math.max(totalCents - paidCents, 0);
    return pendingCents / 100;
  }

  const isPaid = (order: Order): boolean => {
    const totalCents = toCents(order.total);
    const paidCents = order.payments.reduce(
      (acc, payment) => acc + toCents(payment.amount), 0
    );
    return totalCents > 0 && paidCents >= totalCents;
  }

  return (
    <Layout title='Pedidos'>
      <div className="space-y-4">
        <div className="flex justify-between items-end flex-wrap gap-4">
          <div>
            <h1 className='text-2xl md:text-3xl font-bold'>Pedidos</h1>
            <p className='text-muted text-sm md:text-base'>Toda la lista de pedidos registrados en el sistema.</p>
          </div>
          <Link href={'/orders/create'}>
            <Button size="md">
              <PlusIcon className='size-5' />
              <span className='hidden md:block'>Nuevo pedido</span>
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-5 gap-2">
          <OrderStatCard value={overview.total_pending} label="Pedidos pendientes" icon={Timer} />
          <OrderStatCard value={overview.total_in_progress} label="Pedidos en preparación" icon={LoaderCircle} />
          <OrderStatCard value={overview.total_completed} label="Pedidos listos" icon={Check} />
          <OrderStatCard value={overview.total_delivered} label="Pedidos entregados" icon={Truck} />
          <OrderStatCard value={overview.total_cancelled} label="Pedidos cancelados" icon={Ban} />
        </div>

        <OrdersFilter
          clearFilters={clearFilters}
          dateRange={dateRange}
          setDateRange={setDateRange}
          handleApply={handleApply}
          search={search}
          setSearch={setSearch}
          status={status}
          setStatus={setStatus}
        />

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Fecha de entrega</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Pendiente</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <p className='text-center text-muted'>
                    {search || status || dateRange
                      ? 'No se encontraron resultados para los filtros aplicados.'
                      : 'No hay pedidos registrados.'}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              orders.data.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.customer?.full_name}</TableCell>
                  <TableCell>
                    <div className='flex items-center gap-3'>
                      {formatDate(order.date)} {order.shift && (
                        <div className='flex items-center gap-1 text-sm'>
                          <Clock size={17} />
                          <span>{order.shift}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                  <TableCell>{formatCurrency(order.total)}</TableCell>
                  <TableCell>
                    {isPaid(order) ? <Badge variant='success'>Pagado</Badge> : formatCurrency(pending(order))}
                  </TableCell>
                  <TableCell>
                    <Link href={`/orders/${order.id}`}>
                      <Button variant='outline'>Ver detalles</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              )))}

          </TableBody>
        </Table>

        <TablePagination
          paginator={orders}
          filters={filters}
          onPerPageChange={handlePerPage}
        />
      </div>
    </Layout>
  )
}
