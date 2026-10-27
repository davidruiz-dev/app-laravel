<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class TopCustomersService
{
    public function getTopCustomers(int $days): array
    {
        $days = in_array($days, [7, 30, 90], true)
            ? $days
            : 30;

        $end = now()->endOfDay();

        $start = now()
            ->subDays($days - 1)
            ->startOfDay();

        $customers = DB::table('orders')
            ->join(
                'customers',
                'customers.id',
                '=',
                'orders.customer_id'
            )
            ->whereBetween('orders.created_at', [$start, $end])
            ->select(
    'customers.id',
    'customers.full_name',
    DB::raw('COUNT(orders.id) as total_sales')
)
->groupBy('customers.id', 'customers.full_name')
            ->groupBy('customers.id', 'customers.full_name')
            ->orderByDesc('total_sales')
            ->limit(5)
            ->get();

        $totalSales = (int) DB::table('orders')
            ->whereBetween('created_at', [$start, $end])
            ->whereNotNull('customer_id')
            ->count();

        return $customers
            ->map(function ($customer) use ($totalSales) {
                $sales = (int) $customer->total_sales;

                return [
                    'id' => (int) $customer->id,
                    'full_name' => $customer->full_name,
                    'total_sales' => $sales,
                    'percentage' => $totalSales > 0
                        ? round(($sales / $totalSales) * 100, 1)
                        : 0,
                ];
            })
            ->values()
            ->all();
    }
}
