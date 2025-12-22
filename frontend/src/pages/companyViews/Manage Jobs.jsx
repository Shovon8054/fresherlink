import React, { useEffect } from 'react';

export default function ManageJobs({ jobs = [], fetchJobs, startEditJob, handleDeleteJob }) {
  useEffect(() => {
    if (fetchJobs) fetchJobs();
  }, [fetchJobs]);

  return (
    <div>
      <h2>Manage Jobs</h2>
      {jobs.length === 0 ? (
        <p>No jobs posted yet.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {jobs.map((job) => (
            <div key={job._id} style={{ border: '1px solid #ddd', padding: 12, borderRadius: 6 }}>
              <h3>{job.title}</h3>
              <p><strong>Type:</strong> {job.type}</p>
              <p><strong>Location:</strong> {job.location}</p>
              <p><strong>Salary:</strong> {job.salary}</p>
              <div style={{ marginTop: 8 }}>
                <button onClick={() => startEditJob(job)} style={{ marginRight: 8 }}>Edit</button>
                <button onClick={() => { if (confirm('Delete this job?')) handleDeleteJob(job._id); }} style={{ backgroundColor: '#dc3545', color: 'white' }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 
