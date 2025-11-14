import express from 'express';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import User from './models/User.js';
import Profile from './models/Profile.js';
import Job from './models/Job.js';
import Application from './models/Application.js';
import Favorite from './models/Favorite.js';
import { auth, checkRole } from './auth.js';

const router = express.Router();
const JWT_SECRET = 'HasinaPalaise2024';

// File upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// ========== AUTH ROUTES ==========

// Student Signup
router.post('/signup/student', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'User already exists' });

    const user = new User({ email, password, role: 'student' });
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ token, role: user.role, userId: user._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Company Signup
router.post('/signup/company', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'User already exists' });

    const user = new User({ email, password, role: 'company' });
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ token, role: user.role, userId: user._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login (for all roles)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, role: user.role, userId: user._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========== PROFILE ROUTES ==========

// Get Profile (View my own profile)
router.get('/profile', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create/Update Profile (Student creates or edits their profile)
router.post('/profile', auth, upload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'photo', maxCount: 1 },
  { name: 'logo', maxCount: 1 }
]), async (req, res) => {
  try {
    const profileData = { 
      ...req.body, 
      userId: req.user.id 
    };

    // Add file paths if uploaded
    if (req.files?.resume) {
      profileData.resume = req.files.resume[0].path;
    }
    if (req.files?.photo) {
      profileData.photo = req.files.photo[0].path;
    }
    if (req.files?.logo) {
      profileData.logo = req.files.logo[0].path;
    }

    // findOneAndUpdate with upsert creates if doesn't exist, updates if exists
    const profile = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      profileData,
      { 
        new: true,      // Return updated document
        upsert: true    // Create if doesn't exist
      }
    );

    res.json({
      message: 'Profile updated successfully',
      profile
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete Profile Photo/Resume (Optional - if student wants to remove files)
router.delete('/profile/:field', auth, checkRole('student'), async (req, res) => {
  try {
    const { field } = req.params; 
    
    if (!['photo', 'resume'].includes(field)) {
      return res.status(400).json({ message: 'Invalid field' });
    }

    const update = { [field]: null };
    const profile = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      update,
      { new: true }
    );

    res.json({
      message: `${field} removed successfully`,
      profile
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========== JOB ROUTES ==========

// Get all jobs (with pagination & filters)
router.get('/jobs', async (req, res) => {
  try {
    const { type, location, search, page = 1, limit = 10 } = req.query;
    
    // Build filter query
    const filter = { isActive: true };
    if (type) filter.type = type;
    if (location) filter.location = new RegExp(location, 'i');
    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }

    const jobs = await Job.find(filter)
      .populate('companyId', 'email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Job.countDocuments(filter);

    res.json({
      jobs,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single job
router.get('/jobs/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('companyId', 'email');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create job (company only)
router.post('/jobs', auth, checkRole('company'), async (req, res) => {
  try {
    const job = new Job({
      ...req.body,
      companyId: req.user.id
    });
    await job.save();
    res.status(201).json({
      message: 'Job posted successfully',
      job
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update job (company only - their own jobs)
router.put('/jobs/:id', auth, checkRole('company'), async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, companyId: req.user.id });
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found or unauthorized' });
    }

    Object.assign(job, req.body);
    await job.save();

    res.json({
      message: 'Job updated successfully',
      job
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete job (company only - their own jobs)
router.delete('/jobs/:id', auth, checkRole('company'), async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({ 
      _id: req.params.id, 
      companyId: req.user.id 
    });
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found or unauthorized' });
    }

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get company's own jobs (company only)
router.get('/company/jobs', auth, checkRole('company'), async (req, res) => {
  try {
    const jobs = await Job.find({ companyId: req.user.id })
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========== APPLICATION ROUTES ==========

// Apply to job (student only)
router.post('/apply', auth, checkRole('student'), async (req, res) => {
  try {
    const { jobId } = req.body;

    // Check if already applied
    const existing = await Application.findOne({
      studentId: req.user.id,
      jobId
    });
    if (existing) return res.status(400).json({ message: 'Already applied' });

    const application = new Application({
      studentId: req.user.id,
      jobId
    });
    await application.save();
    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get my applications (student only)
router.get('/applications', auth, checkRole('student'), async (req, res) => {
  try {
    const applications = await Application.find({ studentId: req.user.id })
      .populate('jobId')
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========== FAVORITE ROUTES (STAR/SAVE JOBS) ==========

// Add job to favorites (student only)
router.post('/favorites/:jobId', auth, checkRole('student'), async (req, res) => {
  try {
    const { jobId } = req.params;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    // Check if already favorited
    const existing = await Favorite.findOne({
      studentId: req.user.id,
      jobId
    });
    if (existing) return res.status(400).json({ message: 'Job already in favorites' });

    const favorite = new Favorite({
      studentId: req.user.id,
      jobId
    });
    await favorite.save();

    res.status(201).json({ 
      message: 'Job added to favorites',
      favorite 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ===============Remove job from favorites (student only)==============
router.delete('/favorites/:jobId', auth, checkRole('student'), async (req, res) => {
  try {
    const { jobId } = req.params;

    const favorite = await Favorite.findOneAndDelete({
      studentId: req.user.id,
      jobId
    });

    if (!favorite) {
      return res.status(404).json({ message: 'Favorite not found' });
    }

    res.json({ message: 'Job removed from favorites' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all my favorite jobs (student only)
router.get('/favorites', auth, checkRole('student'), async (req, res) => {
  try {
    const favorites = await Favorite.find({ studentId: req.user.id })
      .populate('jobId')
      .sort({ createdAt: -1 });

    // Extract just the job data
    const jobs = favorites.map(fav => fav.jobId);

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==============================Check if job is favorite (student only)
router.get('/favorites/check/:jobId', auth, checkRole('student'), async (req, res) => {
  try {
    const favorite = await Favorite.findOne({
      studentId: req.user.id,
      jobId: req.params.jobId
    });

    res.json({ isFavorite: !!favorite });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;