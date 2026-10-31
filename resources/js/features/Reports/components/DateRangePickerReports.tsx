import Button from "@/components/Button";
import Input from "@/components/Input";
import { Filter, X } from "lucide-react";
import { useEffect, useState } from "react";
import { formatDate } from "@/utils/date";
import type { DateRange } from "./ReportsFilter";

interface DateRangePickerProps {
    initialRange?: DateRange;
    onApply: (range: DateRange) => void;
    onClear: () => void;
}

export function DateRangePickerReports({
    initialRange,
    onApply,
    onClear,
}: DateRangePickerProps) {
    const [range, setRange] = useState<DateRange>(
        initialRange ?? {
            startDate: "",
            endDate: "",
        }
    );

    const [error, setError] = useState("");

    useEffect(() => {
        setRange(
            initialRange ?? {
                startDate: "",
                endDate: "",
            }
        );
    }, [initialRange?.startDate, initialRange?.endDate]);

    const updateRange = (
        field: keyof DateRange,
        value: string
    ) => {
        setRange((current) => ({
            ...current,
            [field]: value,
        }));

        setError("");
    };

    const applyRange = () => {
        if (!range.startDate || !range.endDate) {
            setError("Selecciona ambas fechas.");
            return;
        }

        if (range.startDate > range.endDate) {
            setError("La fecha inicial no puede ser posterior a la final.");
            return;
        }

        onApply(range);
    };

    const handleClear = () => {
        setRange({
            startDate: "",
            endDate: "",
        });

        setError("");
        onClear();
    };

    return (
        <div className="w-64 p-3">
            <div className="grid gap-3">
                <Input
                    label="Desde"
                    id="startDate"
                    type="date"
                    value={range.startDate}
                    max={range.endDate || formatDate(new Date().toDateString())}
                    onChange={(e) =>
                        updateRange("startDate", e.target.value)
                    }
                />

                <Input
                    label="Hasta"
                    id="endDate"
                    type="date"
                    value={range.endDate}
                    min={range.startDate || undefined}
                    max={formatDate(new Date().toDateString())}
                    onChange={(e) =>
                        updateRange("endDate", e.target.value)
                    }
                />
            </div>

            {error && (
                <p className="mt-3 text-sm text-red-600" role="alert">
                    {error}
                </p>
            )}

            <div className="mt-4 flex flex-col gap-2">
                <Button
                    type="button"
                    variant="secondary"
                    onClick={applyRange}
                    className="w-full"
                >
                    <Filter size={16} />
                    Aplicar filtro
                </Button>

                {initialRange && (
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={handleClear}
                        className="w-full"
                    >
                        <X size={16} />
                        Limpiar filtros
                    </Button>
                )}

            </div>
        </div>
    );
}