<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('insurance_policy_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('transaction_type', ['premi_masuk', 'klaim_keluar']);
            $table->decimal('amount', 15, 2);
            $table->dateTime('transaction_date')->useCurrent();
            $table->enum('status', ['success', 'failed', 'pending']);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
