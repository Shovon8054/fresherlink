import React from 'react';
import { isDeadlineNear } from '../hooks/useJobUtils';

function JobCard({ job, onView, onApply, onToggleFavorite, isFavorite, removeMode = false, isApplied = false }) {

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

      <h3 style={{ marginTop: 0 }}>{job.title}</h3>
      <p><strong>Type:</strong> {job.type}</p>
      <p><strong>Location:</strong> {job.location || 'Not specified'}</p>
      <p><strong>Salary:</strong> {job.salary || 'Not specified'}</p>
      <p>{job.description?.substring(0, 100)}...</p>

      <div style={{ marginTop: '10px' }}>
        <button onClick={() => onView?.(job._id)} style={{ marginRight: '5px' }}>
          View Details
        </button>

        {onToggleFavorite && !removeMode && (
          <button onClick={() => onToggleFavorite(job._id)} style={{ marginRight: '5px' }}>
            {isFavorite ? '★' : '☆'}
          </button>
        )}

        {onToggleFavorite && removeMode && (
          <button onClick={() => onToggleFavorite(job._id)} style={{ backgroundColor: '#dc3545', color: 'white' }}>
            Remove ✕
          </button>
        )}

        {onApply && (
          <button
            onClick={() => !isApplied && onApply(job._id)}
            style={{
              backgroundColor: isApplied ? '#6c757d' : '',
              cursor: isApplied ? 'default' : 'pointer',
              color: isApplied ? 'white' : ''
            }}
            disabled={isApplied}
          >
            {isApplied ? 'Applied' : 'Apply'}
          </button>
        )}
      </div>
    </div>
  );
}

export default JobCard;
