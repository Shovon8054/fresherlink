import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllJobs, addFavorite, removeFavorite, applyToJob, checkFavorite } from '../services/api';

function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [favorites, setFavorites] = useState({});
  const navigate = useNavigate();
  
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  useEffect(() => {
    fetchJobs();
  }, [type]);

  const fetchJobs = async () => {
    try {
      const params = {};
      if (type) params.type = type;
      if (search) params.search = search;
      
      const response = await getAllJobs(params);
      setJobs(response.data.jobs || response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const toggleFavorite = async (jobId) => {
    if (!token || role !== 'student') {
      alert('Please login as student to save favorites');
      return;
    }

    try {
      if (favorites[jobId]) {
        await removeFavorite(jobId);
        setFavorites({ ...favorites, [jobId]: false });
      } else {
        await addFavorite(jobId);
        setFavorites({ ...favorites, [jobId]: true });
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Error');
    }
  };

  const handleApply = async (jobId) => {
    if (!token || role !== 'student') {
      alert('Please login as student to apply');
      return;
    }

    try {
      await applyToJob({ jobId });
      alert('Application submitted successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Error applying');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h1>All Jobs</h1>
        <div>
          {token && (
            <button onClick={() => navigate(role === 'student' ? '/student' : '/company')}>
              Dashboard
            </button>
          )}
          {!token && (
            <button onClick={() => navigate('/')}>Login</button>
          )}
        </div>
      </div>

      {/* Search & Filter */}
      <form onSubmit={handleSearch} style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search jobs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '10px', width: '300px', marginRight: '10px' }}
        />
        <select value={type} onChange={(e) => setType(e.target.value)} style={{ padding: '10px' }}>
          <option value="">All Types</option>
          <option value="internship">Internship</option>
          <option value="full-time">Full Time</option>
        </select>
        <button type="submit" style={{ padding: '10px', marginLeft: '10px' }}>Search</button>
      </form>

      {/* Job List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {jobs.map((job) => (
          <div key={job._id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '5px' }}>
            <h3>{job.title}</h3>
            <p><strong>Type:</strong> {job.type}</p>
            <p><strong>Location:</strong> {job.location}</p>
            <p><strong>Salary:</strong> {job.salary}</p>
            <p>{job.description?.substring(0, 100)}...</p>
            
            <div style={{ marginTop: '10px' }}>
              <button onClick={() => setSelectedJob(job)} style={{ marginRight: '5px' }}>
                View Details
              </button>
              
              {token && role === 'student' && (
                <>
                  <button 
                    onClick={() => toggleFavorite(job._id)}
                    style={{ marginRight: '5px' }}
                  >
                    {favorites[job._id] ? '★' : '☆'}
                  </button>
                  <button onClick={() => handleApply(job._id)}>
                    Apply
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Job Details Modal */}
      {selectedJob && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '10px',
            maxWidth: '600px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h2>{selectedJob.title}</h2>
            <p><strong>Type:</strong> {selectedJob.type}</p>
            <p><strong>Location:</strong> {selectedJob.location}</p>
            <p><strong>Salary:</strong> {selectedJob.salary}</p>
            <p><strong>Deadline:</strong> {selectedJob.deadline ? new Date(selectedJob.deadline).toLocaleDateString() : 'N/A'}</p>
            <h3>Description:</h3>
            <p>{selectedJob.description}</p>
            <h3>Requirements:</h3>
            <p>{selectedJob.requirements}</p>
            
            <div style={{ marginTop: '20px' }}>
              {token && role === 'student' && (
                <>
                  <button onClick={() => handleApply(selectedJob._id)} style={{ marginRight: '10px' }}>
                    Apply Now
                  </button>
                  <button onClick={() => toggleFavorite(selectedJob._id)}>
                    {favorites[selectedJob._id] ? 'Remove from Favorites' : 'Add to Favorites'}
                  </button>
                </>
              )}
              <button onClick={() => setSelectedJob(null)} style={{ marginLeft: '10px' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default JobsPage;