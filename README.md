# jedadulu.id — FOMO atau Emang Aku Mau?

Website Layanan Bimbingan dan Konseling (BK) Interaktif Berbasis Decision Tree untuk Membantu Siswa SMA/MA Mengambil Keputusan Sadar di Media Sosial.

- **Penyusun:** Larasati Adi Ningrum (NPM: 2411080031 · Kelas B/V)
- **Dosen Pengampu:** Mega Aria Monica, M.Pd
- **Program Studi:** Bimbingan dan Konseling Pendidikan Islam (BKPI), UIN Raden Intan Lampung (2026)

---

## Fitur Utama & Arsitektur

1. **Portal Siswa (`StudentPortal.tsx`):**
   - **Identitas & Informed Consent:** Masuk cepat menggunakan Nama Panggilan, Kelas (X/XI/XII), dan Kode Sekolah (`JEDA-01`) disertai penjelasan privasi sesuai etika BK (ASCA, 2022; UNESCO, 2023).
   - **Decision Tree "FOMO atau Emang Aku Mau?":** 4 pertanyaan berjenjang (P1–P4) berlandaskan Teori Determinasi Diri, Perbandingan Sosial, dan Restrukturisasi Kognitif yang bermuara pada **Hasil A, B, atau C** (non-diagnostik, dilengkapi tips langkah kecil dan muhasabah/qana'ah).
   - **Jurnal Refleksi "My Life, Their Highlight":** 3 pertanyaan pemandu perbandingan sosial dengan penyimpanan otomatis (*auto-save draft*) di perangkat pengguna + saklar izin *"Izinkan Guru BK membaca jurnal ini"*.
   - **Pengajuan Jadwal Konsultasi BK:** Formulir pemilihan topik dan catatan pengantar menuju layanan konseling tatap muka.
   - **Live Chat Konseling BK:** Percakapan dua arah secara *real-time* antara Siswa dan Guru BK.
   - **Versi Cetak Alur (Print/PDF):** Mendukung aksesibilitas bagi siswa dengan kuota internet terbatas.

2. **Dashboard Guru BK (`CounselorDashboard.tsx`):**
   - Statistik ringkas jumlah siswa terdaftar, siswa yang sudah berefleksi, jurnal yang dibagikan, dan permintaan konsultasi baru.
   - Tabel hasil refleksi Decision Tree dengan filter Kelas (X/XI/XII) dan Hasil (A/B/C).
   - Pembaca jurnal siswa (hanya terbuka pada jurnal yang diizinkan oleh siswa; jurnal privat terkunci otomatis).
   - Manajemen status konsultasi (`Baru`, `Dijadwalkan`, `Selesai`) beserta pengiriman jadwal & tanggapan konselor.
   - Ruang **Live Chat Guru BK** untuk membalas pesan siswa secara *real-time*.
   - Manajemen kode sekolah (`JEDA-01`, buat kode baru, aktif/nonaktifkan kode).

3. **Dashboard Administrator (`AdminDashboard.tsx`):**
   - Statistik agregat sebaran Hasil A, B, C dan jenjang kelas **tanpa membuka isi jurnal atau chat privat siswa** demi menjaga kerahasiaan BK.
   - Manajemen akun Guru BK (tambah konselor baru, aktifkan/nonaktifkan akun).
   - Direktori siswa & mekanisme penghapusan data (sesuai Tabel 6 Proposal).
   - Manajemen konten skenario situasi dan verifikasi pertanyaan Decision Tree.

---

## Cara Menjalankan di Lokal

```bash
npm install
npm run dev
```

Buka `http://localhost:3000` di peramban.

### Akun Demo Siap Pakai
- **Siswa:** Kode Sekolah `JEDA-01` (atau klik tombol *"Isi Data Contoh (Rani · Kelas XI)"*)
- **Guru BK:** Email `guru@sekolah-contoh.sch.id` · Kata Sandi `bk12345`
- **Admin:** Email `admin@sekolah-contoh.sch.id` · Kata Sandi `admin12345`

---

## Cara Menghubungkan ke Supabase & Deploy ke Vercel

1. Buat project baru di [Supabase](https://supabase.com).
2. Buka **SQL Editor** di dashboard Supabase, lalu jalankan isi file:
   - `supabase/migrations/20261122000000_init_jedadulu.sql`
   - `supabase/seed.sql`
3. Salin `Project URL` dan `anon public key` dari Supabase ke Environment Variables di **Vercel** (atau `.env.local` di komputer lokal):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```
4. Push repository ke GitHub dan import ke [Vercel](https://vercel.com) — aplikasi akan otomatis ter-deploy!
