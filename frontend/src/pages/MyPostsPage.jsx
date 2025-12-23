import React, { useEffect, useState } from 'react';
import { getMyPosts } from '../services/api';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';
import StudentSidebar from '../components/StudentSidebar';
import CompanySidebar from '../components/CompanySidebar';

const MyPostsPage = () => {
    const { role } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const { data } = await getMyPosts();
            setPosts(data);
        } catch (error) {
            console.error("Failed to fetch my posts", error);
        } finally {
            setLoading(false);
        }
    };

    const Sidebar = role === 'student' ? StudentSidebar : CompanySidebar;

    return (
        <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
            <Sidebar />
            <div style={{ flex: 1, padding: '24px', backgroundColor: '#f9fafb' }}>
                <h2 style={{ marginBottom: '24px' }}>My Posts</h2>

                {loading ? (
                    <div>Loading posts...</div>
                ) : posts.length === 0 ? (
                    <div style={{ color: '#6b7280' }}>You haven't posted anything yet.</div>
                ) : (
                    <div style={{ maxWidth: '600px' }}>
                        {posts.map(post => (
                            <PostCard key={post._id} post={post} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyPostsPage;
