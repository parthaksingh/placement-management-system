import mongoose from 'mongoose';
// Student is linked to a User account (for student login)
// AND has its own profile fields used by both portals.
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  // Profile fields (displayed in admin portal student management)
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  registrationNumber: { type: String, unique: true, sparse: true },
  branch: String,
  cgpa: Number,
  graduationYear: Number,
  phone: String,
  skills: [String],
  resume: String,
  status: { type: String, enum: ['ACTIVE', 'PLACED', 'INACTIVE'], default: 'ACTIVE' }
}, { timestamps: true });
export default mongoose.model('Student', schema);
