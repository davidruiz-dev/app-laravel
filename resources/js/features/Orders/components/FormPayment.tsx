import Alert from "@/components/Alert";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/Select";
import { Textarea } from "@/components/Textarea";
import { formatCurrency } from "@/utils/currency.util";
import { useForm } from "@inertiajs/react";
import { AlertCircle } from "lucide-react";
import { FormEvent, useState } from "react";
import { PaymentFormData, PaymentMethod } from "../types/expense.types";

interface FormPaymentProps {
    total: number;
    paid: number;
    orderId: number;
}

export default function FormPayment({ total, paid, orderId }: FormPaymentProps) {
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('yape');

    const form = useForm<PaymentFormData>({
        type: 'balance',
        amount: 0,
        method: paymentMethod,
        paid_at: new Date().toDateString(),
        note: '',
        order_id: orderId
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();

        form.post('/orders/payments');
    }

    const pending = total - paid;

    return (
        <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 xl:grid-cols-3 border border-border divide-x divide-y divide-border bg-background">
                <div className="p-3">
                    <h1 className="text-muted">Total del pedido</h1>
                    <span className="font-semibold">{formatCurrency(total.toString())}</span>
                </div>
                <div className="p-3">
                    <h1 className="text-muted">Pagado</h1>
                    <span className="font-semibold">{formatCurrency(paid)}</span>
                </div>
                <div className="p-3">
                    <h1 className="text-primary">Saldo pendiente</h1>
                    <span className="font-semibold text-primary">{formatCurrency(pending)}</span>
                </div>
            </div>

            <Input
                label="Monto recibido"
                leftIcon={
                    <span className="font-semibold text-muted">S/</span>
                }
                max={pending}
                min={0}
                type="number"
                onChange={(e) => {
                    form.setData('amount', Number(e.target.value))
                }}
            />

            {form.errors.amount && (
                <p className="mt-1 text-sm text-destructive">
                    {form.errors.amount}
                </p>
            )}

            <div className="flex flex-col space-y-1.5 w-full">
                <label className="text-sm">Medio de pago</label>
                <Select
                    value={paymentMethod}
                    onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Medio de pago" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="efectivo">
                            Efectivo
                        </SelectItem>
                        <SelectItem value="yape">
                            Yape
                        </SelectItem>
                        <SelectItem value="plin">
                            Plin
                        </SelectItem>
                        <SelectItem value="transferencia">
                            Transferencia
                        </SelectItem>
                        <SelectItem value="otro">
                            Otro
                        </SelectItem>
                    </SelectContent>
                </Select>
                {form.errors.method && (
                    <p className="mt-1 text-sm text-destructive">
                        {form.errors.method}
                    </p>
                )}
            </div>

            <Input
                type="date"
                label="Fecha del pago"
                onChange={(e) => {
                    form.setData('paid_at', e.target.value)
                }}
            />

            <Alert variant="primary" >
                <div className="flex gap-2 items-center text-muted">
                    <AlertCircle size={17} />
                    <p className="text-sm">El monto no puede ser mayor al saldo pendiente ({formatCurrency((total - paid).toFixed(2))})</p>
                </div>
            </Alert>

            <Textarea
                className="h-24"
                label="Observaciones (opcional)"
                placeholder="Referencia o número de operación"
                onChange={(e) => {
                    form.setData('note', e.target.value)
                }}
            />

            <div className="flex items-center gap-2 justify-end">
                <Button variant="ghost" type="button">
                    Cancelar
                </Button>
                <Button type="submit" variant="secondary" disabled={form.processing}>
                    {form.processing ? 'Guardando' : 'Guardar pago'}
                </Button>
            </div>
        </form>
    )
}
