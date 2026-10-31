import Button from '@/components/Button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/DropdownMenu';
import Input from '@/components/Input';
import { DateRange, DateRangePicker } from '@/features/Orders/components/OrdersFilter';
import { router, usePage } from '@inertiajs/react';
import { Calendar, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Filters {
    search?: string;
    type?: string;
    date_from?: string;
    date_to?: string;
}

export default function ExpenseFilters() {
    const { filters = {} } = usePage<{ filters?: Filters }>().props;

    const [search, setSearch] = useState(filters.search ?? '');
    const [type, setType] = useState(filters.type ?? '');
 
    const firstRender = useRef(true);

const [dateRange, setDateRange] = useState<DateRange | null>(null);
    function handleApply(range: DateRange) {
        setDateRange(range);
    }
    useEffect(() => {
        // Evitar enviar una petición al montar el componente.
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }

        const timeout = setTimeout(() => {
            router.get(
                '/expenses',
                {
                    search: search || undefined,
                    type: type || undefined,
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
    }, [search, type, dateRange]);

    const clearFilters = () => {
        setSearch('');
        setType('');
        setDateRange(null);
    };
    

    return (
        <div className="flex flex-wrap items-center gap-3">
            <div className='w-full md:w-5/12'>
                <Input
                    leftIcon={<Search size={18} className="text-muted" />}
                    type="text"
                    placeholder="Buscar gasto..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

           

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

            <Button onClick={clearFilters}>
                Limpiar filtros
            </Button>
        </div>
    );
}
