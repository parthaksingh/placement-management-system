import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  placementDrive: { type: mongoose.Schema.Types.ObjectId, ref: 'PlacementDrive', required: true },
  interviewRound: { type: mongoose.Schema.Types.ObjectId, ref: 'InterviewRound', required: true },
  result: { type: String, enum: ['PENDING', 'PASSED', 'FAILED'], default: 'PENDING' }
}, { timestamps: true });

// A student can be assigned to a particular scheduled round once only.
schema.index({ student: 1, interviewRound: 1 }, { unique: true });

export default mongoose.model('InterviewAssignment', schema);
