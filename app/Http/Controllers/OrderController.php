<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Customer;
use App\Models\Expense;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;
use Cloudinary\Cloudinary;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Throwable;

class OrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $perPage = $request->integer('per_page', 10);
        $query = Order::with('customer', 'items.variant', 'payments')
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
        $ordersCompleted = Order::where('status', 'ready')->count();
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
        $orders = Order::with('customer', 'items.variant', 'payments')->whereIn('status', ['pending', 'in_progress', 'ready'])->orderBy('created_at')->get();
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
        $order->update(['status' => 'ready']);
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
                    'ready',
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
            ->whereBetween('order_date', [
                $start->toDateString(),
                $end->toDateString(),
            ])
            ->whereIn('status', ['pending', 'ready', 'in_progress'])
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
        $searchProduct = trim($validated['search_product'] ?? '');

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

        $products = Product::query()
            ->with(['category', 'variants'])
            ->when($searchProduct !== '', function ($query) use ($searchProduct) {
                $query->where('name', 'like', "%{$searchProduct}%");
            })
            ->orderBy('name')
            ->limit(15)
            ->get(['id', 'name']);

        return Inertia::render('Orders/Create', [
            'customers' => $customers,
            'products' => $products,
            'filters' => [
                'search_customer' => $searchCustomer,
                'search_product' => $searchProduct,
            ],
        ]);
    }
    /**
     * Store a newly created resource in storage.
     */

    public function store(Request $request)
    {
       Log::info('PASO 1: Entró al store');
        $validated = $request->validate([
            // Cliente
            'customer_id' => [
                'required_without:customer',
                'nullable',
                'exists:customers,id',
            ],

            'customer' => ['nullable', 'array'],
            'customer.full_name' => ['required_with:customer', 'string', 'max:255'],
            'customer.phone' => ['required_with:customer', 'string', 'max:20'],

            // Datos del pedido
            'order_date' => ['required', 'date'],
            'delivery_shift' => ['required', 'in:morning,afternoon'],
            'delivery_type' => ['required', 'in:delivery,pickup'],
            'delivery_address' => [
                'nullable',
                'required_if:delivery_type,delivery',
                'string',
                'max:255',
            ],

            'discount' => ['nullable', 'numeric', 'min:0'],

            // Productos
            'items' => ['required', 'array', 'min:1'],

            'items.*.variant_id' => [
                'required',
                'exists:product_variants,id',
            ],

            'items.*.quantity' => ['required', 'integer', 'min:1'],

            // Precio final acordado por unidad
            'items.*.unit_price' => ['required', 'numeric', 'min:0'],

            // Descripción de personalizaciones
            'items.*.details' => ['nullable', 'string'],

            'items.*.image' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],

            // Pagos
            'payments' => ['nullable', 'array'],
            'payments.*.amount' => ['required', 'numeric', 'min:0'],
            'payments.*.method' => ['required', 'string'],
            'payments.*.note' => ['nullable', 'string'],
            'payments.*.paid_at' => ['required', 'date'],
        ]);

        Log::info('PASO 2: Validación completada', [
        'items' => count($validated['items']),
    ]);
        $cloudinary = new Cloudinary(
            config('cloudinary.cloud_url')
        );

        $uploadedImages = [];

        try {
            // 1. Subir imágenes a Cloudinary
            foreach ($validated['items'] as $index => $item) {
                 Log::info("PASO 3: Procesando imagen {$index}");
                $file = $request->file("items.$index.image");

                if (!$file) {
                    continue;
                }

                Log::info("PASO 4: Subiendo imagen {$index}");
                $result = $cloudinary->uploadApi()->upload(
                    $file->getRealPath(),
                    [
                        'folder' => 'my-app/order-items',
                    ]
                );
                Log::info("PASO 5: Imagen subida {$index}");

                $uploadedImages[$index] = [
                    'reference_image_url' => $result['secure_url'],
                    'reference_image_public_id' => $result['public_id'],
                ];
            }

            Log::info('PASO 6: Antes de la transacción');
            // 2. Registrar pedido y sus relaciones
            DB::transaction(function () use (
                $validated,
                $uploadedImages
            ) {
                Log::info('PASO 7: Dentro de la transacción');
                // Obtener o crear cliente
                if (!empty($validated['customer_id'])) {
                    $customerId = $validated['customer_id'];
                } else {
                    $customer = Customer::create([
                        'full_name' => $validated['customer']['full_name'],
                        'phone' => $validated['customer']['phone'],
                    ]);

                    $customerId = $customer->id;
                }

                // Calcular subtotal en el servidor
                $subtotal = collect($validated['items'])->sum(
                    fn($item) =>
                    (float) $item['unit_price'] * (int) $item['quantity']
                );

                $subtotal = round($subtotal, 2);

                $discount = round((float) ($validated['discount'] ?? 0), 2);

                if ($discount > $subtotal) {
                    throw ValidationException::withMessages([
                        'discount' => 'El descuento no puede superar el subtotal.',
                    ]);
                }

                $total = round($subtotal - $discount, 2);

                // Crear pedido
                $order = Order::create([
                    'customer_id' => $customerId,
                    'status' => 'pending',
                    'order_date' => $validated['order_date'],
                    'delivery_shift' => $validated['delivery_shift'],
                    'delivery_type' => $validated['delivery_type'],
                    'delivery_address' => $validated['delivery_address'] ?? null,
                    'subtotal' => $subtotal,
                    'discount' => $discount,
                    'total' => $total,
                ]);

                // Registrar productos
                foreach ($validated['items'] as $index => $item) {
                    // Obtener los datos actuales de la variante y su producto
                    $variant = ProductVariant::with('product')
                        ->findOrFail($item['variant_id']);

                    $variantName = collect($variant->attributes)
                        ->map(fn($value, $key) => ucfirst($key) . ': ' . $value)
                        ->implode(', ');

                    $order->items()->create([
                        'variant_id' => $variant->id,

                        // Guardar nombres históricos
                        'product_name' => $variant->product->name,
                        'variant_name' => $variantName,

                        'quantity' => $item['quantity'],

                        // Precio final acordado, no necesariamente
                        // igual al precio actual del catálogo
                        'unit_price' => $item['unit_price'],

                        // Información de personalización
                        'details' => $item['details'] ?? null,

                        // Imagen de referencia
                        'reference_image_url' =>
                        $uploadedImages[$index]['reference_image_url'] ?? null,

                        'reference_image_public_id' =>
                        $uploadedImages[$index]['reference_image_public_id'] ?? null,
                    ]);
                }

                // Registrar pagos
                foreach ($validated['payments'] ?? [] as $payment) {
                    $order->payments()->create([
                        'amount' => $payment['amount'],
                        'method' => $payment['method'],
                        'note' => $payment['note'] ?? null,
                        'paid_at' => $payment['paid_at'],
                    ]);
                }

                Log::info('PASO 8: Transacción completada');
            });
            Log::info('PASO 9: Después de la transacción');
        } catch (Throwable $e) {
            // Eliminar imágenes si falla el registro
            foreach ($uploadedImages as $image) {
                try {
                    $cloudinary->uploadApi()->destroy(
                        $image['reference_image_public_id']
                    );
                } catch (Throwable $cleanupError) {
                    Log::error(
                        'No se pudo eliminar una imagen de Cloudinary.',
                        [
                            'public_id' => $image['reference_image_public_id'],
                            'error' => $cleanupError->getMessage(),
                        ]
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
        $order->load('items.variant.product.category')->load('customer')->load('payments');
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
            'items' => ['required', 'array', 'min:1'],

            'items.*.id' => [
                'nullable',
                'integer',
                Rule::exists('order_items', 'id')
                    ->where('order_id', $order->id),
            ],

            'items.*.variant_id' => [
                'required',
                'exists:product_variants,id',
            ],

            'items.*.quantity' => ['required', 'integer', 'min:1'],

            'items.*.unit_price' => ['required', 'numeric', 'min:0'],

            'items.*.details' => ['nullable', 'string'],

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
                        'variant_id' => $item['variant_id'],
                        'name' => $item['name'],
                        'details' => $item['details'] ?? null,
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
