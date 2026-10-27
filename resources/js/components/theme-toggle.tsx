import { useTheme } from "@/providers/theme-provider";
import { Moon } from "lucide-react";

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    const isDark = theme === "dark";

    return (
        <div className="w-full flex justify-between gap-2.5 items-center rounded-lg p-2.5 bg-background text-sm">
            <div className="flex items-center gap-2">
                <Moon
                    className="size-5"
                    aria-hidden="true"
                />
                <span>Modo oscuro</span>
            </div>
            <button
                type="button"
                role="switch"
                aria-checked={isDark}
                aria-label="Cambiar tema"
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className="relative inline-flex h-7 w-13 shrink-0 cursor-pointer
                items-center rounded-full border border-border
                bg-background p-1 transition-colors duration-300
                focus-visible:outline-none focus-visible:ring-2"
            >
                <span
                    className={`flex h-4 w-4 items-center justify-center
                    rounded-full bg-foreground shadow-sm
                    transition-transform duration-300
                     ${isDark ? "translate-x-6" : "translate-x-0"
                        }`}
                />
            </button>
        </div>
    );
}
