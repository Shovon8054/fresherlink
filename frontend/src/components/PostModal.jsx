import React, { useState } from 'react';
import { createPost } from '../services/api';

const PostModal = ({ isOpen, onClose, onSuccess }) => {
    const [caption, setCaption] = useState('');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!caption && !file) return alert("Please add caption or file");

        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('caption', caption);
            if (file) {
                formData.append('media', file);
            }

            await createPost(formData);
            setCaption('');
            setFile(null);
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Failed to post", error);
            alert("Failed to create post");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>
                {`
          @keyframes fadeInScale {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          .post-modal-backdrop {
            backdrop-filter: blur(4px);
          }
          .post-modal-card {
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
            animation: fadeInScale 0.2s ease-out;
          }
          textarea::placeholder {
            color: #9ca3af;
          }
        `}
            </style>
            <div
                className="post-modal-backdrop"
                style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
                onClick={onClose} // Close on backdrop click
            >
                <div
                    className="post-modal-card"
                    style={{
                        backgroundColor: 'white', borderRadius: '16px',
                        width: '90%', maxWidth: '550px',
                        padding: '0', overflow: 'hidden',
                        position: 'relative'
                    }}
                    onClick={e => e.stopPropagation()} // Prevent close on modal click
                >
                    {/* Header */}
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '16px 24px', borderBottom: '1px solid #f3f4f6'
                    }}>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', color: '#111827' }}>Create Post</h3>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                fontSize: '1.5rem', color: '#6b7280', padding: '0 4px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                borderRadius: '50%', width: '32px', height: '32px',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={e => e.target.style.backgroundColor = '#f3f4f6'}
                            onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}
                        >
                            &times;
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
                        {/* Body */}
                        <div style={{ padding: '24px' }}>
                            <textarea
                                placeholder="What's on your mind?"
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                style={{
                                    width: '100%', minHeight: '150px',
                                    border: 'none', outline: 'none', resize: 'none',
                                    fontSize: '1.1rem', color: '#374151', fontFamily: 'inherit',
                                    backgroundColor: 'transparent'
                                }}
                            />

                            {/* File Preview */}
                            {file && (
                                <div style={{
                                    marginTop: '10px', padding: '8px',
                                    backgroundColor: '#f3f4f6', borderRadius: '8px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    fontSize: '0.9rem', color: '#4b5563'
                                }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                                        📎 {file.name}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setFile(null)}
                                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444', fontWeight: 'bold' }}
                                    >
                                        ×
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div style={{
                            padding: '16px 24px', borderTop: '1px solid #f3f4f6',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            backgroundColor: '#fff' // Ensure white bg
                        }}>
                            {/* Custom File Input */}
                            <label
                                style={{
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                                    color: '#2563eb', fontWeight: '500', padding: '8px 12px',
                                    borderRadius: '6px', transition: 'background-color 0.2s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#eff6ff'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <input
                                    type="file"
                                    onChange={(e) => setFile(e.target.files[0])}
                                    accept="image/*,video/*"
                                    style={{ display: 'none' }}
                                />
                                <span style={{ fontSize: '1.2rem' }}>📷</span>
                                <span>Add Photo</span>
                            </label>

                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    padding: '10px 24px', background: '#2563eb', color: 'white',
                                    border: 'none', borderRadius: '8px', cursor: loading ? 'default' : 'pointer',
                                    fontWeight: '600', fontSize: '0.95rem',
                                    opacity: loading ? 0.7 : 1,
                                    boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)',
                                    marginTop: '0'
                                }}
                                onMouseEnter={e => !loading && (e.target.style.background = '#1d4ed8')}
                                onMouseLeave={e => !loading && (e.target.style.background = '#2563eb')}
                            >
                                {loading ? 'Posting...' : 'Post'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default PostModal;
