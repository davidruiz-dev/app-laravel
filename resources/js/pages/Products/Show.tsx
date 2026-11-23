import Button from "@/components/Button";
import { Order, OrderItem } from "@/features/Orders/types/order.types";
import { Product, ProductVariant } from "@/features/Products/types/product.type";
import Layout from "@/layouts/Layout";
import { formatCurrency } from "@/utils/currency.util";
import { formatDate } from "@/utils/date";
import { Link, router } from "@inertiajs/react";
import { Pencil, Trash } from "lucide-react";
import { useMemo, useState } from "react";

function StatCard({
    label,
    value,
    icon,
}: {
    label: string;
    value: string | number;
    icon: React.ReactNode;
}) {
    return (
        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{label}</p>
                    <p className="mt-2 text-2xl font-bold text-gray-900">
                        {value}
                    </p>
                </div>
                <div className="rounded-lg bg-indigo-50 p-3 text-indigo-600">
                    {icon}
                </div>
            </div>
        </div>
    );
}
interface VariantCardProps extends React.ComponentProps<"div">{
    variant: ProductVariant,
    active?: boolean,
}

export function VariantCard({ variant, active, ...props }: VariantCardProps) {
    const attributes = variant.attributes ?? {};
    const hasAttributes = Object.keys(attributes).length > 0;

    return (
        <div
            className={`flex flex-col gap-3 rounded-lg border p-4 transition
                ${active
                    ? 'border-primary bg-primary/10 ring-1 ring-primary'
                    : 'border-border bg-surface/50 hover:border-primary'
                }`}
            {...props}
        >    <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                    {hasAttributes ? (
                        <div className="flex flex-wrap gap-1.5">
                            {Object.entries(attributes).map(([key, val]) => (
                                <span
                                    key={key}
                                    className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-200"
                                >
                                    <span className="text-gray-400">
                                        {key}:
                                    </span>
                                    {val}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <span className="text-sm italic text-gray-400">
                            Variante única
                        </span>
                    )}
                </div>
                {/* <span className="shrink-0 rounded-md bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700">
                    #{variant.id}
                </span> */}
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="text-xs text-gray-500">Precio</span>
                <span className="text-base font-semibold text-gray-900">
                    {formatCurrency(Number(variant.price))}
                </span>
            </div>
        </div>
    );
}

function OrderRow({ order, productId }: { order: Order; productId: number }) {
    const [expanded, setExpanded] = useState(false);
    const productItems = order.items.filter((i) => i.product?.id === productId);
    const productTotal = productItems.reduce(
        (sum, i) => sum + Number(i.line_total),
        0,
    );
    //const status = statusConfig[order.status];
    const status = order.status;

    return (
        <>
            <tr
                className="cursor-pointer border-b border-border transition hover:bg-background"
                onClick={() => setExpanded(!expanded)}
            >
                <td className="whitespace-nowrap px-4 py-3 text-sm font-medium ">
                    <div className="flex items-center gap-2">
                        <svg
                            className={`h-4 w-4 text-muted transition-transform ${expanded ? 'rotate-90' : ''
                                }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                        {order.id}
                    </div>
                </td>
                <td className="px-4 py-3 text-sm ">
                    <div className="flex flex-col">
                        <span className="font-medium">{order.customer?.full_name}</span>
                        <span className="text-xs text-muted">
                            {order.customer?.email}
                        </span>
                    </div>
                </td>
                <td className="px-4 py-3 text-sm">
                    <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset `}
                    >
                        {status}
                    </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm">
                    {formatDate(order.created_at)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-semibold ">
                    {formatCurrency(productTotal.toFixed(2))}
                </td>
            </tr>
            {expanded && (
                <tr className="bg-gray-50/70">
                    <td colSpan={5} className="px-4 py-3">
                        <div className="rounded-lg border border-border bg-surface p-3">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                                Items de este producto
                            </p>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-xs text-muted">
                                        <th className="pb-1">Variante</th>
                                        <th className="pb-1 text-center">Cant.</th>
                                        <th className="pb-1 text-right">
                                            Precio unit.
                                        </th>
                                        <th className="pb-1 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {productItems.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="border-t border-border"
                                        >
                                            <td className="py-2">
                                                {item.product_variant?.attributes
                                                    ? Object.entries(
                                                        item.product_variant
                                                            .attributes,
                                                    )
                                                        .map(
                                                            ([k, v]) =>
                                                                `${k}: ${v}`,
                                                        )
                                                        .join(' · ')
                                                    : `Variante #${item.variant_id ??
                                                    '—'
                                                    }`}
                                            </td>
                                            <td className="py-2 text-center">
                                                {item.quantity}
                                            </td>
                                            <td className="py-2 text-right">
                                                {formatCurrency(item.unit_price)}
                                            </td>
                                            <td className="py-2 text-right font-semibold">
                                                {formatCurrency(item.line_total)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}

interface Props {
    product: Product;
    orders: Order[]
    stats: any
}

export default function Show({ product, orders, stats }: Props) {
    const [activeTab, setActiveTab] = useState<'variants' | 'orders'>(
        'variants',
    );

    const handleDelete = () => {
        if (
            confirm(
                `¿Estás seguro de eliminar el producto "${product.name}"? Esta acción no se puede deshacer.`,
            )
        ) {
            router.delete(`/products/${product.id}/delete`);
        }
    };

    return (
        <Layout title={product.name}>

            <div className="">
                {/* Breadcrumb */}
                <nav className="mb-6 flex items-center gap-2 text-sm text-muted">
                    <Link

                        className="hover:text-indigo-600"
                    >
                        Productos
                    </Link>
                    <span>/</span>
                    <span className="font-medium ">
                        {product.name}
                    </span>
                </nav>

                {/* Header */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold ">
                            {product.name}
                        </h1>
                        <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${product.is_active
                                    ? 'bg-green-100 text-green-800 ring-green-600/20'
                                    : 'bg-gray-100 ring-gray-600/20'
                                }`}
                        >
                            {product.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                        {product.is_customizable && (
                            <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 ring-1 ring-inset ring-amber-600/20">
                                Personalizable
                            </span>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Link
                            href={`/products/${product.id}/edit`}
                        >

                            <Button>
                                <Pencil size={17} /> Editar
                            </Button>
                        </Link>
                        <Button
                            variant="danger"
                            onClick={handleDelete}
                        >
                            <Trash size={17} />
                            Eliminar
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        label="Pedidos totales"
                        value={stats.total_orders}
                        icon={
                            <svg
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                />
                            </svg>
                        }
                    />
                    <StatCard
                        label="Unidades vendidas"
                        value={stats.total_sold}
                        icon={
                            <svg
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                />
                            </svg>
                        }
                    />
                    <StatCard
                        label="Ingresos generados"
                        value={formatCurrency(stats.total_revenue)}
                        icon={
                            <svg
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        }
                    />
                    <StatCard
                        label="Variantes"
                        value={stats.active_variants}
                        icon={
                            <svg
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                                />
                            </svg>
                        }
                    />
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Columna izquierda: info del producto */}
                    <div className="lg:col-span-1">
                        <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
                            {product.image_url ? (
                                <img
                                    src={product.image_url}
                                    alt={product.name}
                                    className="aspect-square w-full object-cover"
                                />
                            ) : (
                                <div className="flex aspect-square w-full items-center justify-center bg-background">
                                    <svg
                                        className="h-16 w-16 text-muted"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={1.5}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                    </svg>
                                </div>
                            )}
                            <div className="p-5">
                                <dl className="space-y-4">
                                    


                                    <div>
                                        <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                                            Categoría
                                        </dt>
                                        <dd className="mt-1 text-sm ">
                                            {product.category?.name ?? (
                                                <span className="italic text-gray-400">
                                                    Sin categoría
                                                </span>
                                            )}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                                            Descripción
                                        </dt>
                                        <dd className="mt-1 whitespace-pre-line text-sm ">
                                            {product.description ?? (
                                                <span className="italic text-gray-400">
                                                    Sin descripción
                                                </span>
                                            )}
                                        </dd>
                                    </div>

                                </dl>
                            </div>
                        </div>
                    </div>

                    {/* Columna derecha: tabs variantes / pedidos */}
                    <div className="lg:col-span-2">
                        <div className="rounded-xl border border-border bg-surface shadow-sm">
                            {/* Tabs */}
                            <div className="border-b border-border">
                                <nav className="flex gap-1 px-4">
                                    <button
                                        onClick={() => setActiveTab('variants')}
                                        className={`border-b-2 px-4 py-3 text-sm font-medium transition ${activeTab === 'variants'
                                                ? 'border-indigo-600 text-indigo-600'
                                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                            }`}
                                    >
                                        Variantes ({product.variants.length})
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('orders')}
                                        className={`border-b-2 px-4 py-3 text-sm font-medium transition ${activeTab === 'orders'
                                                ? 'border-indigo-600 text-indigo-600'
                                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                            }`}
                                    >
                                        Pedidos ({orders.length})
                                    </button>
                                </nav>
                            </div>

                            {/* Contenido tabs */}
                            <div className="p-5">
                                {activeTab === 'variants' && (
                                    <>
                                        {product.variants.length === 0 ? (
                                            <div className="py-12 text-center">
                                                <p className="text-sm text-gray-500">
                                                    Este producto no tiene
                                                    variantes registradas.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                {product.variants.map((v) => (
                                                    <VariantCard
                                                        key={v.id}
                                                        variant={v}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}

                                {activeTab === 'orders' && (
                                    <>
                                        {orders.length === 0 ? (
                                            <div className="py-12 text-center">
                                                <p className="text-sm text-gray-500">
                                                    Este producto aún no tiene
                                                    pedidos registrados.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="overflow-x-auto">
                                                <table className="w-full">
                                                    <thead>
                                                        <tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wide text-muted">
                                                            <th className="px-4 py-2">
                                                                Pedido
                                                            </th>
                                                            <th className="px-4 py-2">
                                                                Cliente
                                                            </th>
                                                            <th className="px-4 py-2">
                                                                Estado
                                                            </th>
                                                            <th className="px-4 py-2">
                                                                Fecha
                                                            </th>
                                                            <th className="px-4 py-2 text-right">
                                                                Subtotal
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {orders.map((order) => (
                                                            <OrderRow
                                                                key={order.id}
                                                                order={order}
                                                                productId={
                                                                    product.id
                                                                }
                                                            />
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}