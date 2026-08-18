import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  registrationNumber: { type: String, sparse: true, uppercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['STUDENT', 'ADMIN'], default: 'STUDENT' },
  active: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('User', schema);
