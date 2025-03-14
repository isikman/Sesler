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
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // Kullanıcı giriş yapmamışsa, giriş sayfasına yönlendir ve hedef sayfayı state'de sakla
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();

  // Eğer kullanıcı giriş yapmışsa ve state'de hedef sayfa varsa oraya yönlendir
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