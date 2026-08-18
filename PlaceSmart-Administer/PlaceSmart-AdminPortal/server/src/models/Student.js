import mongoose from 'mongoose';
const schema = new mongoose.Schema({ name: { type: String, required: true }, email: { type: String, required: true, unique: true }, registrationNumber: { type: String, required: true, unique: true }, branch: String, cgpa: Number, graduationYear: Number, phone: String, skills: [String], resume: String, status: { type: String, enum: ['ACTIVE', 'PLACED', 'INACTIVE'], default: 'ACTIVE' } }, { timestamps: true });
export default mongoose.model('Student', schema);
