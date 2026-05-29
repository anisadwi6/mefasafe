<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Feedback extends Model
{
    protected $table = 'feedbacks';

    public const CATEGORY_LABELS = [
        'layanan' => 'Layanan Kesehatan',
        'kecepatan_klaim' => 'Klaim Asuransi',
        'kemudahan_akses' => 'Kemudahan Akses',
    ];

    public const CATEGORY_CTA = [
        'layanan' => ['label' => 'Coba Layanan', 'url' => '/pendaftaran-layanan'],
        'kecepatan_klaim' => ['label' => 'Ajukan Klaim', 'url' => '/klaim'],
        'kemudahan_akses' => ['label' => 'Buka Asuransi', 'url' => '/asuransi'],
    ];

    protected $fillable = [
        'user_id',
        'category',
        'rating',
        'content',
        'is_featured',
    ];

    protected $casts = [
        'is_featured' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
