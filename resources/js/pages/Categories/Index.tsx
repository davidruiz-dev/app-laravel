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
import { CategoryForm } from "@/features/Categories/components/CategoryForm";

interface Props {
    categories: Paginated<Category>;
    filters: {
        search?: string;
    };
}

export default function Index({ categories, filters }: Props) {
    const [showModal, setShowModal] = useState(false);
    const [showModalDelete, setShowModalDelete] = useState(false);
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

    const handleDelete = (category: Category) => {
        setSelectedCategory(category);
        setShowModalDelete(true);
    }

    const confirmDelete = () => {
        if (!selectedCategory) return;
        router.delete(`/categories/${selectedCategory.id}`, {
            onSuccess: () => {
                setShowModalDelete(false);
                setSelectedCategory(null);
            }
        }
        )
    }

    return (
        <Layout title="Categorías">
            <div className="flex mb-4 justify-between gap-10 items-center">
                <div>
                    <h1 className="text-2xl md:text-3xl font-semibold">Categorías</h1>
                    <p className="text-muted text-sm md:text-base">Lista de todos tus categorías registradas en el sistema.</p>
                </div>
                <Button onClick={handleCreate} size="md" className="fixed bottom-6 right-6 z-50 md:static">
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
                                                    onClick={() => handleDelete(category)}
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

                <Modal
                    show={showModalDelete}
                    onClose={() => setShowModalDelete(false)}
                    title={'Eliminar categoría'}
                >
                    <div className="space-y-3">
                        <p>Esta categoría se eliminará permanentemente. ¿Deseas continuar?</p>
                        <div className="flex justify-end gap-3 mt-5">
                            <Button variant="outline" onClick={() => setShowModalDelete(false)}>
                                Cancelar
                            </Button>
                            <Button variant="danger" onClick={confirmDelete}>Confirmar</Button>
                        </div>
                    </div>

                </Modal>
            </div>
        </Layout>
    )
}

