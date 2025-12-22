import { Profile } from '../models/Profile.js';

export const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const upsertProfile = async (req, res) => {
  try {
    // Start with incoming form/body fields
    const profileData = {
      userId: req.user.id
    };

    // Personal fields (accept either top-level or nested keys)
    if (req.body.name) profileData.name = req.body.name;
    if (req.body.headline) profileData.headline = req.body.headline;
    if (req.body.phoneNumber) profileData.phoneNumber = req.body.phoneNumber;
    if (req.body.currentLocation) profileData.currentLocation = req.body.currentLocation;
    if (req.body.permanentLocation) profileData.permanentLocation = req.body.permanentLocation;

    // Experience
    if (req.body.experience) profileData.experience = req.body.experience;

    // Education: either a JSON string/object in req.body.education or individual fields
    if (req.body.education) {
      try {
        profileData.education = typeof req.body.education === 'string' ? JSON.parse(req.body.education) : req.body.education;
      } catch (e) {
        // Fallback: treat as CSV or ignore
        profileData.education = { institution: String(req.body.education) };
      }
    } else {
      // Accept individual education fields
      const edu = {};
      if (req.body.institution) edu.institution = req.body.institution;
      if (req.body.degree) edu.degree = req.body.degree;
      if (req.body.major || req.body.department) edu.major = req.body.major || req.body.department;
      if (req.body.graduationYear) edu.graduationYear = req.body.graduationYear;
      if (req.body.cgpa) edu.cgpa = req.body.cgpa;
      if (req.body.extraCurricular) edu.extraCurricular = req.body.extraCurricular;
      if (Object.keys(edu).length > 0) profileData.education = edu;
    }

    // Social links: either JSON string or individual fields
    if (req.body.socialLinks) {
      try {
        profileData.socialLinks = typeof req.body.socialLinks === 'string' ? JSON.parse(req.body.socialLinks) : req.body.socialLinks;
      } catch (e) {
        profileData.socialLinks = { github: req.body.github, linkedin: req.body.linkedin, portfolio: req.body.portfolio };
      }
    } else {
      const sl = {};
      if (req.body.github) sl.github = req.body.github;
      if (req.body.linkedin) sl.linkedin = req.body.linkedin;
      if (req.body.portfolio) sl.portfolio = req.body.portfolio;
      if (Object.keys(sl).length > 0) profileData.socialLinks = sl;
    }

    // Skills: technicalSkills and softSkills - accept JSON array or comma-separated string
    const parseArrayField = (fieldName) => {
      const val = req.body[fieldName];
      if (!val && val !== '') return undefined;
      if (Array.isArray(val)) return val;
      if (typeof val === 'string') {
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed)) return parsed.map(s => String(s).trim()).filter(Boolean);
        } catch (e) {
          // Not JSON, treat as comma-separated
          return val.split(',').map(s => s.trim()).filter(s => s.length > 0);
        }
      }
      return undefined;
    };

    const tech = parseArrayField('technicalSkills') || parseArrayField('technical') || parseArrayField('skills');
    if (tech) profileData.technicalSkills = tech;

    const soft = parseArrayField('softSkills') || parseArrayField('soft');
    if (soft) profileData.softSkills = soft;

    // Files handling
    if (req.files?.resume) {
      profileData.resume = `uploads/resumes/${req.files.resume[0].filename}`;
    }
    if (req.files?.photo) {
      profileData.photo = `uploads/profile_pictures/${req.files.photo[0].filename}`;
    }
    if (req.files?.logo) {
      profileData.logo = `uploads/logos/${req.files.logo[0].filename}`;
    }

    // Merge with existing values if upsert keeps them
    const profile = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      { $set: profileData },
      { new: true, upsert: true }
    );

    res.json({
      message: 'Profile updated successfully',
      profile
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProfileField = async (req, res) => {
  try {
    const { field } = req.params; 
    
    if (!['photo', 'resume', 'logo'].includes(field)) {
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
};

