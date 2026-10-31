<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Expense extends Model
{
    //
    protected $table = 'expenses';

    protected $fillable = [
        'type',
        'amount',
        'description',
        'expense_date',
    ];

    
}
