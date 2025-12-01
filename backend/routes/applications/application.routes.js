import express from 'express';
import { auth, checkRole } from '../../middlewares/auth.js';
import { applyToJob, getMyApplications } from '../../controllers/application.controller.js';

const router = express.Router();

router.post('/apply', auth, checkRole('student'), applyToJob);
router.get('/applications', auth, checkRole('student'), getMyApplications);

export default router;

