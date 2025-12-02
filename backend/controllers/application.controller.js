import { Application } from '../models/Application.js';

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

export const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    // Validate status
    if (!['shortlisted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be "shortlisted" or "rejected"' });
    }

    // Find the application and verify the job belongs to the company
    const application = await Application.findById(applicationId).populate('jobId');
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Verify that the job belongs to the company making the request
    if (application.jobId.companyId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Unauthorized. You can only update applications for your own jobs' });
    }

    // Update the status
    application.status = status;
    await application.save();

    res.json({
      message: 'Application status updated successfully',
      application
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

