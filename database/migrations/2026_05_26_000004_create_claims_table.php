<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('claims', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('insurance_policy_id')->constrained()->cascadeOnDelete();
            $table->decimal('claim_amount', 15, 2);
            $table->text('description');
            $table->string('document_path')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected', 'partial'])->default('pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('claims');
    }
};
