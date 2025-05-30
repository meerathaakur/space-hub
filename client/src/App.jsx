import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import Workspace from './pages/workspace/Workspace';
import Team from './pages/team/Team';
import Document from './pages/document/Document';
import Chat from './pages/chat/Chat';
import Calendar from './pages/calendar/Calendar';
import Profile from './pages/profile/Profile';
import { AuthProvider } from './context/AuthContext';
import Workboard from './pages/workboard/Workboard';
import PrivateRoute from './components/auth/PrivateRoute';
import { Navigate } from 'react-router-dom';
import PublicRoute from './components/auth/PublicRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public Routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />

            {/* Protected Routes */}
            <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              
              {/* Workspace Routes */}
              <Route path="workspace">
                <Route index element={<Navigate to="/workspace/1" replace />} />
                <Route path=":id" element={<Workspace />}>
                  <Route index element={<Navigate to="board" replace />} />
                  <Route path="board" element={<Workboard />} />
                </Route>
              </Route>

              {/* Other Protected Routes */}
              <Route path="workboard" element={<Workboard />} />
              <Route path="team" element={<Team />} />
              <Route path="documents" element={<Document />} />
              <Route path="chat" element={<Chat />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
