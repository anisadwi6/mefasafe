# 🔑 Cara Mendapatkan Gemini API Key

## ⚠️ PENTING: API Key di Screenshot Tidak Valid!

API Key yang terlihat di screenshot (`AIzaSyB_89SkNKavHTiSNu50yP0cV3zjFk0dyjs`) sudah tidak valid atau expired.

Anda perlu membuat API Key baru dengan langkah berikut:

---

## 📋 Langkah-langkah Mendapatkan API Key Baru

### 1️⃣ Buka Google AI Studio
Kunjungi: **https://aistudio.google.com/app/apikey**

Atau alternatif:
- https://makersuite.google.com/app/apikey
- https://ai.google.dev/

### 2️⃣ Login dengan Google Account
- Gunakan akun Google pribadi atau organisasi
- Pastikan akun sudah terverifikasi

### 3️⃣ Create API Key

#### Opsi A: Create API Key in New Project
1. Klik tombol **"Create API Key"**
2. Pilih **"Create API key in new project"**
3. Tunggu beberapa detik
4. API Key akan muncul

#### Opsi B: Create API Key in Existing Project
1. Klik tombol **"Create API Key"**
2. Pilih **"Create API key in existing project"**
3. Pilih project yang sudah ada
4. API Key akan muncul

### 4️⃣ Copy API Key
1. Klik icon **Copy** di sebelah API Key
2. API Key akan tersalin ke clipboard
3. Format: `AIzaSy...` (panjang sekitar 39 karakter)

### 5️⃣ Simpan API Key
⚠️ **PENTING:** Simpan API Key dengan aman!
- Jangan share ke publik
- Jangan commit ke Git
- Simpan di password manager

---

## 🔧 Setup di MefaSafe

### 1. Buka file `.env`
```bash
# Windows
notepad .env

# Mac/Linux
nano .env
```

### 2. Tambahkan/Update API Key
```env
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```
*Ganti dengan API Key yang baru Anda dapatkan*

### 3. Clear Cache Laravel
```bash
php artisan config:clear
php artisan cache:clear
```

### 4. Test API Key
```bash
php test_gemini.php
```

**Output yang diharapkan:**
```
✅ SUCCESS! Gemini API is working!

📝 Response:
─────────────────────────────────────
MefaSafe adalah platform asuransi kesehatan digital...
─────────────────────────────────────

🎉 ChatBot ready to use!
```

---

## 🚨 Troubleshooting

### ❌ Error: "API key not valid"
**Penyebab:**
- API Key salah atau expired
- API Key belum diaktifkan

**Solusi:**
1. Buat API Key baru di https://aistudio.google.com/app/apikey
2. Copy API Key yang baru
3. Update di `.env`
4. Clear cache: `php artisan config:clear`

### ❌ Error: "API key not enabled for Gemini API"
**Penyebab:**
- API belum diaktifkan di Google Cloud Console

**Solusi:**
1. Buka: https://console.cloud.google.com/apis/dashboard
2. Cari "Generative Language API"
3. Klik "Enable"
4. Tunggu beberapa menit
5. Test lagi

### ❌ Error: "Billing not enabled"
**Penyebab:**
- Project belum mengaktifkan billing

**Solusi:**
1. Buka: https://console.cloud.google.com/billing
2. Link billing account ke project
3. Gemini API memiliki free tier yang cukup untuk development

### ❌ Error: "Rate limit exceeded"
**Penyebab:**
- Terlalu banyak request dalam waktu singkat

**Solusi:**
- Tunggu beberapa menit
- Gunakan API Key baru jika perlu

---

## 📊 Quota & Pricing

### Free Tier (Gratis)
- **60 requests per minute**
- **1,500 requests per day**
- Cukup untuk development dan testing

### Paid Tier
- Unlimited requests
- Pay per 1000 characters
- Lihat: https://ai.google.dev/pricing

---

## 🔐 Keamanan API Key

### ✅ DO (Lakukan):
- Simpan di `.env` (tidak di-commit ke Git)
- Gunakan environment variables
- Rotate API Key secara berkala
- Monitor usage di Google Cloud Console

### ❌ DON'T (Jangan):
- Commit `.env` ke Git
- Share API Key di public
- Hardcode di source code
- Gunakan API Key production untuk testing

---

## 📚 Resources

- **Google AI Studio:** https://aistudio.google.com/
- **Gemini API Docs:** https://ai.google.dev/docs
- **Pricing:** https://ai.google.dev/pricing
- **Support:** https://ai.google.dev/support

---

## ✅ Checklist Setup

- [ ] Buka https://aistudio.google.com/app/apikey
- [ ] Login dengan Google Account
- [ ] Create API Key baru
- [ ] Copy API Key
- [ ] Paste ke `.env` → `GEMINI_API_KEY=...`
- [ ] Run: `php artisan config:clear`
- [ ] Test: `php test_gemini.php`
- [ ] Lihat output: ✅ SUCCESS!
- [ ] Buka aplikasi dan test ChatBot

---

## 🎉 Setelah Setup Berhasil

1. Jalankan server:
   ```bash
   php artisan serve
   npm run dev
   ```

2. Buka browser: http://127.0.0.1:8000

3. Login dan klik menu **ChatBot**

4. Coba tanyakan:
   - "Bagaimana cara klaim asuransi?"
   - "Apa gejala demam berdarah?"
   - "Berapa biaya konsultasi dokter?"

---

**Need Help?** 
Check: `CHATBOT_GEMINI_SETUP.md` untuk dokumentasi lengkap
