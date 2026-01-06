import express from 'express';
import {
    applyToJob,
    getStudentApplications,
    getJobApplications,
    updateApplicationStatus
} from '../../controllers/application.controller.js';
import { auth as verifyToken } from '../../middlewares/auth.js';
import { profileUpload as upload } from '../../middlewares/upload.js';

const router = express.Router();

// Apply to a job (uploading 'resume' file is optional but handled)
router.post('/:jobId/apply', verifyToken, upload.single('resume'), applyToJob);

// Get all applications for the logged-in student
router.get('/my-applications', verifyToken, getStudentApplications);

// Get all applications for a specific job (Company view)
router.get('/job/:jobId', verifyToken, getJobApplications);

// Update application status
router.put('/:id/status', verifyToken, updateApplicationStatus);

export default router;
