import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Layout';
import Dashboard from './pages/Dashboard';
import Clubs from './pages/Clubs';
import Resources from './pages/Resources';
import Events from './pages/Events';
import Profiles from './pages/Profiles';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import ProfileView from './pages/ProfileView';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="clubs" element={<Clubs />} />
        <Route path="resources" element={<Resources />} />
        <Route path="events" element={<Events />} />
        <Route path="profiles" element={<Profiles />} />
        <Route path="profiles/:id" element={<ProfileView />} />
      </Route>
    </Routes>
  );
}

export default App;
