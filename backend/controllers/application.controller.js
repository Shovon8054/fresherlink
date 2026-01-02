import { Application } from '../models/Application.js';
import { Job } from '../models/Job.js';
import { Notification } from '../models/Notification.js';

// Apply to a Job
export const applyToJob = async (req, res) => {
  try {
    const { jobId } = req.params; // Get jobId from URL params, not body
    const studentId = req.user.id;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({ jobId, studentId });
    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    // Create Application
    const application = new Application({
      jobId,
      studentId,
      resume: req.file ? req.file.path : null, // Assuming Cloudinary/Multer gives path
      coverLetter: req.body.coverLetter
    });

    await application.save();

    // Create Notification for the Company
    await Notification.create({
      recipient: job.companyId, // Correct field name
      sender: studentId,
      type: 'application_received',
      message: `New application received for ${job.title}`,
      relatedJob: jobId,
      relatedApplication: application._id
    });

    res.status(201).json({ message: 'Application submitted successfully', application });
  } catch (error) {
    console.error('Apply Job Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get Applications for a logged-in Student
export const getStudentApplications = async (req, res) => {
  try {
    const applications = await Application.find({ studentId: req.user.id })
      .populate('jobId', 'title company location salary type') // Populate job details
      .sort({ appliedAt: -1 });

    res.json(applications);
  } catch (error) {
    console.error('Get Student Applications Error:', error);
    res.status(500).json({ message: 'Server error fetching applications' });
  }
};

// Get All Applications for a specific Job (Company View)
export const getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Verify job belongs to the logged-in company
    const job = await Job.findOne({ _id: jobId, companyId: req.user.id }); // Correct field name
    if (!job) {
      return res.status(404).json({ message: 'Job not found or unauthorized' });
    }

    const applications = await Application.find({ jobId })
      .populate('studentId', 'name email profilePicture headline') // Populate student info
      .sort({ appliedAt: -1 });

    res.json(applications);
  } catch (error) {
    console.error('Get Job Applications Error:', error);
    res.status(500).json({ message: 'Server error fetching job applications' });
  }
};

// Update Application Status (e.g., Shortlist, Reject)
export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const application = await Application.findById(id).populate('jobId');
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Verify that the job belongs to the user trying to update it
    const job = await Job.findById(application.jobId);
    if (job.companyId.toString() !== req.user.id) { // Correct field name
      return res.status(403).json({ message: 'Unauthorized to update this application' });
    }

    application.status = status;
    await application.save();

    // Notify the student
    await Notification.create({
      recipient: application.studentId,
      sender: req.user.id,
      type: 'application_status',
      message: `Your application for ${job.title} has been ${status}`,
      relatedJob: job._id
    });

    res.json({ message: `Application ${status}`, application });
  } catch (error) {
    console.error('Update Status Error:', error);
    res.status(500).json({ message: 'Server error updating status' });
  }
};
