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
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-2">
            <div
                className={`flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg ${
                    isSuccess
                        ? 'border-green-200 bg-green-50 text-green-800'
                        : 'border-red-200 bg-red-50 text-red-800'
                }`}
                role="alert"
            >
                {isSuccess ? (
                    <CheckCircle className="size-5 text-green-600" />
                ) : (
                    <XCircle className="size-5 text-red-600" />
                )}
                <span className="text-sm font-medium">{message}</span>
                <button
                    onClick={() => setVisible(false)}
                    className="ml-2 rounded p-1 hover:bg-black/5"
                    aria-label="Cerrar"
                >
                    <X className="size-4" />
                </button>
            </div>
        </div>
    );
}