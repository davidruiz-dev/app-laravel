<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Order;
use App\Models\Orderitem;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->string('search')->trim();

        $customers = Customer::query()
            ->withCount('orders')
            ->addSelect([
                'last_order' => Orderitem::query()
                    ->select('order_items.name')
                    ->join('orders', 'orders.id', '=', 'order_items.order_id')
                    ->whereColumn('orders.customer_id', 'customers.id')
                    ->orderByDesc('orders.created_at')
                    ->orderByDesc('order_items.id')
                    ->limit(1),
            ])
            ->when($search->isNotEmpty(), function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('full_name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate($request->input('per_page', 10))
            ->withQueryString();

        return Inertia::render('Customers/Index', [
            'customers' => $customers,
            'filters' => $request->only(['search', 'per_page']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // return Inertia::render('Customers/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'full_name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'max:9'],
            'email' => ['nullable'],
            'social_network' => ['nullable']
        ]);

        Customer::create($validated);

        return redirect()->route('customers.index')
            ->with('success', 'Cliente creado correctamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Customer $customer)
    {
        $orders = $customer->orders()
            ->with('items.category')
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Customers/Show', [
            'customer' => $customer,
            'orders' => $orders
        ]);
    }


    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Customer $customer)
    {
        // return Inertia::render('Customers/Edit', [
        //     'customer' => $customer
        // ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Customer $customer)
    {
        $validated = $request->validate([
            'full_name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'max:9'],
            'email' => ['nullable'],
            'social_network' => ['nullable']
        ]);

        $customer->update($validated);
        return redirect()->route('customers.index')->with('success', 'Cliente actualizado correctamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Customer $customer)
    {
        $customer->delete();
        return redirect()->route('customers.index')->with('success', 'Cliente eliminado correctamente.');
    }
}
