import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['internship', 'full-time'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  requirements: String,
  location: String,
  salary: String,
  deadline: Date,
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default mongoose.model('Job', jobSchema);