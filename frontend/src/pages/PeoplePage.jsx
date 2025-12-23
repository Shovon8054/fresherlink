import React, { useEffect, useState } from 'react';
import { getAllUsers, followUser, unfollowUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StudentSidebar from '../components/StudentSidebar';
import CompanySidebar from '../components/CompanySidebar';

const PeoplePage = () => {
    const { user, role } = useAuth(); // Assume user object has basic details or at least id
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);

    const currUserId = user?.id || user?._id || user?.userId || user;

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data } = await getAllUsers();
            // Filter out my own profile if it exists in the list (based on userId)
            const otherProfiles = data.filter(p => p.userId?._id !== currUserId);
            setProfiles(otherProfiles);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFollowToggle = async (profile) => {
        if (!profile.userId) return; // Safety check
        const targetUserId = profile.userId._id;

        try {
            const isFollowing = profile.userId.followers.includes(currUserId);

            // Optimistic update
            setProfiles(prev => prev.map(p => {
                if (p._id === profile._id) { // Match by Profile ID
                    let updatedFollowers = [...p.userId.followers];
                    if (isFollowing) {
                        updatedFollowers = updatedFollowers.filter(id => id !== currUserId);
                    } else {
                        updatedFollowers.push(currUserId);
                    }

                    return {
                        ...p,
                        userId: {
                            ...p.userId,
                            followers: updatedFollowers
                        }
                    };
                }
                return p;
            }));

            if (isFollowing) {
                await unfollowUser(targetUserId);
            } else {
                await followUser(targetUserId);
            }
        } catch (error) {
            console.error("Failed to follow/unfollow", error);
            // Revert on failure
            fetchUsers();
        }
    };

    const Sidebar = role === 'student' ? StudentSidebar : CompanySidebar;

    return (
        <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
            <Sidebar />
            <div style={{ flex: 1, padding: '24px', backgroundColor: '#f9fafb' }}>
                <h2 style={{ marginBottom: '24px' }}>People</h2>

                {loading ? (
                    <div>Loading...</div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                        gap: '20px'
                    }}>
                        {profiles.map(p => {
                            if (!p.userId) return null; // Skip if no user data

                            const isFollowing = p.userId.followers.includes(currUserId);
                            const roleDisplay = p.userId.role === 'student' ? 'Student' : 'Company';
                            const photoUrl = p.profilePicture ? `http://localhost:8080/${p.profilePicture}` : null;

                            return (
                                <div key={p._id} style={{
                                    backgroundColor: 'white', padding: '24px', borderRadius: '12px',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)', textAlign: 'center',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                                    transition: 'transform 0.2s', border: '1px solid #f3f4f6'
                                }}>
                                    {/* Profile Picture */}
                                    <div style={{
                                        width: '80px', height: '80px', borderRadius: '50%',
                                        backgroundColor: '#e5e7eb', display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', marginBottom: '16px', overflow: 'hidden',
                                        border: '3px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                    }}>
                                        {photoUrl ? (
                                            <img src={photoUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <span style={{ fontWeight: 'bold', fontSize: '1.5rem', color: '#6b7280' }}>
                                                {p.name ? p.name.charAt(0).toUpperCase() : '?'}
                                            </span>
                                        )}
                                    </div>

                                    <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', color: '#111827', fontWeight: '600' }}>
                                        {p.name || 'Unknown User'}
                                    </h3>

                                    {p.headline && (
                                        <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: '#4b5563', lineHeight: '1.4', maxHeight: '40px', overflow: 'hidden' }}>
                                            {p.headline}
                                        </p>
                                    )}

                                    <div style={{ marginTop: 'auto', width: '100%' }}>
                                        <p style={{ margin: '0 0 16px 0', fontSize: '0.8rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '500' }}>
                                            {roleDisplay}
                                        </p>

                                        <button
                                            onClick={() => handleFollowToggle(p)}
                                            style={{
                                                padding: '8px 0', borderRadius: '6px',
                                                border: isFollowing ? '1px solid #d1d5db' : 'none',
                                                backgroundColor: isFollowing ? 'transparent' : '#2563eb',
                                                color: isFollowing ? '#374151' : 'white',
                                                cursor: 'pointer', fontWeight: '500', fontSize: '0.9rem',
                                                width: '100%',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={e => {
                                                if (!isFollowing) e.target.style.backgroundColor = '#1d4ed8';
                                                else e.target.style.backgroundColor = '#f9fafb';
                                            }}
                                            onMouseLeave={e => {
                                                if (!isFollowing) e.target.style.backgroundColor = '#2563eb';
                                                else e.target.style.backgroundColor = 'transparent';
                                            }}
                                        >
                                            {isFollowing ? 'Following' : 'Follow'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PeoplePage;
