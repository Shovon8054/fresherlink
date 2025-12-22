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
    const profileData = { 
      ...req.body, 
      userId: req.user.id 
    };

    // Handle skills if provided as JSON string
    if (req.body.skills) {
      try {
        profileData.skills = JSON.parse(req.body.skills);
      } catch (e) {
        // If not JSON, treat as comma-separated string
        if (typeof req.body.skills === 'string') {
          profileData.skills = req.body.skills.split(',').map(s => s.trim()).filter(s => s.length > 0);
        }
      }
    }

    if (req.files?.resume) {
      // store relative path for resume (uploads/resumes/<filename>)
      profileData.resume = `uploads/resumes/${req.files.resume[0].filename}`;
    }
    if (req.files?.photo) {
      profileData.photo = `uploads/profile_pictures/${req.files.photo[0].filename}`;
    }
    if (req.files?.logo) {
      profileData.logo = `uploads/logos/${req.files.logo[0].filename}`;
    }

    const profile = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      profileData,
      { 
        new: true,
        upsert: true
      }
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

