import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './App.css';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import TouristProfileSetup from './pages/TouristProfileSetup';
import TouristDashboard from './pages/TouristDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin = false, requireTourist = false }) => {
  const { isAuthenticated, isAdmin, isTourist, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/tourist/dashboard" replace />;
  }

  if (requireTourist && !isTourist) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

function AppContent() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Tourist Routes */}
        <Route
          path="/tourist/profile-setup"
          element={
            <ProtectedRoute requireTourist={true}>
              <TouristProfileSetup />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tourist/dashboard"
          element={
            <ProtectedRoute requireTourist={true}>
              <TouristDashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;