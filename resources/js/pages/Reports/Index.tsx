import Button from "@/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import StatCard from "@/features/Dashboard/components/StatCard";
import CategoryIncomeChart, { CategoryIncome } from "@/features/Reports/components/CategoryIncomeChart";
import CustomerTypeChart from "@/features/Reports/components/CustomerTypeChart";
import IncomeExpensesChart from "@/features/Reports/components/IncomeExpensesChart";
import ReportsFilter from "@/features/Reports/components/ReportsFilter";
import { CashFlowData, ReportStats } from "@/features/Reports/types/report.types";
import Layout from "@/layouts/Layout";
import { formatCurrency } from "@/utils/currency.util";
import { Printer } from "lucide-react";
import { router } from "@inertiajs/react";

interface ReportIndexProps {
    stats: ReportStats;
    chartData: CashFlowData[];
    categoryIncome: CategoryIncome[];
    customerStats: {
        new: number;
        recurring: number;
    };
    year: number;
}

export default function ReportsIndex({ stats, chartData, categoryIncome, customerStats, year }: ReportIndexProps) {
    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedYear = e.target.value;
        router.get(
            '/reports',
            { year: selectedYear },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    }
    return (
        <Layout title="Reportes">
            <div className="space-y-6" id="report-content">
                <div>
                    <h1 className='text-2xl md:text-3xl font-bold'>Reportes</h1>
                    <p className='text-muted text-sm md:text-base'>Visualiza las estadísticas de tu negocio.</p>
                </div>

                <div className="w-full flex justify-between items-center">
                    <ReportsFilter />

                    <Button
                        variant="secondary"
                        onClick={() => window.print()}
                    >
                        <Printer size={16} />
                        Imprimir
                    </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2">
                    <StatCard
                        label="Total ventas"
                        value={formatCurrency(stats.sales)}
                    />
                    <StatCard
                        label="Gastos"
                        value={formatCurrency(stats.totalExpenses)}
                    />
                    <StatCard
                        label="Cobros recibidos"
                        value={formatCurrency(stats.totalRevenue)}
                    />
                    <StatCard
                        label="Ganancia estimada"
                        value={formatCurrency(stats.profit)}
                    />
                    <StatCard
                        label="Margen de ganancia"
                        value={(stats.profitMargin).toFixed(2) + '%'}
                    />
                </div>

                <div className="report-chart">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>Ingresos vs. Egresos</CardTitle>
                                <select
                                    value={year}
                                    onChange={(e) => handleYearChange(e)}
                                    className="rounded-lg border border-border bg-background px-3 py-2"
                                >
                                    {Array.from(
                                        { length: 5 },
                                        (_, i) => new Date().getFullYear() - i
                                    ).map((year) => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <IncomeExpensesChart data={chartData} />
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
                    <div className="report-chart">
                        <Card>
                            <CardHeader>
                                <CardTitle>Ingresos por categorías</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CategoryIncomeChart data={categoryIncome} />
                            </CardContent>
                        </Card>
                    </div>
                    <div className="report-chart">
                        <Card>
                            <CardHeader>
                                <CardTitle>Clientes nuevos vs. recurrentes </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CustomerTypeChart data={customerStats} />
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </div>
        </Layout>
    )
}
