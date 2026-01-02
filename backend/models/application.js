import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resume: {
    type: String,
    // required: true // Uncomment if resume is mandatory
  },
  coverLetter: {
    type: String
  },
  status: {
    type: String,
    enum: ['applied', 'shortlisted', 'rejected', 'accepted'],
    default: 'applied'
  },
  appliedAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent duplicate applications for the same job by the same student
applicationSchema.index({ jobId: 1, studentId: 1 }, { unique: true });

export const Application = mongoose.model('Application', applicationSchema);