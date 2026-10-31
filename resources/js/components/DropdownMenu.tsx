
import { ChevronDown } from "lucide-react";
import * as React from "react";

type DropdownContextType = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const DropdownContext =
  React.createContext<DropdownContextType | null>(null);

function useDropdown() {
  const context = React.useContext(DropdownContext);

  if (!context) {
    throw new Error(
      "Dropdown components must be used inside DropdownMenu"
    );
  }

  return context;
}

// Contenedor principal
type DropdownMenuProps = {
  children: React.ReactNode;
};

export function DropdownMenu({
  children,
}: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block text-left">
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

// Botón que abre y cierra el menú
type DropdownMenuTriggerProps = {
  children: React.ReactNode;
};

export function DropdownMenuTrigger({
  children,
}: DropdownMenuTriggerProps) {
  const { open, setOpen } = useDropdown();

  return (
    <button
      type="button"
      aria-haspopup="menu"
      aria-expanded={open}
      onClick={() => setOpen((prev) => !prev)}
      className="inline-flex items-center gap-2 rounded-md border
        border-border bg-surface px-3 py-2 text-sm font-medium 
        focus:outline-none cursor-pointer"
    >
      {children}
      <span aria-hidden="true">
        <ChevronDown size={15}/>
      </span>
    </button>
  );
}

// Contenido del dropdown
type DropdownMenuContentProps = {
  children: React.ReactNode;
};

export function DropdownMenuContent({
  children,
}: DropdownMenuContentProps) {
  const { open, setOpen } = useDropdown();

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Cerrar menú"
        className="fixed inset-0 z-40 cursor-default"
        onClick={() => setOpen(false)}
      />

      <div
        role="menu"
        className="absolute right-0 z-50 mt-2 min-w-48
          rounded-md border border-border bg-surface p-1
          shadow-lg"
      >
        {children}
      </div>
    </>
  );
}

// Opción del menú
type DropdownMenuItemProps = {
  children: React.ReactNode;
  onSelect?: () => void;
  destructive?: boolean;
};

export function DropdownMenuItem({
  children,
  onSelect,
  destructive = false,
}: DropdownMenuItemProps) {
  const { setOpen } = useDropdown();

  return (
    <button
      type="button"
      role="menuitem"
      onClick={() => {
        onSelect?.();
      }}
      className={`flex w-full items-center rounded-sm px-3 py-2
        text-left text-sm outline-none transition-colors
        ${
          destructive
            ? "text-red-600 hover:bg-red-50"
            : " hover:bg-background"
        }`}
    >
      {children}
    </button>
  );
}

// Separador visual
export function DropdownMenuSeparator() {
  return (
    <div
      role="separator"
      className="my-1 h-px bg-gray-200"
    />
  );
}
