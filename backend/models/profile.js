import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  // Personal Info
  name: String,
  photo: String,
  resume: String,
  headline: String,
  phoneNumber: String,
  currentLocation: String,
  permanentLocation: String,

  // Education object
  education: {
    institution: String,
    degree: String,
    major: String,
    graduationYear: String,
    cgpa: String,
    extraCurricular: String
  },

  // Experience
  experience: {
    type: String,
    default: 'N/A'
  },

  // Social Links
  socialLinks: {
    github: String,
    linkedin: String,
    portfolio: String
  },

  // Skills
  technicalSkills: [String],
  softSkills: [String],

  // Company fields (kept for company profiles)
  companyName: String,
  logo: String,
  description: String,
  website: String
}, { timestamps: true });

export const Profile = mongoose.models.Profile || mongoose.model('Profile', profileSchema);