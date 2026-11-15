<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model
{
    protected $fillable = [
        'full_name',
        'phone',
        'email',
        'social_network'
    ];

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}
