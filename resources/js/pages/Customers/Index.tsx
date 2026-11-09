import Button from "@/components/Button";
import Layout from "@/layouts/Layout";
import { Eye, Pencil, PlusIcon, Search, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, router } from "@inertiajs/react";
import { formatDateTime } from "@/utils/date";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/Table";
import Modal from "@/components/Modal";
import CustomerForm from "@/features/customers/components/Form";
import { Customer } from "@/features/customers/types/customer.types";
import { Paginated } from "@/types";
import { formatPhone } from "@/utils/phone.util";
import Input from "@/components/Input";
import TablePagination from "@/components/TablePagination";
import PhoneNumber from "@/features/customers/components/PhoneNumber";

interface Props {
  customers: Paginated<Customer>;
  filters: {
    search?: string;
    per_page?: number;
  };
}

export default function Index({ customers, filters }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [showModalForm, setShowModalForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [search, setSearch] = useState(filters.search ?? '');
  const [showModalDelete, setShowModalDelete] = useState(false);

  // Búsqueda debounced, preservando el resto de filtros
  useEffect(() => {
    const timeout = setTimeout(() => {
      const current = filters.search ?? '';
      if (search === current) return;

      router.get(
        '/customers',
        { ...filters, search, page: 1 },
        {
          preserveState: true,
          preserveScroll: true,
          replace: true,
        }
      );
    }, 400);

    return () => clearTimeout(timeout);
  }, [search]);

  const handlePerPage = (perPage: number) => {
    router.get(
      '/customers',
      { ...filters, per_page: perPage, page: 1 },
      {
        preserveState: true,
        preserveScroll: true,
      }
    );
  };

  const destroy = (id: number) => {
    if (!confirm('¿Eliminar este cliente?')) return;
    router.delete(`/customers/${id}`);
  };

  const handleCreate = () => {
    setShowModalForm(true);
    setSelectedCustomer(null);
  };

  const handleEdit = (customer: Customer) => {
    setShowModalForm(true);
    setSelectedCustomer(customer);
  };

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
      <div className="flex justify-between mb-4 items-center gap-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold">Clientes</h1>
          <p className="text-muted text-sm md:text-base">
            Lista de todos tus clientes registrados en el sistema.
          </p>
        </div>

        <Button onClick={handleCreate} size="md">
          <PlusIcon size={17} />
          <span className="hidden md:block">Nuevo cliente</span>
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <Input
            leftIcon={<Search size={17} />}
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar cliente..."
            className="w-full md:w-6/12"
          />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Total pedidos</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <p className="text-center text-muted">
                    {search
                      ? 'No se encontraron clientes con esa búsqueda.'
                      : 'No hay clientes registrados.'}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              customers.data.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">
                    {customer.full_name}
                  </TableCell>

                  <TableCell><PhoneNumber
                    phone={customer.phone}
                    canReveal={true}
                  /></TableCell>

                  <TableCell>{customer.orders_count} pedido(s)</TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Link href={`/customers/${customer.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="size-4" />
                          <span className="hidden md:inline">Ver más</span>
                        </Button>
                      </Link>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(customer)}
                      >
                        <Pencil className="size-4" />
                        <span className="hidden md:inline">Editar</span>
                      </Button>

                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <TablePagination
          paginator={customers}
          filters={filters}
          onPerPageChange={handlePerPage}
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
                <Link
                  href={`https://wa.me/51${selectedCustomer.phone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <button
                    type="button"
                    className="inline-flex items-center rounded-full border border-slate-200 bg-white transition hover:border-blue-200 hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-blue-500/30 dark:hover:bg-blue-500/10 cursor-pointer"
                    aria-label={`WhatsApp ${selectedCustomer.full_name}`}
                  >
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/3670/3670051.png"
                      className="size-8"
                      width={27}
                      height={27}
                      alt="WhatsApp"
                    />
                  </button>
                </Link>
              </div>

              <p className="text-muted text-sm">
                Este cliente fue registrado el {formatDateTime(selectedCustomer.created_at)}
              </p>
            </div>
          )}
        </Modal>



        <Modal
          show={showModalForm}
          onClose={handleCloseModalForm}
          title={selectedCustomer ? 'Editar cliente' : 'Crear cliente'}
        >
          <CustomerForm
            mode={selectedCustomer ? 'edit' : 'create'}
            customer={selectedCustomer}
            onClose={handleCloseModalForm}
          />
        </Modal>
      </div>
    </Layout>
  );
}