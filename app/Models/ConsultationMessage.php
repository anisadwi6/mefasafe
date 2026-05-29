<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ConsultationMessage extends Model
{
    protected $fillable = [
        'doctor_consultation_id',
        'sender',
        'message',
    ];

    public function doctorConsultation()
    {
        return $this->belongsTo(DoctorConsultation::class);
    }}
