import { useEffect, useMemo, useRef, useState } from "react";
import { router, useForm } from "@inertiajs/react";
import { Ban, CheckCircle2, Pencil, Phone, Plus, Save, Search, ShieldCheck, Store, Trash, Truck, User, X, } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { Textarea } from "@/components/Textarea";
import ItemImagePreview from "@/components/ImagePreview";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/Select";
import type { Customer } from "@/features/customers/types/customer.types";
import { DeliveryShift, DeliveryType, Order, OrderFormData, OrderItemFormData, OrderPaymentFormData, OrderStatus, PaymentMethod } from "../types/order.types";
import Modal from "@/components/Modal";
import { orderStatusTypeLabels } from "@/utils/order.util";
import { Product, ProductVariant } from "@/features/Products/types/product.type";
import { Field } from "@/components/Field";
import { VariantCard } from "@/pages/Products/Show";

interface OrderFormProps {
  customers: Customer[];
  products: Product[];
  searchCustomer?: string;
  searchProduct?: string;
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
  variant_id: null,
  quantity: 1,
  unit_price: "",
  line_total: "",
  details: "",
  image: null,
  image_url: null,
  remove_image: false,
  product_id: null,
});

const createInitialData = (order?: Order | null): OrderFormData => ({
  customer_id: order?.customer_id ? String(order.customer_id) : "",
  order_date: order?.order_date ?? "",
  delivery_shift: order?.delivery_shift ?? "morning",
  delivery_type: order?.delivery_type ?? 'delivery',
  delivery_address: order?.delivery_address ?? "",
  delivered_at: order?.delivered_at ?? "",
  total: Number(order?.total ?? 0),
  subtotal: order?.subtotal ?? 0,
  discount: order?.discount ?? 0,
  items:
    order?.items?.length
      ? order.items.map((item) => ({
        id: item.id,
        _key: crypto.randomUUID(),
        product_id: item.variant?.product_id ?? null,
        variant_id: item.variant_id,
        quantity: Number(item.quantity),
        unit_price: item.unit_price,
        line_total: item.line_total.toString(),
        details: item.details ?? "",
        image: null,
        image_url: item.reference_image_url ?? null,
        remove_image: false,
      }))
      : [createEmptyItem()],
  payments: [],
  customer: null,
});

