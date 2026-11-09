<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Customer;
use App\Models\Expense;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;
use Cloudinary\Cloudinary;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Throwable;

class OrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $perPage = $request->integer('per_page', 10);
        $query = Order::with('customer', 'items.category', 'payments')
            ->when($request->status, function ($query, $status) {
                $query->where('status', 'like', "%{$status}%");
            })
            ->when($request->search, function ($query, $search) {
                $query->whereHas('customer', function ($q) use ($search) {
                    $q->where('full_name', 'like', "%{$search}%");
                });
            })
            ->when($request->date_from, function ($query, $date) {
                $query->whereDate('created_at', '>=', $date);
            })
            ->when($request->date_to, function ($query, $date) {
                $query->whereDate('created_at', '<=', $date);
            });;

        $orders = $query
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        $ordersPending = Order::where('status', 'pending')->count();
        $ordersInProgress = Order::where('status', 'in_progress')->count();
        $ordersCompleted = Order::where('status', 'completed')->count();
        $ordersDelivered = Order::where('status', 'delivered')->count();
        $ordersCancelled = Order::where('status', 'cancelled')->count();

        return Inertia::render('Orders/Index', [
            'orders' => $orders,
            'overview' => [
                'total_pending' => $ordersPending,
                'total_in_progress' => $ordersInProgress,
                'total_completed' => $ordersCompleted,
                'total_cancelled' => $ordersCancelled,
                'total_delivered' => $ordersDelivered,
            ],
            'filters' => $request->only([
                'status',
                'search',
                'date_from',
                'date_to',
                'per_page'
            ])
        ]);
    }

    public function Kanban()
    {
        $orders = Order::with('customer', 'items.category', 'payments')->whereIn('status', ['pending', 'in_progress', 'completed'])->orderBy('created_at')->get();
        return Inertia::render('Orders/OrdersKanban', [
            'orders' => $orders,
        ]);
    }


    public function MarkAsInProgress(Order $order)
    {
        $order->update(['status' => 'in_progress']);
        return redirect()->back()->with('success', 'Pedido marcado como "En Progreso".');
    }

    public function MarkAsCompleted(Order $order)
    {
        $order->update(['status' => 'completed']);
        return redirect()->back()->with('success', 'Pedido marcado como "Completado".');
    }

    public function MarkAsDelivered(Order $order)
    {
        //$this->authorize('update', $order);
        $paid = $order->payments()->sum('amount');

        // Verificar si existe un saldo pendiente
        if ($paid < $order->total) {
            return back()->with(
                'error',
                'No se puede entregar el pedido porque tiene un saldo pendiente de pago.'
            );
        }

        $order->update([
            'status' => 'delivered',
        ]);

        return redirect()->back()->with(
            'success',
            'Pedido marcado como "Entregado".'
        );
    }

    public function MarkAsCancelled(Order $order)
    {
        $order->update([
            'status' => 'cancelled',
        ]);

        return back()->with(
            'success',
            'Pedido marcado como "Cancelado".'
        );
    }


    public function UpdateStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => [
                'required',
                Rule::in([
                    'pending',
                    'in_progress',
                    'completed',
                    'delivered',
                    'cancelled',
                ]),
            ],
        ]);

        $order->update([
            'status' => $validated['status'],
        ]);

        return redirect()->route('orders.show', ['order' => $order->id])->with('success', 'Estado del pedido actualizado correctamente.');
    }

    public function calendar(Request $request)
    {
        $selectedDate = Carbon::parse(
            $request->input('date', now()->toDateString())
        );

        $view = $request->input('view', 'month');

        if (!in_array($view, ['month', 'week', 'day'], true)) {
            $view = 'month';
        }

        $start = $selectedDate->copy();
        $end = $selectedDate->copy();

        if ($view === 'month') {
            $start->startOfMonth()->startOfWeek(Carbon::MONDAY);
            $end->endOfMonth()->endOfWeek(Carbon::SUNDAY);
        } elseif ($view === 'week') {
            $start->startOfWeek(Carbon::MONDAY);
            $end->endOfWeek(Carbon::SUNDAY);
        }

        $orders = Order::with('customer', 'items')
            ->whereBetween('date', [
                $start->toDateString(),
                $end->toDateString(),
            ])
            ->whereIn('status', ['pending', 'completed', 'in_progress'])
            ->orderBy('date')
            ->get();

        return Inertia::render('Orders/Calendar', [
            'orders' => $orders,
            'selectedDate' => $selectedDate->toDateString(),
            'calendarView' => $view,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        $validated = $request->validate([
            'search_customer' => ['nullable', 'string', 'min:1', 'max:100'],
            'search_category' => ['nullable', 'string', 'min:1', 'max:100'],
        ]);

        $searchCustomer = trim($validated['search_customer'] ?? '');
        $searchCategory = trim($validated['search_category'] ?? '');

        $customers = Customer::query()
            ->when($searchCustomer !== '', function ($query) use ($searchCustomer) {
                $query->where(function ($query) use ($searchCustomer) {
                    $query->where('full_name', 'like', "%{$searchCustomer}%")
                        ->orWhere('phone', 'like', "%{$searchCustomer}%");
                });
            })
            ->orderBy('full_name')
            ->limit(15)
            ->get(['id', 'full_name', 'phone']);

        $categories = Category::query()
            ->when($searchCategory !== '', function ($query) use ($searchCategory) {
                $query->where('name', 'like', "%{$searchCategory}%");
            })
            ->orderBy('name')
            ->limit(15)
            ->get(['id', 'name']);

        return Inertia::render('Orders/Create', [
            'customers' => $customers,
            'categories' => $categories,
            'filters' => [
                'search_customer' => $searchCustomer,
                'search_category' => $searchCategory,
            ],
        ]);
    }
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => [
                'required_without:customer',
                'nullable',
                'exists:customers,id',
            ],

            'customer' => ['nullable', 'array'],
            'customer.full_name' => ['required_with:customer', 'string', 'max:255'],
            'customer.phone' => ['required_with:customer', 'string', 'max:20'],

            'date' => ['required', 'date'],
            'shift' => ['required', 'string'],
            'delivery' => ['required'],
            'delivery_address' => ['nullable', 'string'],

            'items' => ['required', 'array', 'min:1'],
            'items.*.category_id' => ['required', 'exists:categories,id'],
            'items.*.name' => ['required', 'string', 'max:255'],
            'items.*.description' => ['nullable', 'string'],
            'items.*.quantity' => ['required', 'numeric', 'min:1'],
            'items.*.subtotal' => ['required', 'numeric', 'min:0'],
            'items.*.customization' => ['nullable'],

            'items.*.image' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],

            'payments' => ['nullable', 'array'],
            'payments.*.amount' => ['required', 'numeric', 'min:0'],
            'payments.*.method' => ['required', 'string'],
            'payments.*.type' => ['required', 'string'],
            'payments.*.note' => ['nullable', 'string'],
            'payments.*.paid_at' => ['required', 'date'],
        ]);

        $cloudinary = new Cloudinary(
            config('cloudinary.cloud_url')
        );
        $uploadedImages = [];

        try {
            // Subir las imágenes antes de iniciar la transacción.
            foreach ($validated['items'] as $index => $item) {
                $file = $request->file("items.$index.image");

                if (!$file) {
                    continue;
                }

                $result = $cloudinary->uploadApi()->upload(
                    $file->getRealPath(),
                    [
                        'folder' => 'my-app/order-items',
                    ],
                );

                $uploadedImages[$index] = [
                    'image_url' => $result['secure_url'],
                    'image_public_id' => $result['public_id'],
                ];
            }

            DB::transaction(function () use (
                $validated,
                $uploadedImages
            ) {

                // 1. Obtener o crear el cliente
                if (!empty($validated['customer_id'])) {

                    // Cliente existente
                    $customerId = $validated['customer_id'];
                } else {

                    // Crear nuevo cliente
                    $customer = Customer::create([
                        'full_name' => $validated['customer']['full_name'],
                        'phone' => $validated['customer']['phone'],
                    ]);

                    $customerId = $customer->id;
                }

                // 2. Calcular total del pedido
                $total = collect($validated['items'])->sum(
                    fn($item) => (float) $item['subtotal']
                );

                // 3. Crear pedido
                $order = Order::create([
                    'customer_id' => $customerId,
                    'total' => $total,
                    'status' => 'pending',
                    'date' => $validated['date'],
                    'shift' => $validated['shift'],
                    'delivery' => $validated['delivery'],
                    'delivery_address' =>
                    $validated['delivery_address'] ?? null,
                ]);

                // 4. Registrar productos del pedido
                foreach ($validated['items'] as $index => $item) {

                    $order->items()->create([
                        'category_id' => $item['category_id'],
                        'name' => $item['name'],
                        'description' => $item['description'] ?? null,
                        'quantity' => $item['quantity'],
                        'subtotal' => $item['subtotal'],
                        'customization' => $item['customization'] ?? null,

                        'image_url' =>
                        $uploadedImages[$index]['image_url'] ?? null,

                        'image_public_id' =>
                        $uploadedImages[$index]['image_public_id'] ?? null,
                    ]);
                }

                // 5. Registrar pagos
                foreach ($validated['payments'] ?? [] as $payment) {

                    $order->payments()->create([
                        'amount' => $payment['amount'],
                        'method' => $payment['method'],
                        'type' => $payment['type'],
                        'note' => $payment['note'] ?? null,
                        'paid_at' => $payment['paid_at'],
                    ]);
                }
            });
        } catch (Throwable $e) {
            // Eliminar las imágenes subidas si falla el proceso.
            foreach ($uploadedImages as $image) {
                try {
                    $cloudinary->uploadApi()->destroy(
                        $image['image_public_id']
                    );
                } catch (Throwable $cleanupError) {
                    Log::error(
                        'No se pudo eliminar una imagen de Cloudinary.',
                        ['public_id' => $image['image_public_id']]
                    );
                }
            }

            throw $e;
        }

        return redirect()
            ->route('orders.index')
            ->with('success', 'Pedido registrado correctamente.');
    }



    /**
     * Display the specified resource.
     */
    public function show(Order $order)
    {
        $order->load('items.category')->load('customer')->load('payments');
        return Inertia::render('Orders/Show', [
            'order' => $order,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, Order $order)
    {
        $order->load([
            'customer',
            'items.category',
        ]);
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'min:1', 'max:100'],
        ]);

        $search = trim($validated['search'] ?? '');

        $customers = Customer::query()
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('full_name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                });
            })
            ->orderBy('full_name')
            ->limit(10)
            ->get(['id', 'full_name', 'phone']);

        $categories = Category::query()->latest()->get();

        return Inertia::render('Orders/Update', [
            'order' => $order,
            'customers' => $customers,
            'categories' => $categories,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Order $order)
    {
        $validated = $request->validate([
            'customer_id' => [
                'required_without:customer',
                'nullable',
                'exists:customers,id',
            ],

            'customer' => ['nullable', 'array'],
            'customer.full_name' => ['required_with:customer', 'string', 'max:255'],
            'customer.phone' => ['required_with:customer', 'string', 'max:20'],

            'date' => ['required', 'date'],
            'shift' => ['required', 'string'],
            'delivery' => ['required'],
            'delivery_address' => ['nullable', 'string'],

            'items' => ['required', 'array', 'min:1'],

            'items.*.id' => [
                'nullable',
                'integer',
                Rule::exists('order_items', 'id')
                    ->where('order_id', $order->id),
            ],

            'items.*.category_id' => ['required', 'exists:categories,id'],
            'items.*.name' => ['required', 'string', 'max:255'],
            'items.*.description' => ['nullable', 'string'],
            'items.*.quantity' => ['required', 'numeric', 'min:1'],
            'items.*.subtotal' => ['required', 'numeric', 'min:0'],
            'items.*.customization' => ['nullable'],

            'items.*.image' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],

            'items.*.remove_image' => ['nullable', 'boolean'],
        ]);

        $cloudinary = new Cloudinary(
            config('cloudinary.cloud_url')
        );

        $uploadedImages = [];
        $imagesToDelete = [];

        try {

            // 1. Subir las nuevas imágenes a Cloudinary.
            foreach ($validated['items'] as $index => $item) {

                $file = $request->file("items.$index.image");

                if (!$file) {
                    continue;
                }

                $result = $cloudinary->uploadApi()->upload(
                    $file->getRealPath(),
                    [
                        'folder' => 'my-app/order-items',
                    ]
                );

                $uploadedImages[$index] = [
                    'image_url' => $result['secure_url'],
                    'image_public_id' => $result['public_id'],
                ];
            }

            // 2. Actualizar el pedido dentro de una transacción.
            DB::transaction(function () use (
                $validated,
                $order,
                $uploadedImages,
                &$imagesToDelete
            ) {

                // Cliente existente o nuevo.
                if (!empty($validated['customer_id'])) {

                    $customerId = $validated['customer_id'];
                } else {

                    $customer = Customer::create([
                        'full_name' => $validated['customer']['full_name'],
                        'phone' => $validated['customer']['phone'],
                    ]);

                    $customerId = $customer->id;
                }

                // Calcular el nuevo total.
                $total = collect($validated['items'])->sum(
                    fn($item) => (float) $item['subtotal']
                );

                // Actualizar información general.
                $order->update([
                    'customer_id' => $customerId,
                    'total' => $total,
                    'date' => $validated['date'],
                    'shift' => $validated['shift'],
                    'delivery' => $validated['delivery'],
                    'delivery_address' => $validated['delivery_address'] ?? null,
                ]);

                // Obtener productos actuales del pedido.
                $existingItems = $order->items()
                    ->get()
                    ->keyBy('id');

                $keptItemIds = [];

                // 3. Actualizar o crear productos.
                foreach ($validated['items'] as $index => $item) {

                    if (!empty($item['id'])) {

                        $orderItem = $existingItems->get($item['id']);

                        // Guardar imagen anterior para eliminarla si se reemplaza.
                        $oldPublicId = $orderItem->image_public_id;
                    } else {

                        // Producto nuevo.
                        $orderItem = $order->items()->make();
                        $oldPublicId = null;
                    }

                    $orderItem->fill([
                        'category_id' => $item['category_id'],
                        'name' => $item['name'],
                        'description' => $item['description'] ?? null,
                        'quantity' => $item['quantity'],
                        'subtotal' => $item['subtotal'],
                        'customization' => $item['customization'] ?? null,
                    ]);

                    // Reemplazar imagen.
                    if (isset($uploadedImages[$index])) {

                        if ($oldPublicId) {
                            $imagesToDelete[] = $oldPublicId;
                        }

                        $orderItem->image_url =
                            $uploadedImages[$index]['image_url'];

                        $orderItem->image_public_id =
                            $uploadedImages[$index]['image_public_id'];
                    } elseif (!empty($item['remove_image'])) {

                        // El usuario decidió quitar la imagen.
                        if ($oldPublicId) {
                            $imagesToDelete[] = $oldPublicId;
                        }

                        $orderItem->image_url = null;
                        $orderItem->image_public_id = null;
                    }

                    $orderItem->save();

                    $keptItemIds[] = $orderItem->id;
                }

                // 4. Eliminar productos que fueron quitados del formulario.
                $removedItems = $order->items()
                    ->whereNotIn('id', $keptItemIds)
                    ->get();

                foreach ($removedItems as $removedItem) {

                    if ($removedItem->image_public_id) {
                        $imagesToDelete[] = $removedItem->image_public_id;
                    }

                    $removedItem->delete();
                }
            });
        } catch (Throwable $e) {

            // Si falla la operación, eliminar las nuevas imágenes subidas.
            foreach ($uploadedImages as $image) {

                try {
                    $cloudinary->uploadApi()->destroy(
                        $image['image_public_id']
                    );
                } catch (Throwable $cleanupError) {

                    Log::error('No se pudo eliminar una imagen nueva de Cloudinary.', [
                        'public_id' => $image['image_public_id'],
                    ]);
                }
            }

            throw $e;
        }

        // 5. Eliminar imágenes antiguas después de confirmar la transacción.
        foreach (array_unique($imagesToDelete) as $publicId) {

            try {
                $cloudinary->uploadApi()->destroy($publicId);
            } catch (Throwable $e) {

                Log::error('No se pudo eliminar una imagen antigua de Cloudinary.', [
                    'public_id' => $publicId,
                ]);
            }
        }

        return redirect()
            ->route('orders.show', $order->id)
            ->with('success', 'Pedido actualizado correctamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    public function createPayment(Request $request)
    {
        $validated = $request->validate([
            'amount'   => ['required', 'numeric', 'min:0.01'],
            'type'     => ['required', 'string'],
            'method'   => ['required', 'string'],
            'paid_at'  => ['required', 'date'],
            'note' => ['nullable', 'string'],
            'order_id' => ['required', 'exists:orders,id'],
        ]);

        Payment::Create([
            'amount' => $validated['amount'],
            'type' => $validated['type'],
            'method' => $validated['method'],
            'paid_at' => $validated['paid_at'],
            'note' => $validated['note'],
            'order_id' => $validated['order_id'],
        ]);

        return redirect()
            ->route('orders.show',  ['order' => $request->order_id])
            ->with('success', 'Pago registrado correctamente');
    }
}
