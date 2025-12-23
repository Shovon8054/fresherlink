import express from 'express';
import { auth } from '../../middlewares/auth.js';
import { getMyNotifications, markAsRead } from '../../controllers/notification.controller.js';

const router = express.Router();

router.use(auth);

router.get('/', getMyNotifications);
router.put('/:id/read', markAsRead);

export default router;
