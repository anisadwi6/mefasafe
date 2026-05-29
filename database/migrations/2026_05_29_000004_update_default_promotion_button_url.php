<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('promotions')
            ->where('button_url', '/asuransi')
            ->update(['button_url' => '/promo']);
    }

    public function down(): void
    {
        DB::table('promotions')
            ->where('button_url', '/promo')
            ->update(['button_url' => '/asuransi']);
    }
};
