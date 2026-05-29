<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Add 'failed' to the enum values for payment_status
        DB::statement("ALTER TABLE `doctor_consultations` MODIFY `payment_status` ENUM('pending','paid','failed') NOT NULL DEFAULT 'pending'");
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // Revert to original enum (remove 'failed') — be careful: this may fail
        // if rows with value 'failed' still exist. Handle by setting such rows
        // back to 'pending' before altering.
        DB::statement("UPDATE `doctor_consultations` SET `payment_status` = 'pending' WHERE `payment_status` = 'failed'");
        DB::statement("ALTER TABLE `doctor_consultations` MODIFY `payment_status` ENUM('pending','paid') NOT NULL DEFAULT 'pending'");
    }
};
