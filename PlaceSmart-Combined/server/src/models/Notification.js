import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  targetAudience: {
    type: String,
    enum: ['ALL_STUDENTS', 'DRIVE_STUDENTS', 'SHORTLISTED_STUDENTS', 'SELECTED_STUDENTS', 'INDIVIDUAL'],
    required: true
  },
  placementDrive: { type: mongoose.Schema.Types.ObjectId, ref: 'PlacementDrive' },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  read: { type: Boolean, default: false }
}, { timestamps: true });
export default mongoose.model('Notification', schema);
