import Button from "@/components/Button";
import ThemeToggle from "@/components/theme-toggle";
import { Link, router, usePage } from "@inertiajs/react";
import {
    BoxIcon,
    Calendar,
    ChartBar,
    Kanban,
    LayoutDashboard,
    LogOut,
    Menu,
    PlusIcon,
    TagIcon,
    Users2Icon,
    Wallet,
    X,
} from "lucide-react";

import FlashMessage from '@/components/FlashMessage';
import { ReactNode, useState } from "react";

interface Props {
    children: ReactNode;
    title: string;
}

const items = [
    { url: "/dashboard", title: "Dashboard", icon: <LayoutDashboard className="size-5" /> },
    { url: "/calendar", title: "Calendario", icon: <Calendar className="size-5" /> },
    { url: "/kanban", title: "Tablero", icon: <Kanban className="size-5" /> },
    { url: "/orders", title: "Pedidos", icon: <BoxIcon className="size-5" /> },
    { url: "/customers", title: "Clientes", icon: <Users2Icon className="size-5" /> },
    { url: "/categories", title: "Categorías", icon: <TagIcon className="size-5" /> },
    { url: "/expenses", title: "Gastos", icon: <Wallet className="size-5" /> },
    { url: "/reports", title: "Reportes", icon: <ChartBar className="size-5" /> },
];

export default function Layout({ children, title }: Props) {
    const { auth, } = usePage().props;
    const currentUser = auth.user;
    const [menuOpen, setMenuOpen] = useState(false);

    const { url } = usePage()

    const isActive = (path: string) => {
        const currentPath = url.split('?')[0]
        if (path === '/') {
            return currentPath === '/'
        }
        return currentPath === path ||
            currentPath.startsWith(`${path}/`)
    }

    const logout = () => {
        router.post("/logout");
    };

    const closeMenu = () => setMenuOpen(false);

    return (
        <div className="min-h-screen bg-background">
            <FlashMessage />
            {/* Barra superior: solo móvil */}
            <header className="md:hidden fixed top-0 inset-x-0 z-40 h-16
                bg-surface border-b border-border flex items-center
                justify-between px-4">
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="p-2 rounded-md hover:bg-background/50"
                    aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
                    aria-expanded={menuOpen}
                >
                    {menuOpen ? <X /> : <Menu />}
                </button>

                <h1 className="font-semibold truncate">{title}</h1>

                <span className="text-sm truncate max-w-28">
                    {currentUser.name}
                </span>
            </header>

            {/* Fondo oscuro: solo cuando el menú está abierto */}
            {menuOpen && (
                <button
                    type="button"
                    aria-label="Cerrar menú"
                    onClick={closeMenu}
                    className="fixed inset-0 z-40 bg-black/40 md:hidden"
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed left-0 top-0 z-50 h-screen w-64
                    bg-surface border-r border-border
                    flex flex-col p-4
                    transition-transform duration-300
                    md:translate-x-0
                    ${menuOpen ? "translate-x-0" : "-translate-x-full"}
                `}
            >
                <div className="mb-6 py-3 flex flex-col items-center">
                    <img
                        src="/storage/avatar-de-usuario.png"
                        alt="Avatar de usuario"
                        width={70}
                        height={70}
                        className="rounded-full object-cover"
                    />

                    <h1 className="font-bold mt-2">
                        {currentUser.name}
                    </h1>

                    <p className="text-muted text-sm text-center break-all">
                        {currentUser.email}
                    </p>
                </div>

                {/* NAV LINKS */}
                <nav className="flex-1 overflow-y-auto">
                    <Link
                        href="/orders/create"
                        onClick={closeMenu}
                        className="block mb-4"
                    >
                        <Button className="w-full justify-center">
                            <PlusIcon /> Nuevo pedido
                        </Button>
                    </Link>

                    {items.map((item) => (
                        <Link
                            key={item.url}
                            href={item.url}
                            onClick={closeMenu}
                            className={`flex gap-2.5 items-center rounded-md
                                px-2.5 py-3 hover:bg-background
                                text-sm ${isActive(item.url) ? 'bg-background' : ''}`}
                        >
                            {item.icon}
                            {item.title}
                        </Link>
                    ))}
                </nav>

                <ThemeToggle />
                <button
                    onClick={logout}
                    className="w-full flex gap-2.5 items-center mt-2
                        rounded-md px-2.5 py-3 hover:bg-background
                        text-sm"
                >
                    <LogOut className="size-5" /> Cerrar sesión
                </button>
            </aside>

            {/* Contenido principal */}
            <div className="pt-16 md:pt-0 md:ml-64">
                <main className="p-4 md:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
