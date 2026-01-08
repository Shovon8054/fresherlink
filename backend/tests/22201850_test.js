// Company Features Test: Create job post, Get company jobs, Update job post, Delete job post, View job applicants, Update application status (shortlist/reject), Update company profile, Get company profile.

import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js'; 
import User from '../models/user.model.js'; 
import Job from '../models/job.model.js'; 
import Application from '../models/application.model.js'; 

describe('Company Features Test Suite', () => {
  let companyToken;
  let companyId;
  let studentToken;
  let studentId;
  let jobId;
  let applicationId;


  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/fresherlink_test');
    }

    
    await User.deleteMany({ email: { $in: ['testcompany@test.com', 'teststudent@test.com'] } });
    await Job.deleteMany({});
    await Application.deleteMany({});
    await request(app)
      .post('/api/auth/signup/company')
      .send({
        name: 'Test Company',
        email: 'testcompany@test.com',
        password: 'TestPass123!',
        companyName: 'Test Company Ltd',
        industry: 'Technology'
      });

    const companyLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testcompany@test.com',
        password: 'TestPass123!'
      });

    companyToken = companyLogin.body.token;
    companyId = companyLogin.body.user._id;
    await request(app)
      .post('/api/auth/signup/student')
      .send({
        name: 'Test Student',
        email: 'teststudent@test.com',
        password: 'TestPass123!',
        institution: 'Test University',
        department: 'Computer Science'
      });

    const studentLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'teststudent@test.com',
        password: 'TestPass123!'
      });

    studentToken = studentLogin.body.token;
    studentId = studentLogin.body.user._id;
  });
  afterAll(async () => {
    await User.deleteMany({ email: { $in: ['testcompany@test.com', 'teststudent@test.com'] } });
    await Job.deleteMany({});
    await Application.deleteMany({});
    await mongoose.connection.close();
  });

  // ================================Test 1: Create Job Post ================================
  describe('POST /api/jobs - Create Job Post', () => {
    it('should create a new job post successfully', async () => {
      const response = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${companyToken}`)
        .send({
          title: 'Software Engineer Intern',
          description: 'Looking for talented interns',
          type: 'Internship',
          location: 'Dhaka, Bangladesh',
          salary: '15000-20000',
          requirements: ['JavaScript', 'React', 'Node.js'],
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.job).toHaveProperty('_id');
      expect(response.body.job.title).toBe('Software Engineer Intern');
      expect(response.body.job.company).toBe(companyId);

      jobId = response.body.job._id;
    });

    it('should fail to create job without authentication', async () => {
      const response = await request(app)
        .post('/api/jobs')
        .send({
          title: 'Test Job',
          description: 'Test Description',
          type: 'Full-time',
          location: 'Dhaka'
        });

      expect(response.status).toBe(401);
    });
  });

  // ================================ Test 2: Get Company's Own Jobs ================================
  describe('GET /api/jobs/my-jobs - Get Company Jobs', () => {
    it('should retrieve all jobs posted by the company', async () => {
      const response = await request(app)
        .get('/api/jobs/my-jobs')
        .set('Authorization', `Bearer ${companyToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.jobs)).toBe(true);
      expect(response.body.jobs.length).toBeGreaterThan(0);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/jobs/my-jobs');

      expect(response.status).toBe(401);
    });
  });

  //  ================================Test 3: Update Job Post ================================
  describe('PUT /api/jobs/:id - Update Job Post', () => {
    it('should update job post successfully', async () => {
      const response = await request(app)
        .put(`/api/jobs/${jobId}`)
        .set('Authorization', `Bearer ${companyToken}`)
        .send({
          title: 'Senior Software Engineer Intern',
          salary: '20000-25000'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.job.title).toBe('Senior Software Engineer Intern');
      expect(response.body.job.salary).toBe('20000-25000');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .put(`/api/jobs/${jobId}`)
        .send({
          title: 'Unauthorized Update'
        });

      expect(response.status).toBe(401);
    });
  });

  //  ================================Test 4: Delete Job Post ================================
  describe('DELETE /api/jobs/:id - Delete Job Post', () => {
    let deleteJobId;

    beforeAll(async () => {
      // Create a job to delete
      const createResponse = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${companyToken}`)
        .send({
          title: 'Job To Delete',
          description: 'This will be deleted',
          type: 'Full-time',
          location: 'Dhaka'
        });

      deleteJobId = createResponse.body.job._id;
    });

    it('should delete job post successfully', async () => {
      const response = await request(app)
        .delete(`/api/jobs/${deleteJobId}`)
        .set('Authorization', `Bearer ${companyToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted');
    });

    it('should fail to delete without authentication', async () => {
      const response = await request(app)
        .delete(`/api/jobs/${jobId}`);

      expect(response.status).toBe(401);
    });
  });

  // ================================ Test 5: Get Job Applicants ================================
  describe('GET /api/jobs/:id/applicants - View Job Applicants', () => {
    beforeAll(async () => {
      // Student applies to the job
      await request(app)
        .post(`/api/applications/${jobId}/apply`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          coverLetter: 'I am interested in this position'
        });
    });

    it('should retrieve all applicants for a job', async () => {
      const response = await request(app)
        .get(`/api/jobs/${jobId}/applicants`)
        .set('Authorization', `Bearer ${companyToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.applicants)).toBe(true);
      expect(response.body.applicants.length).toBeGreaterThan(0);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get(`/api/jobs/${jobId}/applicants`);

      expect(response.status).toBe(401);
    });
  });

  // ================================ Test 6: Update Application Status (Shortlist/Reject) ================================
  describe('PATCH /api/applications/:id/status - Update Application Status', () => {
    beforeAll(async () => {
      // Get application ID
      const applicationsResponse = await request(app)
        .get(`/api/jobs/${jobId}/applicants`)
        .set('Authorization', `Bearer ${companyToken}`);

      applicationId = applicationsResponse.body.applicants[0]._id;
    });

    it('should shortlist an applicant successfully', async () => {
      const response = await request(app)
        .patch(`/api/applications/${applicationId}/status`)
        .set('Authorization', `Bearer ${companyToken}`)
        .send({
          status: 'shortlisted'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.application.status).toBe('shortlisted');
    });

    it('should reject an applicant successfully', async () => {
      const response = await request(app)
        .patch(`/api/applications/${applicationId}/status`)
        .set('Authorization', `Bearer ${companyToken}`)
        .send({
          status: 'rejected'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.application.status).toBe('rejected');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .patch(`/api/applications/${applicationId}/status`)
        .send({
          status: 'shortlisted'
        });

      expect(response.status).toBe(401);
    });
  });

  //  ================================Test 7: Company Profile Management ================================
  describe('POST /api/profile - Update Company Profile', () => {
    it('should update company profile successfully', async () => {
      const response = await request(app)
        .post('/api/profile')
        .set('Authorization', `Bearer ${companyToken}`)
        .send({
          companyName: 'Updated Company Name',
          description: 'We are a leading tech company',
          industry: 'Information Technology',
          website: 'https://testcompany.com',
          location: 'Dhaka, Bangladesh'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.profile.companyName).toBe('Updated Company Name');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/profile')
        .send({
          companyName: 'Unauthorized Update'
        });

      expect(response.status).toBe(401);
    });
  });

  //  ================================Test 8: Get Company Profile ================================
  describe('GET /api/profile - Get Company Profile', () => {
    it('should retrieve company profile successfully', async () => {
      const response = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${companyToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.profile).toHaveProperty('companyName');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/profile');

      expect(response.status).toBe(401);
    });
  });
});
