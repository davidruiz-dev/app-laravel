import Button from "@/components/Button";
import { Card, CardContent, } from "@/components/Card";
import Modal from "@/components/Modal";
import ExpenseForm from "@/features/Expenses/components/ExpenseForm";
import { Expense } from "@/features/Expenses/types/expense.types"
import Layout from "@/layouts/Layout";
import { Paginated } from "@/types"
import { formatDate, } from "@/utils/date";
import { Pencil, Plus, Trash, Wallet } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { formatCurrency } from "@/utils/currency.util";
import ExpenseFilters from "@/features/Expenses/components/ExpenseFilters";
import { router } from "@inertiajs/react"
import TablePagination from "@/components/TablePagination";
import { DateRange } from "@/components/DateRange";

interface Props {
    expenses: Paginated<Expense>;
    totalExpenses: number;
    filters: {
        search?: string;
        type?: string;
        date_from?: string;
        date_to?: string;
    }
}

export default function Index({ expenses, totalExpenses, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [type, setType] = useState(filters.type ?? '');
    const [dateRange, setDateRange] = useState<DateRange | null>(null);

    const firstRender = useRef(true);

    function handleApply(range: DateRange) {
        setDateRange(range);
    }

    useEffect(() => {
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

    const [showOpenModal, setShowOpenModal] = useState<boolean>(false);
    const [expenseSelected, setExpenseSelected] = useState<Expense | null>(null);

    const handleShowModal = () => {
        setShowOpenModal(true);
        setExpenseSelected(null);
    }

    const handleCloseModal = () => {
        setShowOpenModal(false);
        setExpenseSelected(null);
    }

    const handleEdit = (expense: Expense) => {
        setShowOpenModal(true);
        setExpenseSelected(expense);
    }

    const handleDelete = (id: number) => {
        if (window.confirm('¿Deseas eliminar este registro?')) {
            router.delete(`/expenses/${id}`);
        } else {
            return;
        }
    }

    const handlePerPage = (perPage: number) => {
        router.get(
            '/expenses',
            { ...filters, per_page: perPage, page: 1 },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    return (
        <Layout title="Gastos">
            <div className="space-y-6">
                <div className="flex justify-between items-center gap-5">
                    <div>
                        <h1 className="text-2xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold">Gastos</h1>
                        <p className="text-muted text-sm sm:text-base">Gestiona y realiza un seguimiento de los gastos de tu negocio.</p>
                    </div>
                    <Button onClick={handleShowModal} size="md">
                        <Plus size={17} /> <span className="hidden md:block">Registrar gasto</span>
                    </Button>
                </div>

                <div className="w-full">
                    <ExpenseFilters search={search} setSearch={setSearch} handleApply={handleApply} clearFilters={clearFilters} type={type} />
                </div>

                <div className="h-full">
                    {expenses.data.length === 0 ? (
                        <div className="w-full h-full">
                            <Card className="h-full">
                                <CardContent>
                                    <div className="space-y-3 p-4 flex flex-col justify-center items-center">
                                        <div className="p-2 bg-background w-fit border border-border rounded-md">
                                            <Wallet size={30} strokeWidth={1.5} className="mx-auto text-muted" />
                                        </div>
                                        <div>
                                            <h1 className="font-bold text-lg text-center">No hay gastos registrados</h1>
                                            <p className="text-muted text-center">
                                                {search || type || dateRange ? 'No se encontraron resultados para los filtros aplicados.' : 'No se han encontrado gastos, prueba agregar algunos.'}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {expenses.data.map((e) => (
                                <Card key={e.id}>
                                    <CardContent>
                                        <div className="flex justify-between flex-wrap gap-2">
                                            <span className="font-semibold">{e.description}</span>
                                            <span className="text-base md:text-xl font-semibold ">{formatCurrency(e.amount)}</span>
                                        </div>

                                        <p className="text-sm text-muted my-2">{formatDate(e.expense_date)}</p>

                                        <div className="flex justify-between items-center">
                                            <span className="px-2.5 py-1 rounded-2xl bg-background text-sm border border-border">
                                                <span>{e.type}</span>
                                            </span>
                                            <div className="space-x-2">
                                                <Button variant="secondary" size="sm" onClick={() => handleEdit(e)}>
                                                    <Pencil size={14} />
                                                </Button>
                                                <Button variant="secondary" size="sm" onClick={() => handleDelete(e.id)}>
                                                    <Trash size={14} />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                </div>

                <TablePagination
                    paginator={expenses}
                    filters={filters}
                    onPerPageChange={handlePerPage}
                />

                <Modal
                    show={showOpenModal}
                    onClose={handleCloseModal}
                    title={expenseSelected ? 'Editar' : 'Registrar'}
                >
                    <ExpenseForm expense={expenseSelected} onClose={handleCloseModal} />
                </Modal>
            </div>
        </Layout>
    )
}
