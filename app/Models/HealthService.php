<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class HealthService extends Model
{
    protected $fillable = [
        'category',
        'category_label',
        'name',
        'price',
        'description',
        'is_active',
    ];

    protected $casts = [
        'price'     => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function serviceRegistrations(): HasMany
    {
        return $this->hasMany(ServiceRegistration::class);
    }
}
