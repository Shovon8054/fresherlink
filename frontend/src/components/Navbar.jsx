import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Navbar.module.css'; // Import the new CSS module
import logo from '../assets/logo.png';

function Navbar({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();

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
          <>
            <button onClick={handleLogout} className={`${styles.navButton} ${styles.logoutBtn}`}>
              Logout
            </button>
          </>
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