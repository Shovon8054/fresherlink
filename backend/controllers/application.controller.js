import Application from '../models/Application.js';

export const applyToJob = async (req, res) => {
  try {
    const { jobId } = req.body;

    const existing = await Application.findOne({
      studentId: req.user.id,
      jobId
    });
    if (existing) return res.status(400).json({ message: 'Already applied' });

    const application = new Application({
      studentId: req.user.id,
      jobId
    });
    await application.save();
    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ studentId: req.user.id })
      .populate('jobId')
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

