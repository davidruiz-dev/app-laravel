
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

import { PackageOpen } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/Card';

export interface TopCategory {
  id: number;
  name: string;
  total_sales: number;
  percentage: number;
}

interface TopCategoriesChartProps {
  categories: TopCategory[];
  days: number;
}

const COLORS = [
  '#6366f1',
  '#f59e0b',
  '#10b981',
  '#ec4899',
  '#06b6d4',
];

const salesLabel = (n: number) =>
  `${n.toLocaleString('es-PE')} ${n === 1 ? 'venta' : 'ventas'}`;

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: TopCategory }[];
}) {
  if (!active || !payload?.length) return null;

  const { name, total_sales, percentage } = payload[0].payload;

  return (
    <div className="rounded-md border border-border bg-background px-3 py-2 text-sm shadow-md">
      <p className="font-semibold">{name}</p>
      <p className="text-muted">
        {salesLabel(total_sales)} · {percentage}%
      </p>
    </div>
  );
}

export default function TopCategoriesChart({
  categories,
  days,
}: TopCategoriesChartProps) {
  const totalSales = categories.reduce(
    (acc, category) => acc + category.total_sales,
    0,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Categorías más vendidas</CardTitle>
        <p className="text-sm text-muted">
          Pedidos completados en los últimos {days} días
        </p>
      </CardHeader>

      <CardContent>
        {categories.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-muted">
            <PackageOpen size={36} />
            <p>Aún no hay ventas en este período.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            <div className="relative h-56 w-56 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categories}
                    dataKey="total_sales"
                    nameKey="name"
                    innerRadius="62%"
                    outerRadius="100%"
                    paddingAngle={categories.length > 1 ? 3 : 0}
                    cornerRadius={4}
                    stroke="none"
                    isAnimationActive
                  >
                    {categories.map((category, index) => (
                      <Cell
                        key={category.id}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>

                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold">
                  {totalSales.toLocaleString('es-PE')}
                </span>
                <span className="text-xs text-muted">
                  {totalSales === 1 ? 'venta' : 'ventas'}
                </span>
              </div>
            </div>

            <ul className="w-full min-w-0 flex-1 space-y-3">
              {categories.map((category, index) => (
                <li key={category.id} className="space-y-1">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        className="size-3 shrink-0 rounded-full"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />

                      <span className="truncate font-medium">
                        {category.name}
                      </span>
                    </span>

                    <span className="shrink-0 text-muted">
                      {category.total_sales} · {category.percentage}%
                    </span>
                  </div>

                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${category.percentage}%`,
                        backgroundColor: COLORS[index % COLORS.length],
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
