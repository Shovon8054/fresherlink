import { useState, useEffect } from 'react';
import { useCard } from '../App';
import { useParams, useNavigate } from 'react-router-dom';
import { getJobById, addFavorite, removeFavorite, applyToJob, getJobComments, addComment, deleteComment } from '../services/api';
import { isDeadlineNear } from '../hooks/useJobUtils';

function JobDetailsPage() {
  const showCard = useCard();
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  useEffect(() => {
    fetchJobDetails();
    fetchComments();
    if (token && role === 'student') {
      checkFavoriteStatus();
    }
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      const response = await getJobById(id);
      setJob(response.data);
    } catch (error) {
      console.error('Error fetching job:', error);
      showCard('Job not found', 'error');
      navigate('/jobs');
    } finally {
      setLoading(false);
    }
  };

  const checkFavoriteStatus = async () => {
    try {
      const response = await checkFavorite(id);
      setIsFavorite(response.data.isFavorite);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await getJobComments(id);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!token || role !== 'student') {
      showCard('Please login as student to comment', 'error');
      return;
    }

    if (!newComment.trim()) {
      showCard('Please enter a comment', 'error');
      return;
    }

    try {
      const response = await addComment(id, newComment);
      setComments([response.data.comment, ...comments]);
      setNewComment('');
    } catch (error) {
      showCard(error.response?.data?.message || 'Error adding comment', 'error');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await deleteComment(commentId);
        setComments(comments.filter(c => c._id !== commentId));
      } catch (error) {
        showCard(error.response?.data?.message || 'Error deleting comment', 'error');
      }
    }
  };

  const handleApply = async () => {
    if (!token || role !== 'student') {
      showCard('Please login as student to apply', 'error');
      return;
    }

    try {
      await applyToJob(id, {});
      showCard('Application submitted successfully!', 'info');
    } catch (error) {
      showCard(error.response?.data?.message || 'Error applying', 'error');
    }
  };

  const toggleFavorite = async () => {
    if (!token || role !== 'student') {
      showCard('Please login as student to save favorites', 'error');
      return;
    }

    try {
      if (isFavorite) {
        await removeFavorite(id);
        setIsFavorite(false);
      } else {
        await addFavorite(id);
        setIsFavorite(true);
      }
    } catch (error) {
      showCard(error.response?.data?.message || 'Error', 'error');
    }
  };

  // deadline helper moved to shared hook

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  if (!job) {
    return <div style={{ padding: '20px' }}>Job not found</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <button onClick={() => navigate('/jobs')} style={{ marginBottom: '20px' }}>
        ← Back to Jobs
      </button>

      {/* Job Details */}
      <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
          <h1 style={{ margin: 0 }}>{job.title}</h1>
          {isDeadlineNear(job.deadline) && (
            <span style={{
              backgroundColor: '#ff6b6b',
              color: 'white',
              padding: '5px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              ⚠️ Deadline Soon!
            </span>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginBottom: '20px' }}>
          <p><strong>Type:</strong> {job.type}</p>
          <p><strong>Location:</strong> {job.location || 'Not specified'}</p>
          <p><strong>Salary:</strong> {job.salary || 'Not specified'}</p>
          <p><strong>Deadline:</strong> {job.deadline ? new Date(job.deadline).toLocaleDateString() : 'Not specified'}</p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3>Description</h3>
          <p style={{ whiteSpace: 'pre-wrap' }}>{job.description}</p>
        </div>

        {job.requirements && (
          <div style={{ marginBottom: '20px' }}>
            <h3>Requirements</h3>
            <p style={{ whiteSpace: 'pre-wrap' }}>{job.requirements}</p>
          </div>
        )}

        {token && role === 'student' && (
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button onClick={handleApply} style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              Apply Now
            </button>
            <button onClick={toggleFavorite} style={{ padding: '10px 20px', backgroundColor: isFavorite ? '#6c757d' : '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              <span style={{ color: isFavorite ? '#ffd700' : '#fff' }}>{isFavorite ? '★' : '☆'}</span> {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
            </button>
          </div>
        )}
      </div>

      {/* Comments Section */}
      <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
        <h2>Comments ({comments.length})</h2>

        {/* Add Comment Form */}
        {token && role === 'student' && (
          <form onSubmit={handleAddComment} style={{ marginBottom: '30px' }}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              rows="3"
              style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
            />
            <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              Post Comment
            </button>
          </form>
        )}

        {/* Comments List */}
        {comments.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>No comments yet. Be the first to comment!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {comments.map((comment) => (
              <div key={comment._id} style={{ borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {comment.userProfile?.photo && (
                      <img
                        src={`http://localhost:8080/${comment.userProfile.photo && comment.userProfile.photo.startsWith('uploads/') ? comment.userProfile.photo : `uploads/profile_pictures/${comment.userProfile.photo}`}`}
                        alt="User"
                        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                    )}
                    <div>
                      <strong>{comment.userProfile?.name || comment.userId?.email || 'Anonymous'}</strong>
                      <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                        {new Date(comment.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {token && role === 'student' && comment.userId?._id?.toString() === localStorage.getItem('userId') && (
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: '#dc3545',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Delete
                    </button>
                  )}
                </div>
                <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{comment.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default JobDetailsPage;

