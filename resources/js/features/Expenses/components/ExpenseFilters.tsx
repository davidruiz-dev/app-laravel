import Button from '@/components/Button';
import { DateRange, DateRangePicker } from '@/components/DateRange';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/DropdownMenu';
import Input from '@/components/Input';
import { Calendar, Search } from 'lucide-react';

interface Props {
    search?: string;
    type?: string;
    handleApply: (dataRange: DateRange) => void;
    setSearch: (value: string) => void;
    clearFilters: () => void;
}

export default function ExpenseFilters({ search, setSearch, handleApply, clearFilters, type }: Props) {
    
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
