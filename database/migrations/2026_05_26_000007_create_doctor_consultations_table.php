<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('doctor_consultations', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('doctor_name');
            $table->string('specialist_type');
            $table->enum('consultation_type', ['chat', 'call']);
            $table->enum('payment_status', ['pending', 'paid']);
            $table->unsignedInteger('session_duration_minutes')->default(45);
            $table->enum('status', ['waiting_approval', 'approved', 'rejected', 'completed'])->default('waiting_approval');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('doctor_consultations');
    }
};
