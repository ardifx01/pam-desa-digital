# 🚰 PAM Digital Desa Plosobuden

**Sistem Manajemen Air Minum Digital untuk Desa Plosobuden, Kecamatan Deket, Kabupaten Lamongan**

## 📍 Lokasi
- **Desa:** Plosobuden
- **Kecamatan:** Deket
- **Kabupaten:** Lamongan
- **Provinsi:** Jawa Timur

## 🎯 Fitur Utama

### 👑 Admin Dashboard
- Manajemen pengguna (User Management)
- Manajemen tagihan (Billing Management)
- Manajemen pembayaran (Payment Management)
- Manajemen laporan masalah (Report Management)
- Manajemen tarif (Tariff Management)
- Reset password untuk semua user

### 👤 User Dashboard
- Lihat tagihan air (Bill History)
- Lihat penggunaan air (Usage Graph)
- Lapor masalah (Report Problem)
- Lihat profil dan update data
- Ubah password

### 🚧 Field Officer Dashboard
- Lihat laporan yang ditugaskan
- Update status laporan
- Monitoring masalah air

## 🗄️ Database Status

✅ **Data sudah dibersihkan dan terstruktur.**

## 🚀 Cara Menjalankan

1. Install dependencies:
   ```bash
   npm install
   ```

2. Jalankan aplikasi:
   ```bash
   npm run dev
   ```

3. Buka browser:
   ```
   http://localhost:5174/ (atau port yang tersedia)
   ```

> Catatan: minta kredensial kepada admin untuk masuk.

## 📱 Tech Stack

- Frontend: React + TypeScript
- Styling: Tailwind CSS
- Backend: Firebase Firestore
- Build Tool: Vite

## 🔧 Konfigurasi Lingkungan

Buat file `.env` di root project berdasarkan contoh di `.env.example`.

```bash
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
```

## 📊 Struktur Data (Ringkas)

- Users: role, profil, customerNumber
- Bills: periode, usage, totalAmount, status
- Problem Reports: status, reportedAt, assigneeId

## 📞 Kontak

Untuk informasi lebih lanjut, silakan hubungi Admin PAM Desa Plosobuden.

---

**PAM Digital Desa Plosobuden** - Mewujudkan Desa Digital yang Maju dan Mandiri 🚰✨
