const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const ownerRoutes = require('./routes/owner');
const customerRoutes = require('./routes/customer');
const apiRoutes = require('./routes/api');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const defaultOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

function normalizeOrigin(origin) {
  return origin ? origin.trim().replace(/\/+$/, '') : '';
}

function parseOrigins(value) {
  return (value || '')
    .split(',')
    .map((origin) => normalizeOrigin(origin))
    .filter(Boolean);
}

const configuredOrigins = parseOrigins(process.env.ALLOWED_ORIGINS);
const allowedOrigins = new Set(
  configuredOrigins.length > 0 ? configuredOrigins : defaultOrigins.map(normalizeOrigin)
);
const allowAllOrigins = process.env.NODE_ENV === 'production' && configuredOrigins.length === 0;

if (allowAllOrigins) {
  console.warn('ALLOWED_ORIGINS is not set in production. Allowing all origins until it is configured.');
} else {
  console.log('Allowed CORS origins:', Array.from(allowedOrigins));
}

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

const app = express();
app.set('trust proxy', 1);
app.use(cors({
  origin(origin, callback) {
    const normalizedOrigin = normalizeOrigin(origin);

    if (!origin || allowAllOrigins || allowedOrigins.has(normalizedOrigin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    mongoReadyState: mongoose.connection.readyState,
    cors: allowAllOrigins ? 'open' : Array.from(allowedOrigins),
  });
});

app.use((req, res, next) => {
  console.log('Incoming request:', req.method, req.originalUrl);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/owner', ownerRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api', apiRoutes);

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
