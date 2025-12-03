import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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

  // Show the Dashboard button only on the jobs (browse) page for students
  const showStudentDashboardButton = auth.isAuthenticated && auth.role === 'student' && (location.pathname === '/jobs' || location.pathname === '/');

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
      <h1 style={{ margin: 0, cursor: 'pointer' }} onClick={() => navigate('/')}>
        FresherLink
      </h1>

      <div>
        {auth.isAuthenticated ? (
          <>
            {showStudentDashboardButton && (
              <button onClick={goToDashboard} style={{ marginRight: '10px' }}>
                Dashboard
              </button>
            )}
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <button onClick={() => navigate('/')}>
            Login
          </button>
        )}
      </div>
    </div>
  );
}

export default Navbar;
