import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import StudentSidebar from '../components/StudentSidebar';

// Import your new views
import ProfileView from './StudentViews/ProfileView';
import FavoritesView from './StudentViews/FavoritesView';
import ApplicationsView from './StudentViews/ApplicationsView';
import RecommendedView from './StudentViews/RecommendedView';

function StudentDashboard() {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* 1. Sidebar on the left */}
      <StudentSidebar />

      {/* 2. Main Content on the right */}
      <div style={{ flex: 1, padding: '40px', backgroundColor: '#f9fafb' }}>


        {/* 3. Nested Routes Area */}
        <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <Routes>
            <Route path="profile" element={<ProfileView />} />
            <Route path="favorites" element={<FavoritesView />} />
            <Route path="applications" element={<ApplicationsView />} />
            <Route path="recommended" element={<RecommendedView />} />
            
            {/* Redirect /student to /student/profile */}
            <Route path="/" element={<Navigate to="profile" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;