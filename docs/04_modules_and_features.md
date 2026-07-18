# 📦 04. Panduan Modul dan Fitur Sistem

Modul fungsional **Madrasah — Personal Knowledge Operating System** dikelompokkan ke dalam empat pilar utama yang saling terhubung membentuk ekosistem manajemen pengetahuan yang kokoh.

---

## 4.1 Pilar 1: Utama (Core Navigation)

### 🕋 Beranda (Mission Control)
Beranda adalah ruang kendali utama pengguna saat membuka aplikasi pertama kali.
- **Fungsi**: Memberikan tinjauan umum instan tentang keadaan "Otak Kedua" pengguna.
- **Fitur Utama**:
  - **Jam Hijriah Dinamis**: Menampilkan kalender Islam dan waktu aktual secara real-time untuk menyelaraskan ritme belajar dengan penanggalan Hijriah.
  - **Prioritas Teratas**: Rekomendasi bacaan buku aktif, tugas review flashcard hari ini, dan progres belajar dalam kurikulum.
  - **Ruang Produksi**: Daftar draf tulisan yang sedang disunting dan proyek-proyek aktif yang membutuhkan tindakan segera.
  - **AI Copilot Insight**: Panel asisten AI yang secara cerdas memperingatkan jumlah catatan yang belum diproses di Inbox dan menyarankan tindakan pembersihan.
  - **Palet Perintah (Cmd+K)**: Jendela pencarian global instan untuk mengakses modul, mencari catatan, proyek, buku, atau draf dari mana saja.

### 📈 Analitik Produktivitas
Menyediakan visualisasi data kuantitatif mengenai aktivitas kognitif pengguna.
- **Fungsi**: Membantu pengguna memantau konsistensi belajar mereka melalui grafik interaktif Recharts.
- **Fitur Utama**:
  - **Grafik Komitmen Harian**: Menampilkan kurva aktivitas pembuatan catatan dan review dari waktu ke waktu.
  - **Metrik Distribusi Catatan**: Diagram lingkaran yang memecah jenis-jenis catatan (knowledge, project, writing, personal) di dalam sistem.
  - **Indikator Kecepatan Tinjauan**: Menunjukkan performa retensi memori pengguna berdasarkan persentase jawaban benar pada sesi review flashcard.

---

## 4.2 Pilar 2: Sumber Belajar (Learning Resources)

### 🗺️ Kurikulum & AI Syllabus Planner
Modul ini berfungsi untuk merancang dan memantau jalur pembelajaran mandiri.
- **Fungsi**: Membantu pengguna memecah topik besar yang menakutkan menjadi langkah-langkah belajar terukur.
- **Fitur Utama**:
  - **Jalur Pembelajaran Mandiri**: Pengguna dapat menyusun peta jalan belajar secara hierarkis (Jalur -> Fase -> Kompetensi).
  - **AI Syllabus Planner**: Masukkan satu topik studi (contoh: "Dasar Ushul Fiqih" atau "Deep Learning"), AI akan otomatis memecah topik tersebut menjadi 3-5 Fase Belajar berurutan, lengkap dengan daftar Kompetensi rinci di setiap fase.
  - **Integrasi Pustaka & Catatan**: Di setiap kompetensi, pengguna dapat menyematkan buku-buku referensi yang relevan dari Pustaka serta menghubungkan catatan proyek atau hasil belajar sebagai bukti fisik penguasaan kompetensi (*output*).

### 📚 Pustaka (Library Management)
Modul penyimpanan literatur digital dan cetak.
- **Fungsi**: Mengelola daftar buku, kitab, artikel jurnal, atau dokumen bacaan pengguna.
- **Fitur Utama**:
  - **Metadata Terstruktur**: Melacak nama penulis, kategori, jumlah halaman, dan persentase progres membaca.
  - **Status Pembacaan**: Buku dikategorikan ke dalam status: *Wishlist*, *Owned*, *Reading*, *Finished*, *Summarized*, *Connected*, *Applied*, hingga *Published*.
  - **Pembuat Catatan Instan**: Di dalam halaman detail buku, pengguna dapat menulis "Catatan Cepat" (*Quick Note*). Catatan ini secara otomatis didaftarkan ke modul **Zettelkasten** dengan referensi `sourceId` yang mengarah kembali ke buku tersebut.

---

## 4.3 Pilar 3: Zettelkasten (The Cognitive Core)

