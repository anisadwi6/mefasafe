# MefaSafe ChatBot dengan Gemini AI

## 🤖 Deskripsi
ChatBot MefaSafe menggunakan Google Gemini AI yang telah dilatih khusus untuk:
- ✅ Menjawab pertanyaan tentang aplikasi MefaSafe
- ✅ Memberikan informasi asuransi kesehatan
- ✅ Konsultasi kesehatan dan penyakit
- ❌ TIDAK menjawab topik di luar kesehatan dan MefaSafe

## 🔑 Setup Gemini API Key

### 1. Dapatkan API Key
1. Kunjungi: https://makersuite.google.com/app/apikey
2. Login dengan akun Google
3. Klik "Create API Key"
4. Copy API Key yang dihasilkan

### 2. Konfigurasi di Laravel
Tambahkan API Key ke file `.env`:
```env
GEMINI_API_KEY=AIzaSyB_89SkNKavHTiSNu50yP0cV3zjFk0dyjs
```

### 3. Clear Cache Laravel
```bash
php artisan config:clear
php artisan cache:clear
```

## 📋 Fitur ChatBot

### 1. **System Prompt Training**
Bot dilatih dengan system prompt yang mencakup:
- Informasi lengkap tentang MefaSafe
- Fitur-fitur aplikasi
- Cara klaim, pembayaran, dan layanan
- Coverage asuransi
- Daftar rumah sakit dan dokter

### 2. **Pembatasan Topik**
Bot HANYA menjawab:
- ✅ Aplikasi MefaSafe (fitur, cara pakai, layanan)
- ✅ Asuransi kesehatan (klaim, premi, polis)
- ✅ Kesehatan & penyakit (gejala, pengobatan, pencegahan)
- ✅ Rumah sakit dan fasilitas kesehatan
- ✅ Konsultasi dokter

Jika ditanya topik lain (politik, hiburan, teknologi umum, dll):
```
"Maaf, saya hanya dapat membantu dengan informasi tentang MefaSafe dan kesehatan. 
Apakah ada yang bisa saya bantu terkait asuransi kesehatan atau konsultasi medis?"
```

### 3. **Conversation History**
- Menyimpan 10 pesan terakhir untuk konteks
- Memahami pertanyaan follow-up
- Memberikan jawaban yang relevan dengan percakapan sebelumnya

### 4. **Quick Replies**
Pertanyaan cepat yang tersedia:
- Cara klaim asuransi
- Cek saldo asuransi
- Daftar rumah sakit
- Konsultasi dokter
- Cara daftar polis
- Promo terbaru
- Gejala demam
- Cara cegah flu
- Obat sakit kepala
- Biaya operasi

## 🔧 API Endpoints

### 1. Chat dengan Bot
```
POST /api/v1/chatbot/chat
```

**Request Body:**
```json
{
  "message": "Bagaimana cara klaim asuransi?",
  "conversation_history": [
    {
      "type": "user",
      "text": "Halo"
    },
    {
      "type": "bot",
      "text": "Halo! Ada yang bisa saya bantu?"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Untuk mengajukan klaim asuransi...",
  "timestamp": "14:30"
}
```

### 2. Get Quick Replies
```
GET /api/v1/chatbot/quick-replies
```

**Response:**
```json
{
  "success": true,
  "data": [
    "Cara klaim asuransi",
    "Cek saldo asuransi",
    ...
  ]
}
```

## 🎯 Contoh Penggunaan

### Pertanyaan tentang MefaSafe:
**User:** "Bagaimana cara klaim asuransi?"
**Bot:** "Untuk mengajukan klaim asuransi, Anda bisa:
1. Buka menu 'Riwayat Transaksi'
2. Klik tombol 'Ajukan Klaim'
3. Upload dokumen pendukung (kwitansi, resep dokter)
4. Tunggu proses verifikasi 1-3 hari kerja..."

### Pertanyaan tentang Kesehatan:
**User:** "Apa gejala demam berdarah?"
**Bot:** "Gejala demam berdarah dengue (DBD) meliputi:
- Demam tinggi mendadak (39-40°C)
- Sakit kepala hebat
- Nyeri di belakang mata
- Nyeri otot dan sendi
- Mual dan muntah
- Ruam kemerahan pada kulit..."

### Pertanyaan di Luar Topik:
**User:** "Siapa presiden Indonesia?"
**Bot:** "Maaf, saya hanya dapat membantu dengan informasi tentang MefaSafe dan kesehatan. Apakah ada yang bisa saya bantu terkait asuransi kesehatan atau konsultasi medis?"

## ⚙️ Konfigurasi Gemini

### Temperature & Parameters
```php
'generationConfig' => [
    'temperature' => 0.7,      // Kreativitas (0.0 - 1.0)
    'topK' => 40,              // Sampling diversity
    'topP' => 0.95,            // Nucleus sampling
    'maxOutputTokens' => 1024, // Max panjang response
]
```

### Safety Settings
Bot dilindungi dari konten:
- Harassment
- Hate speech
- Sexually explicit content
- Dangerous content

## 🚀 Testing

### 1. Test dengan Postman
```bash
POST http://127.0.0.1:8000/api/v1/chatbot/chat
Headers:
  Authorization: Bearer {your_token}
  Content-Type: application/json
Body:
{
  "message": "Halo, apa itu MefaSafe?"
}
```

### 2. Test di Frontend
1. Login ke aplikasi
2. Klik menu "ChatBot"
3. Ketik pertanyaan atau klik Quick Reply
4. Bot akan merespons dalam 2-3 detik

## 📝 Troubleshooting

### Error: "Gemini API Error"
- Pastikan API Key valid
- Cek koneksi internet
- Pastikan quota API belum habis

### Error: "Unauthorized"
- Pastikan user sudah login
- Cek token di localStorage
- Refresh token jika expired

### Bot tidak merespons
- Cek log Laravel: `storage/logs/laravel.log`
- Pastikan route sudah terdaftar: `php artisan route:list`
- Clear cache: `php artisan config:clear`

## 📊 Monitoring

### Log Requests
Semua error dicatat di:
```
storage/logs/laravel.log
```

### Check API Usage
Monitor penggunaan API di:
https://console.cloud.google.com/apis/dashboard

## 🔐 Security

1. **API Key Protection**
   - Jangan commit `.env` ke Git
   - Gunakan `.env.example` untuk template
   - Rotate API key secara berkala

2. **Rate Limiting**
   - Implementasi rate limiting di route
   - Batasi request per user per menit

3. **Input Validation**
   - Max 1000 karakter per pesan
   - Sanitize input dari XSS

## 📚 Resources

- [Gemini API Documentation](https://ai.google.dev/docs)
- [Laravel HTTP Client](https://laravel.com/docs/http-client)
- [React Axios](https://axios-http.com/docs/intro)

## 👨‍💻 Developer Notes

### Customize System Prompt
Edit di: `app/Http/Controllers/Api/ChatBotController.php`
Method: `getSystemPrompt()`

### Add More Quick Replies
Edit di: `app/Http/Controllers/Api/ChatBotController.php`
Method: `quickReplies()`

### Adjust Response Time
Edit timeout di frontend: `ChatBot.jsx`
```javascript
const response = await axios.post(..., {
  timeout: 30000 // 30 seconds
});
```

---

**Created by:** MefaSafe Development Team
**Last Updated:** May 26, 2026
