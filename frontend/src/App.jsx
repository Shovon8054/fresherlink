import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import JobsPage from './pages/JobsPage';
import StudentDashboard from './pages/StudentDashboard';
import CompanyDashboard from './pages/CompanyDashboard';

function App() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        
        <Route 
          path="/student" 
          element={token && role === 'student' ? <StudentDashboard /> : <Navigate to="/" />} 
        />
        
        <Route 
          path="/company" 
          element={token && role === 'company' ? <CompanyDashboard /> : <Navigate to="/" />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
