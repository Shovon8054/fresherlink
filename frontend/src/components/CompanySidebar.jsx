import React, { useState } from 'react';
import styles from './CompanySidebar.module.css';

export default function CompanySidebar({ currentView, setView }) {
  const [isOpen, setIsOpen] = useState(true);

  const menuItems = [
    { id: 'profile', label: 'Company Profile', icon: '🏢' },
    { id: 'create', label: 'Post New Job', icon: '➕' },
    { id: 'manage', label: 'Manage Jobs', icon: '🧾' },
    { id: 'applications', label: 'Manage Applications', icon: '📨' },
  ];

  return (
    <aside className={styles.sidebar} style={{ width: isOpen ? '240px' : '70px' }}>
      <button className={styles.menuBtn} onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '✖' : '☰'}
      </button>

      {menuItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setView(item.id)}
          className={`${styles.navItem} ${currentView === item.id ? styles.activeItem : ''}`}
        >
          <span className={styles.icon}>{item.icon}</span>
          <span className={styles.label} style={{ opacity: isOpen ? 1 : 0 }}>{item.label}</span>
        </button>
      ))}
    </aside>
  );
}
