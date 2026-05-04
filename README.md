# 🖨️ PrintPoint-LBS

**Smart Location-Based Service** untuk menemukan toko fotokopi & printing terdekat di Yogyakarta.

## 📐 Arsitektur 2 VM

Proyek ini dirancang untuk berjalan di **2 Virtual Machine** yang saling terhubung:

```
┌─────────────────────────────┐     ┌─────────────────────────────────────┐
│    VM 1 - WINDOWS 10        │     │      VM 2 - UBUNTU SERVER           │
│                             │     │                                     │
│  ┌───────────────────────┐  │     │  ┌─────────────────────────────┐   │
│  │  Container: Frontend  │  │────▶│  │  Container: Backend API     │   │
│  │  (React + Nginx)      │  │ HTTP│  │  (Node.js + Express)        │   │
│  │  Port: 80             │  │     │  │  Port: 3000                 │   │
│  └───────────────────────┘  │     │  └──────────┬──────────────────┘   │
│                             │     │             │ MySQL Query           │
│                             │     │  ┌──────────▼──────────────────┐   │
│                             │     │  │  Container: Database        │   │
│                             │     │  │  (MySQL 8.0)                │   │
│                             │     │  │  Port: 3306                 │   │
│                             │     │  └─────────────────────────────┘   │
└─────────────────────────────┘     └─────────────────────────────────────┘
```

## 🗄️ Database

MySQL menyimpan 2 tabel:
- **`users`** — Data pengguna (registrasi & login)
- **`shops`** — Data 45 toko fotokopi di Yogyakarta

## ⚡ Fitur
- 🔐 Login & Register (JWT Authentication)
- 🗺️ Peta interaktif (Leaflet.js)
- 📍 GPS untuk lokasi pengguna
- 🔍 Filter berdasarkan kategori & radius
- 🚀 Navigasi rute ke toko
- 💬 Link WhatsApp langsung

---

## 🚀 Langkah-langkah Setup

### Prasyarat

1. **Kedua VM harus satu jaringan (Network)**
   - Di VirtualBox: Setting Network → pilih **Bridged Adapter**
   - Di VMware: pilih **Bridged** mode
   
2. **Install Docker di kedua VM**
   - Windows 10: Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
   - Ubuntu Server: Jalankan perintah di bawah

#### Install Docker di Ubuntu Server:
```bash
sudo apt update
sudo apt install -y docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
# Logout dan login ulang agar grup docker aktif
```

3. **Catat IP Address masing-masing VM:**
   - Windows 10: Buka CMD → `ipconfig` → catat **IPv4 Address**
   - Ubuntu Server: `hostname -I` atau `ip addr show` → catat IP

---

### 🖥️ SETUP VM 2: Ubuntu Server (Backend + Database)

**Jalankan ini dulu sebelum VM Windows!**

1. **Copy folder `backend/` ke Ubuntu Server**
   
   Dari komputer host, gunakan SCP atau langsung clone dari GitHub:
   ```bash
   # Jika menggunakan git
   git clone <URL_REPOSITORY>
   cd PrintPoint-LBS/backend
   
   # Atau copy manual via SCP dari Windows
   # scp -r backend/ user@IP_UBUNTU:~/PrintPoint-LBS/backend/
   ```

2. **Masuk ke folder backend:**
   ```bash
   cd backend
   ```

3. **Jalankan Docker Compose:**
   ```bash
   docker-compose up -d --build
   ```

4. **Tunggu hingga semua container running:**
   ```bash
   docker-compose ps
   ```
   Pastikan `printpoint_backend` dan `printpoint_db` statusnya **Up**

5. **Verifikasi API berjalan:**
   ```bash
   curl http://localhost:3000/api/health
   ```
   Response yang diharapkan:
   ```json
   {
     "status": "OK",
     "message": "PrintPoint Backend API is running!",
     "database": "Connected"
   }
   ```

6. **Catat IP Address Ubuntu Server:**
   ```bash
   hostname -I
   ```
   Contoh output: `192.168.1.100`

