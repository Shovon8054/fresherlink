import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile, getFavorites, getMyApplications, removeFavorite, getRecommendedJobs } from '../services/api';

function StudentDashboard() {
  const [view, setView] = useState('profile'); // profile, favorites, applications, recommended
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [applications, setApplications] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const navigate = useNavigate();

  // Form data
  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('');
  const [department, setDepartment] = useState('');
  const [skills, setSkills] = useState('');
  const [photo, setPhoto] = useState(null);
  const [resume, setResume] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (view === 'favorites') fetchFavorites();
    if (view === 'applications') fetchApplications();
    if (view === 'recommended') fetchRecommendedJobs();
  }, [view]);

  const fetchProfile = async () => {
    try {
      const response = await getProfile();
      setProfile(response.data);
      setName(response.data.name || '');
      setInstitution(response.data.institution || '');
      setDepartment(response.data.department || '');
      setSkills(response.data.skills ? response.data.skills.join(', ') : '');
      setIsEditing(false);
    } catch (error) {
      console.log('No profile yet, showing create form');
      setProfile(null);
      setIsEditing(true);
    }
  };

  const fetchRecommendedJobs = async () => {
    try {
      const response = await getRecommendedJobs();
      setRecommendedJobs(response.data);
    } catch (error) {
      console.error('Error fetching recommended jobs:', error);
    }
  };

  const fetchFavorites = async () => {
    try {
      const response = await getFavorites();
      setFavorites(response.data);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await getMyApplications();
      setApplications(response.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('name', name);
    formData.append('institution', institution);
    formData.append('department', department);
    // Convert skills string to array
    const skillsArray = skills.split(',').map(s => s.trim()).filter(s => s.length > 0);
    formData.append('skills', JSON.stringify(skillsArray));
    if (photo) formData.append('photo', photo);
    if (resume) formData.append('resume', resume);

    try {
      const response = await updateProfile(formData);
      setProfile(response.data.profile || response.data);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Error updating profile');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const handleRemoveFavorite = async (jobId) => {
    if (window.confirm('Remove this job from favorites?')) {
      try {
        await removeFavorite(jobId);
        // Update local state immediately
        setFavorites(favorites.filter(job => job._id !== jobId));
        alert('Removed from favorites');
      } catch (error) {
        console.error('Error removing favorite:', error);
        alert(error.response?.data?.message || 'Error removing favorite');
      }
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h1>Student Dashboard</h1>
        <div>
          <button onClick={() => navigate('/jobs')} style={{ marginRight: '10px' }}>
            Browse Jobs
          </button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: '20px', borderBottom: '2px solid #ddd' }}>
        <button 
          onClick={() => setView('profile')}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: view === 'profile' ? '#007bff' : 'transparent',
            color: view === 'profile' ? 'white' : 'black',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          My Profile
        </button>
        <button 
          onClick={() => setView('favorites')}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: view === 'favorites' ? '#007bff' : 'transparent',
            color: view === 'favorites' ? 'white' : 'black',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Favorite Jobs ⭐
        </button>
        <button 
          onClick={() => setView('applications')}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: view === 'applications' ? '#007bff' : 'transparent',
            color: view === 'applications' ? 'white' : 'black',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          My Applications
        </button>
        <button 
          onClick={() => setView('recommended')}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: view === 'recommended' ? '#007bff' : 'transparent',
            color: view === 'recommended' ? 'white' : 'black',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Recommended For You
        </button>
      </div>

      {/* Profile View */}
      {view === 'profile' && (
        <div>
          {profile && !isEditing ? (
            <div>
              <h2>My Profile</h2>
              {profile.photo && <img src={`http://localhost:8080/${profile.photo}`} alt="Profile" style={{ width: '150px', height: '150px', borderRadius: '50%' }} />}
              <p><strong>Name:</strong> {profile.name}</p>
              <p><strong>Institution:</strong> {profile.institution}</p>
              <p><strong>Department:</strong> {profile.department}</p>
              {profile.skills && profile.skills.length > 0 && (
                <p><strong>Skills:</strong> {profile.skills.join(', ')}</p>
              )}
              {profile.resume && (
                <p>
                  <strong>Resume:</strong> 
                  <a href={`http://localhost:8080/${profile.resume}`} target="_blank" rel="noopener noreferrer">
                    View Resume
                  </a>
                </p>
              )}
              <button onClick={() => setIsEditing(true)}>Edit Profile</button>
            </div>
          ) : (
            <form onSubmit={handleUpdateProfile}>
              <h2>{profile ? 'Edit Profile' : 'Create Your Profile'}</h2>
              <p style={{ color: '#666', marginBottom: '20px' }}>
                {profile ? 'Update your information below' : 'Please complete your profile to start applying for jobs'}
              </p>
              
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
              />
              
              <input
                type="text"
                placeholder="Institution"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                required
                style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
              />
              
              <input
                type="text"
                placeholder="Department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
                style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
              />
              
              <input
                type="text"
                placeholder="Skills (comma-separated, e.g., JavaScript, React, Node.js)"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
              />
              
              <div style={{ marginBottom: '10px' }}>
                <label>Profile Photo:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhoto(e.target.files[0])}
                />
              </div>
              
              <div style={{ marginBottom: '10px' }}>
                <label>Resume (PDF):</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setResume(e.target.files[0])}
                />
              </div>
              
              <button type="submit" style={{ marginRight: '10px' }}>
                {profile ? 'Save Changes' : 'Create Profile'}
              </button>
              {profile && <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>}
            </form>
          )}
        </div>
      )}

      {/* Favorites View */}
      {view === 'favorites' && (
        <div>
          <h2>My Favorite Jobs</h2>
          {favorites.length === 0 ? (
            <p>No favorite jobs yet. Browse jobs and click ⭐ to save them!</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {favorites.map((job) => (
                <div key={job._id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '5px' }}>
                  <h3>{job.title}</h3>
                  <p><strong>Type:</strong> {job.type}</p>
                  <p><strong>Location:</strong> {job.location}</p>
                  <p><strong>Salary:</strong> {job.salary}</p>
                  <div style={{ marginTop: '10px' }}>
                    <button 
                      onClick={() => navigate('/jobs')} 
                      style={{ marginRight: '5px' }}
                    >
                      View Details
                    </button>
                    <button 
                      onClick={() => handleRemoveFavorite(job._id)}
                      style={{ backgroundColor: '#dc3545', color: 'white' }}
                    >
                      Remove ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Applications View */}
      {view === 'applications' && (
        <div>
          <h2>My Applications</h2>
          {applications.length === 0 ? (
            <p>No applications yet. Browse jobs and apply!</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {applications.map((app) => {
                const statusColors = {
                  pending: { bg: '#ffc107', color: '#000', label: 'Pending' },
                  shortlisted: { bg: '#28a745', color: '#fff', label: 'Shortlisted' },
                  rejected: { bg: '#dc3545', color: '#fff', label: 'Rejected' }
                };
                const statusStyle = statusColors[app.status] || statusColors.pending;
                
                return (
                  <div key={app._id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '5px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ marginTop: '0' }}>{app.jobId?.title || 'Job Title Not Available'}</h3>
                    <p>
                      <strong>Status:</strong>
                      <span style={{ 
                        marginLeft: '10px',
                        padding: '4px 12px',
                        borderRadius: '4px',
                        backgroundColor: statusStyle.bg,
                        color: statusStyle.color,
                        fontWeight: 'bold',
                        display: 'inline-block'
                      }}>
                        {statusStyle.label}
                      </span>
                    </p>
                    <p><strong>Type:</strong> {app.jobId?.type || 'N/A'}</p>
                    <p><strong>Location:</strong> {app.jobId?.location || 'Not specified'}</p>
                    <p><strong>Salary:</strong> {app.jobId?.salary || 'Not specified'}</p>
                    <p><strong>Applied on:</strong> {new Date(app.createdAt).toLocaleDateString()}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Recommended Jobs View */}
      {view === 'recommended' && (
        <div>
          <h2>Recommended For You</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Jobs matching your skills. Update your profile with skills to get better recommendations!
          </p>
          {recommendedJobs.length === 0 ? (
            <p>No recommendations available. Add skills to your profile to get personalized job recommendations!</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {recommendedJobs.map((job) => {
                // Check if deadline is within 3 days
                const isDeadlineNear = (deadline) => {
                  if (!deadline) return false;
                  const deadlineDate = new Date(deadline);
                  const today = new Date();
                  const diffTime = deadlineDate - today;
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  return diffDays >= 0 && diffDays <= 3;
                };

                return (
                  <div key={job._id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '5px', position: 'relative' }}>
                    {isDeadlineNear(job.deadline) && (
                      <span style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        backgroundColor: '#ff6b6b',
                        color: 'white',
                        padding: '4px 10px',
                        borderRadius: '15px',
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }}>
                        ⚠️ Deadline Soon!
                      </span>
                    )}
                    <h3>{job.title}</h3>
                    <p><strong>Type:</strong> {job.type}</p>
                    <p><strong>Location:</strong> {job.location || 'Not specified'}</p>
                    <p><strong>Salary:</strong> {job.salary || 'Not specified'}</p>
                    <p>{job.description?.substring(0, 100)}...</p>
                    <div style={{ marginTop: '10px' }}>
                      <button onClick={() => navigate(`/jobs/${job._id}`)}>
                        View Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;