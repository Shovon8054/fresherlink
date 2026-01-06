import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAllJobs, addFavorite, removeFavorite, applyToJob, checkFavorite, getMyApplications, getFavorites } from '../services/api';
import JobCard from '../components/JobCard';
//import Navbar from '../components/Navbar';

function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [favorites, setFavorites] = useState({});
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  useEffect(() => {
    if (token && role === 'student') {
      fetchAppliedJobs();
      fetchFavorites();
    }
  }, [token, role]);

  const fetchAppliedJobs = async () => {
    try {
      const { data } = await getMyApplications();
      // Assuming data is an array of application objects, each with a jobId
      const ids = new Set(data.map(app => app.jobId._id || app.jobId));
      setAppliedJobIds(ids);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const fetchFavorites = async () => {
    try {
      const { data } = await getFavorites();
      const favMap = {};
      data.forEach(fav => {
        favMap[fav.jobId._id || fav.jobId] = true;
      });
      setFavorites(favMap);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [type]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('search') || '';
    if (q) {
      setSearch(q);
      fetchJobs(q);
    } else {
      // If no search param, fetch all (or apply current type filter)
      fetchJobs();
    }
  }, [location.search]);

  const fetchJobs = async (overrideSearch) => {
    try {
      const params = {};
      if (type) params.type = type;
      const searchTerm = overrideSearch !== undefined ? overrideSearch : search;
      if (searchTerm) params.search = searchTerm;

      const response = await getAllJobs(params);
      setJobs(response.data.jobs || response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const q = search.trim();
    navigate(`/jobs${q ? '?search=' + encodeURIComponent(q) : ''}`);
    fetchJobs(q);
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
      await applyToJob(jobId, {});
      alert('Application submitted successfully!');
      setAppliedJobIds(prev => new Set(prev).add(jobId));
    } catch (error) {
      alert(error.response?.data?.message || 'Error applying');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* <Navbar /> */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h1>All Jobs</h1>
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
          <JobCard
            key={job._id}
            job={job}
            onView={(id) => navigate(`/jobs/${id}`)}
            onToggleFavorite={toggleFavorite}
            onApply={handleApply}
            isFavorite={!!favorites[job._id]}
            isApplied={appliedJobIds.has(job._id)}
          />
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
                  <button
                    onClick={() => !appliedJobIds.has(selectedJob._id) && handleApply(selectedJob._id)}
                    style={{ marginRight: '10px', backgroundColor: appliedJobIds.has(selectedJob._id) ? '#6c757d' : '', cursor: appliedJobIds.has(selectedJob._id) ? 'default' : 'pointer' }}
                    disabled={appliedJobIds.has(selectedJob._id)}
                  >
                    {appliedJobIds.has(selectedJob._id) ? 'Applied' : 'Apply Now'}
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