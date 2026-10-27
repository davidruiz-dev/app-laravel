import { useEffect, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import Button from './Button';

interface ItemImagePreviewProps {
    file: File | null;
    onChange: (file: File | null) => void;
}

export default function ItemImagePreview({
    file,
    onChange,
}: ItemImagePreviewProps) {
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        if (!file) {
            setPreview(null);
            return;
        }

        const url = URL.createObjectURL(file);
        setPreview(url);

        return () => URL.revokeObjectURL(url);
    }, [file]);

    return (
        <div className="space-y-2">
            <input
                id="item-image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(event) => {
                    onChange(event.target.files?.[0] ?? null);
                    event.target.value = '';
                }}
            />

            <label
                htmlFor="item-image"
                className="flex min-h-36 cursor-pointer flex-col
                    items-center justify-center overflow-hidden
                    rounded-xl border-2 border-dashed border-border
                    bg-background transition "
            >
                {preview ? (
                    <img
                        src={preview}
                        alt="Vista previa del producto"
                        className="h-40 w-full object-contain"
                    />
                ) : (
                    <div className="flex flex-col items-center gap-2 p-4">
                        <ImagePlus size={30} className="text-muted" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                            Seleccionar imagen
                        </span>
                        <span className="text-xs text-muted">
                            PNG, JPG o WebP
                        </span>
                    </div>
                )}
            </label>

            {preview && (
                <div className="flex justify-center">
                    <Button
                    type="button"
                    onClick={() => onChange(null)}
                    variant='danger'
                >
                    <X size={16} />
                    Quitar imagen
                </Button>
                </div>
            )}
        </div>
    );
}
