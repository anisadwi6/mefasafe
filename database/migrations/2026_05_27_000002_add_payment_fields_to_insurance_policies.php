<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('insurance_policies', function (Blueprint $table): void {
            $table->string('payment_method')->nullable()->after('status');
            $table->string('payment_proof_path')->nullable()->after('payment_method');
            $table->enum('payment_status', ['pending', 'verified', 'rejected'])->nullable()->after('payment_proof_path');
        });
    }

    public function down(): void
    {
        Schema::table('insurance_policies', function (Blueprint $table): void {
            $table->dropColumn(['payment_method', 'payment_proof_path', 'payment_status']);
        });
    }
};
