import { useState } from "react";
import Button from "./Button";
import Input from "./Input";

export type DateRange = {
    startDate: string;
    endDate: string;
};

type DateRangePickerProps = {
    onApply: (range: DateRange) => void;
    initialRange?: DateRange;
};

type Preset = "7days" | "30days" | "thisMonth";

function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function getPresetRange(preset: Preset): DateRange {
    const today = new Date();
    const endDate = formatDate(today);
    const start = new Date(today);

    if (preset === "7days") {
        start.setDate(today.getDate() - 6);
    } else if (preset === "30days") {
        start.setDate(today.getDate() - 29);
    } else {
        start.setDate(1);
    }

    return {
        startDate: formatDate(start),
        endDate,
    };
}

export function DateRangePicker({
    onApply,
    initialRange,
}: DateRangePickerProps) {
    const [range, setRange] = useState<DateRange>(
        initialRange ?? getPresetRange("30days")
    );

    const [error, setError] = useState("");

    function updateRange(field: keyof DateRange, value: string) {
        setRange((current) => ({
            ...current,
            [field]: value,
        }));
        setError("");
    }

    function selectPreset(preset: Preset) {
        setRange(getPresetRange(preset));
        setError("");
    }

    function applyRange() {
        if (!range.startDate || !range.endDate) {
            setError("Selecciona ambas fechas.");
            return;
        }

        if (range.startDate > range.endDate) {
            setError(
                "La fecha de inicio no puede ser posterior a la fecha de fin."
            );
            return;
        }

        onApply(range);
    }

    return (
        <div className="w-full p-2">

            {/* Accesos rápidos */}
            <div className="mb-5 flex flex-wrap gap-2">
                <Button
                    variant="secondary"
                    size="sm"
                    type="button"
                    onClick={() => selectPreset("7days")}
                >
                    Últimos 7 días
                </Button>

                <Button
                    variant="secondary"
                    type="button"
                    size="sm"
                    onClick={() => selectPreset("30days")}
                >
                    Últimos 30 días
                </Button>

                <Button
                    variant="secondary"
                    size="sm"
                    type="button"
                    onClick={() => selectPreset("thisMonth")}
                >
                    Este mes
                </Button>
            </div>

            {/* Selectores de fecha */}
            <div className="grid grid-cols-1 gap-4">
                <div>
                    <Input
                        label="Desde"
                        id="startDate"
                        type="date"
                        value={range.startDate}
                        max={range.endDate || undefined}
                        onChange={(e) =>
                            updateRange("startDate", e.target.value)
                        }
                    />
                </div>

                <div>
                    <Input
                        label="Hasta"
                        id="endDate"
                        type="date"
                        max={formatDate(new Date())}
                        value={range.endDate}
                        min={range.startDate || undefined}
                        onChange={(e) =>
                            updateRange("endDate", e.target.value)
                        }
                    />
                </div>
            </div>

            {/* Resumen y acción */}
            <div className="mt-5 flex">
                <Button
                    type="button"
                    variant="secondary"
                    onClick={applyRange}
                    className="w-full"
                >
                    Aplicar filtro
                </Button>
            </div>

            {error && (
                <p role="alert" className="mt-3 text-sm text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}
