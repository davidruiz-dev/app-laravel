import { useForm } from "@inertiajs/react";
import { Customer } from "../types/customer.types";
import Button from "@/components/Button";

interface Props {
  customer: Customer | null;
  mode: 'create' | 'edit';
  onClose: () => void;
}

export default function CustomerForm({ customer, mode, onClose }: Props) {
  const form = useForm({
    full_name: customer?.full_name ?? '',
    phone: customer?.phone ?? '',
    email: customer?.email ?? '',
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'create') {
      form.post('/customers');
    } else {
      form.put(`/customers/${customer?.id}`);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <div>
        <label
          htmlFor="name"
          className="mb-2 block text-sm font-medium"
        >
          Nombre completo
        </label>

        <input
          id="name"
          type="text"
          value={form.data.full_name}
          onChange={(e) =>
            form.setData('full_name', e.target.value)
          }
          className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
        />

        {form.errors.full_name && (
          <p className="mt-1 text-sm text-destructive">
            {form.errors.full_name}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="phone"
          className="mb-2 block text-sm font-medium"
        >
          Teléfono
        </label>

        <input
          id="phone"
          type="tel"
          value={form.data.phone}
          onChange={(e) =>
            form.setData('phone', e.target.value)
          }
          className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
        />

        {form.errors.phone && (
          <p className="mt-1 text-sm text-destructive">
            {form.errors.phone}
          </p>
        )}
      </div>

      {/* Correo electrónico */}
      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-medium"
        >
          Correo electrónico <span className="text-xs text-muted">*opcional</span>
        </label>

        <input
          id="email"
          type="email"
          value={form.data.email}
          onChange={(e) =>
            form.setData('email', e.target.value)
          }
          className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
        />

        {form.errors.email && (
          <p className="mt-1 text-sm text-destructive">
            {form.errors.email}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-border px-4 py-2"
        >
          Cancelar
        </button>

        <Button
          type="submit"
          disabled={form.processing}
        >
          {form.processing
            ? 'Guardando...'
            : mode === 'create'
              ? 'Crear cliente'
              : 'Guardar cambios'}
        </Button>
      </div>

    </form>
  )
}
