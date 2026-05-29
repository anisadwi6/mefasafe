<?php

namespace Database\Seeders;

use App\Models\Doctor;
use App\Models\Hospital;
use Illuminate\Database\Seeder;

class DoctorSeeder extends Seeder
{
    public function run(): void
    {
        // Data dokter per RS berdasarkan nama RS
        $doctorsByHospital = [
            'RSUD Dr. Saiful Anwar Malang' => [
                ['name' => 'Dr. Ahmad Fauzi, Sp.PD',    'specialist' => 'Penyakit Dalam'],
                ['name' => 'Dr. Siti Rahayu, Sp.A',     'specialist' => 'Anak'],
                ['name' => 'Dr. Budi Santoso, Sp.B',    'specialist' => 'Bedah Umum'],
                ['name' => 'Dr. Dewi Kusuma, Sp.OG',    'specialist' => 'Kandungan & Kebidanan'],
                ['name' => 'Dr. Hendra Wijaya, Sp.JP',  'specialist' => 'Jantung & Pembuluh Darah'],
                ['name' => 'Dr. Rina Marlina, Sp.N',    'specialist' => 'Neurologi'],
                ['name' => 'Dr. Fajar Nugroho, Sp.THT', 'specialist' => 'THT-KL'],
            ],
            'RS Lavalette Malang' => [
                ['name' => 'Dr. Anita Sari, Sp.M',       'specialist' => 'Mata'],
                ['name' => 'Dr. Doni Setiawan, Sp.U',    'specialist' => 'Urologi'],
                ['name' => 'Dr. Maya Indah, Sp.KK',      'specialist' => 'Kulit & Kelamin'],
                ['name' => 'Dr. Rizky Pratama, Sp.PD',   'specialist' => 'Penyakit Dalam'],
                ['name' => 'Dr. Lina Wulandari, Sp.A',   'specialist' => 'Anak'],
            ],
            'RS Panti Waluya Malang' => [
                ['name' => 'Dr. Eko Prasetyo, Sp.B',     'specialist' => 'Bedah Umum'],
                ['name' => 'Dr. Nita Susanti, Sp.OG',    'specialist' => 'Kandungan & Kebidanan'],
                ['name' => 'Dr. Agus Salim, Sp.PD',      'specialist' => 'Penyakit Dalam'],
                ['name' => 'Dr. Yuni Astuti, Sp.A',      'specialist' => 'Anak'],
            ],
            'RS Universitas Brawijaya' => [
                ['name' => 'Dr. Reza Firmansyah, Sp.JP', 'specialist' => 'Jantung & Pembuluh Darah'],
                ['name' => 'Dr. Sari Dewi, Sp.N',        'specialist' => 'Neurologi'],
                ['name' => 'Dr. Bayu Nugroho, Sp.Onk',   'specialist' => 'Onkologi'],
                ['name' => 'Dr. Fitri Handayani, Sp.GK', 'specialist' => 'Gizi Klinik'],
                ['name' => 'Dr. Wahyu Santoso, Sp.PD',   'specialist' => 'Penyakit Dalam'],
            ],
            'Puskesmas Dinoyo Malang' => [
                ['name' => 'Dr. Sari Dewi',              'specialist' => 'Dokter Umum'],
                ['name' => 'Dr. Agus Salim',             'specialist' => 'Dokter Umum'],
                ['name' => 'Bidan Rina Susanti',         'specialist' => 'Kebidanan & KIA'],
            ],
            'RSUD Dr. Soetomo Surabaya' => [
                ['name' => 'Dr. Bambang Irawan, Sp.PD',  'specialist' => 'Penyakit Dalam'],
                ['name' => 'Dr. Indah Permata, Sp.A',    'specialist' => 'Anak'],
                ['name' => 'Dr. Surya Dharma, Sp.B',     'specialist' => 'Bedah Umum'],
                ['name' => 'Dr. Kartika Sari, Sp.OG',    'specialist' => 'Kandungan & Kebidanan'],
                ['name' => 'Dr. Dian Pratiwi, Sp.JP',    'specialist' => 'Jantung & Pembuluh Darah'],
                ['name' => 'Dr. Ikhsan Maulana, Sp.N',   'specialist' => 'Neurologi'],
            ],
            'RS Siloam Surabaya' => [
                ['name' => 'Dr. Putri Anggraini, Sp.M',  'specialist' => 'Mata'],
                ['name' => 'Dr. Arif Budiman, Sp.THT',   'specialist' => 'THT-KL'],
                ['name' => 'Dr. Novi Rahayu, Sp.KK',     'specialist' => 'Kulit & Kelamin'],
                ['name' => 'Dr. Hadi Santoso, Sp.PD',    'specialist' => 'Penyakit Dalam'],
            ],
            'RS Premier Surabaya' => [
                ['name' => 'Dr. Citra Dewi, Sp.KJ',      'specialist' => 'Kesehatan Jiwa'],
                ['name' => 'Dr. Fandi Ahmad, Sp.U',      'specialist' => 'Urologi'],
                ['name' => 'Dr. Mega Wati, Sp.OG',       'specialist' => 'Kandungan & Kebidanan'],
                ['name' => 'Dr. Rudi Hartono, Sp.B',     'specialist' => 'Bedah Umum'],
            ],
            'RSUPN Dr. Cipto Mangunkusumo' => [
                ['name' => 'Dr. Andi Wijaya, Sp.PD',     'specialist' => 'Penyakit Dalam'],
                ['name' => 'Dr. Sinta Maharani, Sp.A',   'specialist' => 'Anak'],
                ['name' => 'Dr. Bima Sakti, Sp.B',       'specialist' => 'Bedah Umum'],
                ['name' => 'Dr. Laras Wulandari, Sp.OG', 'specialist' => 'Kandungan & Kebidanan'],
                ['name' => 'Dr. Galih Pratama, Sp.JP',   'specialist' => 'Jantung & Pembuluh Darah'],
                ['name' => 'Dr. Nadia Putri, Sp.Onk',    'specialist' => 'Onkologi'],
            ],
            'RS Pondok Indah Jakarta' => [
                ['name' => 'Dr. Kevin Santoso, Sp.N',    'specialist' => 'Neurologi'],
                ['name' => 'Dr. Ayu Lestari, Sp.M',      'specialist' => 'Mata'],
                ['name' => 'Dr. Dimas Arya, Sp.THT',     'specialist' => 'THT-KL'],
                ['name' => 'Dr. Rini Kusuma, Sp.KK',     'specialist' => 'Kulit & Kelamin'],
            ],
            'RS Siloam Kebon Jeruk Jakarta' => [
                ['name' => 'Dr. Taufik Hidayat, Sp.PD',  'specialist' => 'Penyakit Dalam'],
                ['name' => 'Dr. Yanti Susilo, Sp.A',     'specialist' => 'Anak'],
                ['name' => 'Dr. Haris Maulana, Sp.B',    'specialist' => 'Bedah Umum'],
            ],
            'RSUP Dr. Hasan Sadikin Bandung' => [
                ['name' => 'Dr. Asep Sunandar, Sp.PD',   'specialist' => 'Penyakit Dalam'],
                ['name' => 'Dr. Tini Rahayu, Sp.A',      'specialist' => 'Anak'],
                ['name' => 'Dr. Ujang Permana, Sp.B',    'specialist' => 'Bedah Umum'],
                ['name' => 'Dr. Siti Aminah, Sp.OG',     'specialist' => 'Kandungan & Kebidanan'],
                ['name' => 'Dr. Dede Kurnia, Sp.JP',     'specialist' => 'Jantung & Pembuluh Darah'],
            ],
            'RS Borromeus Bandung' => [
                ['name' => 'Dr. Cecep Hidayat, Sp.N',    'specialist' => 'Neurologi'],
                ['name' => 'Dr. Wulan Sari, Sp.M',       'specialist' => 'Mata'],
                ['name' => 'Dr. Iman Santosa, Sp.KK',    'specialist' => 'Kulit & Kelamin'],
            ],
            'RSUP Dr. Sardjito Yogyakarta' => [
                ['name' => 'Dr. Joko Widodo, Sp.PD',     'specialist' => 'Penyakit Dalam'],
                ['name' => 'Dr. Sri Wahyuni, Sp.A',      'specialist' => 'Anak'],
                ['name' => 'Dr. Bambang Suharto, Sp.B',  'specialist' => 'Bedah Umum'],
                ['name' => 'Dr. Endah Pratiwi, Sp.OG',   'specialist' => 'Kandungan & Kebidanan'],
                ['name' => 'Dr. Sigit Nugroho, Sp.JP',   'specialist' => 'Jantung & Pembuluh Darah'],
            ],
            'RS Bethesda Yogyakarta' => [
                ['name' => 'Dr. Yohanes Susilo, Sp.N',   'specialist' => 'Neurologi'],
                ['name' => 'Dr. Maria Goretti, Sp.M',    'specialist' => 'Mata'],
                ['name' => 'Dr. Petrus Hartono, Sp.THT', 'specialist' => 'THT-KL'],
                ['name' => 'Dr. Agnes Wulandari, Sp.KJ', 'specialist' => 'Kesehatan Jiwa'],
            ],
        ];

        foreach ($doctorsByHospital as $hospitalName => $doctors) {
            $hospital = Hospital::where('name', $hospitalName)->first();
            if (!$hospital) continue;

            foreach ($doctors as $doc) {
                Doctor::create([
                    'hospital_id'  => $hospital->id,
                    'name'         => $doc['name'],
                    'specialist'   => $doc['specialist'],
                    'availability' => 'available',
                ]);
            }
        }
    }
}
