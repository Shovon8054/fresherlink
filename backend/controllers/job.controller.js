import { Job } from '../models/Job.js';
import { Application } from '../models/Application.js';
import { Profile } from '../models/Profile.js';

export const listJobs = async (req, res) => {
  try {
    const { type, location, search, page = 1, limit = 10 } = req.query;

    const filter = { isActive: true };
    if (type) filter.type = type;
    if (location) filter.location = new RegExp(location, 'i');
    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }

    const jobs = await Job.find(filter)
      .populate('companyId', 'email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Job.countDocuments(filter);

    res.json({
      jobs,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('companyId', 'email');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createJob = async (req, res) => {
  try {
    const job = new Job({
      ...req.body,
      companyId: req.user.id
    });
    await job.save();
    res.status(201).json({
      message: 'Job posted successfully',
      job
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateJob = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, companyId: req.user.id });

    if (!job) {
      return res.status(404).json({ message: 'Job not found or unauthorized' });
    }

    Object.assign(job, req.body);
    await job.save();

    res.json({
      message: 'Job updated successfully',
      job
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({
      _id: req.params.id,
      companyId: req.user.id
    });

    if (!job) {
      return res.status(404).json({ message: 'Job not found or unauthorized' });
    }

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCompanyJobs = async (req, res) => {
  console.log("getCompanyJobs called by user:", req.user?.id);
  try {
    const jobs = await Job.find({ companyId: req.user.id })
      .sort({ createdAt: -1 });
    console.log("Found jobs:", jobs.length);
    res.json(jobs);
  } catch (error) {
    console.error("getCompanyJobs Error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getJobApplicants = async (req, res) => {
  try {
    const jobId = req.params.id; // Correct parameter name from route /:id/applicants

    console.log("getJobApplicants called for jobId:", jobId);

    // Verify the job belongs to the company
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.companyId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Unauthorized. You can only view applicants for your own jobs' });
    }

    // Get all applications for this job with student details
    const applications = await Application.find({ jobId })
      .populate('studentId', 'email')
      .sort({ createdAt: -1 });

    console.log(`Found ${applications.length} applications for job ${jobId}`);

    // Populate profile information for each application
    const applicationsWithProfiles = await Promise.all(
      applications.map(async (app) => {
        // Find profile for the student
        const profile = await Profile.findOne({ userId: app.studentId._id });
        return {
          ...app.toObject(),
          studentProfile: profile
        };
      })
    );

    res.json(applicationsWithProfiles);
  } catch (error) {
    console.error("getJobApplicants Error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getRecommendedJobs = async (req, res) => {
  try {
    // Get student's profile with skills
    const profile = await Profile.findOne({ userId: req.user.id });

    if (!profile || !profile.skills || profile.skills.length === 0) {
      // If no skills, return recent active jobs
      const jobs = await Job.find({ isActive: true })
        .populate('companyId', 'email')
        .sort({ createdAt: -1 })
        .limit(10);
      return res.json(jobs);
    }

    // Extract skills and create search terms
    const skills = profile.skills.map(skill => skill.toLowerCase());

    // Find jobs where requirements or description contain any of the student's skills
    const jobs = await Job.find({
      isActive: true,
      $or: [
        { requirements: { $regex: skills.join('|'), $options: 'i' } },
        { description: { $regex: skills.join('|'), $options: 'i' } },
        { title: { $regex: skills.join('|'), $options: 'i' } }
      ]
    })
      .populate('companyId', 'email')
      .sort({ createdAt: -1 })
      .limit(10);

    // If no matches, return recent jobs
    if (jobs.length === 0) {
      const recentJobs = await Job.find({ isActive: true })
        .populate('companyId', 'email')
        .sort({ createdAt: -1 })
        .limit(10);
      return res.json(recentJobs);
    }

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

