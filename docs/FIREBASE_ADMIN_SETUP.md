# DADU — Panduan Setup Firebase & Primary Administrator

Dokumentasi ini adalah panduan resmi penyiapan Firebase Authentication, Cloud Firestore, Firebase Storage, dan akun **Primary Administrator** untuk aplikasi **DADU (Digitalisasi Data dari Guru)**.

---

## 1. Persiapan Firebase Project

1. Buka [Firebase Console](https://console.firebase.google.com/).
2. Buat project baru atau pilih project yang sudah ada (misal: `dadu-prod` atau `dadu-app`).
3. Daftarkan Web App baru:
   - Masuk ke **Project Overview** > **Project Settings** > **General**.
   - Di bagian *Your apps*, klik ikon **Web (`</>`)**.
   - Masukkan App nickname: `DADU Web`.
   - Salin konfigurasi Firebase Web SDK (`apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`).

---

## 2. Mengaktifkan Firebase Authentication (Email/Password)

DADU v1.2 menggunakan autentikasi berbasis **Email & Password**:

1. Di menu navigasi sebelah kiri Firebase Console, klik **Build** > **Authentication**.
2. Klik **Get Started** (jika baru pertama kali).
3. Buka tab **Sign-in method**.
4. Pilih penyedia **Email/Password**.
5. Aktifkan sakelar **Enable** untuk Email/Password (jangan aktifkan Email link / passwordless kecuali diperlukan).
6. Klik **Save**.

> ⚠️ **Catatan Penting:** Provider pihak ketiga (Google, Microsoft, GitHub) dinonaktifkan secara default sesuai spesifikasi DADU v1.2 untuk menjamin isolasi kredensial institusi.

---

## 3. Membuat Akun Primary Administrator Pertama

1. Di menu **Authentication**, buka tab **Users**.
2. Klik tombol **Add user**.
3. Masukkan **Email** administrator utama (contoh: `admin@sekolah.sch.id` atau email admin terpercaya).
4. Masukkan **Password** yang kuat (minimal 10 karakter dengan kombinasi huruf, angka, dan simbol).
5. Klik **Add user**.
6. Salin **User UID** dari akun yang baru dibuat tersebut.

---

## 4. Keamanan Kredensial & Anti-Bypass Rule

### ⛔ PERATURAN MUTLAK KEAMANAN:
- **JANGAN PERNAH** menuliskan password admin di dalam:
  - Source code React / TypeScript
  - Dokumen Firestore publik
  - Commit Git / GitHub repository
  - Environment variables client-side (`VITE_*`)
  - Komponen UI atau form registrasi publik
- Firebase Authentication menangani verifikasi kata sandi secara terenkripsi.
- Pengguna umum yang mendaftar melalui registrasi publik **TIDAK AKAN PERNAH** mendapatkan role `admin` atau `supervisor` secara otomatis.

---

## 5. Konfigurasi Environment Variable

Buat file `.env` pada root project (gunakan `.env.example` sebagai referensi):

```env
# Client-side Safe Firebase Configuration (Publicly safe for web SDK)
VITE_FIREBASE_API_KEY="AIzaSy..."
VITE_FIREBASE_AUTH_DOMAIN="dadu-project.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="dadu-project"
VITE_FIREBASE_STORAGE_BUCKET="dadu-project.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789"
VITE_FIREBASE_APP_ID="1:123456789:web:abcdef"

# Server-side Secrets ONLY (Never expose to browser)
GEMINI_API_KEY="AIzaSy..."
DADU_ADMIN_BOOTSTRAP_SECRET="secure_random_bootstrap_token_here"
```

---

## 6. Mengaktifkan Cloud Firestore

1. Di Firebase Console, klik **Build** > **Firestore Database**.
2. Klik **Create database**.
3. Pilih lokasi cloud region terdekat (misal: `asia-southeast1` untuk Jakarta / Singapura).
4. Mulai dalam mode Production.
5. Deploy file `firestore.rules` yang telah disediakan di root repository DADU.

---

## 7. Mengaktifkan Firebase Storage

1. Di Firebase Console, klik **Build** > **Storage**.
2. Klik **Get Started**.
3. Pilih aturan akses aman (hanya pengguna terautentikasi yang dapat mengunggah file tanda tangan/avatar ke direktori organisasi mereka).

---

## 8. Verifikasi Akun & Dashboard Admin

1. Jalankan aplikasi DADU (`npm run dev`).
2. Masuk ke halaman **Login**.
3. Masukkan Email dan Password Admin yang telah dibuat di Firebase Authentication.
4. Sistem akan otomatis mengenali status Primary Admin dan mengarahkan ke **Admin Dashboard** & **User Management**.
5. Admin dapat mulai melakukan konfigurasi institusi di **Pusat Pengaturan** (`⚙️ Profil Institusi`, `Terminologi`, `Tahun Pelajaran`, `Dokumen Template`).

---

## 9. Alur Registrasi Guru & Persetujuan Admin

```text
Guru Mendaftar di Halaman Register
             ↓
Akun Terdaftar di Firebase Auth (Status: PENDING)
             ↓
Admin Membuka Menu "Manajemen Pengguna" di DADU
             ↓
Admin Menyetujui Akun & Menetapkan Role (TEACHER / HOMEROOM_TEACHER)
             ↓
Akun Berubah Menjadi ACTIVE
             ↓
Guru Dapat Mengakses Fitur Jadwal, Presensi, Jurnal, dan Nilai
```
