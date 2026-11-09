// resources/js/components/FlashMessages.tsx
import { usePage } from '@inertiajs/react';
import type { PageProps } from '@inertiajs/core';
import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface FlashProps extends PageProps {
    flash: {
        success?: string;
        error?: string;
    };
}

export default function FlashMessages() {
    const { flash } = usePage<FlashProps>().props;
    const [visible, setVisible] = useState(false);

    // Muestra la alerta cada vez que cambia el flash
    useEffect(() => {
        if (flash?.success || flash?.error) {
            setVisible(true);
            const timer = setTimeout(() => setVisible(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    if (!visible || (!flash?.success && !flash?.error)) return null;

    const isSuccess = !!flash.success;
    const message = flash.success || flash.error;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
            <div
                className={`relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl animate-in zoom-in-95 fade-in duration-300`}
                role="alert"
            >
                {/* Botón cerrar */}
                <button
                    onClick={() => setVisible(false)}
                    className="absolute right-4 top-4 rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                    aria-label="Cerrar"
                >
                    <X className="size-5" />
                </button>

                {/* Icono */}
                <div className="flex flex-col items-center text-center">
                    <div
                        className={`mb-4 flex size-16 items-center justify-center rounded-full ${
                            isSuccess ? 'bg-green-100' : 'bg-red-100'
                        }`}
                    >
                        {isSuccess ? (
                            <CheckCircle className="size-9 text-green-600" />
                        ) : (
                            <XCircle className="size-9 text-red-600" />
                        )}
                    </div>

                    {/* Título */}
                    <h2
                        className={`mb-2 text-xl font-bold ${
                            isSuccess ? 'text-green-700' : 'text-red-700'
                        }`}
                    >
                        {isSuccess ? '¡Operación exitosa!' : '¡Ha ocurrido un error!'}
                    </h2>

                    {/* Mensaje */}
                    <p className="text-sm leading-relaxed text-gray-600">
                        {message}
                    </p>

                    {/* Botón aceptar */}
                    <button
                        onClick={() => setVisible(false)}
                        className={`mt-6 w-full rounded-lg px-5 py-3 text-sm font-semibold text-white transition ${
                            isSuccess
                                ? 'bg-green-600 hover:bg-green-700'
                                : 'bg-red-600 hover:bg-red-700'
                        }`}
                    >
                        Aceptar
                    </button>
                </div>
            </div>
        </div>
    );
}