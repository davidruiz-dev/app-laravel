import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  value: number | string;
  label: string;
  icon: LucideIcon;
  className?: string;
}

export function OrderStatCard({
  value,
  label,
  icon: Icon,
  className = "",
}: StatCardProps) {
  return (
    <div
      className={`rounded border border-border bg-surface p-4 ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xl md:text-2xl font-semibold leading-none">
          {value}
        </span>

        <div className="flex p-1.5 items-center justify-center rounded-md border border-border">
          <Icon
            size={17}
            strokeWidth={1.4}
            aria-hidden="true"
          />
        </div>
      </div>

      <p className="mt-5 text-sm md:text-md font-normal leading-tight text-muted">
        {label}
      </p>
    </div>
  );
}