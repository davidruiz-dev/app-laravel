import { useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "theme";

function getSystemTheme(): "light" | "dark" {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
}

function applyTheme(theme: Theme) {
    const resolvedTheme =
        theme === "system" ? getSystemTheme() : theme;

    document.documentElement.classList.toggle(
        "dark",
        resolvedTheme === "dark",
    );

    document.documentElement.style.colorScheme = resolvedTheme;
}

export function useTheme() {
    const [theme, setThemeState] = useState<Theme>(() => {
        if (typeof window === "undefined") return "system";

        const stored = localStorage.getItem(STORAGE_KEY);

        if (
            stored === "light" ||
            stored === "dark" ||
            stored === "system"
        ) {
            return stored;
        }

        return "system";
    });

    useEffect(() => {
        applyTheme(theme);
        localStorage.setItem(STORAGE_KEY, theme);
    }, [theme]);

    useEffect(() => {
        const media = window.matchMedia(
            "(prefers-color-scheme: dark)",
        );

        const handleChange = () => {
            if (theme === "system") {
                applyTheme("system");
            }
        };

        media.addEventListener("change", handleChange);

        return () => {
            media.removeEventListener("change", handleChange);
        };
    }, [theme]);

    return {
        theme,
        setTheme: setThemeState,
        toggleTheme: () => {
            setThemeState((current) =>
                current === "dark" ? "light" : "dark",
            );
        },
    };
}