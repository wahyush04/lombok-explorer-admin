# 🏝️ Lombok Explorer — Admin Management Portal

Portal administrasi terpadu untuk platform ekosistem pariwisata **Lombok Explorer**. Dashboard ini dirancang untuk mengelola seluruh siklus data destinasi, kategori master, kuliner, akomodasi, direktori pengguna, moderasi ulasan, laporan feed komunitas, template rencana perjalanan, dan audit trail keamanan secara real-time.

---

## 🚀 Fitur Utama

- **🔐 Autentikasi Administrator**: Login aman berbasis JWT Bearer Token, mekanisme perpanjangan token (*refresh token*), dan proteksi *rate-limiting*.
- **📊 Dashboard Analitik & KPI**: Metrik statistik sistem real-time (*overview counts*, *periodic metrics*, serta destinasi terpopuler & paling banyak difavoritkan).
- **📍 Manajemen Destinasi Wisata**: Pengelolaan lengkap 35+ destinasi Lombok, relasi kategori, koordinat peta geospasial, tiket masuk, fasilitas, dan galeri foto Cloudinary.
- **🏷️ Master Kategori Wisata**: Pengaturan kategori pariwisata (Pantai, Budaya Sasak, Air Terjun, Spot Sunset, dsb.).
- **🍲 Direktori Restoran & Kuliner**: Katalog kuliner khas Lombok (El Bazar Kuta, Ayam Taliwang, Warung Menega, Nasi Balap Puyung) dengan informasi sertifikasi halal, jam buka, dan rentang harga.
- **🏨 Direktori Akomodasi**: Pengelolaan penginapan (resort pesisir, villa, glamping pegunungan Sembalun) lengkap dengan fasilitas kamar dan tarif per malam.
- **👥 Direktori Pengguna (Users)**: Manajemen akun wisatawan dan kontrol status akses (`ACTIVE`, `SUSPENDED`, `DEACTIVATED`).
- **⭐ Moderasi Ulasan (Reviews)**: Verifikasi ulasan wisatawan komunitas, persetujuan/penolakan ulasan, penilaian rating bintang, dan galeri foto ulasan.
- **🗺️ Kurasi Template Itinerary**: Pengelolaan paket rencana perjalanan multi-hari (*day-by-day activities*) dan estimasi anggaran liburan.
- **🚩 Moderasi Laporan Konten Feed**: Penanganan laporan pelanggaran konten komunitas (*Spam*, *Inappropriate*, *Harassment*) dengan aksi resolusi dan kontrol visibilitas post (`PUBLISHED`, `HIDDEN`, `DELETED`).
- **🛡️ Audit Trail Logs**: Pencatatan riwayat aktivitas administratif sensitif untuk audit keamanan sistem.

---

## 🛠️ Teknologi yang Digunakan

- **Frontend Core**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Styling & UI**: [Tailwind CSS v4](https://tailwindcss.com/), [Lucide Icons](https://lucide.dev/), [Framer Motion](https://motion.dev/)
- **State & Data Fetching**: [TanStack React Query v5](https://tanstack.com/query), [Zustand](https://zustand-demo.pmnd.rs/)
- **Form & Validation**: [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/)
- **Runtime Server**: [Express.js](https://expressjs.com/) (Node.js 22 Alpine)
- **Spesifikasi API**: OpenAPI 3.0.3 ([`openapi-admin.yaml`](openapi-admin.yaml))
- **Containerization**: [Docker](https://www.docker.com/) (Multi-stage build) & [Docker Compose](https://docs.docker.com/compose/)

---

## ⚙️ Variabel Lingkungan (.env)

Salin berkas `.env.example` menjadi `.env` dan sesuaikan nilainya:

```env
# URL Basis API Backend Admin (Canonical)
NEXT_PUBLIC_API_BASE_URL=http://34.142.205.101:3000/api/v1/admin
VITE_API_BASE_URL=http://34.142.205.101:3000/api/v1/admin

# Port Server (Default: 3000)
PORT=3000
```

---

## 💻 Menjalankan Secara Lokal

### Prasyarat:
- [Node.js](https://nodejs.org/) v20+ atau v22+
- [npm](https://www.npmjs.com/) v10+

### Langkah Instalasi:

```bash
# 1. Pasang dependensi
npm install

# 2. Jalankan server development (Express + Vite HMR)
npm run dev

# 3. Akses aplikasi melalui peramban:
# http://localhost:3000
```

### Script Lainnya:
```bash
# Pemeriksaan tipe TypeScript
npm run lint

# Kompilasi bundle produksi
npm run build

# Menjalankan server produksi lokal
npm start
```

---

## 🐳 Menjalankan Menggunakan Docker

Proyek ini telah dikonfigurasi dengan *multi-stage Docker build* yang aman, ringan (berbasis Node Alpine), dan menggunakan akun non-root (`USER node`).

### Menggunakan Docker Compose (Direkomendasikan):

```bash
# Menjalankan kontainer di latar belakang
docker compose up -d

# Memantau log aktivitas kontainer
docker compose logs -f

# Memeriksa status kesehatan kontainer
docker ps --filter "name=lombok-explorer-admin"

# Menghentikan kontainer
docker compose down
```

### Menggunakan Docker CLI Langsung:

```bash
# 1. Build image Docker
docker build -t lombok-explorer-admin:latest .

# 2. Jalankan kontainer
docker run -d --name lombok-explorer-admin -p 3000:3000 lombok-explorer-admin:latest

# 3. Buka dashboard di browser
# http://localhost:3000
```

---

## 📖 Dokumentasi API

Seluruh integrasi API mengacu pada spesifikasi OpenAPI 3.0.3 yang terdokumentasi lengkap pada berkas:
- [`openapi-admin.yaml`](openapi-admin.yaml)

---

## 👨‍💻 Kontributor

- **Lombok Explorer Engineering Team**
- Email: [wahyush04@gmail.com](mailto:wahyush04@gmail.com)
- Repository: [https://github.com/wahyush04/lombok-explorer-admin](https://github.com/wahyush04/lombok-explorer-admin)
