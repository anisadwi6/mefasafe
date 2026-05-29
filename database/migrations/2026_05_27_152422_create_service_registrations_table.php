<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_registrations', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('hospital_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('insurance_policy_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('health_service_id')->constrained()->cascadeOnDelete();
            $table->string('service_type'); // denormalized e.g. mcu, lab
            $table->string('service_name'); // denormalized e.g. MCU Standar
            $table->date('schedule_date');
            $table->string('schedule_time'); // e.g. 08:00 - 10:00
            $table->decimal('price', 15, 2)->default(0); // denormalized price at booking
            $table->string('queue_number');
            $table->string('barcode_data');
            $table->text('notes')->nullable();
            $table->enum('status', ['registered', 'completed', 'canceled'])->default('registered');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_registrations');
    }
};