export default function OrderForm({
  customers,
  products,
  searchCustomer = "",
  searchProduct = "",
  order = null,
  customerSearchUrl = "/orders/create",
  storeUrl = "/orders",
  updateUrl,
}: OrderFormProps) {
  const isEditing = Boolean(order);
  const form = useForm<OrderFormData>(createInitialData(order));
  const [searchTermCustomer, setSearchTermCustomer] = useState(searchCustomer);
  const [searchTermProduct, setSearchTermProduct] = useState(searchProduct);
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
      onFinish: () => {
          console.log("Solicitud finalizada");
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
        {
          search_customer: searchTermCustomer.trim() || undefined,
          search_product: searchTermProduct.trim() || undefined
        },
        {
          preserveState: true,
          preserveScroll: true,
          replace: true,
          only: ["customers", "products", "filters"]
        },
      );
    }, 400);
    return () => window.clearTimeout(timeout);
  }, [searchTermCustomer, searchTermProduct, customerSearchUrl]);

  const total = useMemo(
    () =>
      form.data.items.reduce(
        (sum, item) =>
          sum + Number(item.quantity || 0) * Number(item.unit_price || 0),
        0
      ),
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

    const updatedItem = {
      ...items[index],
      [field]: value,
    };

    if (field === "quantity" || field === "unit_price") {
      updatedItem.line_total = String(
        Number(updatedItem.quantity || 0) *
        Number(updatedItem.unit_price || 0)
      );
    }

    items[index] = updatedItem;

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
      { amount: '', method: "yape", paid_at: localDateTime() },
    ]);
  };

  const removePayment = (index: number) => {
    form.setData("payments", form.data.payments.filter((_, i) => i !== index));
  };

  const updateDelivery = (delivery_type: DeliveryType) => {
    form.setData({
      ...form.data,
      delivery_type,
      delivery_address: delivery_type === 'delivery' ? form.data.delivery_address : "",
    });
  };

  const updateVariant = (index: number, variant: ProductVariant) => {
    const items = [...form.data.items];

    items[index] = {
      ...items[index],
      variant_id: variant.id,
      unit_price: String(variant.price ?? 0),
      line_total: String(
        Number(variant.price ?? 0) * Number(items[index].quantity || 1)
      ),
    };

    form.setData("items", items);
  };


  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Laravel recibe los archivos como multipart/form-data. Para editar se usa
    // method spoofing (_method=put), compatible con formularios que incluyen archivos.
    // form.transform((data) => ({
    //   ...data,
    //   customer_id: data.customer ? null : data.customer_id,
    //   total,
    //   _method: isEditing ? "patch" : undefined,
    // }) as OrderFormData);

    const url = isEditing ? updateUrl ?? `/orders/${order!.id}` : storeUrl;

    form.post(url, {
      forceFormData: true,
      preserveScroll: true,

      onError: (errors) => {
        console.log("Errores de validación:", errors);
      },

      onSuccess: () => {
        console.log("Orden guardada correctamente");
      },
      onFinish: () => {
        console.log('Petición finalizada');
      },
    });
  };

  const [isPriceEditable, setIsPriceEditable] = useState<boolean>(true);

  const error = (key: string) => (form.errors as Record<string, string>)[key];

  return (
    <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-6 ">
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
                          value={searchTermCustomer}
                          placeholder="Buscar cliente por nombre o teléfono"
                          leftIcon={<Search size={17} />}
                          onChange={(event) => setSearchTermCustomer(event.target.value)}
                        />
                      </div>
                      {customers.length === 0 ? (
                        <div className="text-center text-sm text-muted p-2">No se han encontrado clientes</div>
                      ) : (
                        customers.map((customer) => (
                          <SelectItem key={customer.id} value={String(customer.id)}>
                            {customer.full_name}
                          </SelectItem>
                        ))
                      )}
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
              {form.data.items.map((item, index) => {
                const product = products.find((p) => p.id === item.product_id);
                return (
                  <div key={item._key} className="mb-1.5 space-y-4 rounded-lg border border-border p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Producto #{index + 1}</h3>
                      {form.data.items.length > 1 && (
                        <button type="button" onClick={() => removeItem(index)} aria-label={`Eliminar producto ${index + 1}`}>
                          <X size={16} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <Field label="Producto" >
                        <Select
                          value={item.product_id ? String(item.product_id) : ""}
                          onValueChange={(value) => {
                            const items = [...form.data.items];

                            items[index] = {
                              ...items[index],
                              product_id: Number(value),
                              variant_id: null,
                              unit_price: "",
                              line_total: "",
                            };

                            form.setData("items", items);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar producto">
                              {products.find((p) => p.id === item.product_id)?.name ?? 'Selecciona un producto'}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <div className="p-1">
                              <Input
                                value={searchTermProduct}
                                placeholder="Buscar productos por nombre"
                                leftIcon={<Search size={17} />}
                                onChange={(event) => setSearchTermProduct(event.target.value)}
                              />
                            </div>
                            {products.length === 0 ? (
                              <div className="text-center text-sm text-muted p-2">No se han encontrado categorías</div>
                            ) : (
                              products.map((p) => (
                                <SelectItem key={p.id} value={String(p.id)}>
                                  {p.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        {error(`items.${index}.product_id`) && <p className="mt-1 text-sm text-destructive">{error(`items.${index}.product_id`)}</p>}
                      </Field>

                      {product && (
                        product.variants.length === 0 ? (
                          <div className="py-5 text-center">
                            <p className="text-sm text-muted">
                              Este producto no tiene variantes registradas.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2 p-4 bg-background border border-border rounded-lg">
                            <div className="flex justify-between">
                              <h1>Selecciona una variante</h1>
                              <span className="text-sm text-muted">{product?.variants.length} variantes</span>
                            </div>
                            <div className="grid grid-cols-1 gap-1 sm:grid-cols-3">
                              {product?.variants.map((v: ProductVariant) => (
                                <VariantCard
                                  onClick={() => {
                                    updateVariant(index, v);
                                  }}
                                  active={item.variant_id === (v.id)}
                                  key={v.id}
                                  variant={v}
                                />
                              ))}
                            </div>
                          </div>
                        )
                      )}

                      {error(`items.${index}.variant_id`) && (
    <p className="mt-1 text-sm text-destructive">
        {error(`items.${index}.variant_id`)}
    </p>
)}
                    </div>

                    <Textarea
                      label="Observaciones"
                      value={item.details}
                      onChange={(event) => updateItem(index, "details", event.target.value)}
                      placeholder="Observaciones del producto..."
                      rows={3}
                    />
                    {error(`items.${index}.details`) && (
    <p className="mt-1 text-sm text-destructive">
        {error(`items.${index}.details`)}
    </p>
)}


                    <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
                      <div className="grid grid-cols-1 gap-4">
                        <Input
                          label="Cantidad"
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(event) => updateItem(index, "quantity", Math.max(1, Number(event.target.value)))}
                        />

                        <div className="flex gap-1 items-end">
                          <Input
                            label="Precio final (editable)"
                            type="number"
                            min="0"
                            step="1.00"
                            disabled={isPriceEditable}
                            value={item.unit_price}
                            onChange={(event) =>
                              updateItem(index, "unit_price", event.target.value)
                            }
                          />
                          <Button variant="secondary" type="button" onClick={() => setIsPriceEditable(v => !v)}>
                            {isPriceEditable ? (<Pencil size={17} />) : (<Ban size={17} />)}
                          </Button>
                        </div>

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
                )
              })}
            </div>

            <div className="mt-4 flex justify-end">
              <Button type="button" onClick={addItem} variant="secondary" size="sm">
                <Plus className="size-4" /> Agregar otro
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Fecha y entrega</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Input
                  label="Fecha de entrega"
                  id="date"
                  type="date"
                  value={form.data.order_date}
                  onChange={(event) => form.setData("order_date", event.target.value)}
                />
                {error("order_date") && <p className="mt-1 text-sm text-destructive">{error("order_date")}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Horario</label>
                <Select value={form.data.delivery_shift} onValueChange={(value) => form.setData("delivery_shift", value as DeliveryShift)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un horario">
                      {form.data.delivery_shift === 'morning' ? 'Mañana' : 'Tarde'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={'morning'}>Mañana</SelectItem>
                    <SelectItem value={'afternoon'}>Tarde</SelectItem>
                  </SelectContent>
                </Select>
                {error("delivery_shift") && <p className="mt-1 text-sm text-destructive">{error("delivery_shift")}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Tipo de entrega</label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => updateDelivery('pickup')}
                    className={`relative cursor-pointer flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition-all duration-200 
                       ${form.data.delivery_type === "pickup"
                        ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                        : "border-border hover:border-primary/50"
                      }`}
                  >
                    <div className="flex w-full items-center justify-between">
                      <div className={`rounded-lg p-2 ${form.data.delivery_type === "pickup"
                        ? "bg-primary/10 text-primary"
                        : "bg-background text-muted"
                        }`}>
                        <Store size={22} />
                      </div>

                      {form.data.delivery_type && (
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
                    onClick={() => updateDelivery('delivery')}
                    className={`relative cursor-pointer flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition-all duration-200 ${form.data.delivery_type === 'delivery'
                      ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                      : "border-border hover:border-primary/50 "
                      }`}
                  >
                    <div className="flex w-full items-center justify-between">
                      <div className={`rounded-lg p-2 ${form.data.delivery_type === 'delivery'
                        ? "bg-primary/10 text-primary"
                        : "bg-background text-muted"
                        }`}>
                        <Truck size={22} />
                      </div>

                      {form.data.delivery_type === 'delivery' && (
                        <CheckCircle2 size={20} className="text-primary" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-semibold">
                        Envío a domicilio
                      </p>
                    </div>
                  </button>
                  {error("delivery_type") && <p className="mt-1 text-sm text-destructive">{error("delivery_type")}</p>}
                </div>
                {form.data.delivery_type === 'delivery' && (
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
                      onChange={(event) => updatePayment(index, "amount", event.target.value)}
                    />
                    {error(`payments.${index}.amount`)}
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
                    {error(`payments.${index}.method`)}
                    <Input
                      label="Fecha"
                      type="datetime-local"
                      value={payment.paid_at}
                      onChange={(event) => updatePayment(index, "paid_at", event.target.value)}
                    />
                    {error(`payments.${index}.paid_at`)}
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
              <Button variant="outline" className="w-full" type="button" onClick={() => setShowModalChangeStatus(true)}>
                <ShieldCheck size={17} /> Cambiar estado
              </Button>
              <Button disabled={order?.status === 'cancelled'} variant="danger" className="w-full" type="button" onClick={() => setShowModalCancelled(true)}>
                <Trash size={17} /> Cancelar pedido
              </Button>
            </CardContent>
          </Card>
        )}


        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => window.history.back()}>Cancelar</Button>
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
