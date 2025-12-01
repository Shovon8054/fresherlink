import Profile from '../models/Profile.js';

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

    if (req.files?.resume) {
      profileData.resume = req.files.resume[0].path;
    }
    if (req.files?.photo) {
      profileData.photo = req.files.photo[0].path;
    }
    if (req.files?.logo) {
      profileData.logo = req.files.logo[0].path;
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
};

