# Remix: Madrasah 🕋
> **Personal Knowledge Operating System (PKOS)**

**Remix: Madrasah** adalah sistem operasi pengetahuan pribadi (Personal Knowledge Operating System) modern yang dirancang khusus untuk mengintegrasikan proses pembelajaran, pencatatan, penataan kurikulum, penulisan kreatif, tinjauan berbasis repetisi berjarak (spaced repetition), serta eksplorasi hubungan antar-konsep melalui Graf Pengetahuan (Knowledge Graph) yang dinamis. 

Aplikasi ini dioptimalkan sepenuhnya untuk perangkat desktop maupun mobile secara totalitas, menghadirkan harmoni visual yang tinggi, tipografi presisi, dan fungsionalitas cerdas berbasis AI.

---

## 🎨 Identitas Visual & Bahasa Desain

Bahasa desain **Remix: Madrasah** berlandaskan pada keselarasan, minimalisme, dan fungsionalitas intuitif tanpa ornamen berlebih (Anti-AI-Slop).

- **Tema Warna**: *Cosmic Slate & Clean White*
  - Latar belakang utama menggunakan abu-abu ultra-lembut (`bg-gray-50/50`) dipadu dengan kartu putih murni (`bg-white`) berbayang halus (`shadow-sm`) dan berlekuk lembut (`rounded-2xl`).
  - Aksen gelap elegan (`text-gray-900`, `bg-gray-900`) memberikan kontras tinggi dan keterbacaan optimal.
- **Tipografi Harmonis**:
  - **Display (Judul)**: Menggunakan **Plus Jakarta Sans** yang modern dan berkarakter, memberikan kesan ramah sekaligus profesional pada setiap tajuk utama.
  - **Sanskrit (Isi Utama)**: Menggunakan **Inter** untuk keterbacaan teks paragraf yang sangat tajam di berbagai ukuran layar.
  - **Monospace (Data/Meta)**: Menggunakan **JetBrains Mono** untuk representasi kode, penanda waktu, atau teks metadata yang rapi.
- **Set Ikon**: Konsisten 100% menggunakan keluarga ikon dari **Lucide React** dengan ketebalan dan gaya visual yang seragam.

---

## 📱 Sinkronisasi & Optimalisasi Mobile-Web

Seluruh komponen dalam aplikasi ini telah disinkronkan secara total untuk pengalaman lintas perangkat (Cross-Device Mastery):

1. **Navigasi Layar Bawah (Mobile Navigation)**:
   - Akses cepat untuk menu-menu utama (**Beranda, Kurikulum, Pustaka, Otak Kedua**) yang selalu dalam jangkauan ibu jari saat dibuka di smartphone.
   - Pintu masuk tambahan menuju **Pengaturan Sistem** dan **Keluar Sesi** yang elegan pada laci menu tambahan.
2. **Lapisan Interaktif (Z-Index Harmony)**:
   - Komponen dialog, modal, dan jendela AI Syllabus Planner diatur pada indeks lapisan tinggi (`z-[100]`) di atas bilah navigasi mobile agar konten tidak saling tumpang tindih dan dapat beroperasi 100% tanpa hambatan visual.
3. **Penyaring Pintar Mobile (Mobile Filter Toggle)**:
   - Panel pencarian dan filter pada halaman **Catatan (Otak Kedua)** yang awalnya memenuhi ruang samping di layar lebar, kini dikompresi menjadi tombol lipat (*accordion drawer*) interaktif yang bersih dan hemat ruang di layar mobile.
4. **Graf Responsif**:
   - Visualisasi graf relasi pengetahuan yang fleksibel menyesuaikan tinggi jendela serta panel detail simpul (*node detail*) yang bergeser mulus dari bawah layar (*bottom sheet*) khusus untuk tampilan mobile.

---

## 🚀 Fitur Utama & Modul Sistem

- **🕋 Beranda & Dasbor Utama**: Pusat pantauan aktivitas harian, statistik belajar, jam Hijriah real-time, serta kutipan inspirasi yang memotivasi proses belajar harian.
- **🗺️ Jalur Belajar (Curriculum)**: Rencanakan jalur studi Anda sendiri secara mandiri atau gunakan **AI Syllabus Planner** berbasis Gemini AI untuk menyusun silabus belajar dari tingkat pemula hingga ahli dalam hitungan detik.
- **🧠 Otak Kedua (Notes)**: Pencatatan kaya fitur dengan dukungan Markdown, pengelompokan direktori (Folder), penandaan tag, serta integrasi **Asisten AI Madrasah** untuk merangkum dan menghubungkan gagasan Anda.
- **📚 Pustaka (Library)**: Kelola daftar buku, artikel, dokumen penting lengkap dengan status pembacaan dan catatan eksklusif per buku.
- **📊 Graf Pengetahuan (Knowledge Graph)**: Visualisasi keterkaitan antar catatan dan konsep secara dinamis menggunakan D3.js untuk mempermudah eksplorasi wawasan baru.
- **🔁 Tinjauan Memori (Spaced Repetition)**: Pertahankan ingatan Anda jangka panjang dengan sistem Flashcard pintar yang melacak kekuatan memori Anda.
- **✍️ Studio Penulisan (Writing Room)**: Ruang sunyi bebas gangguan untuk merangkai naskah, artikel, atau tulisan akademis berdasarkan referensi catatan Anda.

---

## 🛠️ Arsitektur Teknologi

Aplikasi ini mengusung fondasi tumpukan teknologi modern berkinerja tinggi:

- **Frontend**: React 19, Vite 6, TypeScript 5.
- **State Management**: Zustand (untuk pengelolaan status global yang ringan dan responsif).
- **Styling**: Tailwind CSS v4 (mengoptimalkan utilitas modern langsung pada build CSS terintegrasi).
- **Animasi**: Motion (untuk transisi halaman dan elemen yang lembut).
- **Backend**: Express.js (melayani REST API serta menjembatani integrasi rahasia dengan Google GenAI SDK tanpa mengekspos API Key ke peramban).

---

## 💻 Panduan Pengembangan Lokal

### Prasyarat
Pastikan Anda telah memasang **Node.js** (versi 18+) di komputer Anda.

### Langkah Memulai

1. **Pasang Dependensi**:
   ```bash
   npm install
   ```

2. **Konfigurasi Lingkungan (.env)**:
   Salin `.env.example` menjadi `.env` dan masukkan kunci API Gemini Anda:
   ```env
   GEMINI_API_KEY="AIzaSy..."
   ```

3. **Jalankan Server Pengembangan**:
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://localhost:3000`.

4. **Kompilasi Produksi**:
   Untuk membangun aplikasi siap pakai di lingkungan produksi:
   ```bash
   npm run build
   ```

---

*Remix: Madrasah dirancang dengan ketulusan dan fungsionalitas tinggi untuk menemani petualangan intelektual Anda.*
