import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import JobsPage from './pages/JobsPage';
import JobDetailsPage from './pages/JobDetailsPage';
import StudentDashboard from './pages/StudentDashboard';
import CompanyDashboard from './pages/companyViews/CompanyDashboard';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import { useAuth } from './context/AuthContext';

function AppContent() {
  const { token, role } = useAuth();
  const location = useLocation();

  // Logic: Hide navbar on home and authentication pages (/, /login, /signup)
  const isAuthPage = location.pathname === "/" || location.pathname === "/login" || location.pathname === "/signup";

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!isAuthPage && <Navbar />}
      
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<LoginPage />} />
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
        </Routes>
      </main>

      <Footer />
    </div>
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