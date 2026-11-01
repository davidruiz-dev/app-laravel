<?php

namespace App\Http\Controllers;

use App\Services\DashboardStatsService;
use App\Services\RevenueChartService;
use App\Services\TopCategoriesService;
use App\Services\TopCustomersService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(
        Request $request,
        DashboardStatsService $statsService,
        RevenueChartService $chartService,
        TopCategoriesService $categoriesService,
        TopCustomersService $customersService
    ) {
        $validated = $request->validate([
            'days' => ['sometimes', 'integer', 'in:7,30,90'],
        ]);

        $days = (int) ($validated['days'] ?? 30);

        return Inertia::render('Dashboard/Index', [
            'stats' => $statsService->getStats($days),
            'revenueChart' => $chartService->getDailyRevenue($days),
            'chartDays' => $days,
            'topCategories' => $categoriesService->getTopCategories($days),
            'topCustomers' => $customersService->getTopCustomers($days),
        ]);
    }
}
