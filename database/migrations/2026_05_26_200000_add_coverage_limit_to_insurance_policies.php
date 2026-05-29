<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('insurance_policies', function (Blueprint $table): void {
            $table->decimal('coverage_limit', 15, 2)->default(100000000)->after('premium_amount');
            $table->date('start_date')->nullable()->after('coverage_limit');
            $table->date('end_date')->nullable()->after('start_date');
        });

        Schema::table('feedbacks', function (Blueprint $table): void {
            $table->unsignedTinyInteger('rating')->default(5)->after('content');
        });
    }

    public function down(): void
    {
        Schema::table('insurance_policies', function (Blueprint $table): void {
            $table->dropColumn(['coverage_limit', 'start_date', 'end_date']);
        });

        Schema::table('feedbacks', function (Blueprint $table): void {
            $table->dropColumn('rating');
        });
    }
};
