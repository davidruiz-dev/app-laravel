
import {
    BarChart,
    Bar,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

export interface RevenuePoint {
    date: string;
    label: string;
    total: number;
}

interface Props {
    data: RevenuePoint[];
}

const currency = (value: number) =>
    new Intl.NumberFormat("es-PE", {
        style: "currency",
        currency: "PEN",
        maximumFractionDigits: 0,
    }).format(value);


export default function RevenueChart({ data }: Props) {
    //const chartWidth = Math.max(data.length * 48, 600);

    return (
        <div className="w-full min-w-0">
            <div className="overflow-x-auto overflow-y-hidden">
                <div
                    style={{
                        
                        height: "300px",
                    }}
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            margin={{
                                top: 10,
                                right: 16,
                                left: 8,
                                bottom: 0,
                            }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                                stroke="#e2e8f0"
                            />

                            <XAxis
                                dataKey="label"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fill: "#64748b", fontSize: 11 }}
                            />

                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                width={65}
                                tick={{ fill: "#64748b", fontSize: 11 }}
                                tickFormatter={(value: number) =>
                                    `S/ ${value.toLocaleString("es-PE")}`
                                }
                            />

                            <Tooltip
                                cursor={{ fill: "transparent" }}
                                formatter={(value) => [
                                    currency(Number(value)),
                                    "Ingresos",
                                ]}
                                labelFormatter={(label) => `Fecha: ${label}`}
                            />

                            <Bar
                                dataKey="total"
                                name="Ingresos"
                                fill="#654921"
                                radius={[4, 4, 0, 0]}
                                maxBarSize={28}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

