import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../features/auth/hooks/useAuth";
import Loading from "../components/ui/Loading";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  // Wait while checking authentication
  if (loading) {
    return <Loading />;
  }
  // Redirect unauthenticated user
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Authentication and authorization failures have different destinations.
  if (user.role !== "ADMIN") {
    return <Navigate to="/forbidden" replace />;
  }
  // Render protected child route
  return <Outlet />;
}
