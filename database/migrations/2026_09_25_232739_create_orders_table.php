<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('customers');
            $table->enum('status', [
                'pending',
                'in_progress',
                'cancelled',
                'ready',
                'delivered',
            ])->default('pending');
            $table->date('order_date');
            $table->enum('delivery_shift', ['morning', 'afternoon']);
            $table->enum('delivery_type', ['delivery', 'pickup']);
            $table->string('delivery_address')->nullable();
            $table->dateTime('delivered_at')->nullable();
            $table->decimal('subtotal', 10, 2)->default(0);
            $table->decimal('discount', 10, 2)->default(0);
            $table->decimal('total', 10, 2)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
