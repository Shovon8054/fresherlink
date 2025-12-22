import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  }
}, { timestamps: true });

export const Comment = mongoose.models.Comment || mongoose.model('Comment', commentSchema);

