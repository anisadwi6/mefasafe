<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('doctor_consultations', function (Blueprint $table): void {
            $table->foreignId('insurance_policy_id')->nullable()->constrained('insurance_policies')->nullOnDelete()->after('user_id');
            $table->enum('payment_method', ['saldo_asuransi', 'transfer'])->nullable()->after('payment_status');
            $table->string('payment_proof_path')->nullable()->after('payment_method');
        });
    }

    public function down(): void
    {
        Schema::table('doctor_consultations', function (Blueprint $table): void {
            $table->dropForeign(['insurance_policy_id']);
            $table->dropColumn(['insurance_policy_id', 'payment_method', 'payment_proof_path']);
        });
    }
};
