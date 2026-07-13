# 🗺️ 07. Peta Jalan Pengembangan (Roadmap) dan Changelog

Dokumen ini melacak visi masa depan pengembangan fungsionalitas Madrasah serta mencatat riwayat perubahan sistem yang telah diimplementasikan.

---

## 7.1 Peta Jalan Pengembangan (Roadmap)

Pengembangan **Remix: Madrasah** dibagi ke dalam tiga fase strategis untuk bertransformasi dari sistem operasi pengetahuan personal lokal menjadi platform kolaboratif akademis yang kokoh.

### Fase 1: Fondasi Kokoh & PKOS Inti (Selesai / Tahap Aktual)
- [x] **Bahasa Visual Monokrom Terpadu**: Pembersihan total palet warna sekunder menuju nuansa monokrom hitam-putih murni untuk menjamin ketenangan kognitif pengguna.
- [x] **Zettelkasten & AI Copilot**: Manajemen catatan Markdown hierarkis lengkap dengan saran tag dan koneksi relasional berbasis AI.
- [x] **Visualisasi Graf Pengetahuan**: Jaringan kognitif interaktif bertenaga D3.js dengan dukungan penyorotan dan drawer detail responsif.
- [x] **Latihan Memori SM-2**: Implementasi algoritma SuperMemo-2 fungsional didukung oleh pembuat kartu ulasan otomatis (*AI Flashcard Generator*) dan penilaian konsep (*AI Grading Assistant*).
- [x] **AI Syllabus Planner**: Desain kurikulum otomatis dari topik studi mentah ke dalam fase belajar modular yang terintegrasi dengan pustaka rujukan.
- [x] **Studio Menulis Bebas Gangguan**: Lingkungan penulisan esai murni terhubung dengan bank referensi pribadi di Otak Kedua.

### Fase 2: Sinkronisasi Awan & Autentikasi Multi-User (Jangka Menengah)
- [ ] **Multi-User Authentication**: Integrasi Firebase Auth untuk mendukung pendaftaran dan login aman banyak pengguna secara terisolasi.
- [ ] **Durable Cloud Persistence**: Migrasi data opsional dari penyimpanan lokal (`localStorage`) ke basis data cloud terdistribusi (Firestore) untuk mencegah risiko hilangnya data akibat pembersihan cache peramban.
- [ ] **Sinkronisasi Multidevice Real-Time**: Pembaruan data instan antara sesi desktop aktif dan smartphone tanpa keterlambatan.

### Fase 3: Kolaborasi, Ekspor Literer, dan Ekosistem Penerbitan (Jangka Panjang)
- [ ] **Ekspor Format Kaya**: Ekspor draf tulisan dari Studio Menulis langsung ke format publikasi akademis seperti PDF (LaTeX-ready), EPUB, atau bundel Markdown .zip.
- [ ] **Pustaka Kolaboratif (Shared Curriculums)**: Pengguna dapat membagikan silabus belajar dan daftar rujukan pustaka mereka ke publik untuk dipelajari bersama.
- [ ] **API Penerbitan Pihak Ketiga**: Integrasi ekspor tulisan langsung ke platform penerbitan mandiri seperti Ghost, Medium, atau repositori tulisan personal via Webhooks.

---

## 7.2 Riwayat Perubahan (Changelog)

### v1.1.0 (Rilis Aktual - 13 Juli 2026)
* **Penyempurnaan Estetika Visual (Monochrome Overhaul)**:
  - Melakukan pembersihan menyeluruh terhadap palet warna sekunder (biru, indigo, hijau, ungu, dll.) di seluruh modul, menggantinya dengan skema warna monokromatik hitam-putih-slate yang elegan.
  - Menghapus tombol melayang "Quick Add" di sudut kanan bawah karena mengganggu keterbacaan layout halaman fungsional dan melanggar prinsip kebersihan ruang visual.
* **Pembersihan Infrastruktur & Bundler**:
  - Mengonfigurasi bundler esbuild untuk mengompilasi berkas `server.ts` menjadi berkas CommonJS tunggal (`dist/server.cjs`) guna menyelesaikan isu kebergantungan relatif ESM di lingkungan Cloud Run.
* **Overhaul Dokumentasi**:
  - Menyusun ulang seluruh sistem dokumentasi ke dalam struktur direktori `/docs` modular yang komprehensif sebagai *Single Source of Truth* proyek.

### v1.0.0 (Rilis Perdana - Juni 2026)
* **Peluncuran Madrasah Personal Knowledge Operating System**:
  - Rilis awal dasbor Mission Control terintegrasi Hijri Clock.
  - Rilis modul Zettelkasten Catatan, Pustaka Literatur, Kurikulum Pembelajaran, Proyek Aktif, dan Studio Menulis.
  - Rilis visualisasi Knowledge Graph berbasis D3.js.
  - Integrasi AI Syllabus Planner, AI Tag recommender, AI Flashcard Generator, dan SM-2 Spaced Repetition.
