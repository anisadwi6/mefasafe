<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hospital_registrations', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('insurance_policy_id')->nullable()->constrained()->nullOnDelete();
            $table->string('hospital_name');
            $table->string('doctor_name');
            $table->date('schedule_date');
            $table->string('queue_number');
            $table->string('barcode_data');
            $table->enum('status', ['registered', 'canceled'])->default('registered');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hospital_registrations');
    }
};
