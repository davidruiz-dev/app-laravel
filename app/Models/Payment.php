<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    //
    protected $fillable = [
        'order_id',
        'amount',
        'method',
        'paid_at',
        'type',
        'note',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

}
