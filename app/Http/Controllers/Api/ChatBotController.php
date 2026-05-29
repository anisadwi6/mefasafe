<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ChatBotController extends Controller
{
    private $geminiApiKey;
    private $geminiApiUrl;

    public function __construct()
    {
        $this->geminiApiKey = env('GEMINI_API_KEY');
        $this->geminiApiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    }

    /**
     * Chat with Gemini AI
     */
    public function chat(Request $request)
    {
        $request->validate([
            'message' => 'required|string|max:1000',
            'conversation_history' => 'nullable|array',
        ]);

        $userMessage = $request->input('message');
        $conversationHistory = $request->input('conversation_history', []);

        // Check if API key is configured
        if (!$this->geminiApiKey || $this->geminiApiKey === 'AIzaSyB_89SkNKavHTISNu50yP0cV3zjFk0dyjs') {
            return $this->getFallbackResponse($userMessage);
        }

        try {
            // System prompt untuk melatih Gemini
            $systemPrompt = $this->getSystemPrompt();

            // Build conversation context
            $contents = [];
            
            // Add system prompt as first message
            $contents[] = [
                'role' => 'user',
                'parts' => [['text' => $systemPrompt]]
            ];
            $contents[] = [
                'role' => 'model',
                'parts' => [['text' => 'Baik, saya mengerti. Saya adalah MefaBot, asisten virtual MefaSafe yang siap membantu dengan informasi tentang asuransi kesehatan MefaSafe dan konsultasi kesehatan. Saya tidak akan menjawab pertanyaan di luar topik tersebut.']]
            ];

            // Add conversation history (last 5 messages for context)
            $recentHistory = array_slice($conversationHistory, -5);
            foreach ($recentHistory as $msg) {
                $contents[] = [
                    'role' => $msg['type'] === 'user' ? 'user' : 'model',
                    'parts' => [['text' => $msg['text']]]
                ];
            }

            // Add current user message
            $contents[] = [
                'role' => 'user',
                'parts' => [['text' => $userMessage]]
            ];

            // Call Gemini API
            $response = Http::timeout(30)->post($this->geminiApiUrl . '?key=' . $this->geminiApiKey, [
                'contents' => $contents,
                'generationConfig' => [
                    'temperature' => 0.7,
                    'topK' => 40,
                    'topP' => 0.95,
                    'maxOutputTokens' => 1024,
                ],
                'safetySettings' => [
                    [
                        'category' => 'HARM_CATEGORY_HARASSMENT',
                        'threshold' => 'BLOCK_MEDIUM_AND_ABOVE'
                    ],
                    [
                        'category' => 'HARM_CATEGORY_HATE_SPEECH',
                        'threshold' => 'BLOCK_MEDIUM_AND_ABOVE'
                    ],
                    [
                        'category' => 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                        'threshold' => 'BLOCK_MEDIUM_AND_ABOVE'
                    ],
                    [
                        'category' => 'HARM_CATEGORY_DANGEROUS_CONTENT',
                        'threshold' => 'BLOCK_MEDIUM_AND_ABOVE'
                    ],
                ]
            ]);

            if ($response->successful()) {
                $data = $response->json();
                
                if (isset($data['candidates'][0]['content']['parts'][0]['text'])) {
                    $botResponse = $data['candidates'][0]['content']['parts'][0]['text'];
                    
                    return response()->json([
                        'success' => true,
                        'message' => $botResponse,
                        'timestamp' => now()->format('H:i'),
                    ]);
                } else {
                    // Handle blocked content or no response
                    return response()->json([
                        'success' => true,
                        'message' => 'Maaf, saya tidak dapat memproses pertanyaan tersebut. Silakan tanyakan hal lain terkait MefaSafe atau kesehatan.',
                        'timestamp' => now()->format('H:i'),
                    ]);
                }
            } else {
                Log::error('Gemini API Error: ' . $response->body());
                
                // Return fallback response instead of error
                return $this->getFallbackResponse($userMessage);
            }

        } catch (\Exception $e) {
            Log::error('ChatBot Error: ' . $e->getMessage());
            
            // Return fallback response instead of error
            return $this->getFallbackResponse($userMessage);
        }
    }

    /**
     * Get fallback response when Gemini API is not available
     */
    private function getFallbackResponse($userMessage)
    {
        $lowerMessage = strtolower($userMessage);

        // Klaim
        if (str_contains($lowerMessage, 'klaim') || str_contains($lowerMessage, 'claim')) {
            return response()->json([
                'success' => true,
                'message' => "Untuk mengajukan klaim asuransi, Anda bisa:\n\n1. Buka menu 'Riwayat Transaksi'\n2. Klik tombol 'Ajukan Klaim'\n3. Upload dokumen pendukung (kwitansi, resep dokter, hasil lab)\n4. Isi form klaim dengan lengkap\n5. Submit dan tunggu proses verifikasi 1-3 hari kerja\n6. Dana akan dicairkan ke rekening terdaftar\n\nApakah ada yang ingin ditanyakan lebih lanjut?",
                'timestamp' => now()->format('H:i'),
            ]);
        }

        // Saldo
        if (str_contains($lowerMessage, 'saldo') || str_contains($lowerMessage, 'balance') || str_contains($lowerMessage, 'limit')) {
            return response()->json([
                'success' => true,
                'message' => "Saldo asuransi Anda saat ini adalah Rp 105.000.000 dengan status AKTIF hingga Desember 2026.\n\n📊 Detail:\n• Penggunaan limit: 75%\n• Sisa limit: Rp 26.250.000\n• Coverage: Rawat inap, rawat jalan, obat-obatan\n\nApakah Anda ingin melihat detail transaksi?",
                'timestamp' => now()->format('H:i'),
            ]);
        }

        // Rumah Sakit
        if (str_contains($lowerMessage, 'rumah sakit') || str_contains($lowerMessage, 'rs') || str_contains($lowerMessage, 'hospital')) {
            return response()->json([
                'success' => true,
                'message' => "Kami bekerja sama dengan 500+ rumah sakit di seluruh Indonesia! 🏥\n\nUntuk melihat daftar rumah sakit terdekat:\n1. Buka menu 'Daftar Rumah Sakit'\n2. Aktifkan lokasi GPS\n3. Pilih rumah sakit yang diinginkan\n4. Lihat detail fasilitas dan dokter\n5. Daftar online langsung dari aplikasi\n\nApakah Anda ingin mencari rumah sakit di area tertentu?",
                'timestamp' => now()->format('H:i'),
            ]);
        }

        // Dokter/Konsultasi
        if (str_contains($lowerMessage, 'dokter') || str_contains($lowerMessage, 'konsultasi') || str_contains($lowerMessage, 'doctor')) {
            return response()->json([
                'success' => true,
                'message' => "Layanan konsultasi dokter tersedia 24/7! 👨‍⚕️\n\nAnda bisa:\n✅ Chat dengan dokter umum (Gratis)\n✅ Video call dengan spesialis (Rp 50.000)\n✅ Konsultasi gizi dan psikolog\n✅ Resep digital dan rujukan\n\nDokter kami siap membantu kapan saja. Mau mulai konsultasi sekarang?",
                'timestamp' => now()->format('H:i'),
            ]);
        }

        // Premi/Bayar
        if (str_contains($lowerMessage, 'premi') || str_contains($lowerMessage, 'bayar') || str_contains($lowerMessage, 'payment')) {
            return response()->json([
                'success' => true,
                'message' => "Pembayaran premi bisa dilakukan melalui:\n\n💳 Transfer Bank (BCA, Mandiri, BNI, BRI)\n💰 E-Wallet (GoPay, OVO, Dana, ShopeePay)\n🏪 Minimarket (Alfamart, Indomaret)\n💻 Virtual Account\n\n📅 Jatuh tempo: Tanggal 15 setiap bulan\n💵 Jumlah premi: Rp 500.000/bulan\n\nApakah Anda ingin melakukan pembayaran sekarang?",
                'timestamp' => now()->format('H:i'),
            ]);
        }

        // Penyakit - Demam
        if (str_contains($lowerMessage, 'demam') || str_contains($lowerMessage, 'fever')) {
            return response()->json([
                'success' => true,
                'message' => "Demam adalah kondisi ketika suhu tubuh di atas 37.5°C. 🌡️\n\n🔴 Gejala:\n• Suhu tubuh tinggi\n• Menggigil\n• Sakit kepala\n• Lemas\n\n💊 Penanganan:\n• Istirahat cukup\n• Minum banyak air\n• Kompres hangat\n• Paracetamol jika perlu\n\n⚠️ Segera ke dokter jika:\n• Demam >39°C\n• Berlangsung >3 hari\n• Disertai kejang\n\nIngin konsultasi dengan dokter?",
                'timestamp' => now()->format('H:i'),
            ]);
        }

        // Penyakit - Flu/Batuk
        if (str_contains($lowerMessage, 'flu') || str_contains($lowerMessage, 'batuk') || str_contains($lowerMessage, 'pilek')) {
            return response()->json([
                'success' => true,
                'message' => "Flu adalah infeksi virus pada saluran pernapasan. 🤧\n\n🔴 Gejala:\n• Hidung tersumbat/berair\n• Batuk\n• Sakit tenggorokan\n• Demam ringan\n• Badan pegal\n\n💊 Penanganan:\n• Istirahat yang cukup\n• Minum air hangat\n• Vitamin C\n• Obat flu jika perlu\n\n🛡️ Pencegahan:\n• Cuci tangan rutin\n• Pakai masker\n• Jaga daya tahan tubuh\n• Hindari orang sakit\n\nPerlu rekomendasi obat?",
                'timestamp' => now()->format('H:i'),
            ]);
        }

        // Pencegahan Penyakit
        if (str_contains($lowerMessage, 'cegah') || str_contains($lowerMessage, 'pencegahan') || str_contains($lowerMessage, 'prevent')) {
            return response()->json([
                'success' => true,
                'message' => "Tips Pencegahan Penyakit: 🛡️\n\n1️⃣ Pola Hidup Sehat:\n• Makan bergizi seimbang\n• Olahraga rutin 30 menit/hari\n• Tidur cukup 7-8 jam\n• Kelola stress\n\n2️⃣ Kebersihan:\n• Cuci tangan dengan sabun\n• Jaga kebersihan lingkungan\n• Pakai masker saat sakit\n\n3️⃣ Imunisasi:\n• Vaksinasi lengkap\n• Booster sesuai jadwal\n\n4️⃣ Pemeriksaan Rutin:\n• Medical check-up tahunan\n• Konsultasi dokter berkala\n\nMau info lebih detail?",
                'timestamp' => now()->format('H:i'),
            ]);
        }

        // Sakit Kepala
        if (str_contains($lowerMessage, 'sakit kepala') || str_contains($lowerMessage, 'pusing') || str_contains($lowerMessage, 'headache')) {
            return response()->json([
                'success' => true,
                'message' => "Sakit kepala bisa disebabkan berbagai hal. 🤕\n\n🔴 Penyebab Umum:\n• Kurang tidur\n• Dehidrasi\n• Stress\n• Terlalu lama di depan layar\n• Kurang makan\n\n💊 Penanganan:\n• Istirahat di ruangan gelap\n• Minum air putih\n• Kompres dingin di dahi\n• Paracetamol jika perlu\n• Pijat ringan\n\n⚠️ Segera ke dokter jika:\n• Sakit kepala hebat mendadak\n• Disertai demam tinggi\n• Penglihatan kabur\n• Berlangsung >3 hari\n\nPerlu konsultasi dokter?",
                'timestamp' => now()->format('H:i'),
            ]);
        }

        // Diabetes
        if (str_contains($lowerMessage, 'diabetes') || str_contains($lowerMessage, 'gula darah') || str_contains($lowerMessage, 'kencing manis')) {
            return response()->json([
                'success' => true,
                'message' => "Diabetes adalah kondisi gula darah tinggi. 🩸\n\n🔴 Gejala:\n• Sering haus dan lapar\n• Sering buang air kecil\n• Berat badan turun\n• Luka sulit sembuh\n• Penglihatan kabur\n\n🛡️ Pencegahan:\n• Jaga berat badan ideal\n• Olahraga teratur\n• Kurangi gula dan karbohidrat\n• Perbanyak sayur dan buah\n• Cek gula darah rutin\n\n💊 Pengelolaan:\n• Kontrol gula darah\n• Minum obat teratur\n• Diet sehat\n• Olahraga rutin\n\nMau konsultasi dengan dokter?",
                'timestamp' => now()->format('H:i'),
            ]);
        }

        // Hipertensi
        if (str_contains($lowerMessage, 'hipertensi') || str_contains($lowerMessage, 'darah tinggi') || str_contains($lowerMessage, 'tensi')) {
            return response()->json([
                'success' => true,
                'message' => "Hipertensi adalah tekanan darah tinggi (>140/90 mmHg). 💓\n\n🔴 Gejala:\n• Sakit kepala\n• Pusing\n• Pandangan kabur\n• Nyeri dada\n• Sesak napas\n\n🛡️ Pencegahan:\n• Kurangi garam\n• Olahraga teratur\n• Jaga berat badan\n• Kelola stress\n• Hindari rokok & alkohol\n\n💊 Pengelolaan:\n• Cek tensi rutin\n• Minum obat teratur\n• Diet rendah garam\n• Olahraga 30 menit/hari\n\n⚠️ Komplikasi jika tidak diobati:\n• Stroke\n• Serangan jantung\n• Gagal ginjal\n\nPerlu konsultasi?",
                'timestamp' => now()->format('H:i'),
            ]);
        }

        // Asma
        if (str_contains($lowerMessage, 'asma') || str_contains($lowerMessage, 'sesak napas') || str_contains($lowerMessage, 'asthma')) {
            return response()->json([
                'success' => true,
                'message' => "Asma adalah penyakit saluran napas kronis. 🫁\n\n🔴 Gejala:\n• Sesak napas\n• Mengi (napas berbunyi)\n• Batuk terutama malam hari\n• Dada terasa berat\n\n⚠️ Pemicu:\n• Debu dan tungau\n• Asap rokok\n• Udara dingin\n• Olahraga berlebihan\n• Stress\n\n💊 Penanganan:\n• Inhaler (obat hirup)\n• Hindari pemicu\n• Olahraga ringan teratur\n• Jaga kebersihan rumah\n\n🚨 Segera ke IGD jika:\n• Sesak napas berat\n• Bibir/kuku membiru\n• Tidak bisa bicara\n• Inhaler tidak membantu\n\nButuh konsultasi dokter?",
                'timestamp' => now()->format('H:i'),
            ]);
        }

        // Maag/Asam Lambung
        if (str_contains($lowerMessage, 'maag') || str_contains($lowerMessage, 'asam lambung') || str_contains($lowerMessage, 'gerd')) {
            return response()->json([
                'success' => true,
                'message' => "Maag/GERD adalah gangguan asam lambung. 🔥\n\n🔴 Gejala:\n• Nyeri ulu hati\n• Mual dan muntah\n• Perut kembung\n• Dada terasa panas\n• Mulut terasa asam\n\n🛡️ Pencegahan:\n• Makan teratur\n• Hindari makanan pedas & asam\n• Kurangi kopi & teh\n• Jangan langsung tidur setelah makan\n• Kelola stress\n\n💊 Penanganan:\n• Antasida\n• Obat penurun asam lambung\n• Makan porsi kecil tapi sering\n• Hindari makanan pemicu\n\n⚠️ Ke dokter jika:\n• Nyeri hebat\n• Muntah darah\n• BAB hitam\n• Berat badan turun\n\nPerlu konsultasi?",
                'timestamp' => now()->format('H:i'),
            ]);
        }

        // Hidup Sehat / Pola Hidup Sehat
        if (str_contains($lowerMessage, 'hidup sehat') || str_contains($lowerMessage, 'pola hidup') || str_contains($lowerMessage, 'tips sehat') || str_contains($lowerMessage, 'cara sehat')) {
            return response()->json([
                'success' => true,
                'message' => "Tips Hidup Sehat untuk Anda! 🌟\n\n1️⃣ NUTRISI SEIMBANG 🥗\n• Makan 3x sehari teratur\n• 50% karbohidrat kompleks (nasi merah, gandum)\n• 30% protein (ayam, ikan, tahu, tempe)\n• 20% lemak sehat (alpukat, kacang)\n• 5 porsi sayur & buah per hari\n• Minum air 8 gelas/hari\n\n2️⃣ OLAHRAGA TERATUR 🏃\n• 150 menit/minggu (30 menit x 5 hari)\n• Kombinasi kardio (jalan, lari, renang)\n• Strength training 2x/minggu\n• Peregangan sebelum & sesudah\n\n3️⃣ TIDUR BERKUALITAS 😴\n• 7-8 jam per malam\n• Tidur & bangun di jam yang sama\n• Hindari gadget 1 jam sebelum tidur\n• Ruangan gelap, sejuk, nyaman\n\n4️⃣ KESEHATAN MENTAL 🧠\n• Kelola stress (meditasi, yoga)\n• Jaga hubungan sosial\n• Hobi & me-time\n• Berpikir positif\n\n5️⃣ PEMERIKSAAN RUTIN 🏥\n• Medical check-up tahunan\n• Cek gula darah, kolesterol, tensi\n• Vaksinasi lengkap\n\nMau info lebih detail?",
                'timestamp' => now()->format('H:i'),
            ]);
        }

        // Nutrisi / Gizi
        if (str_contains($lowerMessage, 'nutrisi') || str_contains($lowerMessage, 'gizi') || str_contains($lowerMessage, 'makanan sehat')) {
            return response()->json([
                'success' => true,
                'message' => "Panduan Nutrisi Seimbang! 🍽️\n\n🥗 KOMPOSISI IDEAL:\n• Karbohidrat: 50-60% (nasi, roti, kentang)\n• Protein: 15-20% (daging, ikan, telur, kacang)\n• Lemak: 20-30% (minyak zaitun, alpukat)\n• Serat: 25-30g/hari (sayur, buah)\n\n🌈 WARNA PIRING:\n• 1/2 piring: Sayuran & buah\n• 1/4 piring: Protein\n• 1/4 piring: Karbohidrat\n\n💧 HIDRASI:\n• Air putih: 8 gelas/hari\n• Hindari minuman manis\n\n🚫 HINDARI:\n• Makanan olahan berlebihan\n• Gula & garam berlebih\n• Gorengan\n• Fast food\n\n✅ PERBANYAK:\n• Sayur hijau\n• Buah segar\n• Protein tanpa lemak\n• Whole grains\n\nPerlu konsultasi gizi?",
                'timestamp' => now()->format('H:i'),
            ]);
        }

        // Olahraga / Exercise
        if (str_contains($lowerMessage, 'olahraga') || str_contains($lowerMessage, 'exercise') || str_contains($lowerMessage, 'fitness') || str_contains($lowerMessage, 'gym')) {
            return response()->json([
                'success' => true,
                'message' => "Panduan Olahraga yang Tepat! 💪\n\n⏱️ DURASI IDEAL:\n• 150 menit/minggu (moderate)\n• ATAU 75 menit/minggu (intense)\n• Bisa dibagi 30 menit x 5 hari\n\n🏃 JENIS OLAHRAGA:\n\n1️⃣ KARDIO (3-5x/minggu):\n• Jalan cepat\n• Jogging\n• Bersepeda\n• Renang\n• Aerobik\n\n2️⃣ STRENGTH (2-3x/minggu):\n• Push-up\n• Sit-up\n• Squat\n• Angkat beban\n\n3️⃣ FLEXIBILITY:\n• Yoga\n• Stretching\n• Pilates\n\n📋 TIPS:\n• Pemanasan 5-10 menit\n• Pendinginan & stretching\n• Minum air cukup\n• Dengarkan tubuh\n• Konsisten lebih penting dari intensitas\n\n⚠️ KONSULTASI DOKTER jika:\n• Punya penyakit jantung\n• Diabetes\n• Hipertensi\n• Cedera\n\nMau program olahraga personal?",
                'timestamp' => now()->format('H:i'),
            ]);
        }

        // Tidur / Sleep
        if (str_contains($lowerMessage, 'tidur') || str_contains($lowerMessage, 'insomnia') || str_contains($lowerMessage, 'susah tidur') || str_contains($lowerMessage, 'sleep')) {
            return response()->json([
                'success' => true,
                'message' => "Tips Tidur Berkualitas! 😴\n\n⏰ DURASI IDEAL:\n• Dewasa: 7-8 jam\n• Remaja: 8-10 jam\n• Anak: 9-12 jam\n\n🛏️ SLEEP HYGIENE:\n\n1️⃣ RUTINITAS:\n• Tidur & bangun di jam yang sama\n• Ritual sebelum tidur (baca buku, mandi)\n• Hindari tidur siang >30 menit\n\n2️⃣ LINGKUNGAN:\n• Ruangan gelap\n• Suhu sejuk (18-22°C)\n• Kasur & bantal nyaman\n• Minim suara\n\n3️⃣ HINDARI:\n• Gadget 1 jam sebelum tidur\n• Kafein setelah jam 2 siang\n• Makan berat 3 jam sebelum tidur\n• Olahraga berat malam hari\n\n4️⃣ LAKUKAN:\n• Olahraga pagi/siang\n• Relaksasi (meditasi, napas dalam)\n• Mandi air hangat\n• Baca buku\n\n⚠️ KONSULTASI DOKTER jika:\n• Insomnia >2 minggu\n• Mendengkur keras\n• Sering terbangun\n• Ngantuk berlebihan siang hari\n\nPerlu bantuan?",
                'timestamp' => now()->format('H:i'),
            ]);
        }

        // Stress / Mental Health
        if (str_contains($lowerMessage, 'stress') || str_contains($lowerMessage, 'cemas') || str_contains($lowerMessage, 'anxiety') || str_contains($lowerMessage, 'depresi') || str_contains($lowerMessage, 'mental')) {
            return response()->json([
                'success' => true,
                'message' => "Kelola Kesehatan Mental Anda! 🧠💚\n\n🔴 TANDA STRESS:\n• Mudah marah/emosi\n• Sulit konsentrasi\n• Gangguan tidur\n• Sakit kepala\n• Nafsu makan berubah\n\n🛡️ CARA MENGELOLA:\n\n1️⃣ RELAKSASI:\n• Meditasi 10-15 menit/hari\n• Napas dalam (4-7-8)\n• Yoga\n• Musik tenang\n\n2️⃣ AKTIVITAS:\n• Olahraga teratur\n• Hobi yang disukai\n• Jalan-jalan di alam\n• Journaling\n\n3️⃣ SOSIAL:\n• Bicara dengan teman/keluarga\n• Join komunitas\n• Volunteer\n\n4️⃣ SELF-CARE:\n• Tidur cukup\n• Makan sehat\n• Me-time\n• Batasi media sosial\n\n🚨 SEGERA KONSULTASI jika:\n• Pikiran menyakiti diri\n• Tidak bisa beraktivitas\n• Gejala >2 minggu\n• Panik attack\n\n💬 Konsultasi psikolog/psikiater:\n• Chat gratis di MefaSafe\n• Video call Rp 50.000\n\nAnda tidak sendiri! 💪",
                'timestamp' => now()->format('H:i'),
            ]);
        }

        // Vitamin / Suplemen
        if (str_contains($lowerMessage, 'vitamin') || str_contains($lowerMessage, 'suplemen') || str_contains($lowerMessage, 'supplement')) {
            return response()->json([
                'success' => true,
                'message' => "Panduan Vitamin & Suplemen! 💊\n\n💡 VITAMIN PENTING:\n\n🔸 VITAMIN C:\n• Fungsi: Imunitas, antioksidan\n• Sumber: Jeruk, jambu, paprika\n• Dosis: 75-90 mg/hari\n\n🔸 VITAMIN D:\n• Fungsi: Tulang, imunitas\n• Sumber: Sinar matahari, ikan\n• Dosis: 600-800 IU/hari\n\n🔸 VITAMIN B KOMPLEKS:\n• Fungsi: Energi, metabolisme\n• Sumber: Daging, telur, kacang\n\n🔸 VITAMIN E:\n• Fungsi: Antioksidan, kulit\n• Sumber: Kacang, alpukat\n\n🔸 KALSIUM:\n• Fungsi: Tulang & gigi\n• Sumber: Susu, keju, ikan\n• Dosis: 1000-1200 mg/hari\n\n🔸 ZINC:\n• Fungsi: Imunitas, penyembuhan\n• Sumber: Daging, seafood\n• Dosis: 8-11 mg/hari\n\n⚠️ PERHATIAN:\n• Konsultasi dokter sebelum konsumsi\n• Jangan overdosis\n• Makanan > suplemen\n• Cek interaksi obat\n\nPerlu rekomendasi?",
                'timestamp' => now()->format('H:i'),
            ]);
        }

        // Diet / Menurunkan Berat Badan
        if (str_contains($lowerMessage, 'diet') || str_contains($lowerMessage, 'turun berat') || str_contains($lowerMessage, 'kurus') || str_contains($lowerMessage, 'langsing')) {
            return response()->json([
                'success' => true,
                'message' => "Panduan Diet Sehat! ⚖️\n\n🎯 TARGET REALISTIS:\n• 0.5-1 kg per minggu\n• Defisit kalori 500-750 kkal/hari\n• Jangan ekstrem!\n\n🍽️ POLA MAKAN:\n\n1️⃣ SARAPAN (25%):\n• Protein + karbohidrat kompleks\n• Contoh: Telur + roti gandum + buah\n\n2️⃣ MAKAN SIANG (35%):\n• Protein + sayur + karbohidrat\n• Porsi sedang\n\n3️⃣ MAKAN MALAM (25%):\n• Protein + sayur\n• Kurangi karbohidrat\n• Makan 3 jam sebelum tidur\n\n4️⃣ SNACK (15%):\n• Buah\n• Kacang\n• Yogurt\n\n✅ LAKUKAN:\n• Minum air sebelum makan\n• Makan perlahan\n• Porsi kecil, sering\n• Catat makanan\n• Olahraga 30 menit/hari\n\n🚫 HINDARI:\n• Gorengan\n• Minuman manis\n• Fast food\n• Ngemil malam\n• Diet ekstrem\n\n⚠️ KONSULTASI AHLI GIZI jika:\n• Punya penyakit\n• Hamil/menyusui\n• Perlu program khusus\n\nMau konsultasi gizi?",
                'timestamp' => now()->format('H:i'),
            ]);
        }

        // Kolesterol
        if (str_contains($lowerMessage, 'kolesterol') || str_contains($lowerMessage, 'cholesterol')) {
            return response()->json([
                'success' => true,
                'message' => "Tentang Kolesterol! 🩸\n\n📊 NILAI NORMAL:\n• Total: <200 mg/dL\n• LDL (jahat): <100 mg/dL\n• HDL (baik): >40 mg/dL (pria), >50 mg/dL (wanita)\n• Trigliserida: <150 mg/dL\n\n🔴 PENYEBAB TINGGI:\n• Makanan berlemak jenuh\n• Kurang olahraga\n• Obesitas\n• Merokok\n• Genetik\n\n🛡️ CARA MENURUNKAN:\n\n1️⃣ DIET:\n• Kurangi lemak jenuh\n• Perbanyak serat (oat, kacang)\n• Ikan omega-3 (salmon, tuna)\n• Hindari gorengan\n• Minyak zaitun\n\n2️⃣ OLAHRAGA:\n• 30 menit/hari\n• Kardio (jalan, lari, renang)\n\n3️⃣ GAYA HIDUP:\n• Berhenti merokok\n• Jaga berat badan\n• Kelola stress\n\n💊 OBAT:\n• Statin (jika perlu)\n• Sesuai resep dokter\n\n⚠️ KOMPLIKASI:\n• Penyakit jantung\n• Stroke\n• Aterosklerosis\n\nCek kolesterol rutin!",
                'timestamp' => now()->format('H:i'),
            ]);
        }

        // Jantung
        if (str_contains($lowerMessage, 'jantung') || str_contains($lowerMessage, 'heart') || str_contains($lowerMessage, 'kardio')) {
            return response()->json([
                'success' => true,
                'message' => "Kesehatan Jantung! ❤️\n\n🔴 GEJALA PENYAKIT JANTUNG:\n• Nyeri dada\n• Sesak napas\n• Mudah lelah\n• Jantung berdebar\n• Pusing\n• Keringat dingin\n\n🛡️ PENCEGAHAN:\n\n1️⃣ DIET JANTUNG SEHAT:\n• Kurangi garam (<5g/hari)\n• Lemak sehat (ikan, kacang)\n• Serat tinggi\n• Buah & sayur\n• Hindari lemak trans\n\n2️⃣ OLAHRAGA:\n• Kardio 150 menit/minggu\n• Jalan cepat, jogging, renang\n• Konsisten!\n\n3️⃣ GAYA HIDUP:\n• Berhenti merokok\n• Batasi alkohol\n• Kelola stress\n• Tidur cukup\n• Jaga berat badan\n\n4️⃣ KONTROL:\n• Tekanan darah\n• Kolesterol\n• Gula darah\n• Berat badan\n\n🚨 SEGERA KE IGD jika:\n• Nyeri dada hebat\n• Sesak napas berat\n• Pingsan\n• Nyeri menjalar ke lengan/rahang\n\n📋 CEK RUTIN:\n• EKG\n• Echocardiography\n• Stress test\n\nJaga jantung Anda!",
                'timestamp' => now()->format('H:i'),
            ]);
        }

        // Kalender Pengingat
        if (str_contains($lowerMessage, 'kalender') || str_contains($lowerMessage, 'pengingat') || str_contains($lowerMessage, 'reminder') || str_contains($lowerMessage, 'jadwal') || str_contains($lowerMessage, 'kontrol') || str_contains($lowerMessage, 'obat') && str_contains($lowerMessage, 'jadwal')) {
            return response()->json([
                'success' => true,
                'message' => "Fitur Kalender Pengingat MefaSafe! 📅\n\nDengan Kalender Pengingat, Anda bisa:\n\n✅ Buat pengingat jadwal kontrol dokter\n✅ Atur reminder minum obat harian\n✅ Catat jadwal vaksinasi\n✅ Tambah pengingat kesehatan lainnya\n\n📋 KATEGORI PENGINGAT:\n• 🏥 Kontrol — jadwal kontrol ke dokter/RS\n• 💊 Obat — reminder minum obat\n• 💉 Vaksin — jadwal vaksinasi\n• 🔔 Lainnya — pengingat kesehatan umum\n\n🔁 PENGULANGAN:\n• Tidak berulang\n• Setiap hari\n• Setiap minggu\n• Setiap bulan\n\n🔔 NOTIFIKASI:\nSaat hari H tiba, pengingat otomatis muncul di halaman Notifikasi Anda!\n\n📌 CARA PAKAI:\n1. Buka menu 'Kalender Pengingat'\n2. Klik tombol '+' atau pilih tanggal\n3. Isi judul, kategori, dan waktu\n4. Simpan — notifikasi akan muncul otomatis!\n\nMau coba sekarang?",
                'timestamp' => now()->format('H:i'),
            ]);
        }

        // Notifikasi
        if (str_contains($lowerMessage, 'notifikasi') || str_contains($lowerMessage, 'notification') || str_contains($lowerMessage, 'pemberitahuan')) {
            return response()->json([
                'success' => true,
                'message' => "Pusat Notifikasi MefaSafe! 🔔\n\nHalaman Notifikasi menampilkan semua aktivitas penting Anda:\n\n📋 JENIS NOTIFIKASI:\n• 📄 Klaim — status pengajuan klaim (diproses, disetujui, ditolak)\n• 💳 Transaksi — pembayaran premi & pencairan klaim\n• 🏥 Pendaftaran RS — konfirmasi jadwal di rumah sakit\n• 👨‍⚕️ Konsultasi Dokter — status konsultasi\n• 🔔 Pengingat — jadwal kontrol & obat dari Kalender Pengingat\n\n📊 RINGKASAN:\n• Notifikasi hari ini\n• Belum dibaca\n• Sudah diverifikasi\n• Butuh perhatian\n\nSemua notifikasi diurutkan dari yang terbaru. Ada yang ingin ditanyakan?",
                'timestamp' => now()->format('H:i'),
            ]);
        }

        // Greeting
        if (str_contains($lowerMessage, 'halo') || str_contains($lowerMessage, 'hai') || str_contains($lowerMessage, 'hello') || str_contains($lowerMessage, 'hi')) {
            return response()->json([
                'success' => true,
                'message' => "Halo! Selamat datang di MefaSafe. 👋\n\nSaya MefaBot, asisten virtual yang siap membantu Anda dengan:\n\n✅ Informasi klaim asuransi\n✅ Cek saldo dan limit\n✅ Daftar rumah sakit\n✅ Konsultasi dokter\n✅ Riwayat transaksi\n✅ Kalender Pengingat jadwal & obat\n✅ Konsultasi kesehatan\n\nAda yang bisa saya bantu hari ini?",
                'timestamp' => now()->format('H:i'),
            ]);
        }

        // Terima kasih
        if (str_contains($lowerMessage, 'terima kasih') || str_contains($lowerMessage, 'thanks') || str_contains($lowerMessage, 'thank you')) {
            return response()->json([
                'success' => true,
                'message' => "Sama-sama! 😊 Senang bisa membantu Anda.\n\nJika ada pertanyaan lain tentang MefaSafe atau kesehatan, jangan ragu untuk bertanya ya!\n\nSemoga sehat selalu! 🌟",
                'timestamp' => now()->format('H:i'),
            ]);
        }

        // Default response
        return response()->json([
            'success' => true,
            'message' => "Maaf, saya belum memahami pertanyaan Anda. 🤔\n\nSaya bisa membantu dengan topik berikut:\n\n🏥 Aplikasi MefaSafe:\n• Cara klaim asuransi\n• Cek saldo asuransi\n• Daftar rumah sakit\n• Konsultasi dokter\n• Pembayaran premi\n• Kalender Pengingat obat\n• Notifikasi dan aktivitas\n\n💊 Kesehatan:\n• Gejala penyakit\n• Cara mengatasi gejala\n• Obat dan pengobatan awal\n• Cara hidup sehat dan pencegahan\n\nSilakan ketik pertanyaan seperti \"Gejala demam\", \"Obat flu dan batuk\", \"Cara hidup sehat\", atau \"Konsultasi dokter\".",
            'timestamp' => now()->format('H:i'),
        ]);
    }
    private function getSystemPrompt()
    {
        return <<<PROMPT
Kamu adalah MefaBot, asisten virtual resmi dari MefaSafe - platform asuransi kesehatan digital di Indonesia. 

ATURAN PENTING:
1. Kamu HANYA boleh menjawab pertanyaan tentang:
   - Aplikasi MefaSafe (fitur, layanan, cara penggunaan)
   - Asuransi kesehatan (klaim, premi, polis, coverage)
   - SEMUA GEJALA PENYAKIT, CARA MENGATASI, OBAT, DAN GAYA HIDUP SEHAT (nutrisi, olahraga, mental health, sleep hygiene)
   - Rumah sakit dan fasilitas kesehatan
   - Konsultasi dokter dan layanan medis
   - Obat-obatan dan pengobatan
   - Vitamin dan suplemen
   - Diet dan nutrisi
   - Kesehatan mental
   - Kesehatan ibu dan anak
   - Vaksinasi dan imunisasi
   - Pertolongan pertama
   - Medical check-up

2. Jika ditanya tentang topik LAIN (politik, hiburan, teknologi umum, olahraga non-kesehatan, dll), jawab dengan:
   "Maaf, saya hanya dapat membantu dengan informasi tentang MefaSafe dan kesehatan. Apakah ada yang bisa saya bantu terkait asuransi kesehatan atau konsultasi medis?"

3. Untuk pertanyaan kesehatan, berikan informasi:
   - Gejala dan tanda-tanda
   - Penyebab umum
   - Cara pencegahan
   - Penanganan awal
   - Kapan harus ke dokter
   - Komplikasi jika tidak diobati

4. Gunakan bahasa Indonesia yang ramah, profesional, dan mudah dipahami.

5. Berikan jawaban yang informatif, akurat, dan membantu dengan emoji yang sesuai.

6. Jika pertanyaan medis serius atau memerlukan diagnosis, SELALU sarankan untuk konsultasi dengan dokter melalui fitur aplikasi.

7. Untuk penyakit yang tidak umum atau kompleks, berikan informasi dasar dan sarankan konsultasi dokter.

INFORMASI TENTANG MEFASAFE:

FITUR UTAMA:
- Klaim Asuransi: Ajukan klaim dengan upload dokumen, proses 1-3 hari kerja
- Cek Saldo: Lihat saldo asuransi dan limit coverage real-time
- Daftar Rumah Sakit: 500+ rumah sakit rekanan di seluruh Indonesia
- Konsultasi Dokter: Chat/video call dengan dokter 24/7 (gratis untuk umum, Rp 50.000 untuk spesialis)
- Riwayat Transaksi: Lihat semua transaksi, klaim, dan pembayaran
- Kalender Pengingat: Atur jadwal kontrol dokter, reminder minum obat, jadwal vaksin — notifikasi otomatis di hari H
- Health Tracking: Monitor kesehatan harian
- Feedback & Saran: Berikan masukan untuk layanan
- Notifikasi: Pusat pemberitahuan untuk klaim, transaksi, pendaftaran RS, konsultasi, dan pengingat kalender

KALENDER PENGINGAT (FITUR BARU):
- Buat pengingat dengan kategori: Kontrol (jadwal dokter), Obat (minum obat), Vaksin (vaksinasi), Lainnya
- Atur waktu spesifik untuk setiap pengingat
- Pilih pengulangan: tidak berulang, harian, mingguan, bulanan
- Tanggal yang sudah lewat tidak bisa dipilih (hanya bisa buat pengingat untuk hari ini dan ke depan)
- Saat hari H tiba, pengingat otomatis muncul sebagai notifikasi di halaman Notifikasi
- Cara pakai: Buka menu "Kalender Pengingat" → klik "+" atau pilih tanggal → isi form → simpan
- Bisa tandai pengingat sebagai selesai atau hapus

NOTIFIKASI (DIPERBARUI):
- Menampilkan semua aktivitas: klaim, transaksi, pendaftaran RS, konsultasi dokter, dan pengingat kalender
- Pengingat dari Kalender yang jatuh tempo hari ini otomatis muncul di notifikasi dengan label "Hari Ini"
- Ringkasan: notifikasi hari ini, belum dibaca, sudah diverifikasi, butuh perhatian

PEMBAYARAN PREMI:
- Metode: Transfer Bank (BCA, Mandiri, BNI, BRI), E-Wallet (GoPay, OVO, Dana, ShopeePay), Minimarket (Alfamart, Indomaret)
- Jatuh tempo: Tanggal 15 setiap bulan
- Premi standar: Rp 500.000/bulan (bisa bervariasi tergantung paket)

COVERAGE ASURANSI:
- Limit tahunan: Rp 100.000.000 - Rp 500.000.000 (tergantung paket)
- Rawat inap: Ditanggung hingga 100%
- Rawat jalan: Ditanggung hingga 80%
- Obat-obatan: Ditanggung sesuai resep dokter
- Operasi: Ditanggung sesuai jenis operasi
- Persalinan: Ditanggung untuk paket keluarga
- Gigi: Ditanggung untuk perawatan dasar

CARA KLAIM:
1. Buka menu "Riwayat Transaksi"
2. Klik "Ajukan Klaim"
3. Upload dokumen (kwitansi, resep dokter, hasil lab)
4. Isi form klaim
5. Submit dan tunggu verifikasi 1-3 hari kerja
6. Dana dicairkan ke rekening terdaftar

CUSTOMER SERVICE:
- Email: bantuan@mefasafe.com
- Telepon: 021-1234-5678
- WhatsApp: 0812-3456-7890
- Jam operasional: 24/7

TIPS HIDUP SEHAT:
1. Nutrisi Seimbang:
   - 50% karbohidrat kompleks
   - 30% protein (hewani & nabati)
   - 20% lemak sehat
   - Perbanyak sayur dan buah
   - Minum air 8 gelas/hari

2. Olahraga Teratur:
   - 150 menit/minggu (30 menit x 5 hari)
   - Kombinasi kardio dan strength training
   - Peregangan sebelum dan sesudah
   - Pilih olahraga yang disukai

3. Tidur Berkualitas:
   - 7-8 jam per malam
   - Tidur dan bangun di jam yang sama
   - Hindari gadget 1 jam sebelum tidur
   - Ruangan gelap dan sejuk

4. Kesehatan Mental:
   - Kelola stress dengan meditasi
   - Jaga hubungan sosial
   - Hobi dan me-time
   - Konseling jika perlu

5. Pemeriksaan Rutin:
   - Medical check-up tahunan
   - Cek gula darah, kolesterol, tensi
   - Skrining kanker sesuai usia
   - Vaksinasi lengkap

Jawab pertanyaan user dengan ramah, informatif, dan selalu tawarkan konsultasi dokter untuk masalah serius!
PROMPT;
    }

    /**
     * Get quick replies suggestions
     */
    public function quickReplies()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'Gejala demam',
                'Gejala flu dan batuk',
                'Gejala hipertensi',
                'Gejala diabetes',
                'Obat maag dan asam lambung',
                'Cara hidup sehat',
                'Tips nutrisi dan gizi',
                'Konsultasi dokter',
                'Kalender pengingat obat',
                'Cara klaim asuransi',
                'Daftar rumah sakit',
            ]
        ]);
    }
}
