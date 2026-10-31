import Button from "@/components/Button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/DropdownMenu";
import Input from "@/components/Input";
import { usePage, router } from "@inertiajs/react";
import { Ban, Calendar, Check, CheckCheck, CheckCircle, Clock, LoaderCircle, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { OrderStatus } from "../types/order.types";
import { orderStatusTypeLabels } from "@/utils/order.util";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/Select";

interface OrderFilters {
    search?: string;
    status?: OrderStatus;
    date_from?: string;
    date_to?: string;
}

export default function OrdersFilter() {
    const { filters = {} } = usePage<{ filters?: OrderFilters }>().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState<OrderStatus | ''>(
        filters.status ?? ''
    );
    // const [dateFrom, setDateFrom] = useState(filters.date_from ?? '');
    // const [dateTo, setDateTo] = useState(filters.date_to ?? '');
    const [dateRange, setDateRange] = useState<DateRange | null>(null);

    const firstRender = useRef(true);

    useEffect(() => {
        // Evitar enviar una petición al montar el componente.
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }

        const timeout = setTimeout(() => {
            router.get(
                '/orders',
                {
                    search: search || undefined,
                    status: status || undefined,
                    date_from: dateRange?.startDate || undefined,
                    date_to: dateRange?.endDate || undefined,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                }
            );
        }, 400);

        return () => clearTimeout(timeout);
    }, [search, status, dateRange]);

    const clearFilters = () => {
        setSearch('');
        setStatus('');
        setDateRange(null);
    };



    function handleApply(range: DateRange) {
        setDateRange(range);

        // Aquí puedes solicitar los datos al backend.
        console.log("Fecha inicial:", range.startDate);
        console.log("Fecha final:", range.endDate);
    }


    return (
        <div className="flex flex-wrap items-center gap-3">
            <div className='w-full md:w-5/12'>
                <Input
                    leftIcon={<Search size={18} className="text-muted" />}
                    type="text"
                    placeholder="Buscar por cliente"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>


            <div className="flex items-center gap-3">
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <Calendar size={15} /> Fechas
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <div className="w-60">
                            <DateRangePicker onApply={handleApply} />
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Select
                    value={status ? orderStatusTypeLabels[status] : ''}
                    onValueChange={(value) => setStatus(value as OrderStatus)}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>

                    <SelectContent>
                        <SelectItem value={OrderStatus.PENDING}>
                            <div className="flex items-center gap-1.5">
                                <Clock size={15} /> <span className="first-letter:uppercase">{[orderStatusTypeLabels[OrderStatus.PENDING]]}</span>
                            </div>
                        </SelectItem>

                        <SelectItem value={OrderStatus.IN_PROGRESS}>
                            <div className="flex items-center gap-1.5">
                                <LoaderCircle size={15} /> <span className="first-letter:uppercase">{[orderStatusTypeLabels[OrderStatus.IN_PROGRESS]]}</span>
                            </div>
                        </SelectItem>

                        <SelectItem value={OrderStatus.COMPLETED}>
                            <div className="flex items-center gap-1.5">
                                <CheckCircle size={15} /> <span className="first-letter:uppercase">{[orderStatusTypeLabels[OrderStatus.COMPLETED]]}</span>
                            </div>
                        </SelectItem>
                        <SelectItem value={OrderStatus.DELIVERED}>
                            <div className="flex items-center gap-1.5">
                                <CheckCheck size={15} /> <span className="first-letter:uppercase">{[orderStatusTypeLabels[OrderStatus.DELIVERED]]}</span>
                            </div>
                        </SelectItem>
                        <SelectItem value={OrderStatus.CANCELLED}>
                            <div className="flex items-center gap-1.5">
                                <Ban size={15} /> <span className="first-letter:uppercase">{[orderStatusTypeLabels[OrderStatus.CANCELLED]]}</span>
                            </div>
                        </SelectItem>
                    </SelectContent>
                </Select>

            </div>

            <Button onClick={clearFilters}>
                Limpiar filtros
            </Button>
        </div>
    )
}




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
