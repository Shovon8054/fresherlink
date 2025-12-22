import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  }
}, { timestamps: true });


favoriteSchema.index({ studentId: 1, jobId: 1 }, { unique: true });

export const Favorite = mongoose.models.Favorite || mongoose.model('Favorite', favoriteSchema);