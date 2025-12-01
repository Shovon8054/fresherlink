import Favorite from '../models/Favorite.js';
import Job from '../models/Job.js';

export const addFavorite = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const existing = await Favorite.findOne({
      studentId: req.user.id,
      jobId
    });
    if (existing) return res.status(400).json({ message: 'Job already in favorites' });

    const favorite = new Favorite({
      studentId: req.user.id,
      jobId
    });
    await favorite.save();

    res.status(201).json({ 
      message: 'Job added to favorites',
      favorite 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeFavorite = async (req, res) => {
  try {
    const { jobId } = req.params;

    const favorite = await Favorite.findOneAndDelete({
      studentId: req.user.id,
      jobId
    });

    if (!favorite) {
      return res.status(404).json({ message: 'Favorite not found' });
    }

    res.json({ message: 'Job removed from favorites' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const listFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ studentId: req.user.id })
      .populate('jobId')
      .sort({ createdAt: -1 });

    const jobs = favorites.map(fav => fav.jobId);

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const checkFavorite = async (req, res) => {
  try {
    const favorite = await Favorite.findOne({
      studentId: req.user.id,
      jobId: req.params.jobId
    });

    res.json({ isFavorite: !!favorite });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

