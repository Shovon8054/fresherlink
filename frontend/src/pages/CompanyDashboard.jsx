import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile, createJob, getCompanyJobs, updateJob, deleteJob, getJobApplicants, updateApplicationStatus } from '../services/api';
// import Navbar from '../components/Navbar';

function CompanyDashboard() {
  const [view, setView] = useState('profile'); // profile, create, manage, applications
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [editingJob, setEditingJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const navigate = useNavigate();

  // Profile form
  const [companyName, setCompanyName] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [logo, setLogo] = useState(null);

  // Job form
  const [title, setTitle] = useState('');
  const [type, setType] = useState('internship');
  const [jobDescription, setJobDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [deadline, setDeadline] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (view === 'manage') fetchJobs();
    if (view === 'applications') {
      fetchJobs();
    }
  }, [view]);

  useEffect(() => {
    if (view === 'applications' && selectedJobId) {
      fetchApplicants(selectedJobId);
    }
  }, [view, selectedJobId]);

  const fetchProfile = async () => {
    try {
      const response = await getProfile();
      setProfile(response.data);
      setCompanyName(response.data.companyName || '');
      setDescription(response.data.description || '');
      setWebsite(response.data.website || '');
    } catch (error) {
      console.log('No profile yet');
      setIsEditing(true);
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await getCompanyJobs();
      setJobs(response.data);
      if (view === 'applications' && response.data.length > 0 && !selectedJobId) {
        setSelectedJobId(response.data[0]._id);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const fetchApplicants = async (jobId) => {
    try {
      const response = await getJobApplicants(jobId);
      setApplicants(response.data);
    } catch (error) {
      console.error('Error fetching applicants:', error);
      alert('Error fetching applicants');
    }
  };

  const handleStatusUpdate = async (applicationId, status) => {
    try {
      const response = await updateApplicationStatus(applicationId, status);
      alert(`Application ${status} successfully!`);
      // Optimistically update local applicants state so UI immediately reflects change
      setApplicants((prev) => prev.map((app) => app._id === applicationId ? { ...app, status } : app));
      if (selectedJobId) {
        fetchApplicants(selectedJobId);
      }
      return response.data.application;
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating application status');
      throw error;
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('companyName', companyName);
    formData.append('description', description);
    formData.append('website', website);
    if (logo) formData.append('logo', logo);

    try {
      const response = await updateProfile(formData);
      setProfile(response.data.profile || response.data);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Error updating profile');
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    
    try {
      await createJob({
        title,
        type,
        description: jobDescription,
        requirements,
        location,
        salary,
        deadline
      });
      
      alert('Job posted successfully!');
      resetJobForm();
      setView('manage');
    } catch (error) {
      alert('Error creating job');
    }
  };

  const handleUpdateJob = async (e) => {
    e.preventDefault();
    
    try {
      await updateJob(editingJob._id, {
        title,
        type,
        description: jobDescription,
        requirements,
        location,
        salary,
        deadline
      });
      
      alert('Job updated successfully!');
      setEditingJob(null);
      resetJobForm();
      fetchJobs();
    } catch (error) {
      alert('Error updating job');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await deleteJob(jobId);
        alert('Job deleted successfully!');
        fetchJobs();
      } catch (error) {
        alert('Error deleting job');
      }
    }
  };

  const startEditJob = (job) => {
    setEditingJob(job);
    setTitle(job.title);
    setType(job.type);
    setJobDescription(job.description);
    setRequirements(job.requirements);
    setLocation(job.location);
    setSalary(job.salary);
    setDeadline(job.deadline ? job.deadline.split('T')[0] : '');
    setView('create');
  };

  const resetJobForm = () => {
    setTitle('');
    setType('internship');
    setJobDescription('');
    setRequirements('');
    setLocation('');
    setSalary('');
    setDeadline('');
    setEditingJob(null);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* <Navbar /> */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h1>Company Dashboard</h1>
        <div>
          <button onClick={() => navigate('/jobs')} style={{ marginRight: '10px' }}>
            Browse All Jobs
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: '20px', borderBottom: '2px solid #ddd' }}>
        <button 
          onClick={() => { setView('profile'); resetJobForm(); }}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: view === 'profile' ? '#007bff' : 'transparent',
            color: view === 'profile' ? 'white' : 'black',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Company Profile
        </button>
        <button 
          onClick={() => setView('create')}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: view === 'create' ? '#007bff' : 'transparent',
            color: view === 'create' ? 'white' : 'black',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Post New Job
        </button>
        <button 
          onClick={() => { setView('manage'); resetJobForm(); }}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: view === 'manage' ? '#007bff' : 'transparent',
            color: view === 'manage' ? 'white' : 'black',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Manage Jobs
        </button>
        <button 
          onClick={() => { setView('applications'); resetJobForm(); }}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: view === 'applications' ? '#007bff' : 'transparent',
            color: view === 'applications' ? 'white' : 'black',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Manage Applications
        </button>
      </div>

      {/* Profile View */}
      {view === 'profile' && (
        <div>
          {!isEditing && profile ? (
            <div>
              <h2>Company Profile</h2>
              {profile.logo && (
                <img src={`http://localhost:8080/${profile.logo && profile.logo.startsWith('uploads/') ? profile.logo : `uploads/logos/${profile.logo}`}`} alt="Logo" style={{ width: '150px' }} />
              )}
              <p><strong>Company Name:</strong> {profile.companyName}</p>
              <p><strong>Description:</strong> {profile.description}</p>
              <p><strong>Website:</strong> <a href={profile.website} target="_blank" rel="noopener noreferrer">{profile.website}</a></p>
              <button onClick={() => setIsEditing(true)}>Edit Profile</button>
            </div>
          ) : (
            <form onSubmit={handleUpdateProfile}>
              <h2>{profile ? 'Edit Profile' : 'Create Company Profile'}</h2>
              
              <input
                type="text"
                placeholder="Company Name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
              />
              
              <textarea
                placeholder="Company Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                style={{ width: '100%', padding: '10px', marginBottom: '10px', minHeight: '100px' }}
              />
              
              <input
                type="url"
                placeholder="Website URL"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
              />
              
              <div style={{ marginBottom: '10px' }}>
                <label>Company Logo:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setLogo(e.target.files[0])}
                />
              </div>
              
              <button type="submit" style={{ marginRight: '10px' }}>Save Profile</button>
              {profile && <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>}
            </form>
          )}
        </div>
      )}

      {/* Create/Edit Job View */}
      {view === 'create' && (
        <div>
          <h2>{editingJob ? 'Edit Job' : 'Post New Job'}</h2>
          <form onSubmit={editingJob ? handleUpdateJob : handleCreateJob}>
            <input
              type="text"
              placeholder="Job Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
            />
            
            <select 
              value={type} 
              onChange={(e) => setType(e.target.value)}
              style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
            >
              <option value="internship">Internship</option>
              <option value="full-time">Full Time</option>
            </select>
            
            <textarea
              placeholder="Job Description"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              required
              style={{ width: '100%', padding: '10px', marginBottom: '10px', minHeight: '100px' }}
            />
            
            <textarea
              placeholder="Requirements"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              style={{ width: '100%', padding: '10px', marginBottom: '10px', minHeight: '80px' }}
            />
            
            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
            />
            
            <input
              type="text"
              placeholder="Salary"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
            />
            
            <input
              type="date"
              placeholder="Application Deadline"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
            />
            
            <button type="submit" style={{ marginRight: '10px' }}>
              {editingJob ? 'Update Job' : 'Post Job'}
            </button>
            {editingJob && (
              <button type="button" onClick={() => { resetJobForm(); setView('manage'); }}>
                Cancel
              </button>
            )}
          </form>
        </div>
      )}

      {/* Manage Jobs View */}
      {view === 'manage' && (
        <div>
          <h2>My Posted Jobs</h2>
          {jobs.length === 0 ? (
            <p>No jobs posted yet. Create your first job!</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {jobs.map((job) => (
                <div key={job._id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '5px' }}>
                  <h3>{job.title}</h3>
                  <p><strong>Type:</strong> {job.type}</p>
                  <p><strong>Location:</strong> {job.location}</p>
                  <p><strong>Salary:</strong> {job.salary}</p>
                  <p><strong>Status:</strong> {job.isActive ? 'Active' : 'Inactive'}</p>
                  <div style={{ marginTop: '10px' }}>
                    <button onClick={() => startEditJob(job)} style={{ marginRight: '5px' }}>
                      Edit
                    </button>
                    <button onClick={() => handleDeleteJob(job._id)} style={{ backgroundColor: '#dc3545', color: 'white' }}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Manage Applications View */}
      {view === 'applications' && (
        <div>
          <h2>Manage Applications</h2>
          {jobs.length === 0 ? (
            <p>No jobs posted yet. Create a job to see applications!</p>
          ) : (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Select Job:</label>
                <select 
                  value={selectedJobId || ''} 
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  style={{ padding: '8px', minWidth: '300px' }}
                >
                  {jobs.map((job) => (
                    <option key={job._id} value={job._id}>
                      {job.title} - {job.type}
                    </option>
                  ))}
                </select>
              </div>

              {selectedJobId && (
                <div>
                  <h3>Applicants for Selected Job</h3>
                  {applicants.filter(a => a.status !== 'rejected').length === 0 ? (
                    <p>No applicants for this job yet.</p>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                      {applicants.filter(a => a.status !== 'rejected').map((app) => (
                        <div key={app._id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '5px' }}>
                          <div style={{ marginBottom: '10px' }}>
                            {app.studentProfile?.photo && (
                              <img 
                                src={`http://localhost:8080/${app.studentProfile.photo && app.studentProfile.photo.startsWith('uploads/') ? app.studentProfile.photo : `uploads/profile_pictures/${app.studentProfile.photo}`}`} 
                                alt="Student" 
                                style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }}
                              />
                            )}
                          </div>
                          <h4>{app.studentProfile?.name || 'Name not provided'}</h4>
                          <p><strong>Email:</strong> {app.studentId?.email}</p>
                          <p><strong>Institution:</strong> {app.studentProfile?.institution || 'Not provided'}</p>
                          <p><strong>Department:</strong> {app.studentProfile?.department || 'Not provided'}</p>
                          <p>
                            <strong>Status:</strong> 
                            <span style={{ 
                              marginLeft: '10px',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              backgroundColor: app.status === 'pending' ? '#ffc107' : app.status === 'shortlisted' ? '#28a745' : '#dc3545',
                              color: 'white',
                              fontWeight: 'bold'
                            }}>
                              {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                            </span>
                          </p>
                          <p><strong>Applied on:</strong> {new Date(app.createdAt).toLocaleDateString()}</p>
                          {app.studentProfile?.resume && (
                            <p style={{ marginBottom: '10px' }}>
                              <a 
                                href={`http://localhost:8080/${app.studentProfile.resume && app.studentProfile.resume.startsWith('uploads/') ? app.studentProfile.resume : `uploads/resumes/${app.studentProfile.resume}`}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{ color: '#007bff' }}
                              >
                                View Resume
                              </a>
                            </p>
                          )}
                          <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                            {app.status !== 'shortlisted' && (
                              <button 
                                onClick={() => handleStatusUpdate(app._id, 'shortlisted')}
                                style={{ 
                                  backgroundColor: '#28a745', 
                                  color: 'white', 
                                  border: 'none', 
                                  padding: '8px 16px', 
                                  borderRadius: '4px',
                                  cursor: 'pointer'
                                }}
                              >
                                Shortlist
                              </button>
                            )}
                            {app.status !== 'rejected' && (
                              <button 
                                onClick={() => handleStatusUpdate(app._id, 'rejected')}
                                style={{ 
                                  backgroundColor: '#dc3545', 
                                  color: 'white', 
                                  border: 'none', 
                                  padding: '8px 16px', 
                                  borderRadius: '4px',
                                  cursor: 'pointer'
                                }}
                              >
                                Reject
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CompanyDashboard;