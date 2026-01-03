import mongoose from 'mongoose';
import { User } from '../models/user.js';
import dotenv from 'dotenv';
dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/fresherlink');
        console.log('Connected to MongoDB');

        const adminEmail = 'admin@gmail.com';
        const adminPassword = '1234';

        const existingAdmin = await User.findOne({ email: adminEmail });
        if (existingAdmin) {
            console.log('Admin user already exists');
            process.exit(0);
        }

        const admin = new User({
            email: adminEmail,
            password: adminPassword, // Password will be hashed by pre-save hook in user model
            role: 'admin'
        });

        await admin.save();
        console.log('Admin user created successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
    }
};

createAdmin();
