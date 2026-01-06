import express from 'express';
import { auth, checkRole } from '../../middlewares/auth.js';
import { addComment, getJobComments, deleteComment } from '../../controllers/comment.controller.js';

const router = express.Router();

// Delete comment (student only, own comments)
router.delete('/:commentId', auth, checkRole('student'), deleteComment);

export default router;

