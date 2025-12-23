import express from 'express';
import { auth } from '../../middlewares/auth.js';
import { profileUpload } from '../../middlewares/upload.js'; // Use the exported multer instance
import {
    createPost,
    getMyPosts,
    getFeed,
    likePost,
    commentOnPost
} from '../../controllers/post.controller.js';

const router = express.Router();

router.use(auth);

router.post('/', profileUpload.single('media'), createPost); // 'media' matches frontend input name
router.get('/my-posts', getMyPosts);
router.get('/feed', getFeed);
router.put('/:id/like', likePost);
router.post('/:id/comment', commentOnPost);

export default router;
