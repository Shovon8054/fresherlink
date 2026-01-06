import { useEffect } from 'react';

export default function ManageApplications({ jobs = [], selectedJobId, setSelectedJobId, applicants = [], handleStatusUpdate }) {
  useEffect(() => {
    if ((!selectedJobId || selectedJobId === '') && jobs && jobs.length > 0) {
      setSelectedJobId(jobs[0]._id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobs]);

  return (
    <div>
      <h2>Manage Applications</h2>
      {jobs.length === 0 ? (
        <p>No jobs posted yet. Create a job to see applications.</p>
      ) : (
        <div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ marginRight: 8 }}><strong>Select Job:</strong></label>
            <select value={selectedJobId || ''} onChange={(e) => setSelectedJobId(e.target.value)} style={{ padding: 8, minWidth: 300 }}>
              {jobs.map((job) => (
                <option key={job._id} value={job._id}>{job.title} - {job.type}</option>
              ))}
            </select>
          </div>

          {(!selectedJobId || applicants.filter(a => a.status !== 'rejected').length === 0) ? (
            <p>No applicants for this job yet.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 16 }}>
              {applicants.filter(a => a.status !== 'rejected').map((app) => {
                const photoPath = app.studentProfile?.photo ? (app.studentProfile.photo.startsWith('uploads/') ? app.studentProfile.photo : `uploads/profile_pictures/${app.studentProfile.photo}`) : null;
                const resumePath = app.studentProfile?.resume ? (app.studentProfile.resume.startsWith('uploads/') ? app.studentProfile.resume : `uploads/resumes/${app.studentProfile.resume}`) : null;
                return (
                  <div key={app._id} style={{ border: '1px solid #ddd', padding: 12, borderRadius: 6 }}>
                    {photoPath && <img src={`http://localhost:5000/${photoPath}`} alt="Student" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }} />}
                    <h4>{app.studentProfile?.name || 'Name not provided'}</h4>
                    <p><strong>Email:</strong> {app.studentId?.email}</p>
                    <p><strong>Institution:</strong> {app.studentProfile?.institution || 'Not provided'}</p>
                    <p><strong>Department:</strong> {app.studentProfile?.department || 'Not provided'}</p>
                    <p><strong>Status:</strong> {app.status}</p>
                    {resumePath && (
                      <p style={{ marginTop: 8 }}>
                        <a href={`http://localhost:5000/${resumePath}`} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff' }}>View Resume</a>
                      </p>
                    )}
                    <div style={{ marginTop: 8 }}>
                      {app.status !== 'shortlisted' && <button onClick={() => handleStatusUpdate(app._id, 'shortlisted')} style={{ marginRight: 8 }}>Shortlist</button>}
                      {app.status !== 'rejected' && <button onClick={() => handleStatusUpdate(app._id, 'rejected')} style={{ backgroundColor: '#dc3545', color: 'white' }}>Reject</button>}
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
