import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { Category } from '@/features/Categories/types/category.types';
import { Card, CardContent, CardHeader } from '@/components/Card';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { PricingType, Product, ProductFormData, VariantRow } from '../types/product.type';
import { Textarea } from '@/components/Textarea';
import { Plus, Search, Trash, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/Select';
import { Switch } from '@/components/Switch';

const MAX_ATTRIBUTES = 4;


const emptyVariant = (attrCount: number): VariantRow => ({
    values: Array.from({ length: attrCount }, () => ''),
    price: '',
});
//const emptyExtra = (): ExtraRow => ({ name: '', price: '' });

function Field({ label, error, children, className = '', }: {
    label: string;
    error?: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <label className={`block space-y-1 ${className}`}>
            <span className="block text-sm font-medium ">{label}</span>
            {children}
            {error && <span className="block text-xs text-red-600">{error}</span>}
        </label>
    );
}

function buildInitial(product?: Product): ProductFormData {
    const attrs = product?.variants?.length
        ? Object.keys(product.variants[0].attributes ?? {})
        : [''];

    return {
        category_id: product?.category_id
            ? String(product.category_id)
            : '',

        name: product?.name ?? '',
        description: product?.description ?? '',
        image: null,
        is_active: product?.is_active ?? true,


        attributes: attrs,

        variants: product?.variants?.length
            ? product.variants.map((v) => ({
                values: attrs.map((a) => v.attributes?.[a] ?? ''),
                price: v.price ?? '',
            }))
            : [emptyVariant(attrs.length)],

        is_customizable: product?.is_customizable ?? true,
    };
}

interface Props {
    categories: Category[];
    product?: Product;
    searchCategory?: string;
}

export default function ProductForm({ categories, product, searchCategory = '' }: Props) {
    const isEdit = !!product;
    const { data, setData, post, processing, errors, transform } = useForm<ProductFormData>(buildInitial(product));
    const [searchTermCategory, setSearchTermCategory] = useState(searchCategory);

    const err = (key: string) => (errors as Record<string, string | undefined>)[key];

    const localPreview = useMemo(() => (data.image ? URL.createObjectURL(data.image) : null), [data.image]);
    useEffect(
        () => () => {
            if (localPreview) URL.revokeObjectURL(localPreview);
        },

        [localPreview],
    );
    const preview = localPreview ?? product?.image_url ?? null;

    // ---- atributos de variante ----
    const setAttr = (i: number, value: string) =>
        setData((prev) => ({ ...prev, attributes: prev.attributes.map((a, idx) => (idx === i ? value : a)) }));

    const addAttr = () =>
        setData((prev) => ({
            ...prev,
            attributes: [...prev.attributes, ''],
            variants: prev.variants.map((v) => ({ ...v, values: [...v.values, ''] })),
        }));

    const removeAttr = (i: number) =>
        setData((prev) => ({
            ...prev,
            attributes: prev.attributes.filter((_, idx) => idx !== i),
            variants: prev.variants.map((v) => ({ ...v, values: v.values.filter((_, idx) => idx !== i) })),
        }));

    // ---- variantes ----
    const setVariant = (i: number, patch: Partial<VariantRow>) =>
        setData((prev) => ({ ...prev, variants: prev.variants.map((v, idx) => (idx === i ? { ...v, ...patch } : v)) }));

    const setVariantValue = (i: number, j: number, value: string) =>
        setData((prev) => ({
            ...prev,
            variants: prev.variants.map((v, idx) =>
                idx === i ? { ...v, values: v.values.map((x, k) => (k === j ? value : x)) } : v,
            ),
        }));

    const addVariant = () => setData((prev) => ({ ...prev, variants: [...prev.variants, emptyVariant(prev.attributes.length)] }));
    const removeVariant = (i: number) => setData((prev) => ({ ...prev, variants: prev.variants.filter((_, idx) => idx !== i) }));

    const [withVariants, setWithVariant] = useState(
        product ? product.variants.length > 0 : false
    );

    const submit = (e: FormEvent) => {
        e.preventDefault();

        transform((d) => {
            const names = d.attributes.map((a) => a.trim());
            const keep = names.map((n, i) => (n ? i : -1)).filter((i) => i >= 0);
            const isVariant = d.variants.length !== 0;
            //const isCustom = d.pricing_type === 'custom';

            return {
                category_id: d.category_id,
                name: d.name,
                description: d.description,
                is_active: d.is_active,
                is_customizable: d.is_customizable,
                variant_attributes: isVariant ? keep.map((i) => names[i]) : [],
                variants: isVariant
                    ? d.variants
                        .filter((v) => v.values.some((x) => x.trim() !== ''))
                        .map((v) => ({
                            attributes: Object.fromEntries(keep.map((i) => [names[i], v.values[i].trim()])),
                            price: v.price,
                        }))
                    : [],
                ...(d.image ? { image: d.image } : {}),
                // multipart no soporta PUT nativo: spoofing de método
                ...(isEdit ? { _method: 'put' } : {}),
            };
        });

        post(isEdit ? `/products/${product!.id}` : '/products', {
            forceFormData: true,
            onSuccess: () => console.log('Producto guardado correctamente'),
            onError: (errors) => console.log('Errores:', errors),
        });
    };


    useEffect(() => {
        const timeout = window.setTimeout(() => {
            router.get(window.location.pathname,
                {
                    search_category: searchTermCategory.trim() || undefined
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                    only: ["categories", "filters"]
                },
            );
        }, 400);

        console.log(product)

        return () => window.clearTimeout(timeout);
    }, [searchTermCategory]);

    return (
        <form onSubmit={submit} className="max-w-4xl space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-semibold">{isEdit ? 'Editar producto' : 'Nuevo producto'}</h1>
                <p className="text-sm text-gray-500">Define la información del producto y cómo se calcula su precio.</p>
            </div>
            <Card>
                <CardHeader>
                    <h2 className="text-lg font-semibold">Información del producto</h2>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                        <Field label="Nombre" error={err('name')}>
                            <Input
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Caja de cupcakes"
                            />
                        </Field>

                        <Field label="Categoría" error={err('category_id')}>
                            <Select
                                value={data.category_id}
                                onValueChange={(value) => setData('category_id', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar categoría">
                                        {categories.find((category) => String(category.id) === data.category_id)?.name}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <div className="p-1">
                                        <Input
                                            value={searchTermCategory}
                                            placeholder="Buscar categoría por nombre"
                                            leftIcon={<Search size={17} />}
                                            onChange={(event) => setSearchTermCategory(event.target.value)}
                                        />
                                    </div>
                                    {categories.length === 0 ? (
                                        <div className="text-center text-sm text-muted p-2">No se han encontrado categorías</div>
                                    ) : (
                                        categories.map((category) => (
                                            <SelectItem key={category.id} value={String(category.id)}>
                                                {category.name}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </Field>
                    </div>

                    <Field label="Descripción" error={err('description')}>
                        <Textarea
                            rows={3}
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Cupcakes artesanales decorados a mano"
                        />
                    </Field>

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <Field label={isEdit ? 'Reemplazar imagen' : 'Imagen'} error={err('image')} className="flex-1">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setData('image', e.target.files?.[0] ?? null)}
                                className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200"
                            />
                        </Field>
                        {preview && (
                            <img src={preview} alt="Vista previa" className="h-24 w-24 rounded-md border border-gray-200 object-cover" />
                        )}
                    </div>

                    <div className='border border-border py-2 px-4 rounded-md flex items-center justify-between'>
                        <div>
                            <label htmlFor="" className='text-sm font-semibold'>Producto activo</label>
                            <p className='text-sm text-muted'>Este producto quedará visible en el catálogo para crear pedidos.</p>
                        </div>
                        <Switch
                            checked={data.is_active}
                            onChange={(e) => setData('is_active', e)}
                        />
                    </div>

                    <div className='border border-border py-2 px-4 rounded-md flex items-center justify-between'>
                        <div className='mr-4 xl:mr-20'>
                            <label htmlFor="" className='text-sm font-semibold'>Producto personalizable</label>
                            <p className='text-sm text-muted'>
                                Selecciona para permitir cotizaciones que pueden variar el precio de este producto, caso contrario el producto tendrá un precio fijo.
                            </p>
                        </div>
                        <Switch
                            checked={data.is_customizable}
                            onChange={(e) => setData('is_customizable', e)}
                        />
                    </div>

                    {data.is_customizable && (
                        <p className="rounded-md bg-gray-50 p-3 text-sm text-gray-600">
                            El cliente describe lo que quiere y tú defines el precio final en el pedido.
                        </p>
                    )}
                </CardContent>
            </Card>


            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Variantes</h2>
                            <p className="text-sm text-gray-500">Primero nombra los atributos (Unidades, Sabor, Tamaño...) y luego crea por combinación.</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <span className="block text-sm font-medium text-gray-700">Atributos para cada variante</span>
                        {err('variant_attributes') && <p className="text-xs text-red-600">{err('variant_attributes')}</p>}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className='flex flex-wrap gap-2'>
                                {data.attributes.map((a, j) => (
                                    <div key={j} className="flex items-center gap-1">
                                        <Input
                                            value={a}
                                            onChange={(e) => setAttr(j, e.target.value)}
                                            placeholder={j === 0 ? 'Unidades' : j === 1 ? 'Tamaño' : 'Atributo'}
                                        />
                                        {data.attributes.length > 1 && (
                                            <Button variant='danger' type="button" onClick={() => removeAttr(j)} aria-label="Quitar atributo">
                                                <Trash size={17} />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {data.attributes.length < MAX_ATTRIBUTES && (
                                <Button variant='secondary' type="button" onClick={addAttr}>
                                    <Plus size={17} /> Nuevo atributo
                                </Button>
                            )}
                        </div>
                    </div>

                    {err('variants') && <p className="text-xs text-red-600">{err('variants')}</p>}


                    <div className="space-y-3">
                        {data.variants.map((v, i) => (
                            <div
                                key={i}
                                className="rounded-xl border border-border bg-surface p-4 space-y-4"
                            >
                                {/* Cabecera */}
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-semibold ">
                                        Variante {i + 1}
                                    </h3>

                                    <button
                                        type="button"
                                        onClick={() => removeVariant(i)}
                                        disabled={data.variants.length === 1}
                                        aria-label="Quitar variante"
                                        className='cursor-pointer disabled:cursor-not-allowed'
                                    >
                                        <X size={17} />
                                    </button>
                                </div>

                                {/* Atributos */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {v.values.map((val, j) => (
                                        <div key={j} className="space-y-1">
                                            <label className="block text-xs font-medium">
                                                {data.attributes[j]?.trim() ||
                                                    `Atributo ${j + 1}`}
                                            </label>

                                            <Input
                                                value={val}
                                                onChange={(e) =>
                                                    setVariantValue(i, j, e.target.value)
                                                }
                                                placeholder={
                                                    j === 0 ? "Chocolate" : "Grande"
                                                }
                                            />
                                        </div>
                                    ))}
                                </div>



                                {/* Precio */}
                                {(
                                    <div className="space-y-1">
                                        <label className="block text-xs font-medium">
                                            Precio (S/)
                                        </label>

                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={v.price}
                                            onChange={(e) =>
                                                setVariant(i, { price: e.target.value })
                                            }
                                            placeholder="00.00"
                                        />

                                        {err(`variants.${i}.price`) && (
                                            <span className="block text-xs text-red-600">
                                                {err(`variants.${i}.price`)}
                                            </span>
                                        )}
                                    </div>
                                )}

                                {err(`variants.${i}.attributes`) && (
                                    <span className="block text-xs text-red-600">
                                        {err(`variants.${i}.attributes`)}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end">
                        <Button variant='secondary' type="button" onClick={addVariant} size='sm'>
                            <Plus size={17} /> Nueva variante
                        </Button>
                    </div>
                </CardContent>
            </Card>


            {/* {showExtras && (
                <Card>
                    <CardHeader>
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Extras</h2>
                                <p className="text-sm text-gray-500">Opcionales que suman recargo (relleno premium, topper, cobertura...).</p>
                            </div>
                            <Button type="button" onClick={addExtra}>
                                + Agregar
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {data.extras.length === 0 && <p className="text-sm text-gray-500">Sin extras.</p>}
                        {data.extras.map((x, i) => (
                            <div key={i} className="grid grid-cols-1 items-end gap-2 rounded-md border border-gray-200 p-3 sm:grid-cols-12">
                                <Field label="Nombre" error={err(`extras.${i}.name`)} className="sm:col-span-7">
                                    <Input
                                        value={x.name}
                                        onChange={(e) => setExtra(i, { name: e.target.value })}
                                        placeholder="Cobertura de ganache"
                                    />
                                </Field>
                                <Field label="Recargo (S/)" error={err(`extras.${i}.price`)} className="sm:col-span-4">
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={x.price}
                                        onChange={(e) => setExtra(i, { price: e.target.value })}
                                        placeholder="4.00"
                                    />
                                </Field>
                                <div className="sm:col-span-1 sm:pb-0.5">
                                    <Button type="button" onClick={() => removeExtra(i)} className={`w-full ${dangerBtnCls}`} aria-label="Quitar extra">
                                        ✕
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )} */}

            <div className="flex justify-end gap-3">
                <Button variant='outline' type="button" onClick={() => window.history.back()} >
                    Cancelar
                </Button>
                <Button type="submit" disabled={processing}>
                    {processing ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Guardar producto'}
                </Button>
            </div>
        </form>
    );
}