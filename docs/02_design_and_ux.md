# 🎨 02. Desain dan Sistem Pengalaman Pengguna (UI/UX)

## 2.1 Prinsip Desain Utama

Estetika visual dan interaksi di dalam **Madrasah — Personal Knowledge Operating System** dipandu oleh tiga prinsip dasar:

### 1. Minimalisme Monokrom (Monochrome Zen)
Sesuai dengan arahan terbaru untuk mendukung kejernihan berpikir tanpa distraksi visual, Madrasah mengadopsi palet warna monokromatik hitam-putih yang ketat:
- **Latar Belakang**: Kombinasi abu-abu ultra-lembut (`bg-gray-50/50`) dan putih murni (`bg-white`) untuk meminimalkan ketegangan mata.
- **Teks**: Menggunakan abu-abu gelap pekat (`text-gray-900`) untuk tingkat keterbacaan yang tinggi, dan abu-abu sedang (`text-gray-500` / `text-gray-600`) untuk sub-informasi dan metadata.
- **Aksen & Batas**: Garis batas yang sangat tipis (`border-gray-200` atau `border-gray-100`) untuk pembagian layout tanpa membuat layar terasa padat.
- **Tanpa Palette Colors**: Seluruh aksen warna sekunder (seperti biru, indigo, merah, hijau) telah dihapus total. Satu-satunya kontras didapatkan dari variasi intensitas warna hitam, putih, dan abu-abu.

### 2. Kejujuran Arsitektur (Anti-AI-Slop & No Tech-Larping)
Madrasah menolak keras elemen dekoratif tiruan yang sering kali ditambahkan hanya untuk membuat antarmuka terlihat canggih secara semu. 
- Tidak ada baris status buatan seperti `● ONLINE`, `● ACTIVE`, `CORE_NODE_ONLINE`, atau log sistem tiruan.
- Label antarmuka bersifat humble, literal, dan manusiawi (misalnya: "Jam Hijriah", "Misi Kontrol", "Draf Tulisan", bukan istilah meta-fiksi seperti "Chronos Meter").
- Setiap komponen di layar harus memiliki fungsi praktis bagi pengguna, bukan sekadar hiasan.

### 3. Keberpihakan pada Konten (Content First)
Fokus utama pengguna adalah membaca, merenung, menulis, dan melatih ingatan. Oleh karena itu:
- Navigasi diminimalkan agar tidak memakan porsi layar yang berharga.
- Teks paragraf menggunakan jenis font sans yang sangat terbaca dengan tinggi baris (*line-height*) yang optimal dan pembatasan lebar paragraf (*max-width*) agar nyaman dibaca dalam waktu lama.
- Animasi mikro dihadirkan secara fungsional melalui pustaka `motion` untuk memberikan umpan balik aksi (seperti transisi dialog modal, hover tombol, dan perpindahan tab), bukan sekadar gerakan kosmetik.

---

## 2.2 Spesifikasi Design System

| Kategori | Elemen Desain | Kelas Tailwind Terkait | Keterangan |
| :--- | :--- | :--- | :--- |
| **Tipografi** | Display (Judul Utama) | `font-display` (Plus Jakarta Sans) | Memberikan karakter modern, ramah, dan profesional pada setiap tajuk. |
| | Body (Isi Teks) | `font-sans` (Inter) | Keterbacaan optimal di berbagai resolusi layar ponsel maupun monitor desktop. |
| | Code / Meta | `font-mono` (JetBrains Mono) | Menampilkan metadata waktu, kode, angka, statistik, dan status teknis. |
| **Lengkukan** | Kartu Utama / Dialog | `rounded-2xl` | Memberikan kesan modern dan ramah pada elemen kontainer berukuran besar. |
| | Tombol / Input | `rounded-xl` | Standar konsisten untuk area interaktif berukuran kecil-menengah. |
| **Warna** | Latar Belakang | `bg-gray-50/50` / `bg-white` | Bersih, sejuk, dan konsisten di seluruh modul. |
| | Teks Utama | `text-gray-900` | Kontras tinggi tanpa terlalu tajam di mata. |
| | Teks Sekunder | `text-gray-500` | Digunakan untuk petunjuk input, metadata, atau teks pendukung. |
| | Batas Elemen | `border-gray-200` | Garis pembatas tipis yang elegan dan transparan. |

---

## 2.3 Standar Lintas Perangkat (Responsive Mastery)

Madrasah dirancang dengan pendekatan desktop-first untuk fungsionalitas kognitif berat, tetapi dioptimalkan secara penuh untuk akses mobile yang nyaman melalui panduan berikut:

### 1. Navigasi Bawah Mobile (Bottom Navigation)
Di layar ponsel (resolusi kurang dari `md`), bilah navigasi samping desktop disembunyikan dan diganti dengan bilah navigasi bawah (`MobileNav`) yang menempel tetap (*sticky*). Menu utama diletakkan dalam jangkauan ibu jari pengguna dengan tinggi sentuh minimal **44px** (`h-11`) untuk meminimalkan salah ketuk.

### 2. Penataan Layering (Z-Index Harmony)
Untuk menjamin tidak adanya tumpang tindih visual yang merusak fungsionalitas:
- **Mobile Nav**: Diberikan kelas `z-40` atau `z-50`.
- **Dialog Modal / Popup**: Wajib diletakkan pada kelas **`z-[100]`** serta dilapisi efek blur redup (`backdrop-blur-[4px] bg-black/45`) di latar belakang untuk memisahkan fokus kognitif secara tegas.

### 3. Penyaringan Pintar (Smart Accordion Drawer)
Panel penyaringan data yang kompleks (seperti pada modul **Catatan**) secara dinamis berubah menjadi tombol lipat interaktif di layar mobile. Pengguna dapat membuka filter hanya saat membutuhkannya, memberikan ruang maksimal pada tabel catatan utama.

### 4. Bottom Sheet Detail Simpul Graf
Pada tampilan visualisasi Graf Pengetahuan di layar mobile, informasi detail mengenai simpul yang dipilih tidak diletakkan di sidebar samping kanan (seperti di desktop), melainkan meluncur mulus sebagai panel dari bawah layar (*bottom sheet*) untuk kegunaan satu tangan yang maksimal.
