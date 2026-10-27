import Button from "@/components/Button";
import Modal from "@/components/Modal";
import Layout from "@/layouts/Layout"
import { formatDateTime } from '@/utils/date'
import { router, useForm } from "@inertiajs/react";
import { PlusCircleIcon, Search, } from 'lucide-react';
import { useEffect, useState } from "react";
import { Category } from "@/features/Categories/types/category.types";
import { Paginated } from "@/types";
import TablePagination, { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/Table";

interface Props {
    categories: Paginated<Category>;
    filters: {
        search?: string;
    };
}

export default function Index({ categories, filters }: Props) {
    const [showModal, setShowModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    const [search, setSearch] = useState(filters.search ?? '');



    const handleSearch = (value: string) => {
        setSearch(value);

        router.get('/categories',
            {
                search: value,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const handleCreate = () => {
        setSelectedCategory(null);
        setShowModal(true);
    };

    const handleEdit = (category: Category) => {
        setSelectedCategory(category);
        setShowModal(true);
    };

    const handleClose = () => {
        setShowModal(false);
        setSelectedCategory(null);
    };


    return (
        <Layout title="Categorías">
            <div className="mb-4">
                <h1 className="text-3xl font-semibold">Categorías</h1>
                <p className="text-muted">Lista de todos tus categorías registradas en el sistema.</p>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="relative w-full max-w-sm">
                        <Search
                            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="search"
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder="Buscar categoría..."
                            className="w-full rounded-lg border border-slate-300 dark:text-gray-50 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-neutral-700 dark:bg-neutral-900"
                        />
                    </div>

                    <Button onClick={handleCreate}>
                        <PlusCircleIcon />
                        Nueva categoría
                    </Button>
                </div>

                <Modal
                    show={showModal}
                    onClose={handleClose}
                    title={selectedCategory ? 'Editar categoría' : 'Nueva categoría'}
                >
                    <CategoryForm
                        category={selectedCategory}
                        onClose={handleClose}
                    />
                </Modal>


                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>
                                Nombre
                            </TableHead>

                            <TableHead >
                                Fecha de creación
                            </TableHead>

                            <TableHead>
                                Acciones
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {categories.data.map((category) => (
                            <TableRow
                                key={category.id}

                            >
                                {/* Nombre */}
                                <TableCell>
                                    <div>
                                        {/* <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-sm font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                                                    {category.name.charAt(0).toUpperCase()}
                                                </div> */}

                                        <p className="font-medium text-slate-900 dark:text-slate-100 first-letter:uppercase">
                                            {category.name}
                                        </p>
                                    </div>
                                </TableCell>

                                {/* Fecha */}
                                <TableCell>
                                    <span className="text-slate-600 dark:text-slate-400">
                                        {formatDateTime(category.created_at)}
                                    </span>
                                </TableCell>

                                {/* Acciones */}
                                <TableCell>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(category)}
                                            type="button"
                                            className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-slate-300 dark:hover:border-blue-500/30 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
                                            aria-label={`Editar ${category.name}`}
                                        >
                                            <svg
                                                className="mr-1.5 h-4 w-4"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <path d="M12 20h9" />
                                                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
                                            </svg>

                                            Editar
                                        </button>

                                        <button
                                            type="button"
                                            className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-red-600 transition hover:border-red-200 hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-red-400 dark:hover:border-red-500/30 dark:hover:bg-red-500/10"
                                            aria-label={`Eliminar ${category.name}`}
                                        >
                                            <svg
                                                className="mr-1.5 h-4 w-4"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <path d="M3 6h18" />
                                                <path d="M8 6V4h8v2" />
                                                <path d="M19 6l-1 14H6L5 6" />
                                                <path d="M10 11v5" />
                                                <path d="M14 11v5" />
                                            </svg>

                                            Eliminar
                                        </button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <TablePagination 
                    links={categories.links}
                    total={categories.total}
                    last_page={categories.last_page}
                    current_page={categories.current_page}
                />
            </div>
        </Layout>
    )
}


interface CategoryFormProps {
    category?: Category | null;
    onClose: () => void;
}

function CategoryForm({ category, onClose }: CategoryFormProps) {

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: category?.name ?? '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (category) {
            put(`/categories/${category.id}`, {
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
            return;
        }

        post('/categories', {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };


    useEffect(() => {
        setData('name', category?.name ?? '');
    }, [category]);


    return (
        <form onSubmit={submit} className="space-y-5">
            <div>
                <label
                    htmlFor="name"
                    className="block text-sm font-medium text-foreground"
                >
                    Nombre
                </label>

                <input
                    id="name"
                    type="text"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="Ej. alfajores"
                    autoFocus
                    className="mt-2 w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />

                {errors.name && (
                    <p className="mt-1 text-sm text-danger">
                        {errors.name}
                    </p>
                )}
            </div>

            <div className="flex justify-end gap-3">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={onClose}
                >
                    Cancelar
                </Button>

                <Button type="submit" disabled={processing}>
                    {processing ? 'Guardando...' : 'Guardar'}
                </Button>
            </div>
        </form>
    );
}
