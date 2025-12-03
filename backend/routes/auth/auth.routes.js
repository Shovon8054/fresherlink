import express from 'express';
import { signupStudent, signupCompany, login } from '../../controllers/auth.controller.js';

const router = express.Router();

router.post('/signup/student', signupStudent);
router.post('/signup/company', signupCompany);
router.post('/login', login);

export default router;
