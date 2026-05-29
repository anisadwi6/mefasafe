<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('promotions', function (Blueprint $table): void {
            $table->unsignedTinyInteger('discount_percent')->default(20)->after('description');
            $table->unsignedTinyInteger('required_referrals')->default(3)->after('discount_percent');
        });

        DB::table('promotions')->update([
            'discount_percent' => 20,
            'required_referrals' => 3,
        ]);
    }

    public function down(): void
    {
        Schema::table('promotions', function (Blueprint $table): void {
            $table->dropColumn(['discount_percent', 'required_referrals']);
        });
    }
};
