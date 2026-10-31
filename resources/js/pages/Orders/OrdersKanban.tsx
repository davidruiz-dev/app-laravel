import Button from "@/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import Layout from "@/layouts/Layout";
import { Link } from "@inertiajs/react";
import { PlusIcon } from "lucide-react";
import { Order } from "@/features/Orders/types/order.types";
import { OrderCard } from "@/features/Orders/components/OrderCard";

const columns = [
    {
        status: 'pending',
        title: 'Por empezar',
    },
    {
        status: 'in_progress',
        title: 'En preparación',
    },
    {
        status: 'completed',
        title: 'Listo para entregar',
    },
];

interface OrdersKanbanProps {
    orders: Order[];
}

export default function OrdersKanban({ orders }: OrdersKanbanProps) {

    const ordersByStatus = orders.reduce<Record<string, Order[]>>((groups, order) => {
        if (!groups[order.status]) {
            groups[order.status] = [];
        }

        groups[order.status].push(order);

        return groups;
    }, {});

    return (
        <Layout title="Kanban">
            <div className="flex justify-between flex-wrap gap-2 items-end mb-4">
                <div>
                    <h1 className='text-3xl font-bold'>Tablero de pedidos</h1>
                    <p className='text-muted'>Visualiza y trabaja con tus pedidos de manera organizada.</p>
                </div>
                <Link href={'/orders/create'}>
                    <Button>
                        <PlusIcon className='size-5' /> Nuevo pedido
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 items-start gap-4">
                {columns.map((column) => {

                    const columnOrders =
                        ordersByStatus[column.status] ?? [];

                    return (
                        <OrderColumn
                            key={column.status}
                            title={column.title}
                            orders={columnOrders}
                        />
                    );
                })}

            </div>
        </Layout>

    );
}


/* ORDER COLUMN */
interface OrderColumnProps {
    title: string;
    orders: Order[];
}

function OrderColumn({
    title,
    orders,
}: OrderColumnProps) {

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <h1 className="font-semibold uppercase">{title}</h1>
                    <span className="text-sm bg-background size-7 flex items-center justify-center border border-border rounded-full">{orders.length}</span>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {orders.map(order => (
                        <OrderCard
                            key={order.id}
                            order={order}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
