import { useEffect, useMemo, useRef, useState } from "react";
import { router, useForm } from "@inertiajs/react";
import {
  Bus,
  CheckCircle2,
  Phone,
  Plus,
  Save,
  Search,
  ShieldCheck,
  Store,
  Trash,
  Truck,
  User,
  X,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { Textarea } from "@/components/Textarea";
import ItemImagePreview from "@/components/ImagePreview";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/Select";

import type { Customer } from "@/features/customers/types/customer.types";
import type { Category } from "@/features/Categories/types/category.types";
import { Order, OrderStatus } from "../types/order.types";
import Modal from "@/components/Modal";
import { formatPhone } from "@/utils/phone.util";
import { orderStatusTypeLabels } from "@/utils/order.util";

type PaymentMethod = "yape" | "plin" | "transferencia" | "efectivo" | "otro";
type PaymentType = "advance" | "balance";

type OrderItemFormData = {
  id?: number;
  _key: string;
  category_id: string;
  name: string;
  description: string;
  quantity: number;
  subtotal: number;
  customization: string;
  image: File | null;
  image_url: string | null;
  remove_image: boolean;
};

type OrderPaymentFormData = {
  amount: number;
  method: PaymentMethod;
  type: PaymentType;
  paid_at: string;
};

type NewCustomerFormData = {
  full_name: string;
  phone: string;
} | null;

type OrderFormData = {
  customer_id: string;
  date: string;
  shift: string;
  delivery: boolean;
  delivery_address: string;
  total: number;
  items: OrderItemFormData[];
  // Solo pagos nuevos que se registrarán al crear/actualizar el pedido.
  payments: OrderPaymentFormData[];
  customer: NewCustomerFormData;
};


interface OrderFormProps {
  customers: Customer[];
  categories: Category[];
  search?: string;
  order?: Order | null;
  /** Ruta que devuelve la pantalla actual con los resultados del buscador. */
  customerSearchUrl?: string;
  /** Ruta POST para crear. */
  storeUrl?: string;
  /** Ruta PUT/PATCH para actualizar; si no se envía se usa /orders/{id}. */
  updateUrl?: string;
}

const localDateTime = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 16);
};

const createEmptyItem = (): OrderItemFormData => ({
  _key: crypto.randomUUID(),
  category_id: "",
  name: "",
  description: "",
  quantity: 1,
  subtotal: 0,
  customization: "",
  image: null,
  image_url: null,
  remove_image: false,
});

const createInitialData = (order?: Order | null): OrderFormData => ({
  customer_id: order?.customer_id ? String(order.customer_id) : "",
  date: order?.date ?? "",
  shift: order?.shift ?? "",
  delivery: order?.delivery ?? false,
  delivery_address: order?.delivery_address ?? "",
  total: Number(order?.total ?? 0),
  items:
    order?.items?.length
      ? order.items.map((item) => ({
        id: item.id,
        _key: crypto.randomUUID(),
        category_id: String(item.category_id),
        name: item.name,
        description: item.description ?? "",
        quantity: Number(item.quantity),
        subtotal: Number(item.subtotal),
        customization: item.customization ?? "",
        image: null,
        image_url: item.image_url ?? null,
        remove_image: false,
      }))
      : [createEmptyItem()],
  payments: [],
  customer: null,
});

