import React, { useEffect, useState } from 'react';
import {
    getAdminStats,
    getAdminUsers,
    getAdminPosts,
    getAdminJobs,
    updateAdminUserStatus,
    deleteAdminUser,
    adminDeletePost,
    deleteAdminJob,
    toggleAdminJobFeatured,
    cleanupAdminExpiredJobs
} from '../services/api';
import VerificationBadge from '../components/VerificationBadge';
import PostCard from '../components/PostCard';

function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState({
        students: 0,
        companies: 0,
        jobs: 0,
        applications: 0,
        recentRegistrations: []
    });
    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    useEffect(() => {
        if (activeTab === 'users') {
            const delayDebounceFn = setTimeout(() => {
                fetchUsers();
            }, 500);
            return () => clearTimeout(delayDebounceFn);
        } else if (activeTab === 'moderation') {
            fetchPosts();
        } else if (activeTab === 'jobs') {
            fetchJobs();
        }
    }, [activeTab, searchTerm, roleFilter]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await getAdminStats();
            setStats(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch statistics');
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await getAdminUsers({ search: searchTerm, role: roleFilter });
            setUsers(response.data);
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    };

    const fetchPosts = async () => {
        try {
            const response = await getAdminPosts();
            setPosts(response.data);
        } catch (err) {
            console.error('Error fetching posts:', err);
        }
    };

    const fetchJobs = async () => {
        try {
            const response = await getAdminJobs();
            setJobs(response.data);
        } catch (err) {
            console.error('Error fetching jobs:', err);
        }
    };

    const handleToggleStatus = async (id, field, currentValue) => {
        try {
            const response = await updateAdminUserStatus(id, { [field]: !currentValue });
            setUsers(users.map(u => u._id === id ? response.data : u));
        } catch (err) {
            alert('Failed to update user status');
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user permanently?')) return;
        try {
            await deleteAdminUser(id);
            setUsers(users.filter(u => u._id !== id));
        } catch (err) {
            alert('Failed to delete user');
        }
    };

    const handlePostDeleted = (id) => {
        setPosts(posts.filter(p => p._id !== id));
    };

    const handleToggleFeatured = async (id) => {
        try {
            const response = await toggleAdminJobFeatured(id);
            setJobs(jobs.map(j => j._id === id ? response.data : j));
        } catch (err) {
            alert('Failed to toggle featured status');
        }
    };

    const handleDeleteJob = async (id) => {
        if (!window.confirm('Delete this job?')) return;
        try {
            await deleteAdminJob(id);
            setJobs(jobs.filter(j => j._id !== id));
        } catch (err) {
            alert('Failed to delete job');
        }
    };

    const handleCleanupExpired = async () => {
        if (!window.confirm('Delete ALL jobs that are past their deadline?')) return;
        try {
            const response = await cleanupAdminExpiredJobs();
            alert(response.data.message);
            fetchJobs();
        } catch (err) {
            alert('Failed to cleanup expired jobs');
        }
    };

    if (loading && activeTab === 'dashboard') return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.2rem' }}>
            Loading Dashboard...
        </div>
    );

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f3f4f6', fontFamily: 'Inter, sans-serif' }}>

            {/* Sidebar */}
            <aside style={sidebarStyle}>
                <div style={{ padding: '30px 20px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827', marginBottom: '40px' }}>Admin Panel</h2>
                    <nav>
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            style={activeTab === 'dashboard' ? activeNavButtonStyle : navButtonStyle}
                        >
                            📊 Dashboard
                        </button>
                        <button
                            onClick={() => setActiveTab('users')}
                            style={activeTab === 'users' ? activeNavButtonStyle : navButtonStyle}
                        >
                            👥 Manage Users
                        </button>
                        <button
                            onClick={() => setActiveTab('jobs')}
                            style={activeTab === 'jobs' ? activeNavButtonStyle : navButtonStyle}
                        >
                            💼 Jobs
                        </button>
                        <button
                            onClick={() => setActiveTab('moderation')}
                            style={activeTab === 'moderation' ? activeNavButtonStyle : navButtonStyle}
                        >
                            🛡️ Moderation
                        </button>
                    </nav>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>

                {activeTab === 'dashboard' && (
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '30px' }}>Dashboard Overview</h1>
                        {/* KPI Cards */}
                        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                            <div style={kpiCardStyle('#3b82f6')}>
                                <h3 style={kpiLabelStyle}>Total Students</h3>
                                <p style={kpiValueStyle}>{stats.students}</p>
                            </div>
                            <div style={kpiCardStyle('#8b5cf6')}>
                                <h3 style={kpiLabelStyle}>Total Companies</h3>
                                <p style={kpiValueStyle}>{stats.companies}</p>
                            </div>
                            <div style={kpiCardStyle('#10b981')}>
                                <h3 style={kpiLabelStyle}>Active Jobs</h3>
                                <p style={kpiValueStyle}>{stats.jobs}</p>
                            </div>
                            <div style={kpiCardStyle('#f59e0b')}>
                                <h3 style={kpiLabelStyle}>Applications</h3>
                                <p style={kpiValueStyle}>{stats.applications}</p>
                            </div>
                        </section>

                        {/* Recent Activity */}
                        <section style={sectionCardStyle}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '20px' }}>Recent Registrations</h2>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={simpleTableStyle}>
                                    <thead>
                                        <tr>
                                            <th style={simpleThStyle}>Email</th>
                                            <th style={simpleThStyle}>Role</th>
                                            <th style={simpleThStyle}>Joined</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.recentRegistrations.map(reg => (
                                            <tr key={reg._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                                <td style={simpleTdStyle}>{reg.email}</td>
                                                <td style={simpleTdStyle}>
                                                    <span style={roleBadgeStyle(reg.role)}>{reg.role}</span>
                                                </td>
                                                <td style={simpleTdStyle}>{new Date(reg.createdAt).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                            <h1 style={{ fontSize: '2rem', fontWeight: '700' }}>Manage Users</h1>
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <input
                                    type="text"
                                    placeholder="Search email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={inputStyle}
                                />
                                <select
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                    style={inputStyle}
                                >
                                    <option value="all">All Roles</option>
                                    <option value="student">Students</option>
                                    <option value="company">Companies</option>
                                    <option value="admin">Admins</option>
                                </select>
                            </div>
                        </div>

                        <section style={sectionCardStyle}>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={tableStyle}>
                                    <thead>
                                        <tr style={tableHeaderRowStyle}>
                                            <th style={thStyle}>User Details</th>
                                            <th style={thStyle}>Role</th>
                                            <th style={thStyle}>Status</th>
                                            <th style={thStyle}>Verification</th>
                                            <th style={thStyle}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(user => (
                                            <tr key={user._id} style={trStyle}>
                                                <td style={tdStyle}>
                                                    <div style={{ fontWeight: '600' }}>{user.email}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>ID: {user._id}</div>
                                                    {user.isVerified && <VerificationBadge />}
                                                </td>
                                                <td style={tdStyle}>
                                                    <span style={roleBadgeStyle(user.role)}>{user.role}</span>
                                                </td>
                                                <td style={tdStyle}>
                                                    <button
                                                        onClick={() => handleToggleStatus(user._id, 'isActive', user.isActive)}
                                                        style={statusButtonStyle(user.isActive)}
                                                    >
                                                        {user.isActive ? 'Active' : 'Suspended'}
                                                    </button>
                                                </td>
                                                <td style={tdStyle}>
                                                    {user.role === 'company' && (
                                                        <button
                                                            onClick={() => handleToggleStatus(user._id, 'isVerified', user.isVerified)}
                                                            style={verifyButtonStyle(user.isVerified)}
                                                        >
                                                            {user.isVerified ? 'Unverify' : 'Verify'}
                                                        </button>
                                                    )}
                                                </td>
                                                <td style={tdStyle}>
                                                    <button
                                                        onClick={() => handleDeleteUser(user._id)}
                                                        style={deleteButtonStyle}
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === 'jobs' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                            <h1 style={{ fontSize: '2rem', fontWeight: '700' }}>Job Moderation</h1>
                            <button
                                onClick={handleCleanupExpired}
                                style={{ ...statusButtonStyle(false), backgroundColor: '#111827', color: 'white' }}
                            >
                                🧹 Cleanup Expired Jobs
                            </button>
                        </div>

                        <section style={sectionCardStyle}>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={tableStyle}>
                                    <thead>
                                        <tr style={tableHeaderRowStyle}>
                                            <th style={thStyle}>Job Title & Company</th>
                                            <th style={thStyle}>Deadline</th>
                                            <th style={thStyle}>Featured</th>
                                            <th style={thStyle}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {jobs.map(job => (
                                            <tr key={job._id} style={trStyle}>
                                                <td style={tdStyle}>
                                                    <div style={{ fontWeight: '600' }}>{job.title}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{job.companyId?.email}</div>
                                                </td>
                                                <td style={tdStyle}>
                                                    {job.deadline ? new Date(job.deadline).toLocaleDateString() : 'No deadline'}
                                                    {job.deadline && new Date(job.deadline) < new Date() && (
                                                        <span style={{ marginLeft: '8px', color: '#ef4444', fontSize: '0.75rem', fontWeight: '600' }}>[EXPIRED]</span>
                                                    )}
                                                </td>
                                                <td style={tdStyle}>
                                                    <button
                                                        onClick={() => handleToggleFeatured(job._id)}
                                                        style={featuredButtonStyle(job.isFeatured)}
                                                    >
                                                        {job.isFeatured ? '★ Featured' : '☆ Feature'}
                                                    </button>
                                                </td>
                                                <td style={tdStyle}>
                                                    <button
                                                        onClick={() => handleDeleteJob(job._id)}
                                                        style={deleteButtonStyle}
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === 'moderation' && (
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '30px' }}>Global Content Moderation</h1>
                        <p style={{ color: '#6b7280', marginBottom: '30px' }}>View and remove offensive content from the entire platform.</p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '30px' }}>
                            {posts.map(post => (
                                <PostCard
                                    key={post._id}
                                    post={post}
                                    onPostDeleted={handlePostDeleted}
                                />
                            ))}
                        </div>
                        {posts.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '100px', color: '#9ca3af', backgroundColor: 'white', borderRadius: '16px' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📭</div>
                                <h3>No posts found on the platform.</h3>
                            </div>
                        )}
                    </div>
                )}

            </main>
        </div>
    );
}

// Styles
const sidebarStyle = {
    width: '280px',
    backgroundColor: '#fff',
    borderRight: '1px solid #e5e7eb',
    boxShadow: '4px 0 6px -1px rgba(0,0,0,0.05)'
};

const navButtonStyle = {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    padding: '12px 15px',
    marginBottom: '8px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
    color: '#4b5563',
    transition: 'all 0.2s'
};

const activeNavButtonStyle = {
    ...navButtonStyle,
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    fontWeight: '600'
};

const kpiCardStyle = (color) => ({
    backgroundColor: '#fff',
    padding: '24px',
    borderRadius: '16px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
    borderTop: `4px solid ${color}`
});

const kpiLabelStyle = {
    fontSize: '0.875rem',
    color: '#6b7280',
    marginBottom: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
};

const kpiValueStyle = {
    fontSize: '1.875rem',
    fontWeight: '800',
    color: '#111827'
};

const sectionCardStyle = {
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '16px',
    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
};

const inputStyle = {
    padding: '10px 15px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    fontSize: '0.9rem',
    backgroundColor: 'white'
};

const simpleTableStyle = {
    width: '100%',
    borderCollapse: 'collapse'
};

const simpleThStyle = {
    textAlign: 'left',
    padding: '12px',
    fontSize: '0.75rem',
    color: '#6b7280',
    textTransform: 'uppercase',
    borderBottom: '1px solid #f3f4f6'
};

const simpleTdStyle = {
    padding: '12px',
    fontSize: '0.9rem',
    color: '#374151'
};

const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse'
};

