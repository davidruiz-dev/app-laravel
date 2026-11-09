import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { formatPhone, maskedPhone } from "@/utils/phone.util";

interface PhoneNumberProps {
    phone: string;
    canReveal?: boolean;
}

export default function PhoneNumber({
    phone,
    canReveal = false,
}: PhoneNumberProps) {
    const [visible, setVisible] = useState(false);
    const showPhone = canReveal && visible;

    return (
        <div className="flex items-center gap-2">
            <span className="tabular-nums">
                {showPhone ? formatPhone(phone) : maskedPhone(phone)}
            </span>

            {canReveal && (
                <button
                    type="button"
                    onClick={() => setVisible(!visible)}
                    aria-label={
                        visible
                            ? "Ocultar teléfono"
                            : "Mostrar teléfono"
                    }
                    className="text-muted hover:text-gray-700"
                >
                    {visible ? (
                        <EyeOff size={18} />
                    ) : (
                        <Eye size={18} />
                    )}
                </button>
            )}
        </div>
    );
}
