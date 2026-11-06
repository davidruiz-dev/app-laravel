<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Payment extends Model
{
    //
    use SoftDeletes;
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
