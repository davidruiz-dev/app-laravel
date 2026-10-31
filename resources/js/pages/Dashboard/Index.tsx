import RevenueChart, { RevenuePoint } from "@/features/Dashboard/components/RevenueChart";
import StatCard from "@/features/Dashboard/components/StatCard";
import Layout from "@/layouts/Layout";
import { CheckCircle2, Clock, Users, Wallet } from "lucide-react";
import { router } from '@inertiajs/react'
import TopCategoriesChart, { TopCategory } from "@/features/Dashboard/components/TopCategories";
import { Card, CardContent, CardHeader } from "@/components/Card";
import TopCustomersChart, { TopCustomer } from "@/features/Dashboard/components/TopCustomersChart";

interface Props {
  stats: {
    total_revenue: number;
    previous_revenue: number;
    completed_orders: number;
    new_customers: number;
    previous_customers: number;
    customer_growth: number | null;
    pending_orders: number;
  };
  revenueChart: RevenuePoint[];
  chartDays: number;
  topCategories: TopCategory[];
  topCustomers: TopCustomer[];
}
export default function Dashboard({ stats, revenueChart, chartDays, topCategories, topCustomers }: Props) {
  const money = new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
  });

  const total = revenueChart.reduce(
    (sum, item) => sum + item.total,
    0,
  );

  function changePeriod(days: 7 | 30 | 90) {
    router.get(
      "/dashboard",
      { days },
      {
        preserveState: true,
        preserveScroll: true,
        only: ["revenueChart", "chartDays", "topCategories", "topCustomers",],
      },
    );
  }

  const getTimeMoment = () => {
    const hora = new Date().getHours();

    if (hora >= 6 && hora < 12) {
      return 'Buenos días';
    } else if (hora >= 12 && hora < 20) {
      return 'Buenas tardes';
    } else {
      return 'Buenas noches';
    }
  };

  return (
    <Layout title="Dashboard">
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold">{getTimeMoment()}</h1>
          <p className="text-muted text-sm md:text-base">Mantente informado con el siguiente resumen.</p>
        </div>

        <div className="bg-gray-100 dark:bg-surface rounded-md p-1 w-fit">
          {([7, 30, 90] as const).map((days) => (
            <button
              key={days}
              onClick={() => changePeriod(days)}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${chartDays === days
                ? "bg-white text-gray-800 shadow-sm"
                : "text-muted"
                }`}
            >
              Últimos {days} días
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Ingresos del mes"
            value={money.format(stats.total_revenue)}
            description={`Mes anterior: ${money.format(stats.previous_revenue)}`}
            icon={Wallet}
            trend={
              stats.previous_revenue > 0
                ? Math.round(
                  ((stats.total_revenue -
                    stats.previous_revenue) /
                    stats.previous_revenue) *
                  1000
                ) / 10
                : null
            }
          />

          <StatCard
            label="Pedidos completados"
            value={stats.completed_orders}
            description="Terminados este mes"
            icon={CheckCircle2}
          />

          <StatCard
            label="Nuevos clientes"
            value={stats.new_customers}
            description="Registrados este mes"
            icon={Users}
            trend={stats.customer_growth}
          />

          <StatCard
            label="Pedidos pendientes"
            value={stats.pending_orders}
            description="Pendientes"
            icon={Clock}
          />
        </div>

        <div className="overflow-x-auto">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Ingresos</h2>
              <p className="text-sm text-muted">Últimos {chartDays} días</p>
              {/* <p className="mt-3 text-2xl font-semibold">
              {new Intl.NumberFormat("es-PE", {
                style: "currency",
                currency: "PEN",
              }).format(total)}
            </p> */}
            </CardHeader>
            <CardContent>
              <RevenueChart data={revenueChart} />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TopCategoriesChart categories={topCategories} days={chartDays} />
          <TopCustomersChart
            customers={topCustomers}
            days={chartDays}
          />
        </div>
      </div>
    </Layout>
  )
}
