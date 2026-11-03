import Button from "@/components/Button";
import Modal from "@/components/Modal";
import Layout from "@/layouts/Layout"
import { formatDateTime } from '@/utils/date'
import { router, useForm } from "@inertiajs/react";
import { Pencil, PlusCircleIcon, PlusIcon, Search, Trash, } from 'lucide-react';
import { useEffect, useState } from "react";
import { Category } from "@/features/Categories/types/category.types";
import { Paginated } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/Table";
import TablePagination from "@/components/TablePagination";
import Input from "@/components/Input";

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

    useEffect(() => {
        const timeout = setTimeout(() => {
            const current = filters.search ?? '';
            if (search === current) return;

            router.get(
                '/categories',
                { ...filters, search, page: 1 },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                }
            );
        }, 400);

        return () => clearTimeout(timeout);
    }, [search]);

    const handlePerPage = (perPage: number) => {
    router.get(
      '/categories',
      { ...filters, per_page: perPage, page: 1 },
      {
        preserveState: true,
        preserveScroll: true,
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
            <div className="flex mb-4 justify-between gap-10 items-center">
                <div>
                    <h1 className="text-2xl md:text-3xl font-semibold">Categorías</h1>
                    <p className="text-muted text-sm md:text-base">Lista de todos tus categorías registradas en el sistema.</p>
                </div>
                <Button onClick={handleCreate} size="md">
                    <PlusIcon size={17} />
                    <span className="hidden md:block">Nueva categoría</span>
                </Button>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="relative w-full max-w-sm">
                        <Input
                            leftIcon={<Search size={17} />}
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar categoría..."
                        />
                    </div>
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
                            <TableHead>Nombre</TableHead>
                            <TableHead>Fecha de creación</TableHead>
                            <TableHead>Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3}>
                                    <p className="text-center text-muted">
                                        {search ? 'No se encontraron categorías con ese nombre.'
                                            : 'No hay categorías registradas.'
                                        }
                                    </p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            categories.data.map((category) => (
                                <TableRow
                                    key={category.id}
                                >
                                    {/* Nombre */}
                                    <TableCell>
                                        <div>

                                            <p className="font-medium first-letter:uppercase">
                                                {category.name}
                                            </p>
                                        </div>
                                    </TableCell>

                                    {/* Fecha */}
                                    <TableCell>
                                        {formatDateTime(category.created_at)}
                                    </TableCell>

                                    {/* Acciones */}
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEdit(category)}
                                            >
                                                <Pencil className="size-4" />
                                                <span className="hidden md:inline">Editar</span>
                                            </Button>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => { }}
                                            >
                                                <Trash className="size-4" />
                                                <span className="hidden md:inline">Eliminar</span>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}



                    </TableBody>
                </Table>
                <TablePagination
                    paginator={categories}
                    filters={filters}
                    onPerPageChange={handlePerPage}
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
                    variant="outline"
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
