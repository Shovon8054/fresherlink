import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProfile, updateProfile, createJob, getCompanyJobs, updateJob, deleteJob, getJobApplicants, updateApplicationStatus } from '../../services/api';
import CompanySidebar from '../../components/CompanySidebar';
import CompanyProfile from './Company Profile';
import PostNewJob from './Post New Job';
import ManageJobs from './Manage Jobs';
import ManageApplications from './Manage Applications';

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
  const [loading, setLoading] = useState(false);

  // Fetch profile data
  async function fetchProfile() {
    try {
      const response = await getProfile();
      setProfile(response.data);
    } catch {
      console.log('No profile yet');
    }
  }

  // Fetch company jobs
  async function fetchJobs() {
    setLoading(true);
    try {
      const response = await getCompanyJobs();
      setJobs(response.data);
      if (view === 'applications' && response.data.length > 0 && !selectedJobId) {
        setSelectedJobId(response.data[0]._id);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  }

  // Fetch applicants for a specific job
  async function fetchApplicants(jobId) {
    setLoading(true);
    try {
      const response = await getJobApplicants(jobId);
      setApplicants(response.data);
    } catch (error) {
      console.error('Error fetching applicants:', error);
      alert('Error fetching applicants');
    } finally {
      setLoading(false);
    }
  }

  // Effects for data fetching
  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (view === 'manage' || view === 'applications') {
      fetchJobs();
    }
  }, [view]);

  useEffect(() => {
    if (view === 'applications' && selectedJobId) {
      fetchApplicants(selectedJobId);
    }
  }, [view, selectedJobId]);

  // Application status update handler
  const handleStatusUpdate = async (applicationId, status) => {
    try {
      const response = await updateApplicationStatus(applicationId, status);
      alert(`Application ${status} successfully!`);
      setApplicants((prev) => prev.map((app) => 
        app._id === applicationId ? { ...app, status } : app
      ));
      return response.data.application;
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating application status');
      throw error;
    }
  };

  // Profile update handler
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
      fetchProfile();
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating profile');
    }
  };

  // Job creation handler
  const handleCreateJob = async (jobData) => {
    setLoading(true);
    try {
      await createJob(jobData);
      alert('Job posted successfully!');
      resetJobForm();
      fetchJobs();
      setView('manage');
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating job');
    } finally {
      setLoading(false);
    }
  };

  // Job update handler
  const handleUpdateJob = async (jobData) => {
    if (!editingJob) return alert('No job selected for update');
    setLoading(true);
    try {
      await updateJob(editingJob._id, jobData);
      alert('Job updated successfully!');
      setEditingJob(null);
      resetJobForm();
      fetchJobs();
      setView('manage');
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating job');
    } finally {
      setLoading(false);
    }
  };

  // Job deletion handler
  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      setLoading(true);
      try {
        await deleteJob(jobId);
        alert('Job deleted successfully!');
        fetchJobs();
      } catch {
        alert('Error deleting job');
      } finally {
        setLoading(false);
      }
    }
  };

  // Edit job handler
  const startEditJob = (job) => {
    setEditingJob(job);
    setView('create');
  };

  // Reset job form
  const resetJobForm = () => {
    setEditingJob(null);
  };

  return (
    <div style={styles.dashboardContainer}>
      <CompanySidebar 
        currentView={view} 
        setView={(v) => { 
          setView(v); 
          if (v !== 'create') resetJobForm(); 
        }} 
      />

      <main style={styles.mainContent}>
        <header style={styles.header}>
          <div style={styles.headerContent}>
            <h1 style={styles.pageTitle}>
              {view === 'profile' && 'Company Profile'}
              {view === 'create' && (editingJob ? 'Edit Job' : 'Post New Job')}
              {view === 'manage' && 'Manage Jobs'}
              {view === 'applications' && 'Manage Applications'}
            </h1>
            <div style={styles.viewIndicator}>
              <span style={styles.viewBadge}>
                {view.charAt(0).toUpperCase() + view.slice(1)} View
              </span>
            </div>
          </div>
        </header>

        {loading && (
          <div style={styles.loadingOverlay}>
            <div style={styles.loadingSpinner}></div>
            <p style={styles.loadingText}>Loading...</p>
          </div>
        )}

        <div style={styles.contentCard}>
          {/* Render views using specialized sub-components */}
          {view === 'profile' && (
            <CompanyProfile 
              profile={profile} 
              fetchProfile={fetchProfile} 
              handleUpdateProfile={handleUpdateProfile} 
            />
          )}

          {view === 'create' && (
            <PostNewJob 
              handleCreateJob={handleCreateJob} 
              handleUpdateJob={handleUpdateJob} 
              editingJob={editingJob} 
              resetJobForm={resetJobForm} 
            />
          )}

          {view === 'manage' && (
            <ManageJobs 
              jobs={jobs} 
              fetchJobs={fetchJobs} 
              startEditJob={startEditJob} 
              handleDeleteJob={handleDeleteJob} 
            />
          )}

          {view === 'applications' && (
            <ManageApplications 
              jobs={jobs} 
              selectedJobId={selectedJobId} 
              setSelectedJobId={setSelectedJobId} 
              applicants={applicants} 
              handleStatusUpdate={handleStatusUpdate} 
            />
          )}
        </div>

        <footer style={styles.footer}>
          <p style={styles.footerText}>
            © {new Date().getFullYear()} TalentHub Dashboard
            {profile?.companyName && ` • ${profile.companyName}`}
          </p>
        </footer>
      </main>
    </div>
  );
}

const styles = {
  dashboardContainer: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif",
  },
  mainContent: {
    flex: 1,
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    marginBottom: '2rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #e2e8f0',
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  pageTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0,
    lineHeight: 1.2,
  },
  viewIndicator: {
    display: 'flex',
    alignItems: 'center',
  },
  viewBadge: {
    backgroundColor: '#3b82f6',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    fontSize: '0.875rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  contentCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '2rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    border: '1px solid #e2e8f0',
    flex: 1,
    minHeight: '600px',
    position: 'relative',
  },
  loadingOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingSpinner: {
    width: '50px',
    height: '50px',
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    marginTop: '1rem',
    color: '#64748b',
    fontSize: '1rem',
    fontWeight: '500',
  },
  footer: {
    marginTop: '2rem',
    paddingTop: '1rem',
    borderTop: '1px solid #e2e8f0',
    textAlign: 'center',
  },
  footerText: {
    color: '#64748b',
    fontSize: '0.875rem',
    margin: 0,
  },
};

// Add CSS animation for loading spinner
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`, styleSheet.cssRules.length);

export default CompanyDashboard;