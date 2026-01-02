import React, { useEffect, useState } from 'react';
import { getFeed } from '../services/api';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';
import StudentSidebar from '../components/StudentSidebar';
import CompanySidebar from '../components/CompanySidebar';
import { Link } from 'react-router-dom';

const FeedPage = () => {
    const { role } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFeed();
    }, []);

    const fetchFeed = async () => {
        try {
            const { data } = await getFeed();
            setPosts(data);
        } catch (error) {
            console.error("Failed to fetch feed", error);
        } finally {
            setLoading(false);
        }
    };

    const Sidebar = role === 'student' ? StudentSidebar : CompanySidebar;

    return (
        <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
            <Sidebar />
            <div style={{ flex: 1, padding: '24px', backgroundColor: '#f9fafb', display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: '100%', maxWidth: '600px' }}>
                    <h2 style={{ marginBottom: '24px' }}>Your Feed</h2>

                    {loading ? (
                        <div>Loading feed...</div>
                    ) : posts.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                            <h3 style={{ color: '#374151', marginBottom: '10px' }}>Your feed is empty!</h3>
                            <p style={{ color: '#6b7280', marginBottom: '20px' }}>Follow people to see their posts here.</p>
                            <Link
                                to="/people"
                                style={{
                                    textDecoration: 'none', backgroundColor: '#2563eb', color: 'white',
                                    padding: '10px 20px', borderRadius: '6px', fontWeight: '500'
                                }}
                            >
                                Find People
                            </Link>
                        </div>
                    ) : (
                        <div>
                            {posts.map(post => (
                                <PostCard
                                    key={post._id}
                                    post={post}
                                    onPostDeleted={(id) => setPosts(posts.filter(p => p._id !== id))}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FeedPage;
