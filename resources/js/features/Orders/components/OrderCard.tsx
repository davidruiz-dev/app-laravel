import { useState } from "react";
import { Order } from "../types/order.types";
import { Link, router } from "@inertiajs/react";
import { formatDate, formatDateTime, getDay, getMonth } from "@/utils/date";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import { Check } from "lucide-react";

interface GetIndicatorStatusOrderProps {
    order: Order
}

function GetStepStatusOrder({ order }: GetIndicatorStatusOrderProps) {
    const stages = [
        { label: "Pendiente", status: "pending" },
        { label: "En producción", status: "in_progress" },
        { label: "Completado", status: "completed" },
    ];

    const currentIndex = stages.findIndex(
        (stage) => stage.status === order.status
    );

    return (
        <div className="grid grid-cols-3 gap-2">
            {stages.map((stage, index) => {
                const isCompleted =
                    currentIndex !== -1 && index < currentIndex;

                const isCurrent = index === currentIndex;

                return (
                    <div
                        key={stage.status}
                        className="flex flex-col items-center gap-1"
                    >
                        <div
                            className={`
                                flex size-7 items-center justify-center
                                rounded-full border-2 transition-colors
                                ${isCompleted
                                    ? "border-green-500 bg-green-500/20 text-green-600"
                                    : isCurrent
                                        ? "border-red-400 bg-red-800"
                                        : "border-border bg-transparent"
                                }
                            `}
                        >
                            {isCompleted && (
                                <Check size={16} strokeWidth={2.5} />
                            )}
                        </div>

                        <small
                            className={`text-center text-xs ${isCompleted
                                ? "text-green-600"
                                : isCurrent
                                    ? "text-red-500"
                                    : "text-muted-foreground"
                                }`}
                        >
                            {stage.label}
                        </small>
                    </div>
                );
            })}
        </div>
    );
};


interface OrderCardProps {
    order: Order;
}
export function OrderCard({ order }: OrderCardProps) {

    const advancePayment = order.payments.find((p) => p.type === 'advance');

    const markAsInProgress = () => router.patch(`/orders/${order.id}/in_progress`,);
    const markAsCompleted = () => router.patch(`/orders/${order.id}/complete`,);
    const markAsDelivered = () => router.patch(`/orders/${order.id}/delivered`,);

    const getButtonText = (order: Order) => {
        if (order.status === 'pending') {
            return 'Iniciar producción'
        } else if (order.status === 'in_progress') {
            return 'Pedido listo '
        } else if (order.status === 'completed') {
            return 'Entregar pedido'
        }
    }

    const changeStatus = (order: Order) => {
        if (order.status === 'pending') {
            markAsInProgress();
        } else if (order.status === 'in_progress') {
            markAsCompleted();
        } else if (order.status === 'completed') {
            markAsDelivered();
        }
    }

    const [showModal, setShowModal] = useState(false);
    const handleClose = () => {
        setShowModal(false);
    };

    const showOrderInfo = () => {
        setShowModal(true);
    }

    return (
        <>
            <div className="rounded-lg flex overflow-hidden border border-border">
                <div className="bg-red-400/90 p-3 flex flex-col items-center gap-1 justify-center text-white border-r border-surface border-dashed">
                    <span className="text-3xl font-bold">{getDay(order.date)}</span>
                    <span className="text-xs lowercase">{getMonth(order.date)}</span>
                    <span className="text-xs">T-{order.shift}</span>
                </div>

                <div className="p-3 bg-background flex-1 space-y-3">
                    <div className="flex justify-between">
                        <span className="font-semibold">
                            {order?.customer?.full_name}
                        </span>

                        <span className="text-sm opacity-40">
                            ID {order.id}
                        </span>
                    </div>

                    {order.items.map(item => (
                        <div key={item.id} className="text-sm">
                            {item.quantity}× {item.name}
                        </div>
                    ))}

                    <div className="flex gap-3 mt-3">
                        <span className="text-sm">Total S/{order.total}</span>

                        <span className="text-xs px-2 py-1 rounded-3xl bg-primary text-white">
                            Pendiente S/{(order.total - (advancePayment?.amount ?? 0)).toFixed(2)}
                        </span>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button onClick={showOrderInfo} size="sm" variant="ghost">Detalles</Button>
                        <Button size="sm" variant="secondary" onClick={() => changeStatus(order)}>{getButtonText(order)}</Button>
                    </div>
                </div>
            </div>

            <Modal
                show={showModal}
                onClose={handleClose}
                title={`Pedido N.º ${order.id}`}
            >
                <div className="space-y-4">
                    {/* Indicadors status order*/}
                    <GetStepStatusOrder order={order} />
                    <div>
                        <h1 className="font-semibold">Cliente</h1>
                        <p className="text-muted">{order.customer?.full_name} - <span>{order.customer?.phone}</span></p>
                    </div>

                    <div>
                        <h1 className="font-semibold">Fecha de entrega</h1>
                        <p className="text-muted">{formatDate(order.date)} - Turno {order.shift}</p>
                    </div>

                    <div className="border border-border rounded-md divide-y divide-border text-sm">
                        {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between p-3">
                                <span>{item.quantity}x {item.name}</span>
                                <span>S/{(item.subtotal)}</span>
                            </div>
                        ))}
                        <div className="flex justify-between p-3">
                            <span>Total</span> <span>S/{(order.total)}</span>
                        </div>
                        <div className="flex justify-between p-3">
                            <span>Pago inicial</span> <span>S/{(advancePayment?.amount)}</span>
                        </div>
                        <div className="flex justify-between p-3">
                            <span className="font-semibold">Pendiente</span>
                            <span >
                                S/{(order.total - (advancePayment?.amount ?? 0)).toFixed(2)}
                            </span>
                        </div>
                    </div>

                    {order.payments.map((payment) => (
                        <div key={payment.id}>
                            <h1 className="font-semibold">Pagos recibidos</h1>
                            <p className="text-sm text-muted">
                                S/{payment.amount ?? 0} por <span className="uppercase font-bold">{payment.method}</span> el {formatDateTime(payment.paid_at)}
                            </p>
                        </div>
                    ))}

                </div>

                <div className="mt-8 flex justify-between">
                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={handleClose}>Cerrar</Button>
                        <Link href={`/orders/${order.id}`}><Button variant="secondary">Más información</Button></Link>
                    </div>
                    <Button onClick={() => changeStatus(order)}>{getButtonText(order)}</Button>
                </div>
            </Modal>
        </>
    );
};

