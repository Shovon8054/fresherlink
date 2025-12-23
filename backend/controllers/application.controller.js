import { Application } from '../models/Application.js';
import { Job } from '../models/Job.js';
import { Notification } from '../models/Notification.js';

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

    // Find the job to get the companyId (recipient)
    const job = await Job.findById(jobId);
    if (job) {
      await Notification.create({
        recipient: job.companyId,
        sender: req.user.id,
        message: `New application received for ${job.title} from ${req.user.name || 'a student'}.`,
        type: 'application_received',
        relatedJob: jobId
      });
    }

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

    // Create Notification for Student
    // Ensure we have the job title; application.jobId is populated with the job object
    const jobTitle = application.jobId.title;
    const companyName = req.user.name || "A company"; // Fallback if name is not on req.user, though auth middleware usually provides it

    await Notification.create({
      recipient: application.studentId,
      sender: req.user.id,
      message: `Your application for ${jobTitle} has been ${status} by ${companyName}.`,
      type: 'application_status_update',
      relatedJob: application.jobId._id
    });

    res.json({
      message: 'Application status updated successfully',
      application
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

