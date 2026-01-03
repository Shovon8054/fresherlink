import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const JWT_SECRET = 'HasinaPalaise2024';

export const signupStudent = async (req, res) => {
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
};

export const signupCompany = async (req, res) => {
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
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    if (user.isActive === false) {
      return res.status(403).json({ message: 'Your account has been suspended. Please contact admin.' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, role: user.role, userId: user._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===========================================
// NEW: Delete Account
// ===========================================
import { Profile } from '../models/Profile.js';
import { Post } from '../models/Post.js';
import { Job } from '../models/Job.js';

export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id; // from auth middleware

    // 1. Delete associated Profile
    await Profile.findOneAndDelete({ userId });

    // 2. Delete associated Posts
    await Post.deleteMany({ author: userId });

    // 3. Delete associated Jobs
    await Job.deleteMany({ companyId: userId });

    // 4. Delete User account
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Account and profile deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===========================================
// NEW: Forgot Password (Send OTP)
// ===========================================
import nodemailer from 'nodemailer';
import crypto from 'crypto';

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save to DB (expires in 10 mins)
    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    // Send Email
    const transporter = nodemailer.createTransport({
      service: 'gmail', // or use host/port from env
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: user.email,
      subject: 'Password Reset OTP - FresherLink',
      text: `Your OTP for password reset is: ${otp}\n\nThis OTP is valid for 10 minutes.`
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: 'OTP sent to email' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error sending email' });
  }
};

// ===========================================
// NEW: Reset Password (Verify OTP)
// ===========================================
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({
      email,
      resetPasswordOTP: otp,
      resetPasswordExpires: { $gt: Date.now() } // Check if not expired
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Update password (pre-save hook will hash it)
    user.password = newPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

