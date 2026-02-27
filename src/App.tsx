import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import NotificationBar from './components/NotificationBar';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SetupFlow from './pages/SetupFlow';
import Collect from './pages/Collect';
import Respond from './pages/Respond';
import Results from './pages/Results';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="size-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <NotificationBar />
          <Routes>
            {/* Public Landing */}
            <Route path="/" element={<Home />} />

            {/* Auth */}
            <Route path="/login" element={<Login />} />

            {/* Protected Area */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/survey/:id/setup" element={<ProtectedRoute><SetupFlow /></ProtectedRoute>} />
            <Route path="/survey/new" element={<ProtectedRoute><SetupFlow /></ProtectedRoute>} />
            <Route path="/survey/:id/collect" element={<ProtectedRoute><Collect /></ProtectedRoute>} />
            <Route path="/survey/:id/results" element={<ProtectedRoute><Results /></ProtectedRoute>} />

            {/* Public Respondent Side */}
            <Route path="/s/:token" element={<Respond />} />

            {/* Settings etc */}
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}
