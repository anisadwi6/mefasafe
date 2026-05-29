<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('announcements', function (Blueprint $table): void {
            $table->id();
            $table->string('badge')->default('Informasi');
            $table->string('title');
            $table->text('description');
            $table->string('button_label')->nullable();
            $table->string('button_url')->nullable();
            $table->string('image')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        DB::table('announcements')->insert([
            'badge' => 'Informasi',
            'title' => 'Selamat datang di MefaSafe',
            'description' => 'Pantau polis, klaim, dan layanan kesehatan Anda langsung dari dashboard. Hubungi tim kami jika butuh bantuan.',
            'button_label' => null,
            'button_url' => null,
            'is_active' => true,
            'sort_order' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('announcements');
    }
};
