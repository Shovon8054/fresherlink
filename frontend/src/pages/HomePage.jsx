import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';
import logo from '../assets/logo.png';
import heroVideo from '../assets/home video.mp4';
import heroPoster from '../assets/home background image.jpg';

const categories = [
  'Web Development',
  'Architecture Design',
  'Video Editing',
  'Marketing',
  'Accounting',
];

export default function HomePage() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'FresherLink';
    return () => { document.title = previousTitle; };
  }, []);

  return (
    <div className="home-page">
      <header className="navbar">
        <div className="navbar-left">
          <Link to="/" className="logo-link">
            <img src={logo} alt="FresherLink logo" className="logo" />
          </Link>
        </div>

        <nav className="navbar-right">
          <Link to="/login" className="btn btn-secondary">Log In</Link>
          <Link to="/signup" className="btn btn-primary">Sign Up</Link>
        </nav>
      </header>

      <main className="hero">
        <video className="hero-bg" src={heroVideo} poster={heroPoster} autoPlay loop muted playsInline />

        <div className="hero-overlay">
          <h1 className="hero-title">Your first step into the professional world starts here</h1>

          <div className="search-row">
            <input
              type="search"
              placeholder="search any jobs"
              className="search-input"
            />
            <button className="search-btn">Search</button>
          </div>

          <div className="categories">
            {categories.map((c) => (
              <button key={c} className="category-btn">{c}</button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
