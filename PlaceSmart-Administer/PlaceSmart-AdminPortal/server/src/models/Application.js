import mongoose from 'mongoose';
const schema = new mongoose.Schema({ student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true }, company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true }, placementDrive: { type: mongoose.Schema.Types.ObjectId, ref: 'PlacementDrive', required: true }, currentStage: { type: String, default: 'Application' }, status: { type: String, enum: ['PENDING', 'UNDER REVIEW', 'SHORTLISTED', 'REJECTED', 'SELECTED'], default: 'PENDING' } }, { timestamps: true });
export default mongoose.model('Application', schema);
