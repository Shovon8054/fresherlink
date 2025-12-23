import { Profile } from '../models/Profile.js';

export const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id }).populate('userId', 'email');
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
    const { id } = req.user;

    // 1. Initialize data with basic fields
    const profileData = {
      userId: id,
      ...req.body // Spread all body fields initially (allows for flat fields like 'name', 'headline')
    };

    // 2. Parse Complex Objects (Education & Social Links)
    // The Frontend sends these as JSON strings when using FormData.
    // We try to parse them. If parsing fails (e.g. invalid JSON), we fall back to checking for individual fields.

    // --- Education Parsing ---
    let educationData = req.body.education;
    if (typeof educationData === 'string') {
      try {
        educationData = JSON.parse(educationData);
      } catch (e) {
        educationData = null; // Parsing failed, ignore the string
      }
    }

    if (educationData && typeof educationData === 'object') {
      profileData.education = educationData;
    } else {
      // Fallback: Construct education from individual fields if JSON wasn't provided
      const edu = {};
      if (req.body.institution) edu.institution = req.body.institution;
      if (req.body.degree) edu.degree = req.body.degree;
      if (req.body.major) edu.major = req.body.major;
      if (req.body.department) edu.major = req.body.department; // Handle synonym
      if (req.body.graduationYear) edu.graduationYear = req.body.graduationYear;
      if (req.body.cgpa) edu.cgpa = req.body.cgpa;
      if (req.body.extraCurricular) edu.extraCurricular = req.body.extraCurricular;

      // Only attach if we actually found fields
      if (Object.keys(edu).length > 0) {
        profileData.education = edu;
      }
    }

    // --- Social Links Parsing ---
    let socialData = req.body.socialLinks;
    if (typeof socialData === 'string') {
      try {
        socialData = JSON.parse(socialData);
      } catch (e) {
        socialData = null;
      }
    }

    if (socialData && typeof socialData === 'object') {
      profileData.socialLinks = socialData;
    } else {
      // Fallback
      const sl = {};
      if (req.body.github) sl.github = req.body.github;
      if (req.body.linkedin) sl.linkedin = req.body.linkedin;
      if (req.body.portfolio) sl.portfolio = req.body.portfolio;

      if (Object.keys(sl).length > 0) {
        profileData.socialLinks = sl;
      }
    }

    // 3. Parse Skills (Strings -> Arrays)
    // Supports both JSON arrays '["a", "b"]' and comma-separated strings "a, b"
    const parseSkills = (input) => {
      if (Array.isArray(input)) return input;
      if (typeof input === 'string') {
        try {
          // Try parsing as JSON array
          const parsed = JSON.parse(input);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {
          // Fallback: Split by comma
          return input.split(',').map(s => s.trim()).filter(Boolean);
        }
      }
      return undefined;
    };

    const techSkills = parseSkills(req.body.technicalSkills) || parseSkills(req.body.technical);
    if (techSkills) profileData.technicalSkills = techSkills;

    const softSkills = parseSkills(req.body.softSkills) || parseSkills(req.body.soft);
    if (softSkills) profileData.softSkills = softSkills;

    // 4. Handle File Uploads
    if (req.files) {
      if (req.files.resume && req.files.resume[0]) {
        profileData.resume = `uploads/resumes/${req.files.resume[0].filename}`;
      }
      if (req.files.photo && req.files.photo[0]) {
        profileData.photo = `uploads/profile_pictures/${req.files.photo[0].filename}`;
      }
      // Keep legacy support for 'logo' if this controller serves companies too
      if (req.files.logo && req.files.logo[0]) {
        profileData.logo = `uploads/logos/${req.files.logo[0].filename}`;
      }
    }

    // 5. Database Update
    const profile = await Profile.findOneAndUpdate(
      { userId: id },
      { $set: profileData },
      { new: true, upsert: true, runValidators: true } // runValidators ensures data integrity
    );

    res.json({
      message: 'Profile updated successfully',
      profile
    });

  } catch (error) {
    console.error("Profile Update Error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteProfileField = async (req, res) => {
  try {
    const { field } = req.params;

    // Whitelist allowed fields to delete
    const allowedFields = ['profilePhoto', 'photo', 'resume', 'logo'];

    if (!allowedFields.includes(field)) {
      return res.status(400).json({ message: 'Invalid field' });
    }

    // Handle mapping 'photo' to 'profilePhoto' if necessary based on your Schema
    const dbField = field === 'photo' ? 'profilePhoto' : field;

    const update = { [dbField]: null };
    const profile = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      { $set: update }, // Use $set to explicitly nullify
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