import { useEffect } from 'react';
import { Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from './store/auth';
import { attach401Interceptor } from './api/axios';
import { ScrollToTop } from './components/common/ScrollToTop';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AppLayout from './layout/AppLayout';
import HomePage from './pages/HomePage';
import SignInPage from './pages/AuthPages/SignInPage';
import UserProfilePage from './pages/Users/UserProfilePage';
import UsersPage from './pages/Users/UsersPage';
import ForgotPasswordFormPage from './pages/AuthPages/ForgotPasswordFormPage';
import ResetPasswordFormPage from './pages/AuthPages/ResetPasswordFormPage';
import AlertContainer from './components/common/AlertContainer';
import RolesPage from './pages/Roles/RolesPage';
import MediaPage from './pages/Media/MediaPage';
import ContentsListPage from './pages/Content/ContentsListPage';
import NewContentPage from './pages/Content/NewContentPage';
import EditContentPage from './pages/Content/EditContentPage';
import ContentPreviewPage from './pages/Content/ContentPreviewPage';
import EditMenuPage from './pages/Menus/EditMenuPage';
import MenusListPage from './pages/Menus/MenusListPage';
import SiteSettingsPage from './pages/Settings/SiteSettingsPage';

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
                <UserProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <UsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/roles"
            element={
              <ProtectedRoute>
                <RolesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/media"
            element={
              <ProtectedRoute>
                <MediaPage />
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
          <Route path="/contents/:id/preview" element={<ContentPreviewPage />} />
          <Route path="/menus" element={<MenusListPage />} />
          <Route path="/menus/:id" element={<EditMenuPage />} />
          <Route path="/settings" element={<SiteSettingsPage />} />
        </Route>
        <Route path="/forgot-password" element={<ForgotPasswordFormPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordFormPage />} />
        <Route path="/login" element={<SignInPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
