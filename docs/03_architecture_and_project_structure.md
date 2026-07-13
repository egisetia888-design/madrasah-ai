# 🛠️ 03. Arsitektur Sistem dan Struktur Proyek

## 3.1 Arsitektur Sistem Umum
**Remix: Madrasah** mengusung arsitektur **Full-Stack Single Container** yang menggabungkan kecepatan Single Page Application (SPA) berbasis React dengan keandalan server Express.js di sisi backend.

```
+--------------------------------------------------------------+
|                     PERAMBAN PENGGUNA (CLIENT)               |
|                                                              |
|   +--------------------+               +------------------+  |
|   |   Zustand Store    | <-----------> |  React Frontend  |  |
|   | (State Persistence)|               | (Vite SPA)       |  |
|   +--------------------+               +------------------+  |
+--------------------------------------------------|-----------+
                                                   |
                                                   | (HTTPS/JSON)
                                                   v
+--------------------------------------------------------------+
|                     SERVER BACKEND (EXPRESS)                 |
|                                                              |
|   +-------------------+                +------------------+  |
|   |   Caching Engine  | <------------> | API Gateway &    |  |
|   |  (In-Memory Map)  |                | Rate Limiters    |  |
|   +-------------------+                +------------------+  |
|                                                  |           |
+--------------------------------------------------|-----------+
                                                   |
                                                   | (HTTPS / REST)
                                                   v
                                         +-------------------+
                                         |   OpenRouter AI   |
                                         |    (LLM Proxy)    |
                                         +-------------------+
```

### 1. Sisi Klien (Frontend Client)
Aplikasi klien dibangun menggunakan **React 18+** dan dikompilasi menggunakan **Vite 6**. Seluruh pengelolaan status aplikasi (*global state*) dikonsolidasikan menggunakan **Zustand**. Keuntungan pola ini adalah:
- **Keringan & Kepatuhan**: Zustand tidak memerlukan pembungkus *Provider* berlebih, meminimalkan rendering ulang yang tidak perlu.
- **Persistensi Lokal**: Data disimpan langsung di peramban menggunakan `localStorage` agar pengguna tidak kehilangan pekerjaan mereka meskipun menutup tab atau menyegarkan halaman peramban.

### 2. Sisi Server (Backend Gateway)
Server backend menggunakan **Express.js** yang berjalan di Node.js. Server ini memiliki tanggung jawab krusial:
- **Keamanan API Key**: Menjaga rahasia `OPENROUTER_API_KEY` dari jangkauan pihak luar. Aplikasi frontend tidak pernah berkomunikasi langsung dengan pihak ketiga AI, melainkan melalui endpoint proxy `/api/ai/*`.
- **Rate Limiting**: Melindungi server dari kelebihan beban dan membatasi penyalahgunaan API menggunakan `express-rate-limit`.
- **In-Memory Cache**: Menyimpan respons AI secara berkala (TTL 1 jam) berdasarkan kemiripan payload permintaan untuk memotong biaya API dan mempercepat waktu tunggu pengguna.

---

## 3.2 Struktur Proyek Aktual

Struktur direktori Madrasah diorganisasikan secara modular untuk memastikan skalabilitas jangka panjang dan kemudahan navigasi:

```
/remix-madrasah
├── .env.example              # Template konfigurasi variabel lingkungan
├── AGENTS.md                 # Aturan wajib khusus untuk AI Agent coding
├── README.md                 # Gerbang utama dan daftar isi dokumentasi
├── server.ts                 # Server Express.js (entry point backend)
├── package.json              # Definisi dependensi dan naskah otomasi
├── vite.config.ts            # Konfigurasi pembangun Vite
├── tsconfig.json             # Konfigurasi TypeScript compiler
├── public/                   # Berkas statis publik (favicon, assets)
├── docs/                     # Direktori dokumentasi resmi (Single Source of Truth)
└── src/                      # Source code utama frontend
    ├── App.tsx               # Komponen akar React
    ├── main.tsx              # Entry point frontend
    ├── index.css             # Berkas Tailwind CSS & deklarasi @theme
    ├── app/                  # Infrastruktur dasar aplikasi
    │   └── Router.tsx        # Sistem perutean berbasis react-router-dom
    ├── components/           # Komponen UI global dan tata letak
    │   ├── layout/           # MainLayout, Sidebar, MobileNav, CommandPalette, OnboardingTour
    │   └── ui/               # Komponen atomik atom (Button, Dialog)
    ├── store/                # Zustand stores untuk manajemen state
    │   ├── notesStore.ts
    │   ├── projectsStore.ts
    │   ├── reviewStore.ts
    │   ├── tourStore.ts
    │   ├── uiStore.ts
    │   └── writingStore.ts
    ├── types/                # Definisi tipe data TypeScript global (index.ts)
    ├── utils/                # Fungsi pembantu utilitas umum (cn.ts)
    └── modules/              # Pembagian fitur berbasis modul fungsional
        ├── auth/             # Autentikasi dan login page
        ├── dashboard/        # Beranda (Mission Control) & jam Hijriah
        ├── analytics/        # Laporan visual metrik produktivitas
        ├── notes/            # Catatan digital / inbox Zettelkasten
        ├── graph/            # Visualisasi D3.js Knowledge Graph
        ├── review/           # Modul pengulangan berjarak (Spaced Repetition)
        ├── library/          # Koleksi buku & literatur
        ├── curriculum/       # Silabus studi terstruktur & AI Syllabus Planner
        ├── projects/         # Manajemen proyek personal
        └── writing/          # Studio penulisan sunyi
```

---

## 3.3 Tumpukan Teknologi Utama

| Modul Teknologi | Pustaka yang Digunakan | Justifikasi Pemilihan |
| :--- | :--- | :--- |
| **Kerangka Kerja** | React 18+ & Vite 6 | Kecepatan bundling super cepat di sisi pengembangan dan struktur modular yang matang. |
| **Bahasa Pemrograman**| TypeScript 5 | Membantu deteksi kesalahan ketik pada struktur data rumit sebelum kode didorong ke produksi. |
| **Gaya Visual** | Tailwind CSS v4 | Optimasi CSS modern, ukuran berkas akhir sangat ringan, dan memangkas kebutuhan file CSS terpisah. |
| **Animasi** | Motion (`motion/react`) | Standar industri untuk transisi mikro yang halus, teruji, dan ramah performa peramban. |
| **Manajemen Status** | Zustand | Sangat ringan, tidak memiliki boilerplates berlebih seperti Redux, dan sangat mudah diintegrasikan dengan penyimpanan lokal. |
| **Visualisasi Data** | D3.js & Recharts | D3.js untuk fleksibilitas mutlak merancang Graf Pengetahuan interaktif; Recharts untuk grafik performa yang bersih. |
| **Server Samping** | Express.js & Tsx | Sangat cepat melayani rute API, mudah dihubungkan dengan middleware, serta kompatibel dengan ekosistem container. |

---

## 3.4 Standar Koding & Pengemasan Produksi

Proyek ini memberlakukan aturan kompilasi ketat untuk mencegah kegagalan di lingkungan Cloud Run / Production:

### 1. Type Safety Mutlak
- Dilarang keras menggunakan tipe implisit `any` atau penanda `never` yang dipaksakan. Seluruh data hasil manipulasi API atau Zustand harus terikat pada model di `src/types/index.ts`.
- Pemeriksaan sintaksis dijalankan otomatis melalui `npm run lint` (yang memicu `tsc --noEmit`).

### 2. Strategi Bundling Server Esbuild
Untuk mengatasi masalah ketidakcocokan ESM (*ES Modules*) dan CJS (*CommonJS*) pada impor berkas di lingkungan server Node.js standar, proses pembentukan kode produksi dikonfigurasi sebagai berikut:
```json
"build": "vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs"
```
Dengan membungkus server backend menggunakan **esbuild** ke format CJS (`dist/server.cjs`), seluruh jalur impor relatif internal diselesaikan saat build, menyisakan pustaka luar pihak ketiga sebagai referensi eksternal yang aman dan mempercepat waktu boot container secara signifikan.