const tableHeaderRowStyle = {
    borderBottom: '2px solid #f3f4f6'
};

const thStyle = {
    padding: '15px',
    textAlign: 'left',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#4b5563',
    textTransform: 'uppercase'
};

const trStyle = {
    borderBottom: '1px solid #f3f4f6',
    transition: 'background-color 0.2s'
};

const tdStyle = {
    padding: '15px',
    fontSize: '0.95rem',
    color: '#374151'
};

const roleBadgeStyle = (role) => ({
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '600',
    backgroundColor: role === 'company' ? '#ede9fe' : role === 'admin' ? '#fef3c7' : '#dcfce7',
    color: role === 'company' ? '#5b21b6' : role === 'admin' ? '#92400e' : '#166534'
});

const statusButtonStyle = (isActive) => ({
    padding: '6px 12px',
    borderRadius: '6px',
    border: 'none',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    backgroundColor: isActive ? '#dcfce7' : '#fee2e2',
    color: isActive ? '#166534' : '#b91c1c'
});

const verifyButtonStyle = (isVerified) => ({
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid #3b82f6',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    backgroundColor: isVerified ? '#3b82f6' : 'transparent',
    color: isVerified ? '#fff' : '#3b82f6',
    transition: 'all 0.2s'
});

const featuredButtonStyle = (isFeatured) => ({
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid #f59e0b',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    backgroundColor: isFeatured ? '#f59e0b' : 'transparent',
    color: isFeatured ? '#fff' : '#f59e0b',
    transition: 'all 0.2s'
});

const deleteButtonStyle = {
    padding: '6px 12px',
    borderRadius: '6px',
    border: 'none',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    backgroundColor: '#fef2f2',
    color: '#ef4444'
};

export default AdminDashboard;
