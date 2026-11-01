import { useForm } from "@inertiajs/react";
import { Customer } from "../types/customer.types";
import Button from "@/components/Button";
import Input from "@/components/Input";

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
      form.post('/customers', {
        onSuccess: () => onClose()
      });
    } else {
      form.put(`/customers/${customer?.id}`, {
        onSuccess: () => onClose()
      });
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <div>
        <Input
          id="name"
          type="text"
          label="Nombre completo"
          placeholder="Nombres y apellidos"
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
        <Input
          id="phone"
          type="tel"
          label="Teléfono"
          placeholder="Número de teléfono"
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
        <Input
          id="email"
          type="email"
          label="Correo electrónico *opcional"
          value={form.data.email}
          onChange={(e) =>
            form.setData('email', e.target.value)
          }
        />

        {form.errors.email && (
          <p className="mt-1 text-sm text-destructive">
            {form.errors.email}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          onClick={onClose}
          variant="danger"
        >
          Cancelar
        </Button>

        <Button
          type="submit"
          disabled={form.processing}
          variant="secondary"
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
