import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import TablePagination from "@/components/Table";
import { Customer } from "@/features/customers/types/customer.types";
import { Order, OrderStatus } from "@/features/Orders/types/order.types";
import Layout from "@/layouts/Layout";
import { Paginated } from "@/types";
import { formatDate, formatDateTime, getRemainingDays } from "@/utils/date";
import { orderStatusTypeLabels } from "@/utils/order.util";
import { Link } from "@inertiajs/react";
import { Calendar1Icon, Clock, Mail, MessageCircle, PackageOpen, Phone, } from "lucide-react";

interface CustomerShowProps {
  customer: Customer;
  orders: Paginated<Order>;
}

const ACTIVE_STATUSES: OrderStatus[] = ['pending', 'in_progress', 'completed'];
const MAX_VISIBLE_ITEMS = 3;

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  delivered: 'bg-gray-100 text-gray-700',
  cancelled: 'bg-red-100 text-red-800',
};

const money = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' });
const orderUrl = (id: number) => `/orders/${id}`;

const isActive = (order: Order) => ACTIVE_STATUSES.includes(order.status);

// Parsea 'YYYY-MM-DD' en hora local (evita el desfase UTC de new Date('YYYY-MM-DD'))
const daysUntil = (date: string): number => {
  const [y, m, d] = date.slice(0, 10).split('-').map(Number);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((new Date(y, m - 1, d).getTime() - today.getTime()) / 86_400_000);
};

const pluralDays = (n: number) => `${n} ${n === 1 ? 'día' : 'días'}`;

function DeadlineBadge({ order }: { order: Order }) {
  if (!isActive(order)) return null;

  const days = daysUntil(order.date);
  const { label, className } =
    days < 0
      ? { label: `Atrasado ${pluralDays(Math.abs(days))}`, className: 'bg-destructive/20 text-destructive' }
      : days === 0
        ? { label: 'Para hoy', className: 'bg-orange-100 text-orange-800' }
        : days === 1
          ? { label: 'Para mañana', className: 'bg-orange-100 text-orange-800' }
          : { label: `${pluralDays(days)} restantes`, className: 'bg-background text-foreground border border-border' };

  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>{label}</span>;
}

function OrderCard({ order }: { order: Order }) {
  const late = isActive(order) && daysUntil(order.date) < 0;
  const visibleItems = order.items.slice(0, MAX_VISIBLE_ITEMS);
  const hiddenCount = order.items.length - visibleItems.length;

  return (
    <Link
      href={orderUrl(order.id)}
      className={`block rounded-lg border bg-background/50 p-4 transition-colors hover:bg-background ${late ? 'border-destructive/50' : 'border-border'
        }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="font-semibold">Pedido #{order.id}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
            <span className="flex items-center gap-1.5">
              <Calendar1Icon size={14} /> {formatDate(order.date)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} /> Turno {order.shift}
            </span>
          </div>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-semibold ${STATUS_STYLES[order.status]}`}>
          {orderStatusTypeLabels[order.status]}
        </span>
      </div>

      <ul className="mt-3 space-y-1 text-sm text-muted">
        {visibleItems.map((item) => (
          <li key={item.id} className="truncate">
            {item.quantity}x {item.name}
          </li>
        ))}
        {hiddenCount > 0 && <li>y {hiddenCount} más…</li>}
      </ul>

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
        <DeadlineBadge order={order} />
        <span className="ml-auto font-semibold">{money.format(order.total)}</span>
      </div>
    </Link>
  );
}

const contactLink =
  'inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm transition-colors hover:bg-background/60';

export default function CustomerShow({ customer, orders }: CustomerShowProps) {
  const initials = customer.full_name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();

  const digits = customer.phone.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${digits.length > 9 && digits.startsWith('51') ? digits : `51${digits}`}`;

  const wasUpdated = new Date(customer.updated_at).getTime() - new Date(customer.created_at).getTime() > 60_000;

  return (
    <Layout title="Cliente">
      <div className="space-y-5">
        <div>
          <h1 className="text-3xl font-semibold">Detalles del cliente</h1>
          <p className="text-muted">Información del cliente y todos los pedidos que ha realizado a lo largo del tiempo.</p>
        </div>

        <Card>
          <CardContent>
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                  {initials}
                </div>
                <div className="space-y-0.5">
                  <h2 className="text-xl font-semibold">{customer.full_name}</h2>
                  <p className="text-sm text-muted">Registrado el {formatDateTime(customer.created_at)}</p>
                  {wasUpdated && <p className="text-sm text-muted">Actualizado el {formatDateTime(customer.updated_at)}</p>}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <a href={`tel:${digits}`} className={contactLink}>
                  <Phone size={16} /> {customer.phone}
                </a>
                {customer.email && (
                  <a href={`mailto:${customer.email}`} className={contactLink}>
                    <Mail size={16} /> {customer.email}
                  </a>
                )}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Escribir a ${customer.full_name} por WhatsApp`}
                  className="inline-flex items-center gap-2 rounded-md bg-[#25D366] px-3 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                >
                  <MessageCircle size={16} /> WhatsApp
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Historial de pedidos</CardTitle>
              <span className="flex h-7 min-w-7 items-center justify-center rounded-full border border-border bg-background px-2 text-sm">
                {orders.total}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders.data.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10 text-muted">
                  <PackageOpen size={36} />
                  <p>Este cliente aún no tiene pedidos.</p>
                </div>
              ) : (
                <div className="grid gap-3 lg:grid-cols-2">
                  {orders.data.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              )}

              <TablePagination
                total={orders.total}
                links={orders.links}
                current_page={orders.current_page}
                last_page={orders.last_page}
              />
            </div>

          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}