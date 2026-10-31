import Button from "@/components/Button";
import { Card, CardContent, CardHeader } from "@/components/Card";
import Modal from "@/components/Modal";
import FormPayment from "@/features/Orders/components/FormPayment";
import { Order, OrderItem, OrderStatus } from "@/features/Orders/types/order.types";
import Layout from "@/layouts/Layout";
import { formatCurrency } from "@/utils/currency.util";
import { formatDate, formatDateTime } from "@/utils/date";
import { Link, router } from "@inertiajs/react";
import { Calendar, CheckCircle, Clock, Eye, Pencil, Wallet } from "lucide-react";
import { useState } from "react";

const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string }> = {
    [OrderStatus.PENDING]: {
        label: 'Pendiente',
        className: 'bg-amber-100 text-amber-800 ring-amber-600/20',
    },
    [OrderStatus.IN_PROGRESS]: {
        label: 'En preparación',
        className: 'bg-blue-100 text-blue-800 ring-blue-600/20',
    },
    [OrderStatus.COMPLETED]: {
        label: 'Completado',
        className: 'bg-emerald-100 text-emerald-800 ring-emerald-600/20',
    },
    [OrderStatus.DELIVERED]: {
        label: 'Entregado',
        className: 'bg-gray-100 text-gray-700 ring-gray-500/20',
    },
    [OrderStatus.CANCELLED]: {
        label: 'Cancelado',
        className: 'bg-red-100 text-red-800 ring-red-600/20',
    },
};

const STATUS_ACTIONS: Partial<Record<OrderStatus, string>> = {
    [OrderStatus.PENDING]: 'Iniciar producción',
    [OrderStatus.IN_PROGRESS]: 'Pedido listo',
    [OrderStatus.COMPLETED]: 'Entregar pedido',
};



const formatMoney = (value: number) => formatCurrency(value);

// Trabajar con céntimos para evitar errores de precisión.
const toCents = (value: number | string) =>
    Math.round(Number(value) * 100);

