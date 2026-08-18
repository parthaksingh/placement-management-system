import mongoose from 'mongoose';
const schema = new mongoose.Schema({ name: { type: String, required: true }, industry: String, description: String, location: String, website: String, recruiterName: String, recruiterEmail: String, recruiterPhone: String, status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' } }, { timestamps: true });
export default mongoose.model('Company', schema);
