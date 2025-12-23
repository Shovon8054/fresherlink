import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Navbar.module.css'; // Import the new CSS module
import logo from '../assets/logo.png';
import { getNotifications, markNotificationAsRead } from '../services/api';
import PostModal from './PostModal';

function Navbar({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  // Notification State
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications on mount if logged in
  useEffect(() => {
    if (auth.token) {
      fetchNotifications();
    }
  }, [auth.token]);

  const fetchNotifications = async () => {
    try {
      const { data } = await getNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  const handleMarkAsRead = async (id, isRead) => {
    if (isRead) return; // Already read
    try {
      await markNotificationAsRead(id);
      // Optimistic update
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  const handleLogout = () => {
    auth.logout();
    if (typeof onLogout === 'function') onLogout();
    navigate('/');
  };

  const goToDashboard = () => {
    if (auth.role === 'student') navigate('/student');
    else if (auth.role === 'company') navigate('/company');
    else navigate('/');
  };

  const handleLogoClick = () => {
    if (auth.token) {
      if (auth.role === 'student') navigate('/student/profile');
      else if (auth.role === 'company') navigate('/company');
      else navigate('/');
    } else {
      navigate('/login');
    }
  };

  // Show the Dashboard button only on the jobs (browse) page for students
  const showStudentDashboardButton =
    auth.token &&
    auth.role === 'student' &&
    (location.pathname === '/jobs' || location.pathname.startsWith('/jobs/'));

  return (
    <nav className={styles.navbar}>
      <img src={logo} alt="FresherLink logo" className={styles.logoImage} onClick={handleLogoClick} />

      <div className={styles.buttonGroup}>
        {/* Jobs button visible to all users */}
        <button onClick={() => navigate('/jobs')} className={`${styles.navButton} ${styles.jobsBtn}`}>
          Jobs
        </button>

        {auth.token ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

            <button
              onClick={() => setIsPostModalOpen(true)}
              className={styles.navButton}
              title="Create Post"
              style={{ fontSize: '1.2rem', padding: '8px 12px', background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              ➕
            </button>
            <PostModal
              isOpen={isPostModalOpen}
              onClose={() => setIsPostModalOpen(false)}
              onSuccess={() => {
                navigate('/my-posts');
              }}
            />

            {/* PEOPLE LINK */}
            <button
              onClick={() => navigate('/people')}
              style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', padding: '8px', marginRight: '4px' }}
              title="People"
            >
              👥
            </button>

            {/* NOTIFICATION BELL */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', padding: '8px', position: 'relative' }}
                title="Notifications"
              >
                🔔
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '0',
                    right: '0',
                    backgroundColor: 'red',
                    color: 'white',
                    borderRadius: '50%',
                    padding: '2px 6px',
                    fontSize: '0.7rem',
                    fontWeight: 'bold'
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '100%',
                  backgroundColor: 'white',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  borderRadius: '8px',
                  overflowY: 'auto',
                  maxHeight: '300px',
                  width: '300px',
                  zIndex: 1001,
                  border: '1px solid #eee'
                }}>
                  <div style={{ padding: '12px', borderBottom: '1px solid #eee', fontWeight: 'bold', color: '#333' }}>
                    Notifications
                  </div>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#999', fontSize: '0.9rem' }}>
                      No notifications yet.
                    </div>
                  ) : (
                    <div>
                      {notifications.map(notif => (
                        <div
                          key={notif._id}
                          onClick={() => handleMarkAsRead(notif._id, notif.isRead)}
                          style={{
                            padding: '12px',
                            borderBottom: '1px solid #f0f0f0',
                            cursor: notif.isRead ? 'default' : 'pointer',
                            backgroundColor: notif.isRead ? '#fff' : '#f0f9ff',
                            opacity: notif.isRead ? 0.6 : 1,
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => { if (!notif.isRead) e.currentTarget.style.backgroundColor = '#e0f2fe'; }}
                          onMouseLeave={(e) => { if (!notif.isRead) e.currentTarget.style.backgroundColor = '#f0f9ff'; }}
                        >
                          <p style={{ margin: 0, fontSize: '0.9rem', color: '#333' }}>{notif.message}</p>
                          <span style={{ fontSize: '0.75rem', color: '#888', marginTop: '4px', display: 'block' }}>
                            {new Date(notif.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* SETTINGS DROPDOWN */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={styles.navButton}
                style={{ fontSize: '1.2rem', padding: '8px 12px', background: 'transparent', border: 'none', cursor: 'pointer' }}
                title="Settings"
              >
                ⚙️
              </button>

              {isDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '100%',
                  backgroundColor: 'white',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  zIndex: 1000,
                  minWidth: '150px'
                }}>
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      navigate('/privacy');
                    }}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '10px 16px',
                      textAlign: 'left',
                      background: 'none',
                      border: 'none',
                      borderBottom: '1px solid #f0f0f0',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#f9fafb'}
                    onMouseLeave={(e) => e.target.style.background = 'none'}
                  >
                    Privacy
                  </button>
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      handleLogout();
                    }}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '10px 16px',
                      textAlign: 'left',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#ef4444',
                      fontSize: '14px'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#fef2f2'}
                    onMouseLeave={(e) => e.target.style.background = 'none'}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <button onClick={() => navigate('/')} className={`${styles.navButton} ${styles.loginBtn}`}>
            Login
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;