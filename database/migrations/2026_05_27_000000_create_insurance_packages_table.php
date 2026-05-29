<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('insurance_packages', function (Blueprint $table): void {
            $table->id();
            $table->enum('type', ['jiwa', 'kesehatan', 'kendaraan']);
            $table->string('label');
            $table->text('description');
            $table->decimal('coverage_limit', 15, 2);
            $table->decimal('premium_amount', 15, 2);
            $table->json('benefits');
            $table->timestamps();
        });

        DB::table('insurance_packages')->insert([
            [
                'type' => 'jiwa',
                'label' => 'Asuransi Jiwa',
                'description' => 'Perlindungan jiwa untuk ketenangan keluarga Anda',
                'coverage_limit' => 500000000,
                'premium_amount' => 750000,
                'benefits' => json_encode([
                    'Santunan meninggal dunia hingga Rp 500 juta',
                    'Santunan cacat tetap total',
                    'Bebas premi jika cacat',
                    'Nilai tunai setelah 2 tahun',
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'type' => 'kesehatan',
                'label' => 'Asuransi Kesehatan',
                'description' => 'Rawat inap, rawat jalan, dan obat-obatan ditanggung',
                'coverage_limit' => 100000000,
                'premium_amount' => 500000,
                'benefits' => json_encode([
                    'Rawat inap hingga Rp 100 juta/tahun',
                    'Rawat jalan 80% ditanggung',
                    'Obat sesuai resep dokter',
                    '500+ rumah sakit rekanan',
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'type' => 'kendaraan',
                'label' => 'Asuransi Kendaraan',
                'description' => 'Lindungi kendaraan dari risiko kecelakaan & kehilangan',
                'coverage_limit' => 200000000,
                'premium_amount' => 300000,
                'benefits' => json_encode([
                    'Ganti rugi kecelakaan hingga Rp 200 juta',
                    'Kehilangan akibat pencurian',
                    'Tanggung jawab pihak ketiga',
                    'Layanan derek 24 jam',
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('insurance_packages');
    }
};
