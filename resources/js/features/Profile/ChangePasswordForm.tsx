import Button from '@/components/Button';
import { Card, CardContent } from '@/components/Card';
import Input from '@/components/Input';
import { useForm } from '@inertiajs/react';

export default function ChangePasswordForm() {
    const { data, setData, put, processing, errors, reset } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        put('/profile/password', {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    return (
        <Card>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4 p-3">
                    <div>
                        <Input
                            label='Contraseña actual'
                            type="password"
                            value={data.current_password}
                            onChange={e => setData('current_password', e.target.value)}
                        />
                        {errors.current_password && <p>{errors.current_password}</p>}
                    </div>

                    <div>
                        <Input
                            label='Nueva contraseña'
                            type="password"
                            value={data.password}
                            onChange={e => setData('password', e.target.value)}
                        />
                        {errors.password && <p>{errors.password}</p>}
                    </div>

                    <div>
                        <Input
                            label='Confirmar nueva contraseña'
                            type="password"
                            value={data.password_confirmation}
                            onChange={e => setData('password_confirmation', e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Actualizando...' : 'Cambiar contraseña'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}