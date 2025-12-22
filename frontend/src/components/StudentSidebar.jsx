import React, { useState } from 'react';
import styles from './StudentSidebar.module.css';
import { Link, useLocation } from 'react-router-dom';

const StudentSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  
  const menuItems = [
    { id: 'profile', label: 'My Profile', icon: '👤' },
    { id: 'favorites', label: 'Favorite Jobs', icon: '⭐' },
    { id: 'applications', label: 'My Applications', icon: '📝' },
    { id: 'recommended', label: 'For You', icon: '🎯' },
  ];

  return (
    <aside className={styles.sidebar} style={{ width: isOpen ? '240px' : '70px' }}>
      <button className={styles.menuBtn} onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '✖' : '☰'}
      </button>

      {menuItems.map((item) => (
  <Link
    key={item.id}
    to={`/student/${item.id}`} // This changes the URL to /student/profile, etc.
    className={`${styles.navItem} ${location.pathname.includes(item.id) ? styles.activeItem : ''}`}
  >
    <span className={styles.icon}>{item.icon}</span>
    <span className={styles.label}>{item.label}</span>
  </Link>
))}
    </aside>
  );
};

export default StudentSidebar;