<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\Order;
use App\Models\Payment;

class DashboardStatsService
{
    public function getStats(): array
    {
        $now = now();

        $monthStart = $now->copy()->startOfMonth();
        $monthEnd = $now->copy()->endOfMonth();

        $previousStart = $now->copy()
            ->subMonthNoOverflow()
            ->startOfMonth();

        $previousEnd = $now->copy()
            ->subMonthNoOverflow()
            ->endOfMonth();

        $totalRevenue = Payment::query()
            ->whereBetween('paid_at', [
                $monthStart,
                $monthEnd,
            ])
            ->sum('amount');

        $previousRevenue = Payment::query()
            ->whereBetween('paid_at', [
                $previousStart,
                $previousEnd,
            ])
            ->sum('amount');

        $completedOrders = Order::query()
            ->where('status', 'Completed')
            ->whereBetween('updated_at', [
                $monthStart,
                $monthEnd,
            ])
            ->count();

        $newCustomers = Customer::query()
            ->whereBetween('created_at', [
                $monthStart,
                $monthEnd,
            ])
            ->count();

        $previousCustomers = Customer::query()
            ->whereBetween('created_at', [
                $previousStart,
                $previousEnd,
            ])
            ->count();

        $customerGrowth = $previousCustomers > 0
            ? round(
                (
                    ($newCustomers - $previousCustomers)
                    / $previousCustomers
                ) * 100,
                1
            )
            : null;

        $pendingOrders = Order::query()
            ->whereIn('status', [
                'Pending',
                'In Progress',
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
        ];
    }
}
