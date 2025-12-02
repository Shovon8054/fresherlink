import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // Student fields
  name: String,
  photo: String,
  institution: String,
  department: String,
  resume: String,
  
  // Company fields
  companyName: String,
  logo: String,
  description: String,
  website: String
}, { timestamps: true });

export const Profile = mongoose.models.Profile || mongoose.model('Profile', profileSchema);