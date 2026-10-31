import { useEffect } from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

interface ToastProps {
    message: string;
    type?: "error" | "success";
    onClose: () => void;
}

export default function Toast({
    message,
    type = "error",
    onClose,
}: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const isError = type === "error";

    return (
        <div
            role="alert"
            className="fixed right-5 top-5 z-[100] flex w-[calc(100%-2.5rem)] max-w-sm items-start gap-3 rounded-xl border bg-white p-4 shadow-xl animate-in slide-in-from-top-3 fade-in duration-300"
        >
            <div
                className={`mt-0.5 rounded-full p-1 ${
                    isError ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                }`}
            >
                {isError ? (
                    <AlertCircle size={18} />
                ) : (
                    <CheckCircle2 size={18} />
                )}
            </div>

            <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900">
                    {isError ? "No se pudo completar la acción" : "Operación exitosa"}
                </p>
                <p className="mt-1 text-sm text-gray-600">{message}</p>
            </div>

            <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar notificación"
                className="text-gray-400 transition hover:text-gray-700"
            >
                <X size={18} />
            </button>
        </div>
    );
}
