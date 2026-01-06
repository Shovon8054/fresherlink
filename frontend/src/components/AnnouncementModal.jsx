import React, { useState } from 'react';
import { useCard } from '../App';
import { sendAdminAnnouncement } from '../services/api';

const AnnouncementModal = ({ isOpen, onClose }) => {
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    if (!isOpen) return null;

    const showCard = useCard();
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) return showCard("Please enter a message", 'error');

        try {
            setLoading(true);
            await sendAdminAnnouncement(message);
            setSent(true);
            setMessage('');
            setTimeout(() => {
                setSent(false);
                onClose();
            }, 2000); // Show "Sent" for 2 seconds then close
        } catch (error) {
            console.error("Failed to send announcement", error);
            showCard("Failed to send announcement", 'error');
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
          .ann-modal-backdrop {
            backdrop-filter: blur(4px);
          }
          .ann-modal-card {
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
            animation: fadeInScale 0.2s ease-out;
          }
        `}
            </style>
            <div
                className="ann-modal-backdrop"
                style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
                onClick={onClose}
            >
                <div
                    className="ann-modal-card"
                    style={{
                        backgroundColor: 'white', borderRadius: '16px',
                        width: '90%', maxWidth: '500px',
                        padding: '0', overflow: 'hidden',
                        position: 'relative'
                    }}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '16px 24px', borderBottom: '1px solid #f3f4f6',
                        backgroundColor: '#111827', color: 'white'
                    }}>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>📢 Send Announcement</h3>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                fontSize: '1.5rem', color: 'rgba(255,255,255,0.7)', padding: '0 4px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                borderRadius: '50%', width: '32px', height: '32px',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => e.target.style.color = '#fff'}
                            onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.7)'}
                        >
                            &times;
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
                        {/* Body */}
                        <div style={{ padding: '24px' }}>
                            <p style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: '#6b7280' }}>
                                This message will be sent to ALL users on the platform.
                            </p>
                            <textarea
                                placeholder="Type your announcement here..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                style={{
                                    width: '100%', minHeight: '120px',
                                    padding: '12px', borderRadius: '8px',
                                    border: '1px solid #e5e7eb', outline: 'none', resize: 'none',
                                    fontSize: '1rem', color: '#111827', fontFamily: 'inherit',
                                    backgroundColor: '#f9fafb'
                                }}
                            />
                        </div>

                        {/* Footer */}
                        <div style={{
                            padding: '16px 24px', borderTop: '1px solid #f3f4f6',
                            display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                            backgroundColor: '#fff', gap: '12px'
                        }}>
                            <button
                                type="button"
                                onClick={onClose}
                                style={{
                                    padding: '10px 20px', background: '#fff', color: '#374151',
                                    border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer',
                                    fontWeight: '500'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || sent}
                                style={{
                                    padding: '10px 24px', background: sent ? '#10b981' : '#111827', color: 'white',
                                    border: 'none', borderRadius: '8px', cursor: (loading || sent) ? 'default' : 'pointer',
                                    fontWeight: '600', fontSize: '0.95rem',
                                    opacity: loading ? 0.7 : 1,
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                }}
                            >
                                {sent ? '✓ Sent' : loading ? 'Sending...' : 'Broadcast Announcement'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default AnnouncementModal;
