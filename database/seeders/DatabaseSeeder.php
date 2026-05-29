<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create a default admin account for development/testing.
        User::factory()->create([
            'name' => 'Admin',
            'email' => 'admin@mefasafe.test',
            'role' => 'admin',
            'password' => 'password',
        ]);

        // Create a sample normal user.
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        $this->call([
            HospitalSeeder::class,
            DoctorSeeder::class,
        ]);
    }
}
