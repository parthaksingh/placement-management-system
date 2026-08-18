import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  jobTitle: { type: String, required: true },
  description: String,
  location: String,
  workMode: { type: String, enum: ['On-site', 'Hybrid', 'Remote'], default: 'On-site' },
  package: String,
  applicationDeadline: Date,
  minimumCgpa: Number,
  allowedBranches: [String],
  requiredSkills: [String],
  status: { type: String, enum: ['DRAFT', 'ACTIVE', 'CLOSED'], default: 'ACTIVE' }
}, { timestamps: true });
export default mongoose.model('PlacementDrive', schema);
