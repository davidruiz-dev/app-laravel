<?php

namespace App\Services;

use App\Models\Payment;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class RevenueChartService
{
    public function getDailyRevenue(int $days): array
    {
        $end = now()->endOfDay();

        $start = now()
            ->subDays($days - 1)
            ->startOfDay();

        $dailyRevenue = Payment::query()
            ->whereNotNull('paid_at')
            ->whereBetween('paid_at', [$start, $end])
            ->selectRaw(
                'DATE(paid_at) as date, SUM(amount) as total'
            )
            ->groupBy(DB::raw('DATE(paid_at)'))
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        return collect(range(0, $days - 1))
            ->map(function ($offset) use ($start, $dailyRevenue) {
                $date = $start->copy()
                    ->addDays($offset)
                    ->toDateString();

                return [
                    'date' => $date,
                    'label' => Carbon::parse($date)->format('d/m'),
                    'total' => (float) (
                        $dailyRevenue->get($date)?->total ?? 0
                    ),
                ];
            })
            ->values()
            ->all();
    }
}