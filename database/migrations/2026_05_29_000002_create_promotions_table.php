<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('promotions', function (Blueprint $table): void {
            $table->id();
            $table->string('badge')->default('Promo Spesial');
            $table->string('title');
            $table->text('description');
            $table->string('button_label')->default('Lihat Promo');
            $table->string('button_url')->default('/asuransi');
            $table->string('image')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        DB::table('promotions')->insert([
            'badge' => 'Promo Spesial',
            'title' => 'Dapatkan Cashback 20% untuk Member Baru!',
            'description' => 'Ajak keluarga dan teman untuk bergabung. Nikmati perlindungan kesehatan terbaik dengan harga spesial.',
            'button_label' => 'Ajak Sekarang',
            'button_url' => '/asuransi',
            'is_active' => true,
            'sort_order' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('promotions');
    }
};
