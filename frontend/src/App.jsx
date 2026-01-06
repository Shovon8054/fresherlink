import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import React, { createContext, useState, useContext, useCallback } from 'react';
import Card from './components/Card';
// Card Context for global notifications
const CardContext = createContext();

export function useCard() {
  return useContext(CardContext);
}
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import JobsPage from './pages/JobsPage';
import JobDetailsPage from './pages/JobDetailsPage';
import StudentDashboard from './pages/StudentDashboard';
import CompanyDashboard from './pages/companyViews/CompanyDashboard';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import PrivacyPage from './pages/PrivacyPage';
import MyPostsPage from './pages/MyPostsPage';
import FeedPage from './pages/FeedPage';
import PeoplePage from './pages/PeoplePage';
import AdminDashboard from './pages/AdminDashboard';
import { useAuth } from './context/AuthContext';

function AppContent() {
  const [card, setCard] = useState(null);
  const showCard = useCallback((message, type = 'info') => {
    setCard({ message, type });
    setTimeout(() => setCard(null), 3500);
  }, []);
  const { token, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

  // Logic: Hide navbar on home and authentication pages (/, /login, /signup)
  const isAuthPage = location.pathname === "/" || location.pathname === "/login" || location.pathname === "/signup";

  return (
    <CardContext.Provider value={showCard}>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {!isAuthPage && <Navbar />}

        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<LoginPage initialIsLogin={false} />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/jobs/:id" element={<JobDetailsPage />} />

            <Route
              path="/student/*"
              element={token && role === 'student' ? <StudentDashboard /> : <Navigate to="/" />}
            />

            <Route
              path="/company"
              element={token && role === 'company' ? <CompanyDashboard /> : <Navigate to="/" />}
            />
            <Route
              path="/admin"
              element={token && role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />}
            />
            <Route
              path="/privacy"
              element={token ? <PrivacyPage /> : <Navigate to="/" />}
            />
            <Route
              path="/my-posts"
              element={token ? <MyPostsPage /> : <Navigate to="/" />}
            />
            <Route
              path="/feed"
              element={token ? <FeedPage /> : <Navigate to="/" />}
            />
            <Route
              path="/people"
              element={token ? <PeoplePage /> : <Navigate to="/" />}
            />
          </Routes>
        </main>

        <Footer />
        {card && <Card message={card.message} type={card.type} onClose={() => setCard(null)} />}
      </div>
    </CardContext.Provider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;