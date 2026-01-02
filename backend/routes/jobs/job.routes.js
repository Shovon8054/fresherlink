import express from 'express';
import { auth, checkRole } from '../../middlewares/auth.js';
import {
  listJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getCompanyJobs,
  getJobApplicants,
  getRecommendedJobs
} from '../../controllers/job.controller.js';

const router = express.Router();

// Public routes
router.get('/', listJobs); // GET /jobs
router.get('/search', listJobs); // GET /jobs/search

// Student protected routes - Define BEFORE generic /:id because 'recommendations' could interpret as :id
router.get('/recommendations', auth, checkRole('student'), getRecommendedJobs); // GET /jobs/recommendations

// Company protected routes - Define BEFORE generic /:id
router.post('/', auth, checkRole('company'), createJob); // POST /jobs
router.get('/my-jobs', auth, checkRole('company'), getCompanyJobs); // GET /jobs/my-jobs

// Generic ID routes - Must come LAST
router.get('/:id', getJobById); // GET /jobs/:id
router.get('/:id/applicants', auth, checkRole('company'), getJobApplicants); // GET /jobs/:id/applicants
router.put('/:id', auth, checkRole('company'), updateJob); // PUT /jobs/:id
router.delete('/:id', auth, checkRole('company'), deleteJob); // DELETE /jobs/:id

export default router;
