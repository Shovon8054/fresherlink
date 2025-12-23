import express from 'express';
import { auth } from '../../middlewares/auth.js';
import { getAllUsers, followUser, unfollowUser } from '../../controllers/user.controller.js';

const router = express.Router();

router.use(auth);

router.get('/all', getAllUsers);
router.put('/:id/follow', followUser);
router.put('/:id/unfollow', unfollowUser);

export default router;
