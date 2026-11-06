<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExpenseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $perPage = $request->integer('per_page', 10);
        $query = Expense::query()
            ->when($request->search, function ($query, $search) {
                $query->where('description', 'like', "%{$search}%");
            })
            ->when($request->type, function ($query, $type) {
                $query->where('type', $type);
            })
            ->when($request->date_from, function ($query, $date) {
                $query->whereDate('created_at', '>=', $date);
            })
            ->when($request->date_to, function ($query, $date) {
                $query->whereDate('created_at', '<=', $date);
            });

        $totalExpenses = (clone $query)->sum('amount');

        $expenses = $query
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Expenses/Index', [
            'expenses' => $expenses,
            'totalExpenses' => $totalExpenses,
            'filters' => $request->only([
                'search',
                'type',
                'date_from',
                'date_to',
                'per_page'
            ]),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
        $validated = $request->validate([
            'type' => ['required'],
            'amount' => ['required', 'numeric', 'min:0'],
            'expense_date' => ['required', 'date'],
            'description' => ['nullable'],
        ]);

        Expense::create([
            'type' => $validated['type'],
            'amount' => $validated['amount'],
            'expense_date' => $validated['expense_date'],
            'description' => $validated['description'],
        ]);

        return redirect()
            ->route('expenses.index')
            ->with('success', 'Gasto registrado correctamente');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Expense $expense)
    {
        $validated = $request->validate([
            'type' => ['required'],
            'amount' => ['required', 'numeric', 'min:0'],
            'expense_date' => ['required', 'date'],
            'description' => ['nullable'],
        ]);

        $expense->update($validated);
        return redirect()
            ->route('expenses.index')
            ->with('success', 'Gasto actualizado correctamente');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Expense $expense)
    {   
        $expense->delete();
        return redirect()->route('expenses.index')->with('success', 'Gasto eliminado correctamente.');
    }
}
