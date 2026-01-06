import { useEffect, useState } from 'react';

export default function PostNewJob({ handleCreateJob, handleUpdateJob, editingJob, resetJobForm }) {
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
      setTitle(''); setType('internship'); setDescription(''); setRequirements(''); setLocation(''); setSalary(''); setDeadline('');
    }
  }, [editingJob]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const jobData = { title, type, description, requirements, location, salary, deadline };
    if (editingJob) {
      await handleUpdateJob(jobData);
    } else {
      await handleCreateJob(jobData);
    }
    // resetJobForm();
    setTitle(''); setType('internship'); setDescription(''); setRequirements(''); setLocation(''); setSalary(''); setDeadline('');
  };

  return (
    <div>
      <h2>{editingJob ? 'Edit Job' : 'Post New Job'}</h2>
      <form onSubmit={onSubmit} style={{ maxWidth: 700 }}>
        <input type="text" placeholder="Job Title" value={title} onChange={(e) => setTitle(e.target.value)} required style={{ width: '100%', padding: 8, marginBottom: 8 }} />
        <select value={type} onChange={(e) => setType(e.target.value)} style={{ width: '100%', padding: 8, marginBottom: 8 }}>
          <option value="internship">Internship</option>
          <option value="full-time">Full Time</option>
          <option value="part-time">Part Time</option>
          <option value="remote">Remote</option>
        </select>
        <textarea placeholder="Job Description" value={description} onChange={(e) => setDescription(e.target.value)} required style={{ width: '100%', padding: 8, marginBottom: 8, minHeight: 120 }} />
        <textarea placeholder="Requirements" value={requirements} onChange={(e) => setRequirements(e.target.value)} style={{ width: '100%', padding: 8, marginBottom: 8, minHeight: 80 }} />
        <input type="text" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} style={{ width: '100%', padding: 8, marginBottom: 8 }} />
        <input type="text" placeholder="Salary" value={salary} onChange={(e) => setSalary(e.target.value)} style={{ width: '100%', padding: 8, marginBottom: 8 }} />
        <input type="date" placeholder="Application Deadline" value={deadline} onChange={(e) => setDeadline(e.target.value)} style={{ width: '100%', padding: 8, marginBottom: 8 }} />
        <div>
          <button type="submit" style={{ marginRight: 8 }}>{editingJob ? 'Update Job' : 'Post Job'}</button>
          <button type="button" onClick={() => { resetJobForm(); setTitle(''); setType('internship'); setDescription(''); setRequirements(''); setLocation(''); setSalary(''); setDeadline(''); }}>Cancel</button>
        </div>
      </form>
    </div>
  );
} 
