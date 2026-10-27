<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class TopCategoriesService
{
    public function getTopCategories(int $days): array
    {
        $days = in_array($days, [7, 30, 90], true)
            ? $days
            : 30;

        $end = now()->endOfDay();

        $start = now()
            ->subDays($days - 1)
            ->startOfDay();

        $baseQuery = DB::table('order_items')
            ->join(
                'orders',
                'orders.id',
                '=',
                'order_items.order_id'
            )
            ->join(
                'categories',
                'categories.id',
                '=',
                'order_items.category_id'
            )
            // ->where('orders.status', 'Completed')
            ->whereBetween('orders.created_at', [$start, $end]);

        // Total de ventas por categoría.
        $totalSales = (clone $baseQuery)
            ->distinct()
            ->count('orders.id');

        $categories = (clone $baseQuery)
            ->select(
                'categories.id',
                'categories.name',
                DB::raw(
                    'COUNT(DISTINCT orders.id) as total_sales'
                )
            )
            ->groupBy(
                'categories.id',
                'categories.name'
            )
            ->orderByDesc('total_sales')
            ->limit(5)
            ->get();

        return $categories
            ->map(function ($category) use ($totalSales) {
                $sales = (int) $category->total_sales;

                return [
                    'id' => (int) $category->id,
                    'name' => $category->name,
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
