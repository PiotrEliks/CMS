import { useEffect } from 'react';
import { Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from './store/auth';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/Dashboard/Home';
import { attach401Interceptor } from './api/axios';
import { ScrollToTop } from './components/common/ScrollToTop';
import AppLayout from './layout/AppLayout';
import SignIn from './pages/AuthPages/SignIn';
import UserProfiles from './pages/UserProfiles';
import Users from './pages/Users';
import ForgotPasswordForm from './components/form/auth/ForgotPasswordForm';
import ResetPasswordForm from './components/form/auth/ResetPasswordForm';
import AlertContainer from './components/common/AlertContainer';
import Roles from './pages/Roles';
import Media from './pages/Media';
import ContentsListPage from './pages/Content/ContentsListPage';
import NewContentPage from './pages/Content/NewContentPage';
import EditContentPage from './pages/Content/EditContentPage';

export default function App() {
  const { checkAuth, user, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
    attach401Interceptor(() => {
      window.location.href = '/login';
    });
  }, []);

  const isPublicPath =
    location.pathname === '/login' ||
    location.pathname === '/forgot-password' ||
    location.pathname.startsWith('/reset-password');

  if (loading) {
    return null;
  }

  if (!user && !isPublicPath) {
    return <Navigate to="/login" replace />;
  }

  if (user && location.pathname === '/login') {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <ScrollToTop />
      <AlertContainer />
      <Routes>
        <Route element={<AppLayout loading={loading} />}>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfiles />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="/roles"
            element={
              <ProtectedRoute>
                <Roles />
              </ProtectedRoute>
            }
          />
          <Route
            path="/media"
            element={
              <ProtectedRoute>
                <Media />
              </ProtectedRoute>
            }
          />
          <Route
            path="/contents"
            element={
              <ProtectedRoute>
                <ContentsListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/contents/new"
            element={
              <ProtectedRoute>
                <NewContentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/contents/:id/edit"
            element={
              <ProtectedRoute>
                <EditContentPage />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route path="/forgot-password" element={<ForgotPasswordForm />} />
        <Route path="/reset-password/:token" element={<ResetPasswordForm />} />
        <Route path="/login" element={<SignIn />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
