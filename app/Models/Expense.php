<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Expense extends Model
{
    //
    use SoftDeletes;
    protected $table = 'expenses';

    protected $fillable = [
        'type',
        'amount',
        'description',
        'expense_date',
    ];

    
}
