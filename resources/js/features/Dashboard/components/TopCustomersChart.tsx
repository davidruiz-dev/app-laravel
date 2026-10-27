import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";

export interface TopCustomer {
    id: number;
    full_name: string;
    total_sales: number;
    percentage: number;
}

interface TopCustomersChartProps {
    customers: TopCustomer[];
    days: number;
}


export default function TopCustomersChart({
    customers,
    days,
}: TopCustomersChartProps) {
    const totalSales = customers.reduce(
        (sum, customer) => sum + (Number(customer.total_sales) || 0),
        0,
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>Clientes con más ventas</CardTitle>
                <p className="text-sm text-muted">
                    Pedidos completados en los últimos {days} días
                </p>
            </CardHeader>

            <CardContent>
                {customers.length === 0 ? (
                    <div className="py-10 text-center text-muted">
                        Aún no hay ventas en este período.
                    </div>
                ) : (
                    <div className="space-y-5 py-2">
                        {customers.map((customer) => {
                            const sales = Number(customer.total_sales) || 0;

                            const percentage = totalSales > 0
                                ? (sales / totalSales) * 100
                                : 0;

                            return (
                                <div key={customer.id} className="space-y-2">
                                    <div className="flex items-center justify-between gap-3 text-sm">
                                        <span className="truncate font-medium">
                                            {customer.full_name}
                                        </span>

                                        <span className="shrink-0 text-muted">
                                            {sales} {sales === 1 ? 'venta' : 'ventas'}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="h-3 flex-1 overflow-hidden rounded-full bg-border">
                                            <div
                                                className="h-full rounded-full bg-indigo-500 transition-all duration-300"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>

                                        <span className="w-12 shrink-0 text-right text-xs text-muted">
                                            {Math.round(percentage)}%
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
