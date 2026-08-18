import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  placementDrive: { type: mongoose.Schema.Types.ObjectId, ref: 'PlacementDrive', required: true },
  roundName: String,
  roundType: { type: String, enum: ['Aptitude', 'Technical', 'Coding', 'HR', 'Final Interview'] },
  date: Date,
  time: String,
  location: String,
  meetingLink: String,
  description: String,
  status: { type: String, enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED'], default: 'SCHEDULED' },
  result: String
}, { timestamps: true });
export default mongoose.model('InterviewRound', schema);