function StatusBadge({ status }: { status: OrderStatus }) {
    const config = STATUS_CONFIG[status];

    if (!config) return null;

    return (
        <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${config.className}`}
        >
            {config.label}
        </span>
    );
}

function InfoRow({
    label,
    value,
}: {
    label: string;
    value: React.ReactNode;
}) {
    return (
        <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-muted">{label}</span>
            <span className="text-right font-medium text-foreground">
                {value}
            </span>
        </div>
    );
}

function OrderItemRow({ item }: { item: OrderItem }) {
    const unitPrice =
        item.quantity > 0
            ? Number(item.subtotal) / Number(item.quantity)
            : Number(item.subtotal);

    const openImage = () => {
        if (!item.image_url) return;

        window.open(
            item.image_url,
            '_blank',
            'noopener,noreferrer'
        );
    };

    return (
        <li className="flex gap-4 py-4 first:pt-0 last:pb-0">
            {item.image_url ? (
                <button
                    type="button"
                    onClick={openImage}
                    aria-label={`Ver imagen de ${item.name}`}
                    className="shrink-0"
                >
                    <img
                        src={item.image_url}
                        alt={item.name}
                        loading="lazy"
                        decoding="async"
                        className="size-20 rounded-lg border border-gray-200 object-cover sm:size-24"
                    />
                </button>
            ) : (
                <div className="flex size-20 shrink-0 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-xs text-gray-400 sm:size-24">
                    Sin imagen
                </div>
            )}

            <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <h3 className="truncate text-base font-semibold text-foreground">
                            {item.name}
                        </h3>

                        {item.category?.name && (
                            <span className="mt-0.5 inline-block rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                                {item.category.name}
                            </span>
                        )}
                    </div>

                    <p className="shrink-0 text-base font-semibold text-foreground">
                        {formatMoney(Number(item.subtotal))}
                    </p>
                </div>

                {item.description && (
                    <p className="text-sm text-muted">
                        {item.description}
                    </p>
                )}

                {item.customization && (
                    <div className="mt-1 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
                            Personalización
                        </p>
                        <p className="text-sm text-amber-900">
                            {item.customization}
                        </p>
                    </div>
                )}

                <p className="mt-auto pt-1 text-xs text-muted">
                    {item.quantity} x {formatMoney(unitPrice)}
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

    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);

    const [processing, setProcessing] = useState(false);

    // Cálculos financieros
    const totalCents = toCents(order.total);

    const paidCents = payments.reduce(
        (acc, payment) => acc + toCents(payment.amount),
        0
    );

    const pendingCents = Math.max(totalCents - paidCents, 0);

    const overpaymentCents = Math.max(paidCents - totalCents, 0);

    const paid = paidCents / 100;
    const pending = pendingCents / 100;
    const overpayment = overpaymentCents / 100;

    const isPaid = totalCents > 0 && paidCents >= totalCents;

    const isSettled = isPaid;

    const progress =
        totalCents > 0
            ? Math.min(
                100,
                Math.round((paidCents / totalCents) * 100)
            )
            : 0;

    // Acciones disponibles según el estado
    const buttonText = STATUS_ACTIONS[order.status];

    const canRegisterPayment =
        order.status !== OrderStatus.CANCELLED &&
        order.status !== OrderStatus.DELIVERED &&
        !isPaid;

    // Actualizar estado
    const updateStatus = (url: string) => {
        if (processing) return;

        router.patch(url, {}, {
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onSuccess: () => {
                setShowStatusModal(false);
            },
            onError: () => {
                setShowStatusModal(false);
            },
            onFinish: () => {
                setProcessing(false);
            },
        }
        );
    };

    const changeStatus = () => {
        switch (order.status) {
            case OrderStatus.PENDING:
                updateStatus(`/orders/${order.id}/in_progress`);
                break;

            case OrderStatus.IN_PROGRESS:
                updateStatus(`/orders/${order.id}/complete`);
                break;

            case OrderStatus.COMPLETED:
                updateStatus(`/orders/${order.id}/delivered`);
                break;

            default:
                return;
        }
    };

    return (
        <Layout title={`Pedido #${order.id}`}>
            <div className="w-full space-y-6">

                {/* Encabezado */}
                <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                                Pedido #{order.id}
                            </h1>

                            <StatusBadge status={order.status} />
                        </div>

                        <div className="flex flex-wrap items-center gap-7 text-sm text-muted">
                            <div className="flex items-center gap-1">
                                <Calendar size={15} />
                                Entrega: {formatDate(order.date)}
                            </div>

                            <div className="flex items-center gap-1">
                                <Clock size={15} />
                                Turno {order.shift}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-end gap-2">

                        {buttonText && (
                            <Button
                                variant="ghost"
                                size="md"
                                disabled={processing}
                                onClick={() => {
                                    setShowStatusModal(true);
                                }}
                            >
                                {buttonText}
                            </Button>
                        )}

                        <Button
                            variant="secondary"
                            size="md"
                            type="button"
                            disabled={!canRegisterPayment}
                            onClick={() => setShowPaymentModal(true)}
                        >
                            {isPaid ? (
                                <CheckCircle size={15} />
                            ) : (
                                <Wallet size={15} />
                            )}

                            <span>
                                {isPaid
                                    ? 'Pago completado'
                                    : 'Registrar pago'}
                            </span>
                        </Button>

                        <Link href={`/orders/${order.id}/edit`}>
                            <Button variant="ghost" size="md">
                                <Pencil size={15} />
                                <span>Editar pedido</span>
                            </Button>
                        </Link>
                    </div>
                </header>

                {/* Contenido */}
                <div className="grid gap-6 lg:grid-cols-3">

                    {/* Productos */}
                    <div className="space-y-6 lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-foreground">
                                        Productos
                                    </h2>

                                    <span className="flex size-7 items-center justify-center rounded-full border border-border bg-background text-sm font-semibold text-muted">
                                        {items.length}
                                    </span>
                                </div>
                            </CardHeader>

                            <CardContent>
                                {items.length === 0 ? (
                                    <p className="py-8 text-center text-sm text-muted">
                                        Este pedido no tiene productos.
                                    </p>
                                ) : (
                                    <ul className="divide-y divide-gray-100">
                                        {items.map((item) => (
                                            <OrderItemRow
                                                key={item.id}
                                                item={item}
                                            />
                                        ))}
                                    </ul>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Panel lateral */}
                    <aside className="space-y-6">

                        {/* Resumen financiero */}
                        <Card>
                            <CardHeader>
                                <h2 className="text-lg font-semibold text-foreground">
                                    Resumen
                                </h2>
                            </CardHeader>

                            <CardContent>
                                <div className="space-y-3">

                                    <InfoRow
                                        label="Total"
                                        value={
                                            <span className="text-lg font-bold">
                                                {formatMoney(Number(order.total))}
                                            </span>
                                        }
                                    />

                                    <InfoRow
                                        label="Pagado"
                                        value={
                                            <span className="text-emerald-700">
                                                {formatMoney(paid)}
                                            </span>
                                        }
                                    />

                                    <InfoRow
                                        label="Saldo pendiente"
                                        value={
                                            <span className={isSettled ? 'text-emerald-700' : 'text-red-600'}>
                                                {formatMoney(pending)}
                                            </span>
                                        }
                                    />

                                    {overpayment > 0 && (
                                        <InfoRow
                                            label="Sobrepago"
                                            value={
                                                <span className="text-amber-600">
                                                    {formatMoney(overpayment)}
                                                </span>
                                            }
                                        />
                                    )}

                                    <div className="pt-2">
                                        <div
                                            className="h-2 w-full overflow-hidden rounded-full bg-gray-100"
                                            role="progressbar"
                                            aria-valuenow={progress}
                                            aria-valuemin={0}
                                            aria-valuemax={100}
                                            aria-label="Porcentaje pagado"
                                        >
                                            <div
                                                className={`h-full rounded-full transition-all ${isSettled
                                                    ? 'bg-emerald-500'
                                                    : 'bg-blue-500'
                                                    }`}
                                                style={{
                                                    width: `${progress}%`,
                                                }}
                                            />
                                        </div>

                                        <p className="mt-1 text-right text-xs text-muted">
                                            {progress}% pagado
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Cliente */}
                        <Card>
                            <CardHeader>
                                <h2 className="text-lg font-semibold text-foreground">
                                    Cliente
                                </h2>
                            </CardHeader>

                            <CardContent>
                                <div className="space-y-3">
                                    {order.customer ? (
                                        <>
                                            <InfoRow
                                                label="Nombre"
                                                value={order.customer.full_name}
                                            />

                                            <InfoRow
                                                label="Teléfono"
                                                value={order.customer.phone || '—'}
                                            />
                                        </>
                                    ) : (
                                        <InfoRow
                                            label="ID de cliente"
                                            value={`#${order.customer_id}`}
                                        />
                                    )}

                                    <div className="flex justify-end">
                                        <Link href={`/customers/${order.customer_id}`}>
                                            <Button size="sm" variant="secondary">
                                                <Eye size={15} />
                                                Ver cliente
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Pagos */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-foreground">
                                        Pagos
                                    </h2>

                                    <span className="text-sm text-muted">
                                        {payments.length}
                                    </span>
                                </div>
                            </CardHeader>

                            <CardContent>
                                {payments.length === 0 ? (
                                    <p className="py-4 text-center text-sm text-muted">
                                        Aún no hay pagos registrados.
                                    </p>
                                ) : (
                                    <ul className="divide-y divide-gray-100">
                                        {payments.map((payment) => (
                                            <li
                                                key={payment.id}
                                                className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                                            >
                                                <div>
                                                    <p className="text-sm font-medium capitalize text-foreground">
                                                        {payment.method}
                                                    </p>

                                                    <p className="text-xs text-muted">
                                                        {formatDateTime(payment.paid_at)}
                                                    </p>
                                                </div>

                                                <p className="text-sm font-semibold text-emerald-700">
                                                    {formatMoney(Number(payment.amount))}
                                                </p>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </CardContent>
                        </Card>
                    </aside>
                </div>
            </div>

            {/* Modal de pago */}
            <Modal
                show={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                title="Registrar pago"
            >
                <FormPayment
                    total={Number(order.total)}
                    paid={paid}
                    orderId={order.id}
                />
            </Modal>

            {/* Modal de cambio de estado */}
            <Modal
                title={buttonText ?? 'Actualizar pedido'}
                show={showStatusModal}
                onClose={() => {
                    if (!processing) {
                        setShowStatusModal(false);
                    }
                }}
            >
                <div className="space-y-3">
                    <p className="text-sm text-foreground">
                        ¿Deseas actualizar el estado de este pedido?
                    </p>
                    <div className="mt-4 flex justify-end gap-2">
                        <Button
                            variant="ghost"
                            disabled={processing}
                            onClick={() => setShowStatusModal(false)}
                        >
                            Cancelar
                        </Button>

                        <Button
                            variant="secondary"
                            disabled={processing}
                            onClick={changeStatus}
                        >
                            {processing ? 'Actualizando...' : 'Confirmar'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </Layout>
    );
}
