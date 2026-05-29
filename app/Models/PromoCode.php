<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PromoCode extends Model
{
    public const FEATURE_INSURANCE = 'insurance';
    public const FEATURE_CONSULTATION = 'consultation';
    public const FEATURE_HOSPITAL = 'hospital_registration';
    public const FEATURE_SERVICE = 'service_registration';

    public const FEATURE_LABELS = [
        self::FEATURE_INSURANCE => 'Polis Asuransi',
        self::FEATURE_CONSULTATION => 'Konsultasi Dokter',
        self::FEATURE_HOSPITAL => 'Registrasi RS',
        self::FEATURE_SERVICE => 'Registrasi Layanan',
    ];

    protected $fillable = [
        'code',
        'title',
        'discount_percent',
        'applicable_features',
        'usage_limit',
        'used_count',
        'per_user_limit',
        'starts_at',
        'ends_at',
        'is_active',
    ];

    protected $casts = [
        'applicable_features' => 'array',
        'is_active' => 'boolean',
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
    ];

    public function usages(): HasMany
    {
        return $this->hasMany(PromoCodeUsage::class);
    }
}
