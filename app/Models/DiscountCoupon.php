<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DiscountCoupon extends Model
{
    protected $fillable = [
        'user_id',
        'code',
        'discount_percent',
        'required_referrals',
        'used_count',
        'usage_limit',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
