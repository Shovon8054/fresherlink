import express from 'express';
import { auth, checkRole } from '../../middlewares/auth.js';
import { addComment, getJobComments, deleteComment } from '../../controllers/comment.controller.js';

const router = express.Router();

// Get comments for a job (public, but auth recommended for better UX)
router.get('/jobs/:jobId/comments', getJobComments);

// Add comment (student only)
router.post('/jobs/:jobId/comments', auth, checkRole('student'), addComment);

// Delete comment (student only, own comments)
router.delete('/comments/:commentId', auth, checkRole('student'), deleteComment);

export default router;

