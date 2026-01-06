import React, { useState, useEffect } from 'react';

export default function PostNewJob({ handleCreateJob, handleUpdateJob, editingJob, resetJobForm, onCancel }) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('internship');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [deadline, setDeadline] = useState('');

  useEffect(() => {
    if (editingJob) {
      setTitle(editingJob.title || '');
      setType(editingJob.type || 'internship');
      setDescription(editingJob.description || '');
      setRequirements(editingJob.requirements || '');
      setLocation(editingJob.location || '');
      setSalary(editingJob.salary || '');
      setDeadline(editingJob.deadline ? editingJob.deadline.split('T')[0] : '');
    } else {
      setTitle('');
      setType('internship');
      setDescription('');
      setRequirements('');
      setLocation('');
      setSalary('');
      setDeadline('');
    }
  }, [editingJob]);

  const handleCancel = () => {
    resetJobForm();
    setTitle('');
    setType('internship');
    setDescription('');
    setRequirements('');
    setLocation('');
    setSalary('');
    setDeadline('');
    
    // Call the onCancel prop if provided
    if (onCancel) {
      onCancel();
    } else {
      // Alternative: Use window.history or reload the page with company profile
      console.log('No onCancel handler provided. Redirecting to company profile...');
      window.location.href = '/company/profile';
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const jobData = { title, type, description, requirements, location, salary, deadline };
    if (editingJob) {
      await handleUpdateJob(jobData);
    } else {
      await handleCreateJob(jobData);
    }
    resetJobForm();
    setTitle('');
    setType('internship');
    setDescription('');
    setRequirements('');
    setLocation('');
    setSalary('');
    setDeadline('');
  };

  const styles = {
    container: {
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      padding: '32px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
      maxWidth: '800px',
      margin: '0 auto',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '32px',
      borderBottom: '1px solid #e5e7eb',
      paddingBottom: '16px',
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      color: '#111827',
      margin: 0,
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    },
    formRow: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '20px',
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },
    label: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#374151',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    },
    required: {
      color: '#dc2626',
    },
    input: {
      padding: '12px 16px',
      borderRadius: '8px',
      border: '1px solid #d1d5db',
      fontSize: '14px',
      transition: 'all 0.2s ease',
      backgroundColor: '#ffffff',
      ':focus': {
        outline: 'none',
        borderColor: '#3b82f6',
        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
      },
      '::placeholder': {
        color: '#9ca3af',
      },
    },
    select: {
      padding: '12px 16px',
      borderRadius: '8px',
      border: '1px solid #d1d5db',
      fontSize: '14px',
      backgroundColor: '#ffffff',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      appearance: 'none',
      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
      backgroundPosition: 'right 0.5rem center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: '1.5em 1.5em',
      ':focus': {
        outline: 'none',
        borderColor: '#3b82f6',
        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
      },
    },
    textarea: {
      padding: '12px 16px',
      borderRadius: '8px',
      border: '1px solid #d1d5db',
      fontSize: '14px',
      minHeight: '120px',
      resize: 'vertical',
      fontFamily: 'inherit',
      lineHeight: '1.5',
      transition: 'all 0.2s ease',
      ':focus': {
        outline: 'none',
        borderColor: '#3b82f6',
        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
      },
      '::placeholder': {
        color: '#9ca3af',
      },
    },
    requirementsTextarea: {
      minHeight: '100px',
    },
    salaryContainer: {
      position: 'relative',
    },
    salaryPrefix: {
      position: 'absolute',
      left: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#6b7280',
      fontWeight: '500',
    },
    salaryInput: {
      paddingLeft: '32px',
    },
    buttonGroup: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end',
      marginTop: '32px',
      paddingTop: '24px',
      borderTop: '1px solid #e5e7eb',
    },
    button: {
      padding: '12px 28px',
      borderRadius: '8px',
      fontWeight: '600',
      fontSize: '14px',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
    },
    primaryButton: {
      backgroundColor: '#3b82f6',
      color: 'white',
      ':hover': {
        backgroundColor: '#2563eb',
      },
    },
    secondaryButton: {
      backgroundColor: '#f3f4f6',
      color: '#374151',
      border: '1px solid #d1d5db',
      ':hover': {
        backgroundColor: '#e5e7eb',
      },
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>
          {editingJob ? 'Edit Job Posting' : 'Post New Job'}
        </h2>
      </div>

      <form onSubmit={onSubmit} style={styles.form}>
        <div style={styles.formRow}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              Job Title <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Senior Frontend Developer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              Job Type <span style={styles.required}>*</span>
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
              style={styles.select}
            >
              <option value="internship">🎓 Internship</option>
              <option value="full-time">💼 Full Time</option>
              <option value="part-time">⏱️ Part Time</option>
              <option value="remote">🌍 Remote</option>
            </select>
          </div>
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>
            Job Description <span style={styles.required}>*</span>
          </label>
          <textarea
            placeholder="Describe the role, responsibilities, and what makes this position exciting..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            style={styles.textarea}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Requirements</label>
          <textarea
            placeholder="List required skills, qualifications, and experience..."
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            style={{ ...styles.textarea, ...styles.requirementsTextarea }}
          />
          <small style={{ color: '#6b7280', fontSize: '13px' }}>
            Separate requirements with bullet points or new lines
          </small>
        </div>

        <div style={styles.formRow}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Location</label>
            <input
              type="text"
              placeholder="e.g., New York, NY or Remote"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Salary</label>
            <div style={styles.salaryContainer}>
              <span style={styles.salaryPrefix}>$</span>
              <input
                type="text"
                placeholder="e.g., 80000-120000"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                style={{ ...styles.input, ...styles.salaryInput }}
              />
            </div>
            <small style={{ color: '#6b7280', fontSize: '13px' }}>
              Annual salary or hourly rate
            </small>
          </div>
        </div>

        <div style={styles.formRow}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              Application Deadline <span style={styles.required}>*</span>
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
              style={styles.input}
              min={new Date().toISOString().split('T')[0]}
            />
            <small style={{ color: '#6b7280', fontSize: '13px' }}>
              Applications close on this date
            </small>
          </div>
          <div></div>
        </div>

        <div style={styles.buttonGroup}>
          {/* <button
            type="button"
            onClick={handleCancel}
            style={{ ...styles.button, ...styles.secondaryButton }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            Cancel
          </button> */}
          <button
            type="submit"
            style={{ ...styles.button, ...styles.primaryButton }}
          >
            {editingJob ? (
              <>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Update Job
              </>
            ) : (
              <>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Post Job
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}