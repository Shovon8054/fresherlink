import express from 'express';
import { auth, checkRole } from '../../middlewares/auth.js';
import { profileUpload } from '../../middlewares/upload.js';
import { getProfile, upsertProfile, deleteProfileField } from '../../controllers/profile.controller.js';

const router = express.Router();

router.get('/profile', auth, getProfile);
router.post('/profile', auth, profileUpload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'photo', maxCount: 1 },
  { name: 'logo', maxCount: 1 }
]), upsertProfile);
router.delete('/profile/:field', auth, checkRole('student'), deleteProfileField);

export default router;

