<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Hospital extends Model
{
    protected $fillable = [
        'name', 'address', 'city', 'province', 'phone', 'email',
        'latitude', 'longitude', 'type', 'facilities',
        'image', 'is_partner', 'is_active',
    ];

    protected $casts = [
        'latitude'   => 'float',
        'longitude'  => 'float',
        'is_partner' => 'boolean',
        'is_active'  => 'boolean',
    ];

    public function registrations(): HasMany
    {
        return $this->hasMany(HospitalRegistration::class);
    }

    public function doctors(): HasMany
    {
        return $this->hasMany(Doctor::class);
    }

    public function distanceFrom(float $lat, float $lng): float
    {
        $earthRadius = 6371;
        $dLat = deg2rad($this->latitude - $lat);
        $dLng = deg2rad($this->longitude - $lng);
        $a = sin($dLat / 2) ** 2
            + cos(deg2rad($lat)) * cos(deg2rad($this->latitude)) * sin($dLng / 2) ** 2;
        return $earthRadius * 2 * atan2(sqrt($a), sqrt(1 - $a));
    }
}
