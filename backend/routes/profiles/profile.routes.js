import express from 'express';
import { auth, checkRole } from '../../middlewares/auth.js';
import { profileUpload } from '../../middlewares/upload.js';
import { getProfile, upsertProfile, deleteProfileField } from '../../controllers/profile.controller.js';

const router = express.Router();

router.get('/', auth, getProfile);
router.post('/', auth, profileUpload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'photo', maxCount: 1 },
  { name: 'logo', maxCount: 1 }
]), upsertProfile);
router.delete('/:field', auth, checkRole('student'), deleteProfileField);

export default router;

