# 📊 05. Model Data dan Integrasi API Backend

Seluruh struktur data di dalam **Madrasah — Personal Knowledge Operating System** diketik secara ketat menggunakan TypeScript di sisi klien dan diterjemahkan ke dalam interaksi rute API terstruktur untuk integrasi AI di sisi server.

---

## 5.1 Spesifikasi Model Data (TypeScript Schemas)

Semua entitas data dideklarasikan di `src/types/index.ts` untuk menjamin konsistensi di seluruh modul frontend. Berikut adalah struktur utama model datanya:

### 1. Entitas Literatur (Pustaka)
```typescript
export interface Author {
  id: string;          // UUID v4
  name: string;        // Nama lengkap penulis/tokoh
  createdAt: number;   // Timestamp ms
}

export interface Book {
  id: string;          // UUID v4
  title: string;       // Judul buku/kitab/makalah
  authorId: string | null;  // Referensi ke Author.id
  categoryId: string | null;// Referensi ke kategori pustaka
  status: 'wishlist' | 'owned' | 'reading' | 'finished' | 'summarized' | 'connected' | 'applied' | 'published';
  progress: number;    // Progres membaca (halaman aktif)
  totalPages?: number; // Total halaman buku
  coverImage?: string; // Tautan URL gambar sampul
  createdAt: number;
  updatedAt: number;
}
```

### 2. Entitas Zettelkasten (Otak Kedua)
```typescript
export interface Note {
  id: string;
  title: string;
  content: string;     // Konten catatan dalam sintaks Markdown
  type: 'knowledge' | 'project' | 'writing' | 'personal';
  status: 'unprocessed' | 'processed';
  sourceId?: string | null; // Referensi ke Book.id (jika catatan berasal dari buku)
  folderId: string | null;  // Referensi ke Folder.id
  tags: string[];           // Daftar ID Tag terkait
  createdAt: number;
  updatedAt: number;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null; // Struktur folder hierarkis tak terbatas
  createdAt: number;
}
```

### 3. Entitas Spaced Repetition (Review)
```typescript
export interface Deck {
  id: string;
  name: string;
  description: string;
  noteId?: string | null;   // Wajib terikat pada Note.id asal
  createdAt: number;
  updatedAt: number;
}

export interface Flashcard {
  id: string;
  front: string;            // Pertanyaan kartu
  back: string;             // Kunci jawaban kartu
  deckId: string | null;    // Referensi ke Deck.id
  noteId?: string | null;   // Referensi ke Note.id asal
  interval: number;         // Jeda waktu pengulangan berikutnya (dalam hari)
  repetition: number;       // Jumlah pengulangan sukses berturut-turut
  efactor: number;          // Easiness Factor (E-Factor) algoritma SM-2
  dueDate: number;          // Timestamp batas pengerjaan review
  createdAt: number;
  updatedAt: number;
}
```

---

## 5.2 Antarmuka API Backend (Express Router)

Server backend (`server.ts`) mengekspos endpoint fungsional khusus untuk memproses kecerdasan buatan (AI) secara aman tanpa membebaskan browser pengguna dari beban komputasi langsung:

| Endpoint | Metode | Parameter Payload (JSON) | Deskripsi Respons (JSON) | Peran AI & Model |
| :--- | :--- | :--- | :--- | :--- |
| `/api/ai/zettelkasten` | `POST` | `{ prompt: string, notes: Note[] }` | `{ result: string }` | Menerima instruksi analisis dari pengguna, membaca context seluruh catatan yang dikirimkan, lalu merumuskan sintesis baru dalam sintaks Markdown. |
| `/api/ai/suggest-tags` | `POST` | `{ content: string, notes: Note[] }` | `{ tags: string[], connections: string[] }` | Menganalisis catatan baru untuk memberikan rekomendasi tag fungsional dan menyarankan catatan lama yang relevan untuk saling dihubungkan. |
| `/api/ai/generate-flashcards` | `POST` | `{ content: string }` | `{ flashcards: [{ front: string, back: string }] }` | Membaca catatan penting secara komprehensif untuk mengekstrak daftar pertanyaan & jawaban terbaik guna pembuatan kartu ulasan otomatis. |
| `/api/ai/grade-flashcard` | `POST` | `{ question: string, correctAnswer: string, userAnswer: string }` | `{ isCorrect: boolean, quality: number, feedback: string }` | Menilai keselarasan konseptual dari jawaban pengguna dibandingkan kunci jawaban asli berdasarkan skala kualitas SuperMemo-2 (skala 0-5). |
| `/api/ai/generate-syllabus` | `POST` | `{ topic: string }` | `{ title: string, description: string, phases: [...] }` | Merancang kurikulum modular baru lengkap dengan Fase Belajar dan Kompetensi dari topik masukan pengguna. |
| `/api/ai/summarize-literature` | `POST` | `{ content: string }` | `{ problem: string, methodology: string, conclusion: string }` | Memindai dokumen akademik panjang untuk menyaring tiga intisari utama: Masalah Utama, Metodologi, dan Kesimpulan Akhir. |

---

## 5.3 Keamanan, Kontrol Trafik, dan Optimasi

Untuk melindungi infrastruktur server serta menghemat biaya konsumsi API pihak ketiga, server Express.js di Madrasah dilengkapi tiga lapisan proteksi internal:

### 1. Pembatasan Frekuensi (Rate Limiting)
- **API Limiter Umum** (`/api/*`): Membatasi setiap alamat IP pengguna maksimal 100 panggilan dalam jendela waktu 15 menit.
- **AI Limiter Khusus** (`/api/ai/*`): Membatasi panggilan AI yang mahal secara komputasi maksimal 15 permintaan per IP per menit untuk menghindari serangan *Denial of Service* (DoS) pada kuota API.

### 2. In-Memory Caching Engine
Server mendirikan mekanisme cache memori internal (`aiCache`) dengan masa aktif (Time-To-Live / TTL) selama **1 jam**.
- Setiap kali ada permintaan AI masuk, server membuat kunci unik berdasarkan hash payload body.
- Jika permintaan dengan isi payload yang sama masuk kembali sebelum batas waktu TTL berakhir, server akan mengembalikan hasil instan dari cache memori tanpa melakukan transaksi HTTP ulang ke penyedia AI luar.

### 3. Pembersihan JSON Kokoh (Robust JSON Parsing)
Respons dari model bahasa besar (LLM) sering kali terkontaminasi oleh blok kode Markdown tambahan (misalnya: \`\`\`json ... \`\`\`). Server Madrasah dilengkapi fungsi pembersihan ekspresi reguler khusus (`cleanAndParseJson`) untuk mengekstrak payload JSON murni secara andal sebelum dikembalikan ke aplikasi klien, mencegah terjadinya kerusakan tipe data (*runtime parsing crash*).
