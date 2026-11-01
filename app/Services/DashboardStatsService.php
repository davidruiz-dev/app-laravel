<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\Order;
use App\Models\Payment;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardStatsService
{
    public function getStats(
        string $period = '30',
        ?string $startDate = null,
        ?string $endDate = null
    ): array {

        $end = now()->endOfDay();

        switch ($period) {

            case '7':
                $start = now()->subDays(6)->startOfDay();
                break;

            case '90':
                $start = now()->subDays(89)->startOfDay();
                break;

            case 'custom':
                $start = Carbon::parse($startDate)->startOfDay();
                $end = Carbon::parse($endDate)->endOfDay();
                break;

            default:
                $period = '30';
                $start = now()->subDays(29)->startOfDay();
                break;
        }

        // Periodo anterior de igual duración.
        $days = $start->diffInDays($end) + 1;

        $previousEnd = $start->copy()->subSecond();
        $previousStart = $previousEnd->copy()
            ->subDays($days)
            ->startOfDay();

        // Ingresos recibidos.
        $totalRevenue = Payment::query()
            ->whereBetween('paid_at', [$start, $end])
            ->sum('amount');

        $previousRevenue = Payment::query()
            ->whereBetween('paid_at', [
                $previousStart,
                $previousEnd,
            ])
            ->sum('amount');

        // Pedidos completados durante el periodo.
        $completedOrders = Order::query()
            ->where('status', 'delivered')
            ->whereBetween('updated_at', [$start, $end])
            ->count();

        // Clientes nuevos.
        $newCustomers = Customer::query()
            ->whereBetween('created_at', [$start, $end])
            ->count();

        $previousCustomers = Customer::query()
            ->whereBetween('created_at', [
                $previousStart,
                $previousEnd,
            ])
            ->count();

        // Crecimiento de clientes.
        $customerGrowth = $previousCustomers > 0
            ? round(
                (($newCustomers - $previousCustomers)
                    / $previousCustomers) * 100,
                1
            )
            : null;

        // Pedidos pendientes: estado actual, sin filtro temporal.
        $pendingOrders = Order::query()
            ->whereIn('status', [
                'pending',
                'in_preparation',
                'ready',
            ])
            ->count();

        return [
            'total_revenue' => (float) $totalRevenue,
            'previous_revenue' => (float) $previousRevenue,

            'completed_orders' => $completedOrders,

            'new_customers' => $newCustomers,
            'previous_customers' => $previousCustomers,
            'customer_growth' => $customerGrowth,

            'pending_orders' => $pendingOrders,

            'filters' => [
                'period' => $period,
                'startDate' => $start->toDateString(),
                'endDate' => $end->toDateString(),
            ],
        ];
    }
}