<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Expense;
use App\Models\Order;
use App\Models\Payment;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ReportController extends Controller
{

    public function index(Request $request)
    {
        $validated = $request->validate([
            'startDate' => ['nullable', 'date_format:Y-m-d'],
            'endDate' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:startDate', ],
            'year' => ['nullable', 'integer', 'min:2000', 'max:2100'],
        ]);

        $startDate = isset($validated['startDate'])
            ? Carbon::parse($validated['startDate'])->startOfDay()
            : now()->startOfMonth();

        $endDate = isset($validated['endDate'])
            ? Carbon::parse($validated['endDate'])->endOfDay()
            : now()->endOfMonth();

        // Indicadores
        $sales = Order::query()
            ->whereBetween('created_at', [$startDate, $endDate])
            ->where('status', '!=', 'cancelled')
            ->sum('total');

        $totalRevenue = Payment::query()
            ->whereBetween('paid_at', [$startDate, $endDate])
            ->sum('amount');

        $totalExpenses = Expense::query()
            ->whereBetween('expense_date', [$startDate, $endDate])
            ->sum('amount');

        $profit = $sales - $totalExpenses;

        $profitMargin = $sales > 0
            ? ($profit / $sales) * 100
            : 0;

        $selectedYear = $validated['year'] ?? now()->year;
        // Ingresos agrupados por mes
        $income = Payment::query()
            ->selectRaw("strftime('%m', paid_at) as month, SUM(amount) as total")
            ->whereYear('paid_at', $selectedYear)
            ->groupByRaw("strftime('%m', paid_at)")
            ->pluck('total', 'month');

        // Egresos agrupados por mes 
        $expenses = Expense::query()
            ->selectRaw("strftime('%m', expense_date) as month, SUM(amount) as total")
            ->whereYear('expense_date', $selectedYear)
            ->groupByRaw("strftime('%m', expense_date)")
            ->pluck('total', 'month');

        // Nombres de los meses
        $months = [
            1 => 'Ene',
            2 => 'Feb',
            3 => 'Mar',
            4 => 'Abr',
            5 => 'May',
            6 => 'Jun',
            7 => 'Jul',
            8 => 'Ago',
            9 => 'Sep',
            10 => 'Oct',
            11 => 'Nov',
            12 => 'Dic',
        ];

        // Construir datos para el gráfico
        $chartData = collect($months)->map(function ($name, $month) use ($income, $expenses) {
            return [
                'month' => $name,
                'income' => (float) ($income[sprintf('%02d', $month)] ?? 0),
                'expenses' => (float) ($expenses[sprintf('%02d', $month)] ?? 0),
            ];
        })->values();

        // Ingresos por categoría
        $categoryIncome = DB::table('order_items')
            ->join('categories', 'categories.id', '=', 'order_items.category_id')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->selectRaw('
            categories.id,
            categories.name as category,
            SUM(order_items.subtotal) as total
        ')
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->where('orders.status', '!=', 'cancelled')
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('total')
            ->get()
            ->map(fn($item) => [
                'category' => $item->category,
                'total' => (float) $item->total,
            ]);

        // Clientes nuevos
        $newCustomers = Customer::query()
            ->whereHas('orders', function ($query) use ($startDate, $endDate) {
                $query->whereBetween('created_at', [$startDate, $endDate])
                    ->where('status', '!=', 'cancelled');
            })
            ->whereDoesntHave('orders', function ($query) use ($startDate) {
                $query->where('created_at', '<', $startDate)
                    ->where('status', '!=', 'cancelled');
            })
            ->count();

        // Clientes recurrentes
        $recurringCustomers = Customer::query()
            ->whereHas('orders', function ($query) use ($startDate, $endDate) {
                $query->whereBetween('created_at', [$startDate, $endDate])
                    ->where('status', '!=', 'cancelled');
            })
            ->whereHas('orders', function ($query) use ($startDate) {
                $query->where('created_at', '<', $startDate)
                    ->where('status', '!=', 'cancelled');
            })
            ->count();

        return Inertia::render('Reports/Index', [
            'stats' => [
                'sales' => (float) $sales,
                'totalRevenue' => (float) $totalRevenue,
                'totalExpenses' => (float) $totalExpenses,
                'profit' => (float) $profit,
                'profitMargin' => (float) $profitMargin,
            ],
            'chartData' => $chartData,
            'categoryIncome' => $categoryIncome,
            'customerStats' => [
                'new' => $newCustomers,
                'recurring' => $recurringCustomers,
            ],
            'filters' => [
                'startMonth' => $startDate->format('Y-m'),
                'endMonth' => $endDate->format('Y-m'),
                'year' => (int) $selectedYear,
            ],
        ]);
    }
}
