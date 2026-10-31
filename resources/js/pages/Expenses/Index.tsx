import Button from "@/components/Button";
import { Card, CardContent, } from "@/components/Card";
import Modal from "@/components/Modal";
import TablePagination from "@/components/Table";
import ExpenseForm from "@/features/Expenses/components/ExpenseForm";
import { Expense } from "@/features/Expenses/types/expense.types"
import Layout from "@/layouts/Layout";
import { Paginated } from "@/types"
import { formatDate, } from "@/utils/date";
import { CreditCardMinus, Pencil, Plus, Trash, Wallet } from "lucide-react";
import { useState } from "react";
import { formatCurrency } from "@/utils/currency.util";
import ExpenseFilters from "@/features/Expenses/components/ExpenseFilters";
import {router} from "@inertiajs/react"

interface Props {
    expenses: Paginated<Expense>;
    totalExpenses: number;
}

export default function Index({ expenses, totalExpenses, }: Props) {
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
        if(window.confirm('¿Deseas eliminar este registro?')){
            router.delete(`/expenses/${id}`);
        } else {
            return;
        }
    }
   
    return (
        <Layout title="Gastos">
            <div className="space-y-6">
                <div className="flex justify-between items-center gap-5">
                    <div>
                        <h1 className="text-2xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold">Gastos</h1>
                        <p className="text-muted text-sm sm:text-base">Gestiona y realiza un seguimiento de los gastos de tu negocio.</p>
                    </div>
                    <Button onClick={handleShowModal} size="md">
                        <Plus /> <span className="hidden md:block">Registrar gasto</span>
                    </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <Card>
                        <CardContent>
                            <div className="flex items-center gap-1 text-muted">
                                <Wallet size={14} />
                                <p className="text-sm">Gastos total</p>
                            </div>
                            <p className="mt-2 text-2xl font-bold">
                                {formatCurrency(String(totalExpenses))}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <div className="flex items-center gap-1 text-muted">
                                <CreditCardMinus size={14}/>
                                <p className="text-sm">
                                    Total transactions
                                </p>
                            </div>
                            <p className="mt-2 text-2xl font-bold">
                                {expenses.data.length}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="w-full">
                    <ExpenseFilters />
                </div>

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
                                        <Button variant="secondary" size="sm" onClick={()=> handleDelete(e.id)}>
                                            <Trash size={14} />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                </div>

                <TablePagination
                    showing={expenses.data.length}
                    links={expenses.links}
                    total={expenses.total}
                    last_page={expenses.last_page}
                    current_page={expenses.current_page}
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