### 🧠 Otak Kedua (Notes & Inbox)
Pusat dari seluruh sistem penataan ide, dibangun dengan metode pencatatan Zettelkasten.
- **Fungsi**: Mengumpulkan ide, fakta, riset, dan menyintesisnya ke dalam struktur yang terorganisasi.
- **Fitur Utama**:
  - **Inbox & Status Proses**: Catatan yang baru dibuat masuk ke kategori *Unprocessed* (Mentah) di Inbox. Setelah diproses (diberi tag, dihubungkan, atau disarikan), statusnya berubah menjadi *Processed*.
  - **Folder Hierarkis & Tags**: Pengguna dapat menyusun catatan dalam folder fisik atau menggunakan sistem penandaan (*tagging*) lintas folder yang fleksibel.
  - **AI Zettelkasten Assistant**: Panel AI khusus di sisi editor catatan yang dapat:
    1. **AI Suggest Tags**: Menganalisis konten catatan secara real-time dan memberikan saran tag yang relevan.
    2. **AI Suggest Connections**: Merekomendasikan catatan lain yang relevan di dalam pustaka pengguna untuk dihubungkan.
    3. **AI Chat & Synthesis**: Membedah isi catatan, merangkum, atau memformulasikan argumen baru berdasarkan referensi silang.

### 📊 Graf Pengetahuan (Knowledge Graph)
Visualisasi jaringan kognitif berbasis teori graf.
- **Fungsi**: Membantu pengguna melihat hubungan tersembunyi antarkonsep yang telah mereka catat.
- **Fitur Utama**:
  - **Visualisasi D3.js**: Render graf dinamis di mana setiap simpul (*node*) merepresentasikan Catatan, Buku, Penulis, atau Konsep, dan garis (*edge*) menggambarkan koneksi antar-elemen.
  - **Filter Tipe Simpul**: Pengguna dapat menyembunyikan atau menampilkan tipe simpul tertentu untuk merapikan visualisasi graf.
  - **Pencarian & Penyorotan**: Ketik nama konsep untuk menyorot simpul yang relevan beserta koneksi terdekatnya (*neighbors*).

### 🔁 Latihan & Tinjauan (Spaced Repetition)
Sistem pelatihan memori berbasis sains kognitif untuk mencegah kurva lupa (*forgetting curve*).
- **Fungsi**: Mengunci pengetahuan penting ke dalam ingatan jangka panjang melalui kartu flash (*flashcards*).
- **Fitur Utama**:
  - **Algoritma SuperMemo-2 (SM-2)**: Melacak sejarah latihan pengguna dan menghitung hari tepat berikutnya kartu harus diulas kembali (interval) berdasarkan tingkat kesulitan ingatan.
  - **AI Flashcard Generator**: Cukup klik satu tombol pada catatan penting, AI akan otomatis memindai konten tersebut dan mengekstrak 5-10 kartu flash tanya-jawab yang esensial.
  - **AI Grading Assistant**: Saat menjawab kartu, pengguna tidak perlu mengetik jawaban persis sama dengan kunci jawaban. Cukup ketik pemahaman mereka, dan asisten AI akan menilai kebenaran konsep (*conceptual grading*) secara objektif dari skala kualitas 0-5.

---

## 4.4 Pilar 4: Ruang Kerja (Workspace Production)

### 💼 Proyek (Project Board)
Manajemen eksekusi tugas praktis untuk mengubah ilmu menjadi amal nyata.
- **Fungsi**: Menyusun tugas-tugas terukur berdasarkan ide atau proyek yang sedang dikerjakan.
- **Fitur Utama**:
  - **Status Proyek**: Melacak proyek dari fase *Planned*, *Active*, *Review*, *Completed*, hingga *Archived*.
  - **Sistem Daftar Tugas (Task Board)**: Menambahkan tugas-tugas konkret di bawah proyek, menyusun urutannya, dan mencentangnya setelah selesai dikerjakan.

### ✍️ Menulis (Draft Studio)
Studio penulisan kreatif bebas gangguan (*distraction-free writing studio*).
- **Fungsi**: Ruang tenang untuk merangkai karya tulis akhir seperti esai, artikel, buku, atau tugas akademik.
- **Fitur Utama**:
  - **Fokus Sunyi**: Antarmuka bersih tanpa panel samping yang mengalihkan perhatian untuk menulis draf panjang.
  - **Status Draf**: Mengelola perkembangan tulisan dari status *Idea*, *Outline*, *Draft*, *Editing*, *Review*, hingga *Published*.
  - **Integrasi Referensi Otak Kedua**: Mempermudah pengguna meninjau ulang catatan penting di Otak Kedua tanpa perlu keluar dari studio menulis.
