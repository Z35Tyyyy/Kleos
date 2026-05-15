import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Results from './pages/Results';
import OAuthCallback from './pages/OAuthCallback';
import Status from './pages/Status';
import SidebarLayout from './components/SidebarLayout';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/status" element={<Status />} />
          <Route path="/oauth/callback" element={<OAuthCallback />} />
          <Route path="/dashboard" element={<ProtectedRoute><SidebarLayout><Dashboard /></SidebarLayout></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><SidebarLayout><History /></SidebarLayout></ProtectedRoute>} />
          <Route path="/results/:id" element={<ProtectedRoute><SidebarLayout><Results /></SidebarLayout></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
