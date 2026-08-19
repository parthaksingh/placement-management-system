import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  placementDrive: { type: mongoose.Schema.Types.ObjectId, ref: 'PlacementDrive', required: true },
  currentStage: { type: String, default: 'Application' },
  status: {
    type: String,
    enum: ['APPLIED', 'PENDING', 'UNDER REVIEW', 'SHORTLISTED', 'NOT SHORTLISTED', 'REJECTED', 'SELECTED'],
    default: 'APPLIED'
  }
}, { timestamps: true });
schema.index({ student: 1, placementDrive: 1 }, { unique: true });
export default mongoose.model('Application', schema);
