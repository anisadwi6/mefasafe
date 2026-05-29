<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('promo_codes', function (Blueprint $table): void {
            $table->id();
            $table->string('code')->unique();
            $table->string('title');
            $table->unsignedTinyInteger('discount_percent');
            $table->json('applicable_features');
            $table->unsignedInteger('usage_limit')->nullable();
            $table->unsignedInteger('used_count')->default(0);
            $table->unsignedInteger('per_user_limit')->default(1);
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('promo_code_usages', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('promo_code_id')->constrained('promo_codes')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('feature', 50);
            $table->string('reference_type')->nullable();
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->decimal('original_amount', 14, 2);
            $table->decimal('discount_amount', 14, 2);
            $table->decimal('final_amount', 14, 2);
            $table->timestamps();
        });

        Schema::table('insurance_policies', function (Blueprint $table): void {
            $table->string('promo_code')->nullable()->after('payment_status');
            $table->decimal('original_premium_amount', 14, 2)->nullable()->after('promo_code');
            $table->decimal('discount_amount', 14, 2)->nullable()->after('original_premium_amount');
        });

        Schema::table('doctor_consultations', function (Blueprint $table): void {
            $table->decimal('consultation_amount', 14, 2)->default(75000)->after('payment_method');
            $table->string('promo_code')->nullable()->after('consultation_amount');
            $table->decimal('discount_amount', 14, 2)->nullable()->after('promo_code');
        });
    }

    public function down(): void
    {
        Schema::table('doctor_consultations', function (Blueprint $table): void {
            $table->dropColumn(['consultation_amount', 'promo_code', 'discount_amount']);
        });

        Schema::table('insurance_policies', function (Blueprint $table): void {
            $table->dropColumn(['promo_code', 'original_premium_amount', 'discount_amount']);
        });

        Schema::dropIfExists('promo_code_usages');
        Schema::dropIfExists('promo_codes');
    }
};
