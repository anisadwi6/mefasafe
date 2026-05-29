<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->string('referral_code')->nullable()->unique()->after('role');
        });

        Schema::create('referrals', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('referrer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('referred_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('referral_code');
            $table->timestamps();
            $table->unique('referred_user_id');
        });

        Schema::create('discount_coupons', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('code')->unique();
            $table->unsignedTinyInteger('discount_percent')->default(20);
            $table->unsignedInteger('required_referrals')->default(3);
            $table->unsignedInteger('used_count')->default(0);
            $table->unsignedInteger('usage_limit')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        DB::table('users')->orderBy('id')->get(['id', 'name'])->each(function ($user): void {
            $prefix = strtoupper(Str::slug(substr($user->name ?: 'MEFA', 0, 4), ''));
            DB::table('users')
                ->where('id', $user->id)
                ->update(['referral_code' => ($prefix ?: 'MEFA') . str_pad((string) $user->id, 4, '0', STR_PAD_LEFT)]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('discount_coupons');
        Schema::dropIfExists('referrals');

        Schema::table('users', function (Blueprint $table): void {
            $table->dropUnique(['referral_code']);
            $table->dropColumn('referral_code');
        });
    }
};
