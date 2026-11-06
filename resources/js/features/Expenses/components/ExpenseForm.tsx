import { useForm } from "@inertiajs/react";
import { Expense } from "../types/expense.types";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { Textarea } from "@/components/Textarea";

interface Props {
    expense: Expense | null;
    onClose: () => void;
}

export default function ExpenseForm({ expense, onClose }: Props) {
    const form = useForm({
        type: expense?.type ?? '',
        amount: expense?.amount ?? '',
        description: expense?.description ?? '',
        expense_date: expense?.expense_date
            ? expense.expense_date.substring(0, 10)
            : new Date().toISOString().substring(0, 10),
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        const options = {
            onSuccess: () => {
                onClose();
            },
        };

        if (!expense) {
            form.post('/expenses', options);
        } else {
            form.put(`/expenses/${expense?.id}`, options);
        }
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <div>
                <Input
                    label="Tipo de gasto"
                    id="type"
                    type="text"
                    value={form.data.type}
                    onChange={(e) =>
                        form.setData('type', e.target.value)
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                    isRequired={true}
                />

                {form.errors.type && (
                    <p className="mt-1 text-sm text-destructive">
                        {form.errors.type}
                    </p>
                )}
            </div>

            <div>
                <Input
                    id="amount"
                    label="Monto"
                    type="number"
                    isRequired={true}
                    value={form.data.amount}
                    onChange={(e) =>
                        form.setData('amount', e.target.value)
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                />

                {form.errors.amount && (
                    <p className="mt-1 text-sm text-destructive">
                        {form.errors.amount}
                    </p>
                )}
            </div>

            <div>
                <Input
                    label="Descripción"
                    isRequired={true}
                    value={form.data.description}
                    onChange={(e) =>
                        form.setData('description', e.target.value)
                    }
                />

                {form.errors.description && (
                    <p className="mt-1 text-sm text-destructive">
                        {form.errors.description}
                    </p>
                )}
            </div>

            <div>
                <Input
                    label="Fecha del gasto"
                    id="email"
                    type="date"
                    isRequired={true}
                    value={form.data.expense_date}
                    onChange={(e) =>
                        form.setData('expense_date', e.target.value)
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                />

                {form.errors.expense_date && (
                    <p className="mt-1 text-sm text-destructive">
                        {form.errors.expense_date}
                    </p>
                )}
            </div>

            <div className="flex justify-end gap-3">
                <Button
                    type="button"
                    onClick={onClose}
                    variant="outline"
                    className="rounded-lg border border-border px-4 py-2"
                >
                    Cancelar
                </Button>

                <Button
                    type="submit"
                    disabled={form.processing}
                >
                    {form.processing
                        ? 'Guardando...'
                        : !expense
                            ? 'Registrar gasto'
                            : 'Guardar cambios'}
                </Button>
            </div>

        </form>
    )
}
