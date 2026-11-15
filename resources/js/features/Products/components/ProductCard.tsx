import { Card, CardContent, CardFooter } from '@/components/Card'
import { formatCurrency } from '@/utils/currency.util'
import { Product } from '../types/product.type'
import Badge from '@/components/Badge';
import { Link } from '@inertiajs/react';
import Button from '@/components/Button';
import { Eye, PencilIcon, Trash } from 'lucide-react';

interface Props {
    product: Product;
}

export default function ProductCard({ product }: Props) {
    const getPriceLabel = (product: Product) => {

        if (product.base_price && !product.is_customizable) {
            return <div className='flex flex-col'>
                <span className='font-semibold'>{formatCurrency(Number(product.base_price))}</span>
                <span className='text-sm text-muted'>Precio fijo</span>
            </div>;
        }

        if (product.variants.length !== 0) {
            const prices = product.variants
                ?.map(v => Number(v.price))
                .filter(price => Number.isFinite(price));

            if (!prices?.length) {
                return 'Precio no disponible';
            }

            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);

            return <div className='flex flex-col'>
                <span className='font-semibold text-sm'>{`${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`}</span>
                <span className='text-sm text-muted'>{product.variants.length} variaciones</span>
            </div>
        }

        if (product.base_price && product.is_customizable) {
            return <div className='flex flex-col'>
                <span className='font-semibold'>{formatCurrency(Number(product.base_price))}</span>
                <span className='text-sm text-muted'>Precio base sujeto a cotización</span>
            </div>
        }

        return 'Precio no definido';
    };

    return (
        <Card key={product.id}>
            <CardContent>
                <div className="flex justify-between flex-wrap gap-2">
                    <div className="flex items-start gap-4">
                        <img src={product.image_url ?? 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-YKwoMPIgLj0eGd4fimf49IclMWAIbMJQRe_r21HTcJ0TCmDfQk9CJSU&s=10'} alt={product.name} className="size-20 object-cover rounded-md" />
                        <div>
                            <h1 className="font-semibold">{product.name}</h1>
                            <p className="text-sm">{product.category?.name}</p>
                            <Badge variant={product.is_active ? 'success' : 'danger'}>{product.is_active ? 'Disponible' : 'Inactivo'}</Badge>
                        </div>
                    </div>

                    <h1>{getPriceLabel(product)}</h1>
                </div>

                {/* <div className="py-3">
                    {product.variants.length !== 0 && (
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <h1 className="font-semibold">Presentaciones</h1>
                                <span className="text-xs text-muted">{product.variants.length} variantes</span>
                            </div>

                            <div className="space-y-2">
                                {product.variants.map((v) => (
                                    <div className="flex justify-between items-center">
                                        <div className='flex gap-2'>
                                            {v.attributes && Object.entries(v.attributes).map(([key, value]) => (
                                                <div key={key} className="text-sm">
                                                    <strong>{key}:</strong> {value}
                                                </div>
                                            ))}
                                        </div>
                                        <span className='text-sm'>{formatCurrency(Number(v.price))}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div> */}


            </CardContent>
            <CardFooter>
                <div className="flex items-center gap-2">
                    <Link href={`/products/${product.id}`}>
                        <Button variant="outline" size="sm">
                            <Eye className="size-4" />
                            <span className="hidden md:inline">Ver más</span>
                        </Button>
                    </Link>

                    <Link href={`/products/${product.id}/edit`}>
                        <Button
                            variant="outline"
                            size="sm"
                        >
                            <PencilIcon className="size-4" />
                            <span className="hidden md:inline">Editar</span>
                        </Button>
                    </Link>

                    <Button
                            variant="danger"
                            size="sm"
                        >
                            <Trash className="size-4" />
                            <span className="hidden md:inline">Eliminar</span>
                        </Button>

                </div>
            </CardFooter>
        </Card>
    )
}
