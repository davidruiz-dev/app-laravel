import Button from "@/components/Button";
import Layout from "@/layouts/Layout";
import { Eye, Pencil, PlusCircleIcon, Search, Trash } from "lucide-react";
import { useState } from "react";
import { Link, router } from "@inertiajs/react";
import { formatDateTime } from "@/utils/date";
import TablePagination, { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/Table";
import Modal from "@/components/Modal";
import CustomerForm from "@/features/customers/components/Form";
import { Customer } from "@/features/customers/types/customer.types";
import { Paginated } from "@/types";

interface Props {
  customers: Paginated<Customer>;
  filters: {
    search?: string;
  };
}

export default function Index({ customers, filters }: Props) {
  const [search, setSearch] = useState(filters.search ?? '');
  const [showModal, setShowModal] = useState(false);
  const [showModalForm, setShowModalForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const handleSearch = (value: string) => {
    setSearch(value);
    router.get('/customers',
      {
        search: value,
      },
      {
        preserveState: true,
        replace: true,
      }
    );
  };

  const destroy = (id: number) => {
    if (!confirm('¿Eliminar este cliente?')) {
      return;
    }
    router.delete(`/customers/${id}`);
  };

  

  const handleCreate = () => {
    setShowModalForm(true);
    setSelectedCustomer(null);
  }

  const handleEdit = (customer: Customer) => {
    setShowModalForm(true);
    setSelectedCustomer(customer);
  }

  const handleCloseModalForm = () => {
    setShowModalForm(false);
    setSelectedCustomer(null);
  };

  const handleClose = () => {
    setShowModal(false);
    setSelectedCustomer(null);
  };

  return (
    <Layout title="Clientes">
      <div className="mb-4">
        <h1 className="text-3xl font-semibold">Clientes</h1>
        <p className="text-muted">Lista de todos tus clientes registrados en el sistema.</p>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Buscar cliente..."
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-neutral-700 dark:bg-neutral-900"
            />
          </div>

          <Button onClick={handleCreate}>
            <PlusCircleIcon />
            Nuevo cliente
          </Button>

        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Total pedidos</TableHead>
              <TableHead>Último pedido</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.data.length == 0 ? (
              <TableRow>
                <TableCell colSpan={4}>No hay clientes registrados</TableCell>
              </TableRow>
            ) :
              customers.data.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>{customer.full_name}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>{customer.orders_count}</TableCell>
                  <TableCell>{customer.last_order}</TableCell>
                  <TableCell className="flex gap-3 items-center">
                    <Link href={`/customers/${customer.id}`}>
                      <button
                      type="button"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-slate-300 dark:hover:border-blue-500/30 dark:hover:bg-blue-500/10 dark:hover:text-blue-400" aria-label={`Edit ${customer.full_name}`}
                    >
                      <Eye className="size-4" />
                      <span className="hidden md:block">Ver más</span>
                    </button>
                    </Link>

                    <button
                      onClick={() => handleEdit(customer)}
                      type="button"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-slate-300 dark:hover:border-blue-500/30 dark:hover:bg-blue-500/10 dark:hover:text-blue-400" aria-label={`Edit ${customer.full_name}`}
                    >
                      <Pencil className="size-4" />
                      <span className="hidden md:block">Editar</span>
                    </button>
                    <button
                      onClick={() => destroy(customer.id)}
                      type="button"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-red-600 transition hover:border-red-200 hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-red-400 dark:hover:border-red-500/30 dark:hover:bg-red-500/10"
                      aria-label={`Delete ${customer.full_name}`}
                    >
                      <Trash className="size-4" />
                      <span className="hidden md:block">Eliminar</span>
                    </button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>

        <TablePagination
          links={customers.links}
          last_page={customers.last_page}
          current_page={customers.current_page}
          total={customers.total}
        />


        <Modal
          show={showModal}
          onClose={handleClose}
          title="Detalles del cliente"
        >
          {selectedCustomer && (
            <div className="space-y-4">
              <div>
                <span className="font-semibold">Nombre completo</span>
                <h1 className="text-muted">{selectedCustomer.full_name}</h1>
              </div>

              <div className="flex justify-between items-center gap-5">
                <div>
                  <span className="font-semibold">Teléfono</span>
                  <h1 className="text-muted">{selectedCustomer.phone}</h1>
                </div>
                <Link href={`https://wa.me/51${selectedCustomer.phone}`} target="_blank" rel="noopener noreferrer">
                  <button
                    type="button"
                    className="inline-flex items-center rounded-full border border-slate-200 bg-white transition hover:border-blue-200 hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-blue-500/30 dark:hover:bg-blue-500/10 cursor-pointer" aria-label={`Edit ${selectedCustomer.full_name}`}
                  >
                    <img src="https://cdn-icons-png.flaticon.com/512/3670/3670051.png" className="size-8" width={27} height={27} />
                  </button>
                </Link>
              </div>

              <p className="text-muted text-sm">Este cliente fue registrado el {formatDateTime(selectedCustomer.created_at)}</p>
            </div>
          )}

        </Modal>

        <Modal
          show={showModalForm}
          onClose={handleCloseModalForm}
          title={selectedCustomer ? 'Editar cliente' : 'Crear cliente'}
        >
          <CustomerForm mode={selectedCustomer ? 'edit' : 'create'} customer={selectedCustomer} onClose={handleCloseModalForm} />
        </Modal>
      </div>
    </Layout>
  )
}
