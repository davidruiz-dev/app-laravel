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
            $table->foreignId('customer_id')
                ->constrained('customers')
                ->cascadeOnDelete();
            $table->decimal('total', 10, 2)->default(0);
            $table->enum('status', [
                'pending',
                'in_progress',
                'cancelled',
                'completed',
                'delivered',
            ])->default('pending');
            $table->date('date');
            $table->string('shift');
            $table->boolean('delivery')->default(false);
            $table->string('delivery_address')->nullable();

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
