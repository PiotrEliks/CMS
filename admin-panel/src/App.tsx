import { useEffect } from 'react';
import { Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from './store/auth';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/Dashboard/Home';
import { attach401Interceptor } from './api/axios';
import { ScrollToTop } from './components/common/ScrollToTop';
import AppLayout from './layout/AppLayout';
import SignIn from './pages/AuthPages/SignIn';

export default function App() {
  const { checkAuth, user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
    attach401Interceptor(() => {
      window.location.href = '/login';
    });
  }, []);

  if (location.pathname === '/login' && user) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<AppLayout />}>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route path="/login" element={<SignIn />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
