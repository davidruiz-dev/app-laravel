import { XIcon } from 'lucide-react';
import { ReactNode, useEffect } from 'react';

interface ModalProps {
    show: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
}

export default function Modal({
    show,
    onClose,
    title,
    children,
}: ModalProps) {
    useEffect(() => {
        if (!show) return;

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [show, onClose]);

    if (!show) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
        >
            {/* Overlay */}
            <div
                className="absolute inset-0 h-screen bg-black/50"
                onClick={onClose}
            />

            {/* Contenido */}
            <div className="relative z-10 w-full max-w-xl rounded-xl bg-surface shadow-xl">
                <div className="flex items-center justify-between border-b border-border border-black/10 px-6 py-4">
                    <h2 className="text-lg font-semibold text-foreground">
                        {title}
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-muted hover:bg-gray-100"
                        aria-label="Cerrar"
                    >
                        <XIcon/>
                    </button>
                </div>

                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}
