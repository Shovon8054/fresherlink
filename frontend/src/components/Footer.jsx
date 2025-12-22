import React from 'react';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <h3>FresherLink</h3>
          <p>Connecting fresh talent with great opportunities.</p>
        </div>
        <div className={styles.links}>
          <a href="/about">About</a>
          <a href="/jobs">Jobs</a>
          <a href="/contact">Contact</a>
        </div>
        <div className={styles.copyright}>
          &copy; {new Date().getFullYear()} FresherLink. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;