import { useEffect } from "react";
import { Route, Routes, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "./store/auth";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/Dashboard/Home";
import { attach401Interceptor } from "./api/axios";
import { ScrollToTop } from "./components/common/ScrollToTop";
import AppLayout from "./layout/AppLayout";
import SignIn from "./pages/AuthPages/SignIn";
import UserProfiles from "./pages/UserProfiles";
import Users from "./pages/Users";

export default function App() {
  const { checkAuth, user, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
    attach401Interceptor(() => {
      window.location.href = "/login";
    });
  }, []);

  if (!loading && !user && location.pathname !== "/login") {
    return <Navigate to="/login" replace />;
  }

  if (location.pathname === "/login" && user) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <ScrollToTop />
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
        </Route>
        <Route path="/login" element={<SignIn />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
