import { Comment } from '../models/Comment.js';
import { Job } from '../models/Job.js';

export const addComment = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    // Verify job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const comment = new Comment({
      userId: req.user.id,
      jobId,
      text: text.trim()
    });

    await comment.save();
    
    // Populate user info for response
    await comment.populate('userId', 'email role');
    const { Profile } = await import('../models/Profile.js');
    const profile = await Profile.findOne({ userId: comment.userId._id });
    const name = comment.userId.role === 'company' ? (profile?.companyName || comment.userId.email) : (profile?.name || comment.userId.email);
    const photo = profile?.photo || null;
    
    res.status(201).json({
      message: 'Comment added successfully',
      comment: {
        ...comment.toObject(),
        userId: {
          ...comment.userId.toObject(),
          name,
          photo
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getJobComments = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Verify job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const comments = await Comment.find({ jobId })
      .populate('userId', 'email role')
      .sort({ createdAt: -1 });

    // Populate profile information for each comment
    const { Profile } = await import('../models/Profile.js');
    const commentsWithProfiles = await Promise.all(
      comments.map(async (comment) => {
        const profile = await Profile.findOne({ userId: comment.userId._id });
        const name = comment.userId.role === 'company' ? (profile?.companyName || comment.userId.email) : (profile?.name || comment.userId.email);
        const photo = profile?.photo || null;
        return {
          ...comment.toObject(),
          userId: {
            ...comment.userId.toObject(),
            name,
            photo
          }
        };
      })
    );

    res.json(commentsWithProfiles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Only the comment owner can delete their comment
    if (comment.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Unauthorized. You can only delete your own comments' });
    }

    await Comment.findByIdAndDelete(commentId);

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

