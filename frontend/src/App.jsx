import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Jobs from './Jobs';
import Student from './Student';
import Company from './Company';

function App() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/jobs" element={<Jobs />} />
        
        <Route 
          path="/student" 
          element={token && role === 'student' ? <Student /> : <Navigate to="/" />} 
        />
        
        <Route 
          path="/company" 
          element={token && role === 'company' ? <Company /> : <Navigate to="/" />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
