
import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Eye, EyeOff, LockKeyhole, UserRound, Mail, ShieldCheck, CheckCircle2 } from 'lucide-react';
import Layout from '@/layouts/Layout';
import { Card, CardContent, CardHeader } from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';

interface User {
    name: string;
    email: string;
}

interface ProfileProps {
    user: User;
}

export default function Profile({ user }: ProfileProps) {
    const [showCurrent, setShowCurrent] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

    const { data, setData, put, processing, errors, reset, recentlySuccessful } =
        useForm({
            current_password: '',
            password: '',
            password_confirmation: '',
        });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        put('/profile/password', {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    const inputClass = (hasError?: boolean) =>
        `w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition
        placeholder:text-gray-400 focus:ring-4
        ${hasError
            ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
            : 'border-gray-200 focus:border-indigo-400 focus:ring-indigo-50'
        }`;

    return (
        <Layout title="Mi perfil">
            <Head title="Mi perfil" />

            <div className="min-h-screen">
                <div className="mx-auto max-w-4xl space-y-7">
                    {/* Encabezado */}
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Mi perfil
                        </h1>
                        <p className="mt-1 text-sm text-muted">
                            Administra tu información personal y la seguridad de tu cuenta.
                        </p>
                    </div>

                    {/* Información del usuario */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                    <UserRound size={21} />
                                </div>
                                <div>
                                    <h2 className="font-semibold">
                                        Información de la cuenta
                                    </h2>
                                    <p className="text-sm text-muted">
                                        Datos de tu cuenta de administrador.
                                    </p>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-700">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>

                                <div className="min-w-0 flex-1 space-y-3">
                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                            Nombre
                                        </p>
                                        <p className="mt-1 font-semibold">
                                            {user.name}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                            Correo electrónico
                                        </p>
                                        <p className="mt-1 flex items-center gap-2 text-sm ">
                                            <Mail size={15} className="text-gray-400" />
                                            {user.email}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 self-start rounded-full bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 sm:self-center">
                                    <ShieldCheck size={15} />
                                    Cuenta activa
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Cambiar contraseña */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                                    <LockKeyhole size={21} />
                                </div>
                                <div>
                                    <h2 className="font-semibold">
                                        Cambiar contraseña
                                    </h2>
                                    <p className="text-sm text-muted">
                                        Actualiza tu contraseña para mantener segura tu cuenta.
                                    </p>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-5">

                            {/* Contraseña actual */}
                            <div>
                      
                                <div className="relative">
                                    <Input
                                        label='Contraseña actual'
                                        type={showCurrent ? 'text' : 'password'}
                                        value={data.current_password}
                                        onChange={e => setData('current_password', e.target.value)}
                                        placeholder="Ingresa tu contraseña actual"
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrent(!showCurrent)}
                                        className="absolute right-0 top-9 flex items-center px-4 text-gray-400 hover:text-gray-600"
                                        aria-label="Mostrar u ocultar contraseña actual"
                                    >
                                        {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>

                                {errors.current_password && (
                                    <p className="mt-1.5 text-xs text-red-600">
                                        {errors.current_password}
                                    </p>
                                )}
                            </div>

                            {/* Nueva contraseña */}
                            <div>
                                <div className="relative">
                                    <Input
                                        label='Nueva contraseña'
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password}
                                        onChange={e => setData('password', e.target.value)}
                                        placeholder="Ingresa tu nueva contraseña"
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-0 top-9 flex items-center px-4 text-gray-400 hover:text-gray-600"
                                        aria-label="Mostrar u ocultar nueva contraseña"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>

                                {errors.password && (
                                    <p className="mt-1.5 text-xs text-red-600">
                                        {errors.password}
                                    </p>
                                )}

                                <p className="mt-2 text-xs text-gray-400">
                                    Utiliza al menos 8 caracteres para tu contraseña.
                                </p>
                            </div>

                            {/* Confirmar contraseña */}
                            <div>
                                <div className="relative">
                                    <Input
                                        label='Confirmar nueva contraseña'
                                        type={showConfirmation ? 'text' : 'password'}
                                        value={data.password_confirmation}
                                        onChange={e => setData('password_confirmation', e.target.value)}
                                        placeholder="Vuelve a ingresar tu nueva contraseña"
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmation(!showConfirmation)}
                                        className="absolute right-0 top-9 flex items-center px-4 text-gray-400 hover:text-gray-600"
                                        aria-label="Mostrar u ocultar confirmación"
                                    >
                                        {showConfirmation ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Aviso de seguridad */}
                            <div className="flex gap-3 rounded-xl border border-blue-100 bg-blue-50/70 dark:bg-blue-900/20 dark:border-blue-800 p-4">
                                <ShieldCheck size={19} className="mt-0.5 shrink-0 text-blue-600" />
                                <div>
                                    <p className="text-sm font-medium text-blue-900">
                                        Recomendación de seguridad
                                    </p>
                                    <p className="mt-1 text-xs leading-relaxed text-blue-700">
                                        Evita utilizar contraseñas que ya uses en otras cuentas.
                                        No compartas tus credenciales con otras personas.
                                    </p>
                                </div>
                            </div>

                            {/* Acciones */}
                            <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    {recentlySuccessful && (
                                        <p className="flex items-center gap-2 text-sm font-medium text-green-600">
                                            <CheckCircle2 size={17} />
                                            Contraseña actualizada correctamente.
                                        </p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    disabled={processing}
                                >
                                    <LockKeyhole size={16} />
                                    {processing ? 'Actualizando...' : 'Actualizar contraseña'}
                                </Button>
                            </div>
                        </form>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </Layout>
    );
}
