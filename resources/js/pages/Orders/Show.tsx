import Button from "@/components/Button";
import { Card, CardContent, CardHeader } from "@/components/Card";
import { Order, OrderItem, OrderStatus } from "@/features/Orders/types/order.types";
import Layout from "@/layouts/Layout";
import { formatDateTime } from "@/utils/date";
import { ArrowLeft, Calendar, Clock } from "lucide-react";

const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string }> = {
    [OrderStatus.PENDING]: { label: 'Pendiente', className: 'bg-amber-100 text-amber-800 ring-amber-600/20' },
    [OrderStatus.IN_PROGRESS]: { label: 'En preparación', className: 'bg-blue-100 text-blue-800 ring-blue-600/20' },
    [OrderStatus.COMPLETED]: { label: 'Completado', className: 'bg-emerald-100 text-emerald-800 ring-emerald-600/20' },
    [OrderStatus.DELIVERED]: { label: 'Entregado', className: 'bg-gray-100 text-gray-700 ring-gray-500/20' },
    [OrderStatus.CANCELLED]: { label: 'Cancelado', className: 'bg-red-100 text-red-800 ring-red-600/20' },
};

const currency = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' });
const formatMoney = (value: number) => currency.format(value);

const formatDate = (value: string) => {
    const date = new Date(value.length === 10 ? `${value}T00:00:00` : value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });
};

function StatusBadge({ status }: { status: OrderStatus }) {
    const { label, className } = STATUS_CONFIG[status];
    return (
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${className}`}>
            {label}
        </span>
    );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-muted">{label}</span>
            <span className="text-right font-medium text-foreground">{value}</span>
        </div>
    );
}

function OrderItemRow({ item }: { item: OrderItem }) {
    const unitPrice = item.quantity > 0 ? item.subtotal / item.quantity : item.subtotal;

    return (
        <li className="flex gap-4 py-4 first:pt-0 last:pb-0">
            {item.image_url ? (
                <img
                    src={item.image_url}
                    alt={item.name}
                    loading="lazy"
                    className="size-20 shrink-0 rounded-lg border border-gray-200 object-cover sm:size-24"
                />
            ) : (
                <div className="flex size-20 shrink-0 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-xs text-gray-400 sm:size-24">
                    Sin imagen
                </div>
            )}

            <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <h3 className="truncate text-base font-semibold text-foreground">{item.name}</h3>
                        {item.category?.name && (
                            <span className="mt-0.5 inline-block rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                                {item.category.name}
                            </span>
                        )}
                    </div>
                    <p className="shrink-0 text-base font-semibold text-foreground">{formatMoney(item.subtotal)}</p>
                </div>

                {item.description && <p className="text-sm text-muted">{item.description}</p>}

                {item.customization && (
                    <div className="mt-1 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">Personalización</p>
                        <p className="text-sm text-amber-900">{item.customization}</p>
                    </div>
                )}

                <p className="mt-auto pt-1 text-xs text-muted">
                    {item.quantity} × {formatMoney(unitPrice)}
                </p>
            </div>
        </li>
    );
}


interface ShowOrderProps {
    order: Order;
}

export default function ShowOrder({ order }: ShowOrderProps) {
    const items = order.items ?? [];
    const payments = order.payments ?? [];

    const paid = payments.reduce((acc, payment) => acc + payment.amount, 0);
    const pending = Math.max(order.total - paid, 0);
    const progress = order.total > 0 ? Math.min(100, Math.round((paid / order.total) * 100)) : 0;
    const isSettled = pending === 0 && order.total > 0;

    return (
        <Layout title="detalle pedido">
            <div className="w-full space-y-6">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center gap-4">
                            {/* <Button variant="ghost" size="md" onClick={() => window.history.back()}>
                                <ArrowLeft size={15} /> Volver
                            </Button> */}
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Pedido #{order.id}</h1>
                                <StatusBadge status={order.status} />
                            </div>
                        </div>


                        <div className="text-sm text-muted flex items-center flex-wrap gap-7">
                            <div className="flex items-center gap-1">
                                <Calendar size={15} /> Entrega: {formatDate(order.date)}
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock size={15} /> Turno {order.shift}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-foreground">Productos</h2>
                                    <span className="text-sm text-muted">
                                        {items.length} {items.length === 1 ? 'ítem' : 'ítems'}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {items.length === 0 ? (
                                    <p className="py-8 text-center text-sm text-muted">Este pedido no tiene productos.</p>
                                ) : (
                                    <ul className="divide-y divide-gray-100">
                                        {items.map((item) => (
                                            <OrderItemRow key={item.id} item={item} />
                                        ))}
                                    </ul>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <aside className="space-y-6">
                        <Card>
                            <CardHeader>
                                <h2 className="text-lg font-semibold text-foreground">Resumen</h2>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <InfoRow label="Total" value={<span className="text-lg font-bold">{formatMoney(order.total)}</span>} />
                                    <InfoRow label="Pagado" value={<span className="text-emerald-700">{formatMoney(paid)}</span>} />
                                    <InfoRow
                                        label="Saldo pendiente"
                                        value={<span className={isSettled ? 'text-emerald-700' : 'text-red-600'}>{formatMoney(pending)}</span>}
                                    />
                                    <div className="pt-2">
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                                            <div
                                                className={`h-full rounded-full transition-all ${isSettled ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <p className="mt-1 text-right text-xs text-muted">{progress}% pagado</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <h2 className="text-lg font-semibold text-foreground">Cliente</h2>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {order.customer ? (
                                        <>
                                            <InfoRow label="Nombre" value={order.customer.full_name} />
                                            <InfoRow label="Teléfono" value={order.customer.phone || '—'} />
                                        </>
                                    ) : (
                                        <InfoRow label="ID de cliente" value={`#${order.customer_id}`} />
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-foreground">Pagos</h2>
                                    <span className="text-sm text-muted">{payments.length}</span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {payments.length === 0 ? (
                                    <p className="py-4 text-center text-sm text-muted">Aún no hay pagos registrados.</p>
                                ) : (
                                    <ul className="divide-y divide-gray-100">
                                        {payments.map((payment) => (
                                            <li key={payment.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                                                <div>
                                                    <p className="text-sm font-medium capitalize text-foreground">{payment.method}</p>
                                                    <p className="text-xs text-muted">{formatDateTime(payment.paid_at)}</p>
                                                </div>
                                                <p className="text-sm font-semibold text-emerald-700">{formatMoney(payment.amount)}</p>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </CardContent>
                        </Card>
                    </aside>
                </div>
            </div>
        </Layout>
    )
}
