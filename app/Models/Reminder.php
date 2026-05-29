<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reminder extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'description',
        'reminder_date',
        'reminder_time',
        'category',
        'repeat',
        'is_notified',
        'is_done',
    ];

    protected $casts = [
        'reminder_date' => 'date',
        'is_notified'   => 'boolean',
        'is_done'       => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
