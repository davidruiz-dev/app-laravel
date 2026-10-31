import { usePage } from '@inertiajs/react';
import type { PageProps as InertiaPageProps } from '@inertiajs/core';
import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';

interface PageProps extends InertiaPageProps {
    flash: {
        success?: string;
        error?: string;
    };
}

export default function FlashMessage() {
    const page = usePage<PageProps>();
    const { flash } = page.props;

    const [visible, setVisible] = useState(false);

    const message = flash.success || flash.error;
    const isSuccess = Boolean(flash.success);

    useEffect(() => {
        if (!message) {
            setVisible(false);
            return;
        }

        setVisible(true);

        const timeout = setTimeout(() => {
            setVisible(false);
        }, 5000);

        return () => clearTimeout(timeout);
    }, [message, page.url]);

    useEffect(() => {
        if (!visible) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setVisible(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [visible]);

    if (!visible || !message) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-100 flex items-center
                justify-center bg-black/50 p-4"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    setVisible(false);
                }
            }}
        >
            <div
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="flash-title"
                aria-describedby="flash-description"
                className="w-full max-w-sm animate-in zoom-in-95
                    fade-in duration-200 rounded-2xl border
                    border-border bg-background p-6 shadow-2xl "
            >
                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={() => setVisible(false)}
                        aria-label="Cerrar alerta"
                        className="rounded-lg p-1 text-muted
                            transition hover:bg-gray-100 hover:text-gray-700
                            dark:hover:bg-gray-800 dark:hover:text-gray-200"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex flex-col items-center text-center">
                    <div
                        className={`mb-4 flex h-16 w-16 items-center
                            justify-center rounded-full ${
                                isSuccess
                                    ? 'bg-green-100 text-green-600 dark:bg-green-500/15 dark:text-green-400'
                                    : 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400'
                            }`}
                    >
                        {isSuccess ? (
                            <CheckCircle2 size={36} strokeWidth={1.8} />
                        ) : (
                            <XCircle size={36} strokeWidth={1.8} />
                        )}
                    </div>

                    <h2
                        id="flash-title"
                        className="text-xl font-semibold text-gray-900
                            dark:text-white"
                    >
                        {isSuccess ? '¡Operación exitosa!' : 'Ha ocurrido un error'}
                    </h2>

                    <p
                        id="flash-description"
                        className="mt-2 text-sm leading-6 text-gray-600
                            dark:text-gray-300"
                    >
                        {message}
                    </p>

                    <button
                        type="button"
                        onClick={() => setVisible(false)}
                        className={`mt-6 rounded-xl px-4 py-2.5
                            text-sm font-medium text-white transition
                            focus-visible:outline-none focus-visible:ring-2
                            focus-visible:ring-offset-2 ${
                                isSuccess
                                    ? 'bg-green-600 hover:bg-green-700 focus-visible:ring-green-500'
                                    : 'bg-red-600 hover:bg-red-700 focus-visible:ring-red-500'
                            }`}
                    >
                        Entendido
                    </button>
                </div>
            </div>
        </div>
    );
}
