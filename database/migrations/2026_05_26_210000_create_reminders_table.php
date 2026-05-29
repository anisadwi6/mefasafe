<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reminders', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->date('reminder_date');
            $table->time('reminder_time')->nullable();
            $table->enum('category', ['kontrol', 'obat', 'vaksin', 'lainnya'])->default('lainnya');
            $table->enum('repeat', ['none', 'daily', 'weekly', 'monthly'])->default('none');
            $table->boolean('is_notified')->default(false);
            $table->boolean('is_done')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reminders');
    }
};
