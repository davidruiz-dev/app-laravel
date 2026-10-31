import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { CashFlowData } from "../types/report.types";

interface Props {
    data: CashFlowData[];
}

export default function IncomeExpensesChart({ data }: Props) {
    return (
        <div className="w-full h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    barGap={6}
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                    />

                    <XAxis
                        dataKey="month"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />

                    <YAxis
                        tickFormatter={(value) => `S/ ${value}`}
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />

                    <Tooltip
                        formatter={(value) => `S/ ${Number(value).toFixed(2)}`}
                    />

                    <Legend />

                    <Bar
                        dataKey="income"
                        name="Ingresos"
                        fill="#0D5AA3"
                        radius={[4, 4, 0, 0]}
                    />

                    <Bar
                        dataKey="expenses"
                        name="Egresos"
                        fill="#ef4444"
                        radius={[4, 4, 0, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}