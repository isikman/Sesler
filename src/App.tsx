import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './hooks/useAuth';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import MyStories from './pages/MyStories';
import DashboardLayout from './components/DashboardLayout';
import LoginSuccess from './components/LoginSuccess';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (user) {
    const targetPath = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={targetPath} replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <>
      <Toaster position="top-right" />
      <LoginSuccess />
      <Routes>
        <Route
          path="/"
          element={
            <PublicRoute>
              <LandingPage />
            </PublicRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/create-story"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <div>Masal Yaratma Sayfası</div>
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/my-stories"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <MyStories />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;