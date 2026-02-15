// NOKOSKU Backend - Updated Fix
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path'); // Pindahkan ke atas
const sequelize = require('../models/db');
const logger = require('../lib/logger');

const app = express();

// 1. Security & Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Matikan jika mengganggu load script Vite/Lottie
}));

const allowedOrigin = process.env.FRONTEND_ORIGIN || '*';
app.use(cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(compression()); // Performance

// Rate limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: 'Bentar ya, request terlalu banyak.'
});
app.use(limiter);

// 2. Database Sync
sequelize.sync({ force: false }).then(() => {
  console.log('DB synced');
}).catch(e => console.error('DB sync error:', e));

// 3. Health Check
app.get('/health', (req, res) => {
  logger.info('Health check requested');
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// 4. API Routes (WAJIB DITARUH SEBELUM FRONTEND)
app.use('/api/v1/auth', require('../routes/auth'));
app.use('/api/v1/user/profile', require('../routes/profile'));
app.use('/api/v1/deposit', require('../routes/deposit'));
app.use('/api/v1/orders', require('../routes/order'));
app.use('/api/v1/admin', require('../routes/admin'));

// 5. Serve Frontend (Vite Build)
// Mengarah ke folder frontend/dist (hasil build)
const frontendPath = path.join(__dirname, '../../frontend/dist');

// Serve file statis (js, css, images) dari folder dist
app.use(express.static(frontendPath));

// Jika ada folder lottie/assets manual di source (opsional, untuk jaga-jaga)
app.use('/lottie', express.static(path.join(__dirname, '../../frontend/lottie')));

// HANDLE SPA: Semua request lain diarahkan ke index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'), (err) => {
    if (err) {
      console.error("Error sending index.html:", err);
      res.status(500).send("Server Error: Frontend build not found. Did you run 'npm run build'?");
    }
  });
});

module.exports = app;
