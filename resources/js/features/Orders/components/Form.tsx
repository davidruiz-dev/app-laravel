import { useForm } from "@inertiajs/react";
import { Payment } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import Select from "@/components/Select";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { PlusIcon, X } from "lucide-react";
import { Textarea } from "@/components/Textarea";
import { Customer } from "@/features/customers/types/customer.types";
import { Category } from "@/features/Categories/types/category.types";
import { OrderItem } from "@/features/Orders/types/order.types";
import ItemImagePreview from "@/components/ImagePreview";

interface OrderItemForm {
    category_id: string
    name: string
    description: string
    quantity: number
    subtotal: number;
    customization: string
    image: File | null
}

interface Props {
    customers: Customer[];
    categories: Category[];
}

export default function OrderForm({ customers, categories }: Props) {
    const form = useForm({
        customer_id: "",
        date: "",
        shift: "",
        delivery: false,
        delivery_address: "",
        total: 0,
        items: [
            {
                category_id: "",
                name: "",
                description: "",
                quantity: 1,
                subtotal: 0,
                customization: "",
                image: null
            },
        ] as OrderItemForm[],

        payments: [
            {
                amount: 0,
                method: "",
                type: "advance",
                paid_at: new Date().toISOString().slice(0, 16),
            }
        ] as Payment[],
    });


    const addItem = () => {
        form.setData("items", [
            ...form.data.items,
            {
                category_id: "",
                name: "",
                description: "",
                quantity: 1,
                subtotal: 0,
                customization: "",
                image: null
            },
        ]);
    };

    const removeItem = (index: number) => {
        form.setData(
            "items",
            form.data.items.filter((_, i) => i !== index)
        );
    };

    const updateItem = (
        index: number,
        field: keyof OrderItem,
        value: string | number
    ) => {
        const items = [...form.data.items];

        items[index] = {
            ...items[index],
            [field]: value,
        };
        form.setData("items", items);
    };

    const updatePayment = (
        index: number,
        field: keyof Payment,
        value: string | number
    ) => {
        const payments = [...form.data.payments];
        payments[index] = {
            ...payments[index],
            [field]: value,
        };
        form.setData("payments", payments);
    };



    const total = form.data.items.reduce((sum, item) => sum + Number(item.subtotal), 0);
    const paid = form.data.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
    const balance = total - paid;

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post("/orders");
    };

    return (
        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Información del cliente</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Select
                            label="Cliente"
                            id="customer_id"
                            value={form.data.customer_id}
                            onChange={(e) =>
                                form.setData("customer_id", e.target.value)
                            }
                        >
                            <option value={''} disabled selected hidden>Seleccionar cliente</option>

                            {customers.map((customer) => (
                                <option
                                    key={customer.id}
                                    value={customer.id}
                                >
                                    {customer.full_name}
                                </option>
                            ))}
                        </Select>

                        {form.errors.customer_id && (
                            <p className="mt-1 text-sm text-destructive">
                                {form.errors.customer_id}
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* ======= ITEMS ======= */}
                <Card>
                    <CardHeader>
                        <CardTitle>Productos del pedido</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {form.data.items.map((item, index) => {
                            return (
                                <div
                                    key={index}
                                    className="space-y-4 rounded-lg border border-border p-4"
                                >
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-medium">
                                            Producto #{index + 1}
                                        </h3>

                                        {form.data.items.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeItem(index)}
                                                className="cursor-pointer"
                                            >
                                                <X />
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {/* CATEGORY */}
                                        <div>
                                            <label className="mb-2 block text-sm font-medium">
                                                Categoría
                                            </label>

                                            <Select
                                                value={item.category_id}
                                                onChange={(e) =>
                                                    updateItem(
                                                        index,
                                                        "category_id",
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                <option value="">Seleccionar categoría</option>
                                                {categories.map((category) => (
                                                    <option
                                                        key={category.id}
                                                        value={category.id}
                                                    >
                                                        {category.name}
                                                    </option>
                                                ))}
                                            </Select>
                                            {form.errors[`items.${index}.category_id`] && (
                                                <p className="mt-1 text-sm text-destructive">
                                                    {form.errors[`items.${index}.category_id`]}
                                                </p>
                                            )}
                                        </div>
                                        {/* NAME */}
                                        <div>
                                            <label className="mb-2 block text-sm font-medium">
                                                Nombre del producto
                                            </label>
                                            <Input
                                                type="text"
                                                value={item.name}
                                                onChange={(e) =>
                                                    updateItem(
                                                        index,
                                                        "name",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Ej. Torta personalizada"
                                            />
                                        </div>
                                    </div>


                                    {/* DESCRIPTION */}
                                    <Textarea
                                        label="Observaciones"
                                        value={item.description}
                                        onChange={(e) =>
                                            updateItem(
                                                index,
                                                "description",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Observaciones del pedido..."
                                        rows={3}
                                    />


                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                                        {/* QUANTITY + PRICE */}
                                        <div className="grid gap-4 grid-cols-1">
                                            <Input
                                                label="Cantidad"
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) =>
                                                    updateItem(
                                                        index,
                                                        "quantity",
                                                        Number(e.target.value)
                                                    )
                                                }
                                                className="w-full rounded-lg border border-border bg-background px-3 py-2"
                                            />

                                            <Input
                                                label="Subtotal"
                                                type="text"
                                                value={item.subtotal}
                                                onChange={(e) =>
                                                    updateItem(
                                                        index,
                                                        "subtotal",
                                                        Number(e.target.value)
                                                    )
                                                }
                                                className="w-full rounded-lg border border-border bg-background px-3 py-2"
                                            />
                                        </div>
                                        <ItemImagePreview
                                            file={item.image}
                                            onChange={(file) => {
                                                form.setData(
                                                    'items',
                                                    form.data.items.map((current, i) =>
                                                        i === index
                                                            ? { ...current, image: file }
                                                            : current,
                                                    ),
                                                );
                                            }}
                                        />
                                    </div>

                                    {/* CUSTOMIZATION */}
                                    {/* <Textarea
                                        label="Personalización"
                                        value={item.customization}
                                        onChange={(e) =>
                                            updateItem(
                                                index,
                                                "customization",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Colores, diseño, texto, temática, etc."
                                        rows={3}
                                    /> */}


                                </div>
                            );
                        })}

                        <div className="flex justify-end items-center mt-4">
                            <Button
                                type="button"
                                onClick={addItem}
                                variant="secondary"
                                size="sm"
                            >
                                <PlusIcon className="size-4" /> Agregar otro
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>


            <div className="space-y-6">
                {/* =======DATOS DEL PEDIDO============ */}
                <Card>
                    <CardHeader>
                        <CardTitle>Datos del pedido</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <Input
                                    label="Fecha de entrega"
                                    id="date"
                                    type="date"
                                    value={form.data.date}
                                    onChange={(e) =>
                                        form.setData("date", e.target.value)
                                    }
                                />
                                {form.errors.date && (
                                    <p className="mt-1 text-sm text-destructive">
                                        {form.errors.date}
                                    </p>
                                )}
                            </div>
                            <div>
                                <Select
                                    label="Horario"
                                    id="shift"
                                    value={form.data.shift}
                                    onChange={(e) =>
                                        form.setData("shift", e.target.value)
                                    }
                                >
                                    <option value="" disabled selected hidden>Seleccionar horario</option>
                                    <option value="mañana">Mañana</option>
                                    <option value="tarde">Tarde</option>
                                </Select>

                                {form.errors.shift && (
                                    <p className="mt-1 text-sm text-destructive">
                                        {form.errors.shift}
                                    </p>
                                )}
                            </div>

                        </div>

                        {/* DELIVERY */}
                        <div className="mt-4 flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => form.setData("delivery", false)}
                                className={`px-4 py-2 bg-background border border-border cursor-pointer rounded-full text-sm transition-colors ${form.data.delivery === false
                                    ? "opacity-100"
                                    : "opacity-40"
                                    }`}
                            >
                                Recojo en local
                            </button>
                            <button
                                type="button"
                                onClick={() => form.setData("delivery", true)}
                                className={`px-4 py-2 bg-white text-black border border-border cursor-pointer rounded-full text-sm transition-colors ${form.data.delivery === true
                                    ? "opacity-100"
                                    : "opacity-40"
                                    }`}
                            >
                                Delivery a domicilio
                            </button>
                        </div>

                        {form.data.delivery && (
                            <div className="mt-4">
                                <Input
                                    label="Dirección de entrega"
                                    id="delivery_address"
                                    type="text"
                                    placeholder="Calle, número, referencia"
                                    value={form.data.delivery_address}
                                    onChange={(e) =>
                                        form.setData(
                                            "delivery_address",
                                            e.target.value
                                        )
                                    }
                                />
                                {form.errors.delivery_address && (
                                    <p className="mt-1 text-sm text-destructive">
                                        {form.errors.delivery_address}
                                    </p>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Anticipo</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {form.data.payments.map((payment, index) => (
                            <div
                                key={index}
                                className="grid gap-4 md:grid-cols-3"
                            >
                                <Input
                                    label="Monto"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={payment.amount}
                                    onChange={(e) =>
                                        updatePayment(
                                            index,
                                            "amount",
                                            Number(e.target.value)
                                        )
                                    }
                                />

                                <Select
                                    label="Método"
                                    value={payment.method}
                                    onChange={(e) =>
                                        updatePayment(
                                            index,
                                            "method",
                                            e.target.value
                                        )
                                    }
                                >
                                    <option value="">Seleccionar</option>
                                    <option value="cash">Efectivo</option>
                                    <option value="yape">Yape</option>
                                    <option value="plin">Plin</option>
                                    <option value="transfer">Transferencia</option>
                                </Select>

                                <Input
                                    label="Fecha"
                                    type="datetime-local"
                                    value={payment.paid_at}
                                    onChange={(e) =>
                                        updatePayment(
                                            index,
                                            "paid_at",
                                            e.target.value
                                        )
                                    }
                                />
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* ===========RESUMEN======= */}
                <Card>
                    <CardHeader>
                        <CardTitle>Resumen</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span>Total del pedido</span>
                                <span className="font-medium">
                                    S/ {total.toFixed(2)}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span>Total pagado</span>
                                <span className="font-medium">
                                    S/ {paid.toFixed(2)}
                                </span>
                            </div>

                            <div className="flex justify-between border-t border-border pt-2">
                                <span>Saldo pendiente</span>
                                <span className="font-semibold">
                                    S/ {Math.max(balance, 0).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-3">
                    <Button
                        type="button"
                        onClick={() => window.history.back()}
                        variant="ghost"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        disabled={form.processing}
                        variant="primary"
                    >
                        {form.processing
                            ? "Guardando..."
                            : "Registrar pedido"}
                    </Button>
                </div>
            </div>
        </form>
    );
}