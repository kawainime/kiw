// NOKOSKU Backend - Express 5 Compatible Version
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const sequelize = require('../models/db');
const logger = require('../lib/logger');

const app = express();

// 1. Security & Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Diperlukan agar script/asset frontend bisa diload lancar
}));

const allowedOrigin = process.env.FRONTEND_ORIGIN || '*';
app.use(cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(compression());

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
app.get('/api/health', (req, res) => {
  logger.info('Health check requested');
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// 4. API Routes
app.use('/api/v1/auth', require('../routes/auth'));
app.use('/api/v1/user/profile', require('../routes/profile'));
app.use('/api/v1/deposit', require('../routes/deposit'));
app.use('/api/v1/orders', require('../routes/order'));
app.use('/api/v1/admin', require('../routes/admin'));

// 5. Serve Frontend (Vite Build)
const frontendPath = path.join(__dirname, '../../frontend/dist');

// Serve file statis hasil build Vite
app.use(express.static(frontendPath));

// Perbaikan Express 5: Gunakan (.*) sebagai pengganti *
app.get('(.*)', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'), (err) => {
    if (err) {
      console.error("Error sending index.html:", err);
      res.status(500).send("Error: Frontend build belum ada. Jalankan 'npm run build' di folder frontend.");
    }
  });
});

module.exports = app;
