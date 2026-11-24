<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Cloudinary\Cloudinary;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $perPage = $request->integer('per_page', 15);
        $search = $request->string('search')->trim();
        $products = Product::query()->with(['category', 'variants'])
            ->when($search->isNotEmpty(), function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->when($request->date_from, function ($query, $date) {
                $query->whereDate('created_at', '>=', $date);
            })
            ->when($request->date_to, function ($query, $date) {
                $query->whereDate('created_at', '<=', $date);
            })
            ->latest()->paginate($perPage)->withQueryString();
        return Inertia::render('Products/Index', [
            'products' => $products,
            'filters' => [
                'search' => $search->value(),
                'per_page' => $perPage,
                'date_from',
                'date_to',
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        $validated = $request->validate([
            'search_category' => ['nullable', 'string', 'min:1', 'max:100'],
        ]);

        $searchCategory = trim($validated['search_category'] ?? '');
        $categories = Category::query()
            ->when($searchCategory !== '', function ($query) use ($searchCategory) {
                $query->where('name', 'like', "%{$searchCategory}%");
            })
            ->orderBy('name')
            ->limit(15)
            ->get(['id', 'name']);
        return Inertia::render('Products/Create', [
            'categories' => $categories,
            'filters' => [
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
            'category_id' => ['required', 'exists:categories,id'],
            'name' => ['required', 'string'],
            'description' => ['nullable', 'string'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:7120'],
            'is_active' => ['required', 'boolean'],
            'is_customizable' => ['required', 'boolean'],

            // Variantes opcionales
            'variants' => ['nullable', 'array'],
            //'variants.*.name' => ['required', 'string', 'max:255'],
            'variants.*.price' => ['required', 'numeric', 'min:0'],
            'variants.*.attributes' => ['nullable', 'array'],
            'variants.*.is_active' => ['boolean'],
        ]);

        $cloudinary = new Cloudinary(config('cloudinary.cloud_url'));
        $uploadedImage = null;

        try {
            if ($request->hasFile('image')) {
                $result = $cloudinary->uploadApi()->upload(
                    $request->file('image')->getRealPath(),
                    [
                        'folder' => 'app/products/images',
                    ]
                );

                $uploadedImage = [
                    'image_url' => $result['secure_url'],
                    'image_public_id' => $result['public_id'],
                ];
            }

            DB::beginTransaction();

            $product = Product::create([
                'category_id' => $validated['category_id'],
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'is_active' => $validated['is_active'] ?? true,
                'image_url' => $uploadedImage['image_url'] ?? null,
                'image_public_id' => $uploadedImage['image_public_id'] ?? null,
                'is_customizable' => $validated['is_customizable'] ?? false,
            ]);

            if (!empty($validated['variants'])) {
                $product->variants()->createMany(
                    collect($validated['variants'])->map(fn($variant) => [
                        //'name' => $variant['name'],
                        'price' => $variant['price'],
                        'attributes' => $variant['attributes'] ?? [],
                        'is_active' => $variant['is_active'] ?? true,
                    ])->toArray()
                );
            }

            DB::commit();
            return redirect()->route('products.index')->with('success', 'Producto creado correctamente.');
        } catch (\Throwable $e) {
            DB::rollBack();
            if ($uploadedImage) {
                $cloudinary->uploadApi()->destroy(
                    $uploadedImage['image_public_id']
                );
            }
            report($e);

            return back()->withInput()->withErrors([
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        $product->load(['variants', 'category']);
        $orders = Order::query()
            ->whereHas('items', fn($q) => $q->where('product_id', $product->id))
            ->with([
                'items' => fn($q) => $q->where('product_id', $product->id)
                    ->with('productVariant'),
            ])
            ->latest()
            ->get();

        $itemsQuery = OrderItem::where('product_id', $product->id);
        $stats = [
            'total_orders'    => $orders->count(),
            'total_sold'      => (int) $itemsQuery->sum('quantity'),
            'total_revenue'   => (string) ($itemsQuery->sum('total_price') ?? 0),
            'active_variants' => $product->variants->count(),
        ];


        return Inertia::render('Products/Show', [
            'product' => $product,
            'orders' => $orders,
            'stats'   => $stats,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Product $product, Request $request)
    {
        $product->load(['variants',]);
        $validated = $request->validate([
            'search_category' => ['nullable', 'string', 'min:1', 'max:100'],
        ]);

        $searchCategory = trim($validated['search_category'] ?? '');
        $categories = Category::query()
            ->when($searchCategory !== '', function ($query) use ($searchCategory) {
                $query->where('name', 'like', "%{$searchCategory}%");
            })
            ->orderBy('name')
            ->limit(15)
            ->get(['id', 'name']);
        return Inertia::render('Products/Edit', [
            'product' => $product,
            'categories' => $categories,
            'filters' => [
                'search_category' => $searchCategory,
            ],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */


    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'category_id' => ['required', 'exists:categories,id'],
            'name' => ['required', 'string'],
            'description' => ['nullable', 'string'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:7120'],
            'is_active' => ['required', 'boolean'],
            'is_customizable' => ['required', 'boolean'],

            // Variantes opcionales
            'variants' => ['nullable', 'array'],
            'variants.*.id' => ['nullable', 'integer'],
            'variants.*.price' => ['required', 'numeric', 'min:0'],
            'variants.*.attributes' => ['nullable', 'array'],
            'variants.*.is_active' => ['nullable', 'boolean'],
        ]);

        $cloudinary = new Cloudinary(config('cloudinary.cloud_url'));

        $uploadedImage = null;
        $oldImagePublicId = $product->image_public_id;

        try {
            DB::beginTransaction();

            // Subir nueva imagen si existe
            if ($request->hasFile('image')) {
                $result = $cloudinary->uploadApi()->upload(
                    $request->file('image')->getRealPath(),
                    [
                        'folder' => 'app/products/images',
                    ]
                );

                $uploadedImage = [
                    'image_url' => $result['secure_url'],
                    'image_public_id' => $result['public_id'],
                ];
            }

            // Actualizar producto
            $product->update([
                'category_id' => $validated['category_id'],
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'is_active' => $validated['is_active'],
                'is_customizable' => $validated['is_customizable'],

                // Mantener imagen anterior si no se sube otra
                'image_url' => $uploadedImage['image_url'] ?? $product->image_url,
                'image_public_id' => $uploadedImage['image_public_id'] ?? $product->image_public_id,
            ]);

            // Actualizar variantes
            // Actualizar variantes
            if (isset($validated['variants'])) {

                $processedVariantIds = [];

                foreach ($validated['variants'] as $variant) {

                    if (!empty($variant['id'])) {

                        $existingVariant = $product->variants()
                            ->findOrFail($variant['id']);

                        $existingVariant->update([
                            'price' => $variant['price'],
                            'attributes' => $variant['attributes'] ?? [],
                            'is_active' => $variant['is_active'] ?? true,
                        ]);

                        $processedVariantIds[] = $existingVariant->id;
                    } else {

                        $newVariant = $product->variants()->create([
                            'price' => $variant['price'],
                            'attributes' => $variant['attributes'] ?? [],
                            'is_active' => $variant['is_active'] ?? true,
                        ]);

                        $processedVariantIds[] = $newVariant->id;
                    }
                }

                // Identificar variantes que fueron quitadas del formulario
                $removedVariants = $product->variants()
                    ->whereNotIn('id', $processedVariantIds)
                    ->get();

                foreach ($removedVariants as $variant) {

                    // Comprobar si tiene pedidos relacionados
                    if ($variant->orderItems()->exists()) {

                        // Si tiene pedidos, solamente desactivar
                        $variant->update([
                            'is_active' => false,
                        ]);
                    } else {

                        // Si no tiene pedidos, eliminar físicamente
                        $variant->delete();
                    }
                }
            }
            DB::commit();

            // Eliminar imagen anterior solamente después del commit
            if ($uploadedImage && $oldImagePublicId) {
                $cloudinary->uploadApi()->destroy($oldImagePublicId);
            }

            return redirect()
                ->route('products.index')
                ->with('success', 'Producto actualizado correctamente.');
        } catch (\Throwable $e) {

            DB::rollBack();

            // Eliminar imagen nueva si ocurrió un error
            if ($uploadedImage) {
                $cloudinary->uploadApi()->destroy(
                    $uploadedImage['image_public_id']
                );
            }

            report($e);

            return back()->withInput()->withErrors([
                'error' => $e->getMessage(),
            ]);
        }
    }



    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        //
    }
}
