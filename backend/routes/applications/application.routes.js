import express from 'express';
import { auth, checkRole } from '../../middlewares/auth.js';
import { applyToJob, getMyApplications, updateApplicationStatus } from '../../controllers/application.controller.js';

const router = express.Router();

router.post('/apply', auth, checkRole('student'), applyToJob);
router.get('/applications', auth, checkRole('student'), getMyApplications);
router.put('/applications/:applicationId/status', auth, checkRole('company'), updateApplicationStatus);

export default router;

