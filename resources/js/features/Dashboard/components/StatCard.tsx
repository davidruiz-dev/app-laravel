
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
    label: string;
    value: string | number;
    description?: string;
    icon: LucideIcon;
    trend?: number | null;
}

export default function StatCard({
    label,
    value,
    description,
    icon: Icon,
    trend,
}: StatCardProps) {
    return (
        <div className="rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted">{label}</p>
                <div className="flex size-10 items-center justify-center rounded-lg bg-transparent border border-border">
                    <Icon size={20} className="text-foreground" />
                </div>
            </div>

            <p className="text-2xl font-semibold tracking-tight ">
                {value}
            </p>

            {description && (
                <p className="mt-2 text-xs text-muted">
                    {description}
                </p>
            )}

            {trend !== undefined && trend !== null && (
                <p
                    className={`mt-2 text-xs font-medium ${
                        trend >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                >
                    {trend > 0 ? "+" : ""}
                    {trend}% vs. mes anterior
                </p>
            )}
        </div>
    );
}
