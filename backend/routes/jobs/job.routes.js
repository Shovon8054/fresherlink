import express from 'express';
import { auth, checkRole } from '../../middlewares/auth.js';
import { 
  listJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  listCompanyJobs
} from '../../controllers/job.controller.js';

const router = express.Router();

router.get('/jobs', listJobs);
router.get('/jobs/:id', getJobById);
router.post('/jobs', auth, checkRole('company'), createJob);
router.put('/jobs/:id', auth, checkRole('company'), updateJob);
router.delete('/jobs/:id', auth, checkRole('company'), deleteJob);
router.get('/company/jobs', auth, checkRole('company'), listCompanyJobs);

export default router;

