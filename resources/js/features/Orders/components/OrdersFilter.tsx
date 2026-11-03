import Button from "@/components/Button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/DropdownMenu";
import Input from "@/components/Input";
import { Ban, Calendar, Check, CheckCheck, CheckCircle, Clock, LoaderCircle, Search } from "lucide-react";
import { OrderStatus } from "../types/order.types";
import { orderStatusTypeLabels } from "@/utils/order.util";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/Select";
import { DateRange, DateRangePicker } from "@/components/DateRange";

interface OrderFilters {
    search: string;
    setSearch: (value: string) => void;
    status: OrderStatus | '';
    setStatus: (value: OrderStatus | '') => void;
    dateRange: { startDate: string; endDate: string } | null;
    setDateRange: (value: { startDate: string; endDate: string } | null) => void;
    handleApply: (dataRange: DateRange) => void;
    clearFilters: () => void;
}

export default function OrdersFilter({ search, setSearch, status, setStatus, dateRange, setDateRange, handleApply, clearFilters }: OrderFilters) {
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

