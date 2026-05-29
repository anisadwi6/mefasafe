<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServiceRegistration extends Model
{
    protected $fillable = [
        'user_id',
        'hospital_id',
        'insurance_policy_id',
        'health_service_id',
        'service_type',
        'service_name',
        'schedule_date',
        'schedule_time',
        'price',
        'promo_code',
        'original_price',
        'discount_amount',
        'queue_number',
        'barcode_data',
        'notes',
        'status',
    ];

    protected $casts = [
        'schedule_date' => 'date',
        'price'          => 'decimal:2',
        'original_price' => 'decimal:2',
        'discount_amount' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function hospital(): BelongsTo
    {
        return $this->belongsTo(Hospital::class);
    }

    public function insurancePolicy(): BelongsTo
    {
        return $this->belongsTo(InsurancePolicy::class);
    }

    public function healthService(): BelongsTo
    {
        return $this->belongsTo(HealthService::class);
    }
}
