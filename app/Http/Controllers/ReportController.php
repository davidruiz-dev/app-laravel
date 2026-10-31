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
            'endDate' => [
                'nullable',
                'date_format:Y-m-d',
                'after_or_equal:startDate'
            ],
        ]);

        $now = now();

        $startDate = isset($validated['startDate'])
            ? Carbon::parse($validated['startDate'])->startOfDay()
            : now()->startOfMonth();

        $endDate = isset($validated['endDate'])
            ? Carbon::parse($validated['endDate'])->endOfDay()
            : now()->endOfMonth();

        // Indicadores
        $sales = Order::query()
            ->whereBetween('created_at', [$startDate, $endDate])
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

        // Ingresos agrupados por día
        $income = Payment::query()
            ->selectRaw('MONTH(paid_at) as month, SUM(amount) as total')
            ->whereYear('paid_at', $now->year)
            ->groupByRaw('MONTH(paid_at)')
            ->pluck('total', 'month');

        // Egresos agrupados por mes
        $expenses = Expense::query()
            ->selectRaw('MONTH(expense_date) as month, SUM(amount) as total')
            ->whereYear('expense_date', $now->year)
            ->groupByRaw('MONTH(expense_date)')
            ->pluck('total', 'month');

        // Construir datos para todos los días del mes
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

        $chartData = collect($months)->map(function ($name, $month) use ($income, $expenses) {
            return [
                'month' => $name,
                'income' => (float) ($income[$month] ?? 0),
                'expenses' => (float) ($expenses[$month] ?? 0),
            ];
        })->values();

        $categoryIncome = DB::table('order_items')
            ->join('categories', 'categories.id', '=', 'order_items.category_id')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->selectRaw('
                categories.id,
                categories.name as category,
                SUM(order_items.subtotal) as total
            ')
            ->whereYear('orders.created_at', $now->year)
            ->where('orders.status', '!=', 'cancelled')
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('total')
            ->get()
            ->map(fn($item) => [
                'category' => $item->category,
                'total' => (float) $item->total,
            ]);

        // Clientes nuevos: primera compra dentro del periodo
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

        // Clientes recurrentes: compraron en el periodo y antes de él
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
                'sales' => $sales,
                'totalRevenue' => $totalRevenue,
                'totalExpenses' => $totalExpenses,
                'profit' => $profit,
                'profitMargin' => $profitMargin,
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
            ],
        ]);
    }
}
