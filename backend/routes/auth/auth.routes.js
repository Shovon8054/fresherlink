import express from 'express';
import { signupStudent, signupCompany, login, deleteAccount, forgotPassword, resetPassword } from '../../controllers/auth.controller.js';
import { auth } from '../../middlewares/auth.js';

const router = express.Router();

router.post('/signup/student', signupStudent);
router.post('/signup/company', signupCompany);
router.post('/login', login);

// New Routes
router.delete('/delete-account', auth, deleteAccount);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;

