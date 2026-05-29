<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('health_services', function (Blueprint $table): void {
            $table->id();
            $table->string('category'); // e.g. mcu, lab, vaksin, terapi, homecare
            $table->string('category_label'); // e.g. Medical Check-Up
            $table->string('name'); // e.g. MCU Standar
            $table->decimal('price', 15, 2)->default(0);
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Seed default health services
        DB::table('health_services')->insert([
            // MCU
            [
                'category' => 'mcu',
                'category_label' => 'Medical Check-Up',
                'name' => 'MCU Standar',
                'price' => 350000.00,
                'description' => 'Pemeriksaan fisik umum, tekanan darah, gula darah sewaktu, dan kolesterol total.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category' => 'mcu',
                'category_label' => 'Medical Check-Up',
                'name' => 'MCU Eksekutif',
                'price' => 850000.00,
                'description' => 'Pemeriksaan fisik lengkap, hematologi lengkap, gula darah puasa, EKG rekam jantung, dan Rontgen Thorax.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category' => 'mcu',
                'category_label' => 'Medical Check-Up',
                'name' => 'MCU Premium',
                'price' => 1500000.00,
                'description' => 'MCU Eksekutif ditambah pemeriksaan USG abdomen, treadmill test, serta konsultasi spesialis mata & gigi.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Lab
            [
                'category' => 'lab',
                'category_label' => 'Laboratorium Clinik',
                'name' => 'Hematologi Lengkap',
                'price' => 150000.00,
                'description' => 'Analisis sel darah merah, sel darah putih, hemoglobin, trombosit, dan laju endap darah.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category' => 'lab',
                'category_label' => 'Laboratorium Clinik',
                'name' => 'Panel Screening Diabetes',
                'price' => 200000.00,
                'description' => 'Pemeriksaan Gula Darah Puasa, Gula Darah 2 Jam PP, dan HbA1c.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category' => 'lab',
                'category_label' => 'Laboratorium Clinik',
                'name' => 'Panel Kolesterol & Lipid',
                'price' => 180000.00,
                'description' => 'Pemeriksaan Kolesterol Total, HDL, LDL, dan Trigliserida.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Vaksin
            [
                'category' => 'vaksin',
                'category_label' => 'Vaksinasi & Imunisasi',
                'name' => 'Vaksin Influenza',
                'price' => 250000.00,
                'description' => 'Vaksinasi flu tahunan untuk melindungi dari berbagai mutasi virus influenza musiman.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category' => 'vaksin',
                'category_label' => 'Vaksinasi & Imunisasi',
                'name' => 'Vaksin Hepatitis B',
                'price' => 180000.00,
                'description' => 'Pemberian 1 dosis vaksin Hepatitis B untuk proteksi jangka panjang organ hati.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category' => 'vaksin',
                'category_label' => 'Vaksinasi & Imunisasi',
                'name' => 'Vaksin Pneumonia (PCV)',
                'price' => 950000.00,
                'description' => 'Imunisasi pencegahan infeksi paru-paru basah akibat bakteri pneumokokus.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Terapi
            [
                'category' => 'terapi',
                'category_label' => 'Fisioterapi & Rehabilitasi',
                'name' => 'Fisioterapi Stroke & Saraf',
                'price' => 200000.00,
                'description' => 'Terapi stimulasi saraf dan latihan gerak terarah untuk penderita pasca-stroke.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category' => 'terapi',
                'category_label' => 'Fisioterapi & Rehabilitasi',
                'name' => 'Fisioterapi Cedera Olahraga',
                'price' => 180000.00,
                'description' => 'Rehabilitasi fungsional otot dan sendi pasca terkilir, cedera ligament, atau patah tulang.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category' => 'terapi',
                'category_label' => 'Fisioterapi & Rehabilitasi',
                'name' => 'Fisioterapi Reduksi Nyeri Punggung',
                'price' => 150000.00,
                'description' => 'Terapi pemanasan infra-red, electro-therapy, dan manipulasi manual pada area nyeri punggung.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Home Care
            [
                'category' => 'homecare',
                'category_label' => 'Home Care (Layanan Rumah)',
                'name' => 'Kunjungan Dokter Umum',
                'price' => 250000.00,
                'description' => 'Pemeriksaan kesehatan umum, diagnosis penyakit ringan, dan resep obat langsung di rumah.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category' => 'homecare',
                'category_label' => 'Home Care (Layanan Rumah)',
                'name' => 'Perawatan Luka Steril',
                'price' => 150000.00,
                'description' => 'Tindakan ganti perban dan pembersihan luka pasca operasi atau luka kronis oleh perawat.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category' => 'homecare',
                'category_label' => 'Home Care (Layanan Rumah)',
                'name' => 'Pendampingan Lansia (8 Jam)',
                'price' => 350000.00,
                'description' => 'Perawatan harian lansia (caregiver) meliputi pemantauan nutrisi, obat, dan mobilitas.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('health_services');
    }
};
