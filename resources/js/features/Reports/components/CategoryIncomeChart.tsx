import { formatCurrency } from "@/utils/currency.util";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

export interface CategoryIncome {
    category: string;
    total: number;
}

interface Props {
    data: CategoryIncome[];
}

const COLORS = [
    "#6366f1",
    "#0ea5e9",
    "#10b981",
    "#f59e0b",
    "#f43f5e",
    "#8b5cf6",
];

export default function CategoryIncomeChart({ data }: Props) {
    const renderLabel = ({
        cx,
        cy,
        midAngle,
        innerRadius,
        outerRadius,
        percent,
    }: any) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;

        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill="#fff"
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={12}
                fontWeight={600}
            >
                {(percent * 100).toFixed(1)}%
            </text>
        );
    };

    return (
        <div className="w-full h-[350px]">
            {data.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    No hay categorías con compras en este periodo.
                </div>
            ): (<ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="total"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        
                        label={renderLabel}
                        labelLine={false}
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={entry.category}
                                fill={COLORS[index % COLORS.length]}
                            />
                        ))}
                    </Pie>

                    <Tooltip
                        formatter={(value) =>
                            formatCurrency(Number(value))
                        }
                    />

                    <Legend verticalAlign="bottom" height={36} />
                </PieChart>
            </ResponsiveContainer>)}
            
        </div>
    );
}