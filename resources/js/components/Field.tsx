import { ReactNode } from "react";

export function Field({
  label,
  error,
  children,
  className = '',
}: {
  label: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block space-y-1 ${className}`}>
      <span className="block text-sm font-medium">{label}</span>
      {children}
      {error && <span className="block text-xs text-red-600">{error}</span>}
    </label>
  );
}

export function SummaryRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${strong ? 'border-t border-gray-200 pt-2 text-base font-semibold text-gray-900' : 'text-gray-600'}`}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}