<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\OrderController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Login
Route::middleware('guest')->group(function () {
    Route::get('/login', function () {
        return Inertia::render('Login');
    })->name('login');

    Route::post('/login', [AuthController::class, 'store'])
        ->name('login.store');
});



Route::middleware('auth')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::resource('categories', CategoryController::class)->only([
        'index',
        'store',
        'update',
        'destroy',
    ]);

    Route::resource('customers', CustomerController::class);

    // Orders routes
    Route::get('/orders/kanban', [OrderController::class, 'Kanban'])->name('orders.kanban');

    Route::patch('/orders/{order}/in_progress', [OrderController::class, 'MarkAsInProgress'])->name('orders.MarkAsInProgress');
    Route::patch('/orders/{order}/complete', [OrderController::class, 'MarkAsCompleted'])->name('orders.MarkAsCompleted');
    // Route::patch('/orders/{order}/cancel', [OrderController::class, 'MarkAsCancelled'])->name('orders.MarkAsCancelled');
    Route::patch('/orders/{order}/delivered', [OrderController::class, 'MarkAsDelivered'])->name('orders.MarkAsDelivered');
    Route::get('/orders/calendar', [OrderController::class, 'calendar'])->name('orders.calendar');
    Route::resource('orders', OrderController::class);

    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

    Route::post('/logout', [AuthController::class, 'destroy'])->name('logout');
});
