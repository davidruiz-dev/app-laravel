import { Check, ChevronDown } from "lucide-react";
import * as React from "react";

type SelectContextType = {
  value: string;
  setValue: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
};

const SelectContext =
  React.createContext<SelectContextType | null>(null);

function useSelect() {
  const context = React.useContext(SelectContext);

  if (!context) {
    throw new Error(
      "Select components must be inside Select"
    );
  }

  return context;
}

type SelectProps = {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
};

export function Select({
  value,
  onValueChange,
  children,
}: SelectProps) {
  const [open, setOpen] = React.useState(false);

  const context = React.useMemo(
    () => ({
      value,
      setValue: onValueChange,
      open,
      setOpen,
    }),
    [value, onValueChange, open]
  );

  return (
    <SelectContext.Provider value={context}>
      <div className="relative inline-block min-w-56 w-full" >
        {children}
      </div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({
  children,
}: {
  children: React.ReactNode;
}) {
  const { open, setOpen } = useSelect();

  return (
    <button
      type="button"
      aria-haspopup="listbox"
      aria-expanded={open}
      onClick={() => setOpen(!open)}
      className="flex w-full items-center justify-between
        rounded-md border border-border bg-background/40 px-3 h-10
        text-sm "
    >
      {children}
      <span aria-hidden="true"><ChevronDown size={14}/></span>
    </button>
  );
}

export function SelectValue({
  placeholder = "Seleccionar...",
  children,
}: {
  placeholder?: string;
  children?: React.ReactNode;
}) {
  const { value } = useSelect();

  return (
    <span
      className={`${
        value ? "text-foreground" : "text-gray-400"
      } first-letter:uppercase`}
    >
      {value ? children ?? value : placeholder}
    </span>
  );
}

export function SelectContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { open, setOpen } = useSelect();

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Cerrar opciones"
        className="fixed inset-0 z-50 cursor-default"
        onClick={() => setOpen(false)}
      />

      <div
        role="listbox"
        className="absolute left-0 top-full z-100 mt-1
          w-full rounded-md border border-border
          bg-surface p-1 shadow-lg"
      >
        {children}
      </div>
    </>
  );
}

export function SelectItem({
  value,
  children,
}: {
  value: string;
  children: React.ReactNode;
}) {
  const context = useSelect();
  const selected = context.value === value;

  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      onClick={() => {
        context.setValue(value);
        context.setOpen(false);
      }}
      className={`flex w-full items-center justify-between
        rounded-sm px-3 h-10 text-left text-sm
        ${
          selected
            ? "bg-background text-foreground "
            : " hover:bg-background"
        }`}
    >
      {children}
      {selected && <span aria-hidden="true">
          <Check size={15}/>
        </span>}
    </button>
  );
}
