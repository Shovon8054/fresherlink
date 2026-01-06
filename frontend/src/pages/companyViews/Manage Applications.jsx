import React, { useEffect, useState } from 'react';

export default function ManageApplications({ jobs = [], selectedJobId, setSelectedJobId, applicants = [], handleStatusUpdate }) {
  const [statusUpdateLoading, setStatusUpdateLoading] = useState({});
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    if ((!selectedJobId || selectedJobId === '') && jobs && jobs.length > 0) {
      setSelectedJobId(jobs[0]._id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobs]);

  const handleStatusUpdateClick = async (applicationId, status) => {
    setStatusUpdateLoading(prev => ({ ...prev, [applicationId]: status }));
    try {
      await handleStatusUpdate(applicationId, status);
    } finally {
      setTimeout(() => {
        setStatusUpdateLoading(prev => ({ ...prev, [applicationId]: null }));
      }, 500);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'shortlisted': return '#10b981';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'shortlisted': return '⭐';
      case 'rejected': return '❌';
      default: return '📄';
    }
  };

  const getJobTypeIcon = (type) => {
    switch (type) {
      case 'internship': return '🎓';
      case 'full-time': return '💼';
      case 'part-time': return '⏰';
      case 'remote': return '🏠';
      default: return '📋';
    }
  };

  const selectedJob = jobs.find(job => job._id === selectedJobId);
  const filteredApplicants = applicants.filter(a => a.status !== 'rejected');
  const shortlistedCount = applicants.filter(a => a.status === 'shortlisted').length;
  const totalApplicants = applicants.length;
  const pendingCount = totalApplicants - shortlistedCount;

  // Styles
  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '30px',
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.08)',
      fontFamily: "'Inter', 'Segoe UI', sans-serif"
    },
    header: {
      fontSize: '32px',
      fontWeight: '700',
      color: '#1a237e',
      marginBottom: '30px',
      paddingBottom: '20px',
      borderBottom: '2px solid #f0f2f5'
    },
    statsBar: {
      display: 'flex',
      gap: '15px',
      marginBottom: '30px',
      flexWrap: 'wrap'
    },
    statCard: {
      flex: 1,
      minWidth: '150px',
      padding: '20px',
      backgroundColor: '#f9faff',
      borderRadius: '12px',
      border: '1px solid #e8eaf6',
      textAlign: 'center'
    },
    statNumber: {
      fontSize: '32px',
      fontWeight: '800',
      color: '#3f51b5',
      marginBottom: '8px'
    },
    statLabel: {
      fontSize: '14px',
      color: '#7986cb',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    jobSelectorContainer: {
      marginBottom: '30px',
      padding: '20px',
      backgroundColor: '#f9faff',
      borderRadius: '12px',
      border: '1px solid #e8eaf6'
    },
    jobSelectorLabel: {
      display: 'block',
      fontSize: '16px',
      fontWeight: '700',
      color: '#5c6bc0',
      marginBottom: '12px'
    },
    jobSelect: {
      width: '100%',
      maxWidth: '500px',
      padding: '14px 20px',
      fontSize: '16px',
      border: '2px solid #c5cae9',
      borderRadius: '10px',
      backgroundColor: 'white',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    jobInfo: {
      marginTop: '15px',
      padding: '15px',
      backgroundColor: 'white',
      borderRadius: '8px',
      borderLeft: '4px solid #3f51b5'
    },
    jobTitle: {
      fontSize: '18px',
      fontWeight: '700',
      color: '#1a237e',
      margin: '0 0 8px 0'
    },
    jobMeta: {
      display: 'flex',
      gap: '15px',
      fontSize: '14px',
      color: '#546e7a'
    },
    emptyState: {
      textAlign: 'center',
      padding: '80px 40px',
      backgroundColor: '#f9faff',
      borderRadius: '16px',
      border: '2px dashed #c5cae9',
      marginTop: '20px'
    },
    emptyIcon: {
      fontSize: '60px',
      marginBottom: '20px',
      color: '#9fa8da'
    },
    emptyTitle: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#5c6bc0',
      marginBottom: '12px'
    },
    emptyText: {
      fontSize: '16px',
      color: '#7986cb',
      marginBottom: '30px',
      maxWidth: '400px',
      margin: '0 auto 30px auto',
      lineHeight: '1.6'
    },
    applicantsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
      gap: '25px'
    },
    applicantCard: {
      border: '2px solid #e8eaf6',
      padding: '25px',
      borderRadius: '14px',
      backgroundColor: '#ffffff',
      transition: 'all 0.3s ease',
      position: 'relative'
    },
    statusBadge: {
      position: 'absolute',
      top: '20px',
      right: '20px',
      padding: '6px 14px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '700',
      letterSpacing: '0.5px',
      textTransform: 'uppercase',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    applicantHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      marginBottom: '20px'
    },
    applicantPhoto: {
      width: '90px',
      height: '90px',
      borderRadius: '50%',
      objectFit: 'cover',
      border: '4px solid #e8eaf6',
      flexShrink: 0
    },
    applicantInfo: {
      flex: 1
    },
    applicantName: {
      fontSize: '22px',
      fontWeight: '700',
      color: '#1a237e',
      margin: '0 0 6px 0'
    },
    applicantEmail: {
      fontSize: '14px',
      color: '#7986cb',
      margin: '0 0 10px 0'
    },
    applicantDetails: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      marginBottom: '25px'
    },
    detailItem: {
      display: 'flex',
      gap: '10px',
      fontSize: '15px',
      color: '#455a64'
    },
    resumeLink: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 20px',
      backgroundColor: '#f0f2ff',
      color: '#3f51b5',
      borderRadius: '8px',
      textDecoration: 'none',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      marginTop: '10px'
    },
    actionButtons: {
      display: 'flex',
      gap: '12px',
      marginTop: '25px',
      paddingTop: '20px',
      borderTop: '1px solid #f0f2f5'
    },
    shortlistButton: {
      padding: '12px 24px',
      backgroundColor: 'transparent',
      color: '#10b981',
      border: '2px solid #10b981',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      flex: 1
    },
    rejectButton: {
      padding: '12px 24px',
      backgroundColor: 'transparent',
      color: '#ef4444',
      border: '2px solid #ef4444',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      flex: 1
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Manage Applications</h2>

      {jobs.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📭</div>
          <h3 style={styles.emptyTitle}>No Jobs Posted Yet</h3>
          <p style={styles.emptyText}>
            You haven't posted any job openings yet. Create a job posting to start receiving applications.
          </p>
        </div>
      ) : (
        <div>
          {/* Stats Bar */}
          {selectedJobId && (
            <div style={styles.statsBar}>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>{totalApplicants}</div>
                <div style={styles.statLabel}>Total Applicants</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>{shortlistedCount}</div>
                <div style={styles.statLabel}>Shortlisted</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>{pendingCount}</div>
                <div style={styles.statLabel}>Pending Review</div>
              </div>
            </div>
          )}

          {/* Job Selector */}
          <div style={styles.jobSelectorContainer}>
            <label style={styles.jobSelectorLabel}>Select Job to Review Applications</label>
            <select 
              value={selectedJobId || ''} 
              onChange={(e) => setSelectedJobId(e.target.value)} 
              style={styles.jobSelect}
            >
              {jobs.map((job) => (
                <option key={job._id} value={job._id}>
                  {job.title} - {job.type} ({applicants.filter(a => a.jobId === job._id && a.status !== 'rejected').length} applicants)
                </option>
              ))}
            </select>
            
            {selectedJob && (
              <div style={styles.jobInfo}>
                <h3 style={styles.jobTitle}>
                  {getJobTypeIcon(selectedJob.type)} {selectedJob.title}
                </h3>
                <div style={styles.jobMeta}>
                  <span>📍 {selectedJob.location || 'Not specified'}</span>
                  <span>💰 {selectedJob.salary || 'Salary not specified'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Applicants List */}
          {!selectedJobId || filteredApplicants.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>👤</div>
              <h3 style={styles.emptyTitle}>No Applicants Yet</h3>
              <p style={styles.emptyText}>
                {selectedJob 
                  ? `No applicants have applied for "${selectedJob.title}" yet. Check back soon!`
                  : 'Select a job to view applications.'}
              </p>
            </div>
          ) : (
            <div style={styles.applicantsGrid}>
              {filteredApplicants.map((app) => {
                const photoPath = app.studentProfile?.photo ? (app.studentProfile.photo.startsWith('uploads/') ? app.studentProfile.photo : `uploads/profile_pictures/${app.studentProfile.photo}`) : null;
                const resumePath = app.studentProfile?.resume ? (app.studentProfile.resume.startsWith('uploads/') ? app.studentProfile.resume : `uploads/resumes/${app.studentProfile.resume}`) : null;
                
                return (
                  <div
                    key={app._id}
                    style={{
                      ...styles.applicantCard,
                      transform: hoveredCard === app._id ? 'translateY(-5px)' : 'translateY(0)',
                      boxShadow: hoveredCard === app._id ? '0 12px 30px rgba(0, 0, 0, 0.12)' : 'none'
                    }}
                    onMouseEnter={() => setHoveredCard(app._id)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    {/* Status Badge */}
                    <div 
                      style={{
                        ...styles.statusBadge,
                        backgroundColor: `${getStatusColor(app.status)}20`,
                        color: getStatusColor(app.status)
                      }}
                    >
                      <span>{getStatusIcon(app.status)}</span>
                      {app.status}
                    </div>

                    {/* Applicant Header */}
                    <div style={styles.applicantHeader}>
                      {photoPath ? (
                        <img 
                          src={`http://localhost:8080/${photoPath}`} 
                          alt="Student" 
                          style={styles.applicantPhoto}
                        />
                      ) : (
                        <div style={{
                          ...styles.applicantPhoto,
                          backgroundColor: '#e8eaf6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '32px'
                        }}>
                          👤
                        </div>
                      )}
                      <div style={styles.applicantInfo}>
                        <h3 style={styles.applicantName}>
                          {app.studentProfile?.name || 'Name not provided'}
                        </h3>
                        <p style={styles.applicantEmail}>
                          📧 {app.studentId?.email || 'Email not provided'}
                        </p>
                      </div>
                    </div>

                    {/* Applicant Details */}
                    <div style={styles.applicantDetails}>
                      <div style={styles.detailItem}>
                        <strong>Institution:</strong> {app.studentProfile?.institution || 'Not provided'}
                      </div>
                      <div style={styles.detailItem}>
                        <strong>Department:</strong> {app.studentProfile?.department || 'Not provided'}
                      </div>
                      <div style={styles.detailItem}>
                        <strong>Applied:</strong> {new Date(app.appliedAt || app.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Resume Link */}
                    {resumePath && (
                      <a
                        href={`http://localhost:8080/${resumePath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.resumeLink}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#3f51b5';
                          e.target.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = '#f0f2ff';
                          e.target.style.color = '#3f51b5';
                        }}
                      >
                        📄 View Resume
                      </a>
                    )}

                    {/* Action Buttons */}
                    <div style={styles.actionButtons}>
                      {app.status !== 'shortlisted' && (
                        <button
                          onClick={() => handleStatusUpdateClick(app._id, 'shortlisted')}
                          style={{
                            ...styles.shortlistButton,
                            opacity: statusUpdateLoading[app._id] === 'shortlisted' ? 0.7 : 1,
                            cursor: statusUpdateLoading[app._id] ? 'wait' : 'pointer'
                          }}
                          onMouseEnter={(e) => {
                            if (!statusUpdateLoading[app._id]) {
                              e.target.style.backgroundColor = '#10b981';
                              e.target.style.color = 'white';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!statusUpdateLoading[app._id]) {
                              e.target.style.backgroundColor = 'transparent';
                              e.target.style.color = '#10b981';
                            }
                          }}
                          disabled={statusUpdateLoading[app._id]}
                        >
                          {statusUpdateLoading[app._id] === 'shortlisted' ? 'Shortlisting...' : '⭐ Shortlist'}
                        </button>
                      )}
                      
                      {app.status !== 'rejected' && (
                        <button
                          onClick={() => handleStatusUpdateClick(app._id, 'rejected')}
                          style={{
                            ...styles.rejectButton,
                            opacity: statusUpdateLoading[app._id] === 'rejected' ? 0.7 : 1,
                            cursor: statusUpdateLoading[app._id] ? 'wait' : 'pointer'
                          }}
                          onMouseEnter={(e) => {
                            if (!statusUpdateLoading[app._id]) {
                              e.target.style.backgroundColor = '#ef4444';
                              e.target.style.color = 'white';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!statusUpdateLoading[app._id]) {
                              e.target.style.backgroundColor = 'transparent';
                              e.target.style.color = '#ef4444';
                            }
                          }}
                          disabled={statusUpdateLoading[app._id]}
                        >
                          {statusUpdateLoading[app._id] === 'rejected' ? 'Rejecting...' : '❌ Reject'}
                        </button>
                      )}
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