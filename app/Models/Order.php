<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Order extends Model
{
    protected $fillable = [
        'customer_id',
        'subtotal', 
        'discount', 
        'total',
        'status',
        'order_date',
        'delivery_shift',
        'delivery_type',
        'delivery_address',
        'delivered_at',
    ];

    protected $casts = [
        'delivered_at' => 'datetime',
        'subtotal' => 'decimal:2',
        'discount' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function getPaidAmountAttribute(): string
    {
        return number_format((float) $this->payments->sum('amount'), 2, '.', '');
    }

    public function getBalanceAttribute(): string
    {
        return number_format((float) $this->total - (float) $this->paid_amount, 2, '.', '');
    }
}
