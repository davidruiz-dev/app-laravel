<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends Model
{
    use SoftDeletes;
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