export default function OrderForm({
  customers,
  categories,
  search = "",
  order = null,
  customerSearchUrl = "/orders/create",
  storeUrl = "/orders",
  updateUrl,
}: OrderFormProps) {
  const isEditing = Boolean(order);
  const form = useForm<OrderFormData>(createInitialData(order));
  const [searchTerm, setSearchTerm] = useState(search);
  const firstSearchRender = useRef(true);


  // modals
  const [showModalCancelled, setShowModalCancelled] = useState(false);
  const [showModalChangeStatus, setShowModalChangeStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "">("");

  const handleCancelled = (id: number) => {
    router.patch(`/orders/${id}/cancelled`, {}, {
      onSuccess: () => {
        console.log('Antes de cerrar:', showModalCancelled);
        setShowModalCancelled(false);
      },
      onFinish: () => {
        console.log('Petición finalizada');
      },
    });
  };

  const handleStatusChange = (id: number, status: string) => {
    router.patch(`/orders/${id}/status`, { status }, {
      preserveScroll: true,
      onSuccess: () => {
        setShowModalChangeStatus(false);
      },
      onError: (errors) => {
        console.log(errors);
      },
    });
  };

  // Si Inertia entrega otro pedido en las props, reinicializa el formulario.
  useEffect(() => {
    form.setData(createInitialData(order));
    setSelectedStatus(order?.status ?? "");
    // La intención es reaccionar al cambio de pedido, no a cada cambio del formulario.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.id]);

  useEffect(() => {
    if (firstSearchRender.current) {
      firstSearchRender.current = false;
      return;
    }

    const timeout = window.setTimeout(() => {
      router.get(
        customerSearchUrl,
        { search: searchTerm.trim() || undefined },
        { preserveState: true, preserveScroll: true, replace: true, only: ["customers", "filters"] },
      );
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [searchTerm, customerSearchUrl]);

  const total = useMemo(
    () => form.data.items.reduce((sum, item) => sum + Number(item.subtotal || 0), 0),
    [form.data.items],
  );

  const paid = useMemo(
    () => form.data.payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
    [form.data.payments],
  );

  const balance = total - paid;

  const updateItem = <K extends keyof OrderItemFormData>(
    index: number,
    field: K,
    value: OrderItemFormData[K],
  ) => {
    const items = [...form.data.items];
    items[index] = { ...items[index], [field]: value };
    form.setData("items", items);
  };

  const addItem = () => form.setData("items", [...form.data.items, createEmptyItem()]);

  const removeItem = (index: number) => {
    if (form.data.items.length <= 1) return;
    form.setData("items", form.data.items.filter((_, itemIndex) => itemIndex !== index));
  };

  const addCustomer = () => {
    form.setData({ ...form.data, customer_id: "", customer: { full_name: "", phone: "" } });
  };

  const removeCustomer = () => {
    form.setData({ ...form.data, customer: null, customer_id: "" });
  };

  const updateCustomer = (field: "full_name" | "phone", value: string) => {
    if (!form.data.customer) return;
    form.setData("customer", { ...form.data.customer, [field]: value });
  };

  const updatePayment = <K extends keyof OrderPaymentFormData>(
    index: number,
    field: K,
    value: OrderPaymentFormData[K],
  ) => {
    const payments = [...form.data.payments];
    payments[index] = { ...payments[index], [field]: value };
    form.setData("payments", payments);
  };

  const addPayment = () => {
    form.setData("payments", [
      ...form.data.payments,
      { amount: 0, method: "yape", type: "advance", paid_at: localDateTime() },
    ]);
  };

  const removePayment = (index: number) => {
    form.setData("payments", form.data.payments.filter((_, i) => i !== index));
  };

  const updateDelivery = (delivery: boolean) => {
    form.setData({
      ...form.data,
      delivery,
      delivery_address: delivery ? form.data.delivery_address : "",
    });
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Laravel recibe los archivos como multipart/form-data. Para editar se usa
    // method spoofing (_method=put), compatible con formularios que incluyen archivos.
    form.transform((data) => ({
      ...data,
      customer_id: data.customer ? null : data.customer_id,
      total,
      _method: isEditing ? "patch" : undefined,
    }) as OrderFormData);

    const url = isEditing ? updateUrl ?? `/orders/${order!.id}` : storeUrl;

    form.post(url, {
      forceFormData: true,
      preserveScroll: true,
    });
  };

  const error = (key: string) => (form.errors as Record<string, string>)[key];


  return (
    <form onSubmit={submit} className="grid grid-cols-12 gap-6">
      <div className="col-span-12 space-y-6 md:col-span-8">
        <Card>
          <CardHeader>
            <CardTitle>Información del cliente</CardTitle>
          </CardHeader>
          <CardContent>
            {!form.data.customer ? (
              <div className="flex items-start gap-2">
                <div className="w-full">
                  <Select
                    value={form.data.customer_id}
                    onValueChange={(value) => form.setData("customer_id", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar cliente">
                        {customers.find((customer) => String(customer.id) === form.data.customer_id)?.full_name}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <div className="p-1">
                        <Input
                          value={searchTerm}
                          placeholder="Buscar cliente por nombre o teléfono"
                          leftIcon={<Search size={17} />}
                          onChange={(event) => setSearchTerm(event.target.value)}
                        />
                      </div>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={String(customer.id)}>
                          {customer.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="button" onClick={addCustomer}>
                  <Plus size={17} />
                  <span className="hidden md:block">Agregar cliente</span>
                </Button>
              </div>
            ) : (
              <Card>
                <div className="flex items-center justify-between p-3">
                  <h3 className="font-semibold">Registrar cliente</h3>
                  <button type="button" onClick={removeCustomer} aria-label="Cancelar registro de cliente">
                    <X size={16} />
                  </button>
                </div>
                <CardContent>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div>
                      <Input
                        label="Nombre completo"
                        placeholder="Nombres y apellidos"
                        leftIcon={<User size={16} />}
                        value={form.data.customer.full_name}
                        onChange={(event) => updateCustomer("full_name", event.target.value)}
                      />
                      {error("customer.full_name") && <p className="mt-1 text-sm text-destructive">{error("customer.full_name")}</p>}
                    </div>
                    <div>
                      <Input
                        type="tel"
                        label="Teléfono"
                        leftIcon={<Phone size={16} />}
                        value={form.data.customer.phone}
                        onChange={(event) => updateCustomer("phone", event.target.value)}
                      />
                      {error("customer.phone") && <p className="mt-1 text-sm text-destructive">{error("customer.phone")}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            {error("customer_id") && <p className="mt-2 text-sm text-destructive">{error("customer_id")}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Productos del pedido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {form.data.items.map((item, index) => (
                <div key={item._key} className="mb-1.5 space-y-4 rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Producto #{index + 1}</h3>
                    {form.data.items.length > 1 && (
                      <button type="button" onClick={() => removeItem(index)} aria-label={`Eliminar producto ${index + 1}`}>
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">Categoría</label>
                      <Select value={item.category_id} onValueChange={(value) => updateItem(index, "category_id", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar categoría">
                            {categories.find((category) => String(category.id) === item.category_id)?.name}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={String(category.id)}>{category.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {error(`items.${index}.category_id`) && <p className="mt-1 text-sm text-destructive">{error(`items.${index}.category_id`)}</p>}
                    </div>
                    <div>
                      <Input
                        label="Nombre del producto"
                        value={item.name}
                        onChange={(event) => updateItem(index, "name", event.target.value)}
                        placeholder="Ej. Torta personalizada"
                      />
                      {error(`items.${index}.name`) && <p className="mt-1 text-sm text-destructive">{error(`items.${index}.name`)}</p>}
                    </div>
                  </div>

                  <Textarea
                    label="Observaciones"
                    value={item.description}
                    onChange={(event) => updateItem(index, "description", event.target.value)}
                    placeholder="Observaciones del producto..."
                    rows={3}
                  />

                  <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
                    <div className="grid grid-cols-1 gap-4">
                      <Input
                        label="Cantidad"
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(event) => updateItem(index, "quantity", Math.max(1, Number(event.target.value)))}
                      />
                      <Input
                        label="Precio"
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.subtotal}
                        onChange={(event) => updateItem(index, "subtotal", Math.max(0, Number(event.target.value)))}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">Imagen de referencia</label>
                      {item.image_url && !item.remove_image && !item.image && (
                        <div className="mb-2 space-y-2">
                          <img src={item.image_url} alt={`Imagen de referencia del producto ${index + 1}`} className="h-32 w-full rounded-md border object-contain" />
                          <button type="button" className="text-sm text-destructive underline" onClick={() => updateItem(index, "remove_image", true)}>
                            Eliminar imagen actual
                          </button>
                        </div>
                      )}
                      {item.remove_image && (
                        <button type="button" className="mb-2 text-sm underline" onClick={() => updateItem(index, "remove_image", false)}>
                          Mantener imagen actual
                        </button>
                      )}
                      <ItemImagePreview
                        file={item.image}
                        onChange={(file) => {
                          const items = [...form.data.items];
                          items[index] = { ...items[index], image: file, remove_image: file ? false : items[index].remove_image };
                          form.setData("items", items);
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-end">
              <Button type="button" onClick={addItem} variant="secondary" size="sm">
                <Plus className="size-4" /> Agregar otro
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="col-span-12 space-y-6 md:col-span-4">
        <Card>
          <CardHeader><CardTitle>Fecha y entrega</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Input
                  label="Fecha de entrega"
                  id="date"
                  type="date"
                  value={form.data.date}
                  onChange={(event) => form.setData("date", event.target.value)}
                />
                {error("date") && <p className="mt-1 text-sm text-destructive">{error("date")}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Horario</label>
                <Select value={form.data.shift} onValueChange={(value) => form.setData("shift", value)}>
                  <SelectTrigger><SelectValue placeholder="Selecciona un horario" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mañana">Mañana</SelectItem>
                    <SelectItem value="tarde">Tarde</SelectItem>
                  </SelectContent>
                </Select>
                {error("shift") && <p className="mt-1 text-sm text-destructive">{error("shift")}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Tipo de entrega</label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => updateDelivery(false)}
                    className={`relative cursor-pointer flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition-all duration-200 ${!form.data.delivery
                        ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                        : "border-border hover:border-primary/50"
                      }`}
                  >
                    <div className="flex w-full items-center justify-between">
                      <div className={`rounded-lg p-2 ${!form.data.delivery
                          ? "bg-primary/10 text-primary"
                          : "bg-background text-muted"
                        }`}>
                        <Store size={22} />
                      </div>

                      {!form.data.delivery && (
                        <CheckCircle2 size={20} className="text-primary" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-semibold">
                        Recojo en local
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateDelivery(true)}
                    className={`relative cursor-pointer flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition-all duration-200 ${form.data.delivery
                        ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                        : "border-border hover:border-primary/50 "
                      }`}
                  >
                    <div className="flex w-full items-center justify-between">
                      <div className={`rounded-lg p-2 ${form.data.delivery
                          ? "bg-primary/10 text-primary"
                          : "bg-background text-muted"
                        }`}>
                        <Truck size={22} />
                      </div>

                      {form.data.delivery && (
                        <CheckCircle2 size={20} className="text-primary" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-semibold">
                        Envío a domicilio
                      </p>
                    </div>
                  </button>

                </div>
                {form.data.delivery === true && (
                  <div className="mt-4">
                    <Input
                      label="Dirección de entrega"
                      id="delivery_address"
                      placeholder="Calle, número, referencia"
                      value={form.data.delivery_address}
                      onChange={(event) => form.setData("delivery_address", event.target.value)}
                    />
                    {error("delivery_address") && <p className="mt-1 text-sm text-destructive">{error("delivery_address")}</p>}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {!isEditing && (
          <Card>
            <CardHeader><CardTitle>Adelanto</CardTitle></CardHeader>
            <CardContent>
              {form.data.payments.map((payment, index) => (
                <Card key={index} className="mb-2">
                  <CardContent>
                    <div className="flex justify-end">
                      <button type="button" onClick={() => removePayment(index)} aria-label="Eliminar pago"><X size={16} /></button>
                    </div>
                    <Input
                      label="Monto"
                      type="number"
                      min="0"
                      step="0.01"
                      value={payment.amount}
                      onChange={(event) => updatePayment(index, "amount", Math.max(0, Number(event.target.value)))}
                    />
                    <div>
                      <label className="mb-2 block text-sm font-medium">Método de pago</label>
                      <Select value={payment.method} onValueChange={(value) => updatePayment(index, "method", value as PaymentMethod)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yape">Yape</SelectItem>
                          <SelectItem value="plin">Plin</SelectItem>
                          <SelectItem value="transferencia">Transferencia</SelectItem>
                          <SelectItem value="efectivo">Efectivo</SelectItem>
                          <SelectItem value="otro">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Input
                      label="Fecha"
                      type="datetime-local"
                      value={payment.paid_at}
                      onChange={(event) => updatePayment(index, "paid_at", event.target.value)}
                    />
                  </CardContent>
                </Card>
              ))}
              <div className="flex justify-end">
                <Button type="button" variant="secondary" size="sm" onClick={addPayment}>
                  <Plus className="size-4" /> Agregar adelanto
                </Button>
              </div>
            </CardContent>
          </Card>
        )}


        {!isEditing ? (
          <Card>
            <CardHeader><CardTitle>Resumen</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Total del pedido</span><span className="font-medium">S/ {total.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Pagos nuevos</span><span className="font-medium">S/ {paid.toFixed(2)}</span></div>
                <div className="flex justify-between border-t border-border pt-2 font-semibold text-primary">
                  <span>Saldo pendiente*</span><span>S/ {Math.max(balance, 0).toFixed(2)}</span>
                </div>
                {balance < 0 && <p className="text-xs text-destructive">Los pagos nuevos superan el total del pedido.</p>}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Acciones rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="ghost" className="w-full" type="button" onClick={() => setShowModalChangeStatus(true)}>
                <ShieldCheck size={17} /> Cambiar estado
              </Button>
              <Button disabled={order?.status === 'cancelled'} variant="danger" className="w-full" type="button" onClick={() => setShowModalCancelled(true)}>
                <Trash size={17} /> Cancelar pedido
              </Button>
            </CardContent>
          </Card>
        )}


        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => window.history.back()}>Cancelar</Button>
          <Button type="submit" disabled={form.processing || balance < 0} variant="primary">
            <Save size={17} /> {form.processing ? "Guardando..." : isEditing ? "Guardar cambios" : "Registrar pedido"}
          </Button>
        </div>
      </div>


      {order && (
        <Modal
          show={showModalCancelled}
          onClose={() => setShowModalCancelled(false)}
          title="Cancelar pedido"
        >
          <div>
            <p>¿Deseas cancelar este pedido?</p>
            <div className="flex justify-end gap-2">
              <Button variant="danger" onClick={() => setShowModalCancelled(false)} type="button">Rechazar</Button>
              <Button variant="secondary" onClick={() => handleCancelled(order.id)} type="button">Aceptar</Button>
            </div>
          </div>
        </Modal>
      )}

      {order && (
        <Modal
          show={showModalChangeStatus}
          onClose={() => setShowModalChangeStatus(false)}
          title="Cambiar estado"
        >
          <div className="space-y-2">
            <Select
              value={selectedStatus}
              onValueChange={(value) => setSelectedStatus(value as OrderStatus | "")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar estado">
                  <span className="first-letter:uppercase">{selectedStatus ? orderStatusTypeLabels[selectedStatus] : ""}</span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.values(OrderStatus).map((status) => (
                  <SelectItem key={status} value={status}>
                    <span className="first-letter:uppercase">{orderStatusTypeLabels[status]}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-muted text-sm">¿Deseas cambiar el estado de este pedido?</p>

            <div className="flex justify-end gap-2 items-center">
              <Button variant="danger" onClick={() => setShowModalChangeStatus(false)} type="button">Rechazar</Button>
              <Button variant="secondary" onClick={() => handleStatusChange(order.id, selectedStatus)} type="button">Aceptar</Button>
            </div>
          </div>
        </Modal>
      )}
    </form>
  );
}
