import Button from '@/components/Button'
import Input from '@/components/Input'
import Layout from '@/layouts/Layout'
import { Ban, Check, LoaderCircle, PlusIcon, Search, Timer } from 'lucide-react'
import { Link } from '@inertiajs/react'
import TablePagination, { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/Table'
import { formatDateTime } from '@/utils/date'
import { OrderStatCard } from '@/features/Orders/components/OrderStatCard'
import { orderStatusTypeLabels } from '@/utils/order.util'
import { Order, OrdersOverview } from '@/features/Orders/types/order.types'
import { Paginated } from '@/types'
import OrdersFilter from '@/features/Orders/components/OrdersFilter'

interface Props {
  orders: Paginated<Order>;
  overview: OrdersOverview;
}

export default function Index({ orders, overview }: Props) {

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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <OrderStatCard value={overview.total_pending} label="Pedidos pendientes" icon={Timer} />
          <OrderStatCard value={overview.total_in_progress} label="Pedidos en progreso" icon={LoaderCircle} />
          <OrderStatCard value={overview.total_completed} label="Pedidos completados" icon={Check} />
          <OrderStatCard value={overview.total_cancelled} label="Pedidos cancelados" icon={Ban} />
        </div>

        <OrdersFilter />

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>

            {orders.data.map((order) => (
              <TableRow>
                <TableCell>{order.customer?.full_name}</TableCell>
                <TableCell>{formatDateTime(order.date)}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : order.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {[orderStatusTypeLabels[order.status]]}
                  </span>
                </TableCell>
                <TableCell>S/{order.total}</TableCell>
                <TableCell>
                  <Link href={`/orders/${order.id}`}>
                    <Button variant='ghost'>Ver detalles</Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
            {orders.data.length === 0 && (
              <TableCell colSpan={5}>
                <p className='text-center text-muted'>No se han encontrado pedidos</p>
              </TableCell>
            )}
          </TableBody>
        </Table>

        <TablePagination
          showing={orders.data.length}
          links={orders.links}
          total={orders.total}
          current_page={orders.current_page}
          last_page={orders.last_page}
        />
      </div>
    </Layout>
  )
}
