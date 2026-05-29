<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('service_registrations', function (Blueprint $table): void {
            $table->string('promo_code')->nullable()->after('price');
            $table->decimal('original_price', 15, 2)->nullable()->after('promo_code');
            $table->decimal('discount_amount', 15, 2)->nullable()->after('original_price');
        });
    }

    public function down(): void
    {
        Schema::table('service_registrations', function (Blueprint $table): void {
            $table->dropColumn(['promo_code', 'original_price', 'discount_amount']);
        });
    }
};
