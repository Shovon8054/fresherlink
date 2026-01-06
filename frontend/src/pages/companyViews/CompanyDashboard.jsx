import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProfile, updateProfile, createJob, getCompanyJobs, updateJob, deleteJob, getJobApplicants, updateApplicationStatus } from '../../services/api';
import CompanySidebar from '../../components/CompanySidebar';
import CompanyProfile from './Company Profile';
import PostNewJob from './Post New Job';
import ManageJobs from './Manage Jobs';
import ManageApplications from './Manage Applications';
// import Navbar from '../components/Navbar';

function CompanyDashboard() {
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
    try {
      const response = await getCompanyJobs();
      setJobs(response.data);
      if (view === 'applications' && response.data.length > 0 && !selectedJobId) {
        setSelectedJobId(response.data[0]._id);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  }

  async function fetchApplicants(jobId) {
    try {
      const response = await getJobApplicants(jobId);
      setApplicants(response.data);
    } catch (error) {
      console.error('Error fetching applicants:', error);
      alert('Error fetching applicants');
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
      (async () => {
        try {
          const response = await getCompanyJobs();
          setJobs(response.data);
          if (view === 'applications' && response.data.length > 0 && !selectedJobId) {
            setSelectedJobId(response.data[0]._id);
          }
        } catch {
          console.error('Error fetching jobs');
        }
      })();
    }
  }, [view, selectedJobId]);

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
      alert(`Application ${status} successfully!`);
      // Optimistically update local applicants list so UI immediately reflects status change
      setApplicants((prev) => prev.map((app) => app._id === applicationId ? { ...app, status } : app));
      // Ensure server state is in sync by refetching applicants for the selected job
      if (selectedJobId) {
        fetchApplicants(selectedJobId);
      }
      return response.data.application;
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating application status');
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
      alert('Profile updated successfully!');
      // Refresh profile from server
      fetchProfile();
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating profile');
    }
  };

  // Create a job using the passed jobData object
  const handleCreateJob = async (jobData) => {
    try {
      await createJob(jobData);
      alert('Job posted successfully!');
      resetJobForm();
      fetchJobs();
      setView('manage');
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating job');
    }
  };

  const handleUpdateJob = async (jobData) => {
    if (!editingJob) return alert('No job selected for update');
    try {
      await updateJob(editingJob._id, jobData);
      alert('Job updated successfully!');
      setEditingJob(null);
      resetJobForm();
      fetchJobs();
      setView('manage');
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating job');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await deleteJob(jobId);
        alert('Job deleted successfully!');
        fetchJobs();
      } catch {
        alert('Error deleting job');
      }
    }
  };

  const startEditJob = (job) => {
    setEditingJob(job);
    setView('create');
  };

  const resetJobForm = () => {
    setEditingJob(null);
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
          <ManageJobs startEditJob={startEditJob} />
        )}

        {view === 'applications' && (
          <ManageApplications jobs={jobs} selectedJobId={selectedJobId} setSelectedJobId={setSelectedJobId} applicants={applicants} handleStatusUpdate={handleStatusUpdate} />
        )}

      </div>
    </div>
  );
}

export default CompanyDashboard;