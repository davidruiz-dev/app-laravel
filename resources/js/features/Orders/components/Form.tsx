import { router, useForm, usePage } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { Bus, Phone, Plus, PlusIcon, Search, Store, User, X } from "lucide-react";
import { Textarea } from "@/components/Textarea";
import { Customer } from "@/features/customers/types/customer.types";
import { Category } from "@/features/Categories/types/category.types";
import ItemImagePreview from "@/components/ImagePreview";
import { Payment } from "../types/expense.types";
import { OrderFormData, OrderItemFormData } from "../types/order.types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/Select";
import { useEffect, useRef, useState } from "react";

interface OrderFormProps {
    customers: Customer[];
    categories: Category[];
    search?: string;
}

export default function OrderForm({ customers, categories, search = "" }: OrderFormProps) {
    const form = useForm<OrderFormData>({
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
        ],
        payments: [
            {
                amount: 0,
                method: 'yape',
                type: "advance",
                paid_at: new Date().toISOString().slice(0, 16),
            }
        ],
        customer: null,
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

    const addCustomer = () => {
        form.setData({
            ...form.data,
            customer_id: "",
            customer: {
                full_name: "",
                phone: "",
            },
        });
    };

    const removeCustomer = () => {
        form.setData("customer", null);
        form.setData("customer_id", '');
    }

    const removeItem = (index: number) => {
        form.setData(
            "items",
            form.data.items.filter((_, i) => i !== index)
        );
    };

    const updateItem = (index: number, field: keyof OrderItemFormData, value: string | number) => {
        const items = [...form.data.items];

        items[index] = {
            ...items[index],
            [field]: value,
        };
        form.setData("items", items);
    };

    const updatePayment = (index: number, field: keyof Payment, value: string | number) => {
        const payments = [...form.data.payments];
        payments[index] = {
            ...payments[index],
            [field]: value,
        };
        form.setData("payments", payments);
    };

    const updateCustomer = (
        field: "full_name" | "phone",
        value: string
    ) => {
        form.setData("customer", {
            ...form.data.customer!,
            [field]: value,
        });
    };

    const total = form.data.items.reduce((sum, item) => sum + Number(item.subtotal), 0);
    const paid = form.data.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
    const balance = total - paid;

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.transform((data) => ({
            ...data,
            customer_id: data.customer ? null : data.customer_id,
        }));
        form.post("/orders");
    };

    const { filters = {} } = usePage<{ filters?: { search?: string } }>().props;
    const [searchTerm, setSearchTerm] = useState(filters.search ?? '');
    const firstRender = useRef(true);

    useEffect(() => {
        // Evitar enviar una petición al montar el componente.
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }

        const timeout = setTimeout(() => {
            router.get(
                '/orders/create',
                {
                    search: searchTerm || undefined,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                }
            );
        }, 400);

        return () => clearTimeout(timeout);
    }, [searchTerm]);


    return (
        <form onSubmit={submit} className="grid grid-cols-12 gap-6">
            <div className="col-span-12 md:col-span-8 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Información del cliente</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {!form.data.customer && (
                                <div className="flex items-center gap-2">

                                    <div className="w-full">
                                        <Select
                                            value={form.data.customer_id}
                                            onValueChange={(value) =>
                                                form.setData("customer_id", value)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar cliente">
                                                    {customers.find(
                                                        (customer) => String(customer.id) === form.data.customer_id
                                                    )?.full_name}
                                                </SelectValue>
                                            </SelectTrigger>

                                            <SelectContent>
                                                <div className="p-1">
                                                    <Input
                                                        value={searchTerm}
                                                        placeholder="Buscar cliente por nombre o teléfono"
                                                        leftIcon={<Search size={17} />}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                    />
                                                </div>
                                                {customers.map((customer) => (
                                                    <SelectItem
                                                        key={customer.id}
                                                        value={String(customer.id)}
                                                    >
                                                        {customer.full_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>


                                    <Button type="button" onClick={addCustomer}>
                                        <Plus size={17} /> <span className="hidden md:block">Agregar cliente</span>
                                    </Button>
                                </div>
                            )}
                            {form.data.customer && (
                                <Card>
                                    <div className="p-3 flex justify-between">
                                        <h1 className="font-semibold">Registrar cliente</h1>
                                        {form.data.customer && (
                                            <button
                                                type="button"
                                                onClick={() => removeCustomer()}
                                                className="cursor-pointer"
                                            >
                                                <X size={16} />
                                            </button>
                                        )}
                                    </div>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            <Input
                                                label="Nombre completo"
                                                placeholder="Nombres y apellidos"
                                                leftIcon={<User size={16} />}
                                                value={form.data.customer.full_name ?? ''}
                                                onChange={(e) => updateCustomer("full_name", e.target.value)}
                                            />
                                            {form.errors["customer.full_name"] && (
                                                <p className="text-sm text-destructive">
                                                    {form.errors["customer.full_name"]}
                                                </p>
                                            )}
                                            <Input
                                                label="Teléfono"
                                                leftIcon={<Phone size={16} />}
                                                value={form.data.customer.phone ?? ''}
                                                onChange={(e) => updateCustomer("phone", e.target.value)}
                                            />
                                            {form.errors["customer.phone"] && (
                                                <p className="text-sm text-destructive">
                                                    {form.errors["customer.phone"]}
                                                </p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {form.errors.customer_id && (
                                <p className="text-sm text-destructive">
                                    {form.errors.customer_id}
                                </p>
                            )}
                        </div>
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
                                    className="space-y-4 rounded-lg border border-border p-4 mb-2"
                                >
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-medium mb-2">
                                            Producto #{index + 1}
                                        </h3>

                                        {form.data.items.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeItem(index)}
                                                className="cursor-pointer"
                                            >
                                                <X size={16} />
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {/* CATEGORY */}
                                        <div>
                                            <label className="mb-2 block text-sm font-medium">
                                                Categoría
                                            </label>

                                            {categories.length > 0 && (
                                                <Select
                                                    value={item.category_id}
                                                    onValueChange={(value) =>
                                                        updateItem(index, "category_id", value)
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccionar cliente">
                                                            {categories.find(
                                                                (c) => String(c.id) === item.category_id
                                                            )?.name}
                                                        </SelectValue>
                                                    </SelectTrigger>

                                                    <SelectContent>
                                                        {categories.map((c) => (
                                                            <SelectItem
                                                                key={c.id}
                                                                value={String(c.id)}
                                                            >
                                                                {c.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
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
                                        <div>
                                            <label className="mb-2 block text-sm font-medium">
                                                Imagen de referencia
                                            </label>
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


            <div className="col-span-12 md:col-span-4 space-y-6">
                {/* =======Fecha y entrega ============ */}
                <Card>
                    <CardHeader>
                        <CardTitle>Fecha y entrega</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 grid-cols-1">
                            <div className="space-y-3">
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
                                    <label className="mb-2 block text-sm font-medium">
                                        Horario
                                    </label>
                                    <Select
                                        value={form.data.shift}
                                        onValueChange={(value) => form.setData("shift", value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="selecciona un horario" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="mañana">
                                                Mañana
                                            </SelectItem>
                                            <SelectItem value="tarde">
                                                Tarde
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {form.errors.shift && (
                                        <p className="mt-1 text-sm text-destructive">
                                            {form.errors.shift}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* DELIVERY */}
                            <div className="">
                                <label className="mb-2 block text-sm font-medium">Tipo de entrega</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => form.setData("delivery", false)}
                                        className={`p-3 border cursor-pointer rounded-md text-sm transition-colors flex flex-col items-center gap-2
                                    ${form.data.delivery === false
                                                ? "border-primary text-primary border-2 bg-primary/10"
                                                : "border-border"
                                            }`}
                                    >
                                        <Store />
                                        Recojo en local
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => form.setData("delivery", true)}
                                        className={`p-3 border cursor-pointer rounded-md text-sm transition-colors flex flex-col items-center gap-2
                                    ${form.data.delivery === true
                                                ? "border-primary text-primary border-2 bg-primary/10"
                                                : "border-border"
                                            }`}
                                    >
                                        <Bus />
                                        Envio a domicilio
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
                            </div>


                        </div>


                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Adelanto</CardTitle>
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

                            <div className="flex justify-between border-t border-border pt-2 font-semibold text-primary">
                                <span>Saldo pendiente</span>
                                <span>
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