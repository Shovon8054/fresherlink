import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { likePost, addPostComment } from '../services/api';

const PostCard = ({ post }) => {
    const { user } = useAuth();
    const currUserId = user?.id || user?._id || user?.userId || user;

    const [isLiked, setIsLiked] = useState(post.likes.includes(currUserId));
    const [likeCount, setLikeCount] = useState(post.likes.length);
    const [comments, setComments] = useState(post.comments || []);
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [commentLoading, setCommentLoading] = useState(false);

    const handleLike = async () => {
        // Optimistic Update
        const previousIsLiked = isLiked;
        const previousCount = likeCount;

        setIsLiked(!isLiked);
        setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);

        try {
            await likePost(post._id);
        } catch (error) {
            console.error("Failed to like post", error);
            // Revert on error
            setIsLiked(previousIsLiked);
            setLikeCount(previousCount);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            setCommentLoading(true);
            const { data } = await addPostComment(post._id, newComment);
            // The endpoint returns the updated post or list of comments?
            // Let's assume it returns the updated Post object, or at least we should append our new comment manually if we want optimistic.
            // But backend usually returns the updated post.
            // Let's verify what `addPostComment` returns. Controller returns `updatedPost`.

            // Update comments list
            setComments(data.comments);
            setNewComment("");
        } catch (error) {
            console.error("Failed to comment", error);
            alert("Failed to submit comment");
        } finally {
            setCommentLoading(false);
        }
    };

    return (
        <div style={{
            backgroundColor: 'white', border: '1px solid #e5e7eb',
            borderRadius: '8px', padding: '16px', marginBottom: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    backgroundColor: '#e5e7eb', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontWeight: 'bold', color: '#6b7280',
                    marginRight: '12px'
                }}>
                    {post.author?.name ? post.author.name.charAt(0).toUpperCase() : '?'}
                </div>
                <div>
                    <div style={{ fontWeight: 'bold', color: '#111827' }}>{post.author?.name || 'Unknown User'}</div>
                    <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                        {new Date(post.createdAt).toLocaleDateString()}
                    </div>
                </div>
            </div>

            {/* Caption */}
            {post.caption && (
                <p style={{ margin: '0 0 12px 0', color: '#374151', lineHeight: '1.5' }}>
                    {post.caption}
                </p>
            )}

            {/* Media */}
            {post.mediaUrl && (
                <div style={{ marginBottom: '12px' }}>
                    {post.mediaType === 'video' ? (
                        <video
                            src={`http://localhost:8080/${post.mediaUrl}`}
                            controls
                            style={{ width: '100%', borderRadius: '8px', maxHeight: '500px' }}
                        />
                    ) : (
                        <img
                            src={`http://localhost:8080/${post.mediaUrl}`}
                            alt="Post media"
                            style={{ width: '100%', borderRadius: '8px', maxHeight: '500px', objectFit: 'cover' }}
                        />
                    )}
                </div>
            )}

            {/* Footer / Stats */}
            <div style={{
                borderTop: '1px solid #f3f4f6', paddingTop: '12px', marginTop: '4px',
                display: 'flex', gap: '20px', color: '#6b7280', fontSize: '0.9rem'
            }}>
                {/* Like Button */}
                <button
                    onClick={handleLike}
                    style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '6px',
                        color: isLiked ? '#ef4444' : '#6b7280',
                        fontWeight: isLiked ? '600' : '400',
                        transition: 'color 0.2s'
                    }}
                >
                    <span>{isLiked ? '❤️' : '🤍'}</span>
                    <span>{likeCount} Likes</span>
                </button>

                {/* Comment Toggle */}
                <button
                    onClick={() => setShowComments(!showComments)}
                    style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '6px',
                        color: '#6b7280'
                    }}
                >
                    <span>💬</span>
                    <span>{comments.length} Comments</span>
                </button>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f3f4f6' }}>
                    {/* Comment List */}
                    <div style={{ marginBottom: '16px' }}>
                        {comments.length === 0 ? (
                            <div style={{ color: '#9ca3af', fontSize: '0.9rem', fontStyle: 'italic' }}>No comments yet.</div>
                        ) : (
                            comments.map((comment, index) => (
                                <div key={index} style={{ marginBottom: '12px' }}>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline' }}>
                                        <span style={{ fontWeight: '600', fontSize: '0.9rem', color: '#1f2937' }}>
                                            {comment.userId?.name || 'User'}:
                                        </span>
                                        <span style={{ fontSize: '0.9rem', color: '#4b5563' }}>{comment.text}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Comment Form */}
                    <form onSubmit={handleCommentSubmit} style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write a comment..."
                            style={{
                                flex: 1, padding: '8px 12px', borderRadius: '20px',
                                border: '1px solid #d1d5db', outline: 'none', fontSize: '0.9rem'
                            }}
                        />
                        <button
                            type="submit"
                            disabled={!newComment.trim() || commentLoading}
                            style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: newComment.trim() ? '#2563eb' : '#9ca3af', fontWeight: '600'
                            }}
                        >
                            Post
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default PostCard;
