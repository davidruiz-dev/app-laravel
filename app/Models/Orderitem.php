<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class OrderItem extends Model
{
    use SoftDeletes;
    protected $table = 'order_items';
    
    protected $fillable = [
        'order_id',
        'category_id',
        'name',
        'description',
        'quantity',
        'subtotal',
        'customization',
        'image_url',
        'image_public_id',

    ];

    protected $casts = [
        'customization' => 'array',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
}
