# 🚀 Setup ChatBot MefaSafe dengan Gemini AI

## ✅ Langkah-langkah Setup

### 1️⃣ Install Dependencies (Jika Belum)
```bash
composer install
npm install
```

### 2️⃣ Setup Gemini API Key

#### Dapatkan API Key:
1. Buka: https://makersuite.google.com/app/apikey
2. Login dengan Google Account
3. Klik **"Create API Key"** atau **"Get API Key"**
4. Copy API Key yang dihasilkan

#### Tambahkan ke .env:
```env
GEMINI_API_KEY=AIzaSyB_89SkNKavHTiSNu50yP0cV3zjFk0dyjs
```

### 3️⃣ Clear Cache Laravel
```bash
php artisan config:clear
php artisan cache:clear
```

### 4️⃣ Jalankan Server
```bash
# Terminal 1 - Laravel Backend
php artisan serve

# Terminal 2 - React Frontend
npm run dev
```

### 5️⃣ Test ChatBot
1. Buka browser: http://127.0.0.1:8000
2. Login ke aplikasi
3. Klik menu **"ChatBot"** di header
4. Coba tanyakan:
   - "Bagaimana cara klaim asuransi?"
   - "Apa gejala demam berdarah?"
   - "Berapa biaya konsultasi dokter?"

---

## 🎯 Fitur ChatBot

### ✅ Yang Bisa Dijawab:
- 🏥 Informasi aplikasi MefaSafe
- 💰 Asuransi kesehatan (klaim, premi, polis)
- 🩺 Kesehatan & penyakit
- 🏨 Rumah sakit dan dokter
- 💊 Obat dan pengobatan

### ❌ Yang TIDAK Bisa Dijawab:
- Politik
- Hiburan
- Teknologi umum
- Olahraga
- Topik di luar kesehatan

---

## 🧪 Test API dengan Postman

### Endpoint: Chat
```
POST http://127.0.0.1:8000/api/v1/chatbot/chat
```

**Headers:**
```
Authorization: Bearer {your_token}
Content-Type: application/json
```

**Body:**
```json
{
  "message": "Bagaimana cara klaim asuransi?"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Untuk mengajukan klaim asuransi, Anda bisa:\n\n1. Buka menu 'Riwayat Transaksi'...",
  "timestamp": "14:30"
}
```

---

## 🔧 Troubleshooting

### ❌ Error: "GEMINI_API_KEY not found"
**Solusi:**
```bash
# Pastikan .env sudah ada GEMINI_API_KEY
php artisan config:clear
```

### ❌ Error: "Unauthorized"
**Solusi:**
- Pastikan sudah login
- Cek token di localStorage browser
- Refresh halaman

### ❌ Bot tidak merespons
**Solusi:**
```bash
# Cek log error
tail -f storage/logs/laravel.log

# Clear cache
php artisan config:clear
php artisan cache:clear

# Restart server
php artisan serve
```

### ❌ Error: "Connection timeout"
**Solusi:**
- Cek koneksi internet
- Pastikan API Key valid
- Cek quota API di Google Cloud Console

---

## 📊 Monitoring

### Cek Log Laravel:
```bash
tail -f storage/logs/laravel.log
```

### Cek API Usage:
https://console.cloud.google.com/apis/dashboard

---

## 🎨 Customize ChatBot

### Ubah System Prompt:
File: `app/Http/Controllers/Api/ChatBotController.php`
Method: `getSystemPrompt()`

### Tambah Quick Replies:
File: `app/Http/Controllers/Api/ChatBotController.php`
Method: `quickReplies()`

### Ubah UI ChatBot:
File: `resources/js/components/ChatBot.jsx`

---

## 📚 Dokumentasi Lengkap

Lihat: `CHATBOT_GEMINI_SETUP.md`

---

## ✨ Selamat! ChatBot Siap Digunakan! 🎉
