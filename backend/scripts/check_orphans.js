import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Post } from '../models/Post.js';
import { Profile } from '../models/Profile.js';
import { Job } from '../models/Job.js';

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/fresherlink');
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        process.exit(1);
    }
};

const checkOrphans = async () => {
    await connectDB();

    try {
        console.log('--- Checking for Orphaned Posts ---');
        const posts = await Post.find({});
        for (const post of posts) {
            const user = await User.findById(post.author);
            if (!user) {
                console.log(`Orphaned Post Found: ID ${post._id}, Author ID ${post.author}`);
            }
        }

        console.log('--- Checking for Orphaned Profiles ---');
        const profiles = await Profile.find({});
        for (const profile of profiles) {
            const user = await User.findById(profile.userId);
            if (!user) {
                console.log(`Orphaned Profile Found: ID ${profile._id}, User ID ${profile.userId}`);
            }
        }

        console.log('--- Checking for Orphaned Jobs ---');
        const jobs = await Job.find({});
        for (const job of jobs) {
            const user = await User.findById(job.companyId);
            if (!user) {
                console.log(`Orphaned Job Found: ID ${job._id}, Company ID ${job.companyId}`);
            }
        }

        console.log('--- Check Complete ---');

    } catch (error) {
        console.error('Error checking orphans:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

checkOrphans();
