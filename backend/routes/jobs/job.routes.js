import express from 'express';
import { auth, checkRole } from '../../middlewares/auth.js';
import { 
  listJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  listCompanyJobs,
  getJobApplicants,
  getRecommendedJobs
} from '../../controllers/job.controller.js';

const router = express.Router();

// Public routes
router.get('/', listJobs); // GET /jobs
router.get('/search', listJobs); // GET /jobs/search
router.get('/:id', getJobById); // GET /jobs/:id

// Student protected routes
router.get('/recommendations', auth, checkRole('student'), getRecommendedJobs); // GET /jobs/recommendations

// Company protected routes
router.post('/', auth, checkRole('company'), createJob); // POST /jobs
router.get('/company/my-jobs', auth, checkRole('company'), listCompanyJobs); // GET /jobs/company/my-jobs
router.get('/:id/applicants', auth, checkRole('company'), getJobApplicants); // GET /jobs/:id/applicants
router.put('/:id', auth, checkRole('company'), updateJob); // PUT /jobs/:id
router.delete('/:id', auth, checkRole('company'), deleteJob); // DELETE /jobs/:id

export default router;

