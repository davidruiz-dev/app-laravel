<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Category extends Model
{
    use SoftDeletes;
    
    protected $fillable = [
        'name',
        'description',
    ];

    public function orderItems(): HasMany
    {
        return $this->hasMany(Orderitem::class);
    }
}
