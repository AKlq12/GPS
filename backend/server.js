// ============================================
// PrintPoint-LBS Backend API Server
// ============================================
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;

// --- MIDDLEWARE ---
app.use(cors({
  origin: '*', // Izinkan semua origin (untuk development antar VM)
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// --- DATABASE CONNECTION POOL ---
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER || 'printpoint_user',
  password: process.env.DB_PASSWORD || 'userpassword',
  database: process.env.DB_NAME || 'printpoint_db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// --- JWT MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Akses ditolak. Token tidak ditemukan.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'printpoint_super_secret_key_2025');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token tidak valid atau sudah expired.' });
  }
};

// ============================================
// AUTH ROUTES
// ============================================

// POST /api/auth/register - Daftar akun baru
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validasi input
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nama, email, dan password wajib diisi.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password minimal 6 karakter.' });
    }

    // Cek apakah email sudah terdaftar
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email sudah terdaftar. Silakan login.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Simpan user baru
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    res.status(201).json({
      message: 'Registrasi berhasil! Silakan login.',
      userId: result.insertId
    });
  } catch (err) {
    console.error('Register Error:', err);
    res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
  }
});

// POST /api/auth/login - Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validasi input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email dan password wajib diisi.' });
    }

    // Cari user berdasarkan email
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Email atau password salah.' });
    }

    const user = users[0];

    // Verifikasi password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Email atau password salah.' });
    }

    // Buat JWT token (berlaku 24 jam)
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      process.env.JWT_SECRET || 'printpoint_super_secret_key_2025',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login berhasil!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
  }
});

// GET /api/auth/me - Get current user info (Protected)
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, name, email, created_at FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User tidak ditemukan.' });
    }
    res.json({ user: users[0] });
  } catch (err) {
    console.error('Get User Error:', err);
    res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
  }
});

// ============================================
// SHOP ROUTES (Protected - harus login dulu)
// ============================================

// GET /api/shops - Get semua toko
app.get('/api/shops', authenticateToken, async (req, res) => {
  try {
    const [shops] = await pool.query('SELECT * FROM shops ORDER BY id ASC');
    res.json(shops);
  } catch (err) {
    console.error('Get Shops Error:', err);
    res.status(500).json({ error: 'Gagal mengambil data toko.' });
  }
});

// GET /api/shops/:id - Get toko by ID
app.get('/api/shops/:id', authenticateToken, async (req, res) => {
  try {
    const [shops] = await pool.query('SELECT * FROM shops WHERE id = ?', [req.params.id]);
    if (shops.length === 0) {
      return res.status(404).json({ error: 'Toko tidak ditemukan.' });
    }
    res.json(shops[0]);
  } catch (err) {
    console.error('Get Shop Error:', err);
    res.status(500).json({ error: 'Gagal mengambil data toko.' });
  }
});

// ============================================
// HEALTH CHECK
// ============================================
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      status: 'OK',
      message: 'PrintPoint Backend API is running!',
      database: 'Connected',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Database connection failed',
      database: 'Disconnected'
    });
  }
});

// --- ROOT ROUTE ---
app.get('/', (req, res) => {
  res.json({
    name: 'PrintPoint-LBS Backend API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      me: 'GET /api/auth/me',
      shops: 'GET /api/shops',
      shopById: 'GET /api/shops/:id'
    }
  });
});

// --- START SERVER ---
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 PrintPoint Backend API berjalan di http://0.0.0.0:${PORT}`);
  console.log(`📋 Health Check: http://localhost:${PORT}/api/health`);
});
