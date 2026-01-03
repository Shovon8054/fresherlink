import express from 'express';
const router = express.Router();
import * as adminController from '../../controllers/admin.controller.js';
import { getDashboardStats } from '../../controllers/admin.controller.js';
import { auth, checkRole } from '../../middlewares/auth.js';

router.get('/stats', auth, checkRole('admin'), getDashboardStats);
router.get('/users', auth, checkRole('admin'), adminController.getAllUsers);
router.patch('/users/:id/status', auth, checkRole('admin'), adminController.updateUserStatus);
router.delete('/users/:id', auth, checkRole('admin'), adminController.deleteUser);
router.get('/posts', auth, checkRole('admin'), adminController.getAllPosts);
router.delete('/posts/:id', auth, checkRole('admin'), adminController.adminDeletePost);
router.delete('/posts/:postId/comments/:commentId', auth, checkRole('admin'), adminController.adminDeleteComment);

// Jobs Management
router.get('/jobs', auth, checkRole('admin'), adminController.adminGetAllJobs);
router.delete('/jobs/:id', auth, checkRole('admin'), adminController.adminDeleteJob);
router.patch('/jobs/:id/featured', auth, checkRole('admin'), adminController.adminToggleFeatured);
router.post('/jobs/cleanup', auth, checkRole('admin'), adminController.adminCleanupExpired);
router.post('/announce', auth, checkRole('admin'), adminController.adminSendAnnouncement);

export default router;
