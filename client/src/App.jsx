import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import StudentDashboard from './pages/StudentDashboard';
import RequestDetail from './pages/RequestDetail';

function App() {
  // For now, default to userId 1 - in production, this would come from authentication
  const defaultUserId = 1;

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to={`/students/${defaultUserId}/requests`} replace />} />
        <Route path="/students/:userId/requests" element={<StudentDashboard />} />
        <Route path="/students/:userId/requests/:requestId" element={<RequestDetail />} />
        <Route path="/students/:userId/requests/:requestId/edit" element={<div>Edit Form - Coming Soon</div>} />
        <Route path="/students/:userId/requests/new" element={<div>New Request Form - Coming Soon</div>} />
      </Routes>
    </Router>
  );
}

export default App;