---

### 💻 SETUP VM 1: Windows 10 (Frontend)

1. **Buka folder proyek `PrintPoint-LBS/`**

2. **Edit file `.env`** — ganti `VITE_API_URL` dengan IP Ubuntu Server:
   ```
   VITE_API_URL=http://192.168.1.100:3000
   ```
   > ⚠️ Ganti `192.168.1.100` dengan **IP Ubuntu Server yang sebenarnya!**

3. **Buka Docker Desktop** (pastikan sudah running)

4. **Buka terminal (PowerShell/CMD) di folder proyek, jalankan:**
   ```powershell
   docker-compose up -d --build
   ```

5. **Tunggu proses build selesai**, lalu buka browser:
   ```
   http://localhost
   ```

6. **Daftar akun baru** → klik "Daftar Sekarang" → isi form → klik "Daftar"

7. **Login** dengan akun yang baru dibuat

8. **Selamat! 🎉** Anda sekarang bisa melihat peta dan semua toko fotokopi

---

### 🔧 Mode Development (Tanpa Docker)

Jika ingin menjalankan tanpa Docker untuk development:

**Terminal 1 — Backend:**
```bash
cd backend
npm install
# Pastikan MySQL sudah running di localhost:3306
node seed.js    # Seed database (jalankan 1x saja)
npm start       # Jalankan API server
```

**Terminal 2 — Frontend:**
```bash
npm install
npm run dev -- --host
```

Buka `http://localhost:5173` di browser.

---

## 📋 API Endpoints

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | `/api/health` | ❌ | Health check |
| POST | `/api/auth/register` | ❌ | Daftar akun baru |
| POST | `/api/auth/login` | ❌ | Login |
| GET | `/api/auth/me` | ✅ | Info user saat ini |
| GET | `/api/shops` | ✅ | Semua data toko |
| GET | `/api/shops/:id` | ✅ | Data toko by ID |

**Auth Header:** `Authorization: Bearer <token>`

---

## 🛑 Troubleshooting

### Frontend tidak bisa konek ke backend?
1. Pastikan IP Ubuntu Server benar di `.env`
2. Pastikan firewall Ubuntu Server mengizinkan port 3000:
   ```bash
   sudo ufw allow 3000
   ```
3. Test dari Windows: buka browser → `http://IP_UBUNTU:3000/api/health`

### Container error di Ubuntu?
```bash
# Lihat log backend
docker-compose logs backend

# Lihat log database
docker-compose logs db

# Restart semua
docker-compose down
docker-compose up -d --build
```

### Ingin reset database?
```bash
cd backend
docker-compose down -v   # -v menghapus volume (data MySQL)
docker-compose up -d --build
```

---

## 📁 Struktur Proyek

```
PrintPoint-LBS/
├── backend/                    # 🖥️ VM 2 (Ubuntu Server)
│   ├── server.js               # Express API Server
│   ├── seed.js                 # Database seeder
│   ├── package.json            # Dependencies backend
│   ├── Dockerfile              # Docker image backend
│   ├── docker-compose.yml      # Backend + MySQL compose
│   ├── .env                    # Config database & JWT
│   └── .dockerignore
├── src/                        # 💻 VM 1 (Windows 10)
│   ├── App.jsx                 # Komponen utama (Map + Auth)
│   ├── RoutingMachine.jsx      # Navigasi rute Leaflet
│   ├── pages/
│   │   ├── LoginPage.jsx       # Halaman login
│   │   └── RegisterPage.jsx    # Halaman register
│   ├── index.css               # Styling auth pages
│   └── main.jsx                # Entry point React
├── public/
│   └── shops.json              # Data toko (fallback)
├── Dockerfile                  # Docker image frontend (Nginx)
├── docker-compose.yml          # Frontend compose
├── nginx.conf                  # Nginx configuration
├── .env                        # Config API URL
├── package.json                # Dependencies frontend
└── README.md                   # Dokumentasi ini
```

## 👥 Tim Pengembang

PrintPoint-LBS © 2025
