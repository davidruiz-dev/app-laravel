import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

interface Props {
    data: {
        new: number;
        recurring: number;
    };
}

const COLORS = ["#0ea5e9", "#10b981"];

export default function CustomerTypeChart({ data }: Props) {
    const chartData = [
        {
            name: "Nuevos",
            value: data.new,
        },
        {
            name: "Recurrentes",
            value: data.recurring,
        },
    ];

    const total = data.new + data.recurring;

    const renderLabel = ({
        percent,
    }: {
        percent?: number;
    }) => {
        return `${((percent ?? 0) * 100).toFixed(1)}%`;
    };

    return (
        <div className="w-full h-[320px]">
            {total === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    No hay clientes con compras en este periodo.
                </div>
            ) : (
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={65}
                            outerRadius={100}
                            paddingAngle={3}
                            label={renderLabel}
                            labelLine={false}
                        >
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={entry.name}
                                    fill={COLORS[index]}
                                />
                            ))}
                        </Pie>

                        <Tooltip
                            formatter={(value) => [
                                `${value} clientes`,
                                "Cantidad",
                            ]}
                        />

                        <Legend verticalAlign="bottom" />
                    </PieChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}