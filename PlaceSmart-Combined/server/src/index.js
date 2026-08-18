import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { auth, allow } from './auth.js';
import authRoutes from './routes/auth.js';
import studentRoutes from './routes/student.js';
import adminRoutes from './routes/admin.js';

const app = express();
const allowedOrigins = (process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    // Allow non-browser requests and all origins until CLIENT_ORIGIN is configured.
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Origin is not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Health check
app.get('/api/health', (_, res) => res.json({ ok: true, service: 'PlaceSmart Combined API' }));

// Auth (public)
app.use('/api/auth', authRoutes);

// Student routes (authenticated, STUDENT role only)
app.use('/api/student', auth, allow('STUDENT'), studentRoutes);

// Admin routes (authenticated, ADMIN role only)
app.use('/api/admin', auth, allow('ADMIN'), adminRoutes);

// Always return JSON to API clients, including for unknown routes.
app.use('/api', (req, res) => {
  res.status(404).json({ message: `API route not found: ${req.method} ${req.originalUrl}` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || (err.type === 'entity.parse.failed' ? 400 : 500);
  res.status(status).json({ message: status === 500 ? 'Unexpected server error' : err.message });
});

const port = process.env.PORT || 5050;
const uri = process.env.MONGODB_URI;
if (!uri) { console.error('MONGODB_URI is not set in server/.env'); process.exit(1); }

mongoose.connect(uri)
  .then(() => app.listen(port, () => console.log(`PlaceSmart Combined API running on port ${port}`)))
  .catch(e => { console.error('MongoDB connection failed:', e.message); process.exit(1); });
