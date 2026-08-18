import 'dotenv/config';
import mongoose from 'mongoose';
import { ensureDemoAccounts } from './demo-users.js';

if (!process.env.MONGODB_URI) {
  console.error('Set MONGODB_URI before running this script.');
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI);
await ensureDemoAccounts();

console.log('Demo accounts are ready: ADMIN001 and PS2022001 (Password123!).');
await mongoose.disconnect();
