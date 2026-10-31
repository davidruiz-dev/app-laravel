import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, } from "@/components/DropdownMenu";
import { router, usePage } from "@inertiajs/react";
import { Calendar, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { formatDateShort } from "@/utils/date";
import { DateRangePickerReports } from "./DateRangePickerReports";

export type DateRange = {
    startDate: string;
    endDate: string;
};

interface ReportFilter {
    startDate: string;
    endDate: string;
}

export default function ReportsFilter() {
    const { filters } = usePage<{ filters: ReportFilter }>().props;

    const [dateRange, setDateRange] = useState<DateRange | null>(
        filters?.startDate && filters?.endDate
            ? {
                startDate: filters.startDate,
                endDate: filters.endDate,
            }
            : null
    );

    const firstRender = useRef(true);

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }

        const timeout = setTimeout(() => {
            router.get(
                "/reports",
                {
                    startDate: dateRange?.startDate,
                    endDate: dateRange?.endDate,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                }
            );
        }, 400);

        return () => clearTimeout(timeout);
    }, [dateRange]);

    const clearFilters = () => setDateRange(null);

    const hasFilters = dateRange !== null;

    return (
        <div className="flex items-center gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger>
                    <Calendar size={16} />
                    {hasFilters ? (
                        <div className="flex items-center gap-2">
                            <span>{formatDateShort(dateRange.startDate)}</span> -
                            <span>{formatDateShort(dateRange.endDate)}</span>
                        </div>
                    ) : (
                        <span>Seleccionar fechas</span>
                    )}
                </DropdownMenuTrigger>

                <DropdownMenuContent>
                    <DateRangePickerReports
                        initialRange={dateRange ?? undefined}
                        onApply={setDateRange}
                        onClear={clearFilters}
                    />
                </DropdownMenuContent>
            </DropdownMenu>


        </div>
    );
}