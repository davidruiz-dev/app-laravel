import { useForm } from "@inertiajs/react";
import { Category } from "../types/category.types";
import { useEffect } from "react";
import Button from "@/components/Button";

interface CategoryFormProps {
    category?: Category | null;
    onClose: () => void;
}

export function CategoryForm({ category, onClose }: CategoryFormProps) {

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
