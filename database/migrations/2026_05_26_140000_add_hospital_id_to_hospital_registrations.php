<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('hospital_registrations', function (Blueprint $table): void {
            // Tambah hospital_id sebagai FK ke tabel hospitals
            $table->foreignId('hospital_id')
                ->nullable()
                ->after('insurance_policy_id')
                ->constrained('hospitals')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('hospital_registrations', function (Blueprint $table): void {
            $table->dropForeign(['hospital_id']);
            $table->dropColumn('hospital_id');
        });
    }
};
