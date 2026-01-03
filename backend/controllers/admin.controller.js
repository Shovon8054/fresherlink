import { User } from '../models/user.js';
import { Job } from '../models/Job.js';
import { Application } from '../models/Application.js';
import { Post } from '../models/Post.js';
import { Notification } from '../models/Notification.js';

export const getDashboardStats = async (req, res) => {
    try {
        const studentCount = await User.countDocuments({ role: 'student' });
        const companyCount = await User.countDocuments({ role: 'company' });
        const jobCount = await Job.countDocuments({ isActive: true });
        const applicationCount = await Application.countDocuments();

        const recentRegistrations = await User.find()
            .select('email role createdAt')
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            students: studentCount,
            companies: companyCount,
            jobs: jobCount,
            applications: applicationCount,
            recentRegistrations
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const { search, role } = req.query;
        let query = {};

        if (search) {
            query.email = new RegExp(search, 'i');
        }

        if (role && role !== 'all') {
            query.role = role;
        }

        const users = await User.find(query).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isVerified, isActive } = req.body;

        const updateData = {};
        if (isVerified !== undefined) updateData.isVerified = isVerified;
        if (isActive !== undefined) updateData.isActive = isActive;

        const user = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndDelete(id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Optionally delete related data here as well
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const adminDeletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await Post.findByIdAndDelete(id);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        res.json({ message: 'Post deleted by admin successfully', id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const adminDeleteComment = async (req, res) => {
    try {
        const { postId, commentId } = req.params;
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        post.comments = post.comments.filter(c => c._id.toString() !== commentId);
        await post.save();

        const updatedPost = await Post.findById(postId)
            .populate('author', 'name email role')
            .populate('comments.userId', 'name');

        res.json({ message: 'Comment deleted by admin successfully', post: updatedPost });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .populate('author', 'name email role')
            .populate('comments.userId', 'name');
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const adminGetAllJobs = async (req, res) => {
    try {
        const jobs = await Job.find()
            .populate('companyId', 'email isVerified')
            .sort({ createdAt: -1 });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const adminDeleteJob = async (req, res) => {
    try {
        const { id } = req.params;
        const job = await Job.findByIdAndDelete(id);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        res.json({ message: 'Job deleted by admin successfully', id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const adminToggleFeatured = async (req, res) => {
    try {
        const { id } = req.params;
        const job = await Job.findById(id);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        job.isFeatured = !job.isFeatured;
        await job.save();
        res.json(job);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const adminCleanupExpired = async (req, res) => {
    try {
        const result = await Job.deleteMany({
            deadline: { $lt: new Date() }
        });
        res.json({ message: `${result.deletedCount} expired jobs deleted successfully` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const adminSendAnnouncement = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ message: 'Message is required' });

        const users = await User.find({ role: { $ne: 'admin' } }).select('_id');

        const notifications = users.map(u => ({
            recipient: u._id,
            sender: req.user.id,
            message: message,
            type: 'announcement'
        }));

        await Notification.insertMany(notifications);

        res.json({ message: `Announcement sent to ${users.length} users successfully` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
