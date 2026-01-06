<<<<<<< HEAD
import { useEffect, useState } from 'react';
=======
import { useState, useEffect } from 'react';
import { useCard } from '../../App';
>>>>>>> cd1c622874d55a08cf620353f3c9825e77e7a3c5
import { useSearchParams } from 'react-router-dom';
import CompanySidebar from '../../components/CompanySidebar';
import { createJob, deleteJob, getCompanyJobs, getJobApplicants, getProfile, updateApplicationStatus, updateJob, updateProfile } from '../../services/api';
import CompanyProfile from './Company Profile';
import ManageApplications from './Manage Applications';
import ManageJobs from './Manage Jobs';
import PostNewJob from './Post New Job';
// import Navbar from '../components/Navbar';

function CompanyDashboard() {
  const showCard = useCard();
  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get('view') || 'profile';

  const setView = (newView) => {
    setSearchParams({ view: newView });
  };

  const [profile, setProfile] = useState(null);

  const [jobs, setJobs] = useState([]);
  const [editingJob, setEditingJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState(false);
  // Form state is managed inside child components

  async function fetchProfile() {
    try {
      const response = await getProfile();
      setProfile(response.data);
    } catch {
      console.log('No profile yet');
    }
  }

  async function fetchJobs() {
    setJobsLoading(true);
    setJobsError(false);
    try {
      const response = await getCompanyJobs();
      setJobs(response.data);
      if (view === 'applications' && response.data.length > 0 && !selectedJobId) {
        setSelectedJobId(response.data[0]._id);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobsError(true);
    } finally {
      setJobsLoading(false);
    }
  }

  async function fetchApplicants(jobId) {
    try {
      const response = await getJobApplicants(jobId);
      setApplicants(response.data);
    } catch (error) {
      console.error('Error fetching applicants:', error);
      showCard('Error fetching applicants', 'error');
    }
  }

  // Effects to prime data when dashboard mounts or view changes
  useEffect(() => {
    (async () => {
      try {
        const response = await getProfile();
        setProfile(response.data);
      } catch {
        // no profile yet
      }
    })();
  }, []);

  useEffect(() => {
    if (view === 'manage' || view === 'applications') {
      fetchJobs();
    }
  }, [view]);

  useEffect(() => {
    if (view === 'applications' && selectedJobId) {
      (async () => {
        try {
          const response = await getJobApplicants(selectedJobId);
          setApplicants(response.data);
        } catch {
          console.error('Error fetching applicants');
        }
      })();
    }
  }, [view, selectedJobId]);

  const handleStatusUpdate = async (applicationId, status) => {
    try {
      const response = await updateApplicationStatus(applicationId, status);
      showCard(`Application ${status} successfully!`, 'info');
      // Optimistically update local applicants list so UI immediately reflects status change
      setApplicants((prev) => prev.map((app) => app._id === applicationId ? { ...app, status } : app));
      // Ensure server state is in sync by refetching applicants for the selected job
      if (selectedJobId) {
        fetchApplicants(selectedJobId);
      }
      return response.data.application;
    } catch (error) {
      showCard(error.response?.data?.message || 'Error updating application status', 'error');
      throw error;
    }
  };

  // Accept either a FormData object or a plain object with profile fields
  const handleUpdateProfile = async (data) => {
    try {
      const formData = data instanceof FormData ? data : (() => {
        const fd = new FormData();
        if (data.companyName !== undefined) fd.append('companyName', data.companyName);
        if (data.description !== undefined) fd.append('description', data.description);
        if (data.website !== undefined) fd.append('website', data.website);
        if (data.logo) fd.append('logo', data.logo);
        return fd;
      })();

      const response = await updateProfile(formData);
      setProfile(response.data.profile || response.data);
      showCard('Profile updated successfully!', 'info');
      // Refresh profile from server
      fetchProfile();
    } catch (error) {
      showCard(error.response?.data?.message || 'Error updating profile', 'error');
    }
  };

  // Create a job using the passed jobData object
  const handleCreateJob = async (jobData) => {
    try {
      await createJob(jobData);
      showCard('Job posted successfully!', 'info');
      resetJobForm();
      fetchJobs();
      setView('manage');
    } catch (error) {
      showCard(error.response?.data?.message || 'Error creating job', 'error');
    }
  };

  const handleUpdateJob = async (jobData) => {
    if (!editingJob) return showCard('No job selected for update', 'error');
    try {
      await updateJob(editingJob._id, jobData);
      showCard('Job updated successfully!', 'info');
      setEditingJob(null);
      resetJobForm();
      fetchJobs();
      setView('manage');
    } catch (error) {
      showCard(error.response?.data?.message || 'Error updating job', 'error');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await deleteJob(jobId);
        showCard('Job deleted successfully!', 'info');
        fetchJobs();
      } catch {
        showCard('Error deleting job', 'error');
      }
    }
  };

  const startEditJob = (job) => {
    setEditingJob(job);
    setView('create');
  };

  const handleJobDeleted = (jobId) => {
    setJobs(prev => prev.filter(job => job._id !== jobId));
  };

  const resetJobForm = () => {
    setEditingJob(null);
    setView('create');
  };



  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <CompanySidebar currentView={view} setView={(v) => { setView(v); if (v !== 'create') resetJobForm(); }} />

      <div style={{ flex: 1, padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>

        </div>

        {/* Render views using specialized sub-components */}
        {view === 'profile' && (
          <CompanyProfile profile={profile} fetchProfile={fetchProfile} handleUpdateProfile={handleUpdateProfile} />
        )}

        {view === 'create' && (
          <PostNewJob handleCreateJob={handleCreateJob} handleUpdateJob={handleUpdateJob} editingJob={editingJob} resetJobForm={resetJobForm} />
        )}

        {view === 'manage' && (
          jobsLoading ? (
            <div>Loading jobs...</div>
          ) : jobsError ? (
            <div>
              <p>Error loading jobs. <button onClick={fetchJobs}>Retry</button></p>
            </div>
          ) : (
            <ManageJobs startEditJob={startEditJob} jobs={jobs} onJobDeleted={handleJobDeleted} />
          )
        )}

        {view === 'applications' && (
          jobsLoading ? (
            <div>Loading jobs...</div>
          ) : jobsError ? (
            <div>
              <p>Error loading jobs. <button onClick={fetchJobs}>Retry</button></p>
            </div>
          ) : (
            <ManageApplications jobs={jobs} selectedJobId={selectedJobId} setSelectedJobId={setSelectedJobId} applicants={applicants} handleStatusUpdate={handleStatusUpdate} />
          )
        )}

      </div>
    </div>
  );
}

export default CompanyDashboard;