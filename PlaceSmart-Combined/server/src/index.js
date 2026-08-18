import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { auth, allow } from './auth.js';
import authRoutes from './routes/auth.js';
import studentRoutes from './routes/student.js';
import adminRoutes from './routes/admin.js';

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (_, res) => res.json({ ok: true, service: 'PlaceSmart Combined API' }));

// Auth (public)
app.use('/api/auth', authRoutes);

// Student routes (authenticated, STUDENT role only)
app.use('/api/student', auth, allow('STUDENT'), studentRoutes);

// Admin routes (authenticated, ADMIN role only)
app.use('/api/admin', auth, allow('ADMIN'), adminRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Unexpected server error' });
});

const port = process.env.PORT || 5050;
const uri = process.env.MONGODB_URI;
if (!uri) { console.error('MONGODB_URI is not set in server/.env'); process.exit(1); }

mongoose.connect(uri)
  .then(() => app.listen(port, () => console.log(`PlaceSmart Combined API running on port ${port}`)))
  .catch(e => { console.error('MongoDB connection failed:', e.message); process.exit(1); });
