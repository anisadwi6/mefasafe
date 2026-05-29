<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InsurancePackage extends Model
{
    protected $fillable = [
        'type',
        'label',
        'description',
        'coverage_limit',
        'premium_amount',
        'benefits',
        'is_active',
    ];

    protected $casts = [
        'coverage_limit' => 'decimal:2',
        'premium_amount' => 'decimal:2',
        'benefits' => 'array',
        'is_active' => 'boolean',
    ];
}
