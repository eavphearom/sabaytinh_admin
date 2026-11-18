import { lazy, Suspense, useEffect, useState } from "react";
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from "react-router-dom";

import { ACCESS_DENIED_EVENT } from "../services/apiClient";
import ForbiddenPage from "../pages/ForbiddenPage";

// Layout
import AdminLayout from "../components/layout/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "../features/auth/hooks/useAuth";
import Loading from "../components/ui/Loading";

// import ProtectedRoute from "./ProtectedRoute";

// Lazy-loaded pages
const LoginPage = lazy(() => import("../pages/Auth/LoginPage"));
const DashboardPage = lazy(() => import("../pages/DashboardPage"));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage"));

const BannerPage = lazy(() => import("../pages/BannerPage"));
const BrandPage = lazy(() => import("../pages/BrandPage"));
const CategoryPage = lazy(() => import("../pages/CategoryPage"));
const ColorPage = lazy(() => import("../pages/ColorPage"));
const CustomerPage = lazy(() => import("../pages/CustomerPage"));
const OrderPage = lazy(() => import("../pages/OrderPage"));
const ProfilePage = lazy(() => import("../pages/ProfilePage"));
const ProductPage = lazy(() => import("../pages/ProductPage"));
const ProductCreatePage = lazy(() => import("../pages/ProductCreatePage"));
const ProductEditPage = lazy(() => import("../pages/ProductEditPage"));
const SizePage = lazy(() => import("../pages/SizePage"));
const UserRolePage = lazy(() => import("../pages/UserRolePage"));
const VariantPage = lazy(() => import("../pages/VariantPage"));
const StockMovementPage = lazy(() => import("../pages/StockMovementPage"));
const DeliveryPage = lazy(() => import("../pages/DeliveryPage"));
function PageSuspense() {
  const { pathname, state } = useLocation();
  // Successful saves can return to a list without flashing a page overlay.
  const skipLoading = state?.skipPageLoading === true;
  return (
    <Suspense fallback={skipLoading ? null : <Loading overlay />}>
      <PageContent key={pathname} skipLoading={skipLoading} />
    </Suspense>
  );
}

function PageContent({ skipLoading = false }) {
  const [ready, setReady] = useState(skipLoading);

  useEffect(() => {
    if (skipLoading) return;
    const timer = window.setTimeout(() => setReady(true), 350);
    return () => window.clearTimeout(timer);
  }, [skipLoading]);

  // Only pathname changes remount this boundary; filters and modals stay mounted.
  return (
    <>
      <Outlet />
      {!skipLoading && !ready && <Loading overlay />}
    </>
  );
}
export default function AppRoutes() {
  const { user } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    const denied = () => navigate("/forbidden", { replace: true });
    window.addEventListener(ACCESS_DENIED_EVENT, denied);
    return () => window.removeEventListener(ACCESS_DENIED_EVENT, denied);
  }, [navigate]);
  return (
    <Routes>
      <Route path="/forbidden" element={user ? <ForbiddenPage /> : <Navigate to="/login" replace />} />
      {/* Public */}
      <Route
        path="/login"
        element={
          user?.role === "ADMIN" ? <Navigate to="/" replace /> : <LoginPage />
        }
      />

      {/* Protected */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route element={<PageSuspense />}>
            <Route index element={<DashboardPage />} />
            <Route path="/banner" element={<BannerPage />} />
            <Route path="/category" element={<CategoryPage />} />
            <Route path="/brand" element={<BrandPage />} />
            <Route path="/color" element={<ColorPage />} />
            <Route path="/size" element={<SizePage />} />
            <Route path="/products" element={<ProductPage />} />
            <Route path="/products/create" element={<ProductCreatePage />} />
            <Route path="/products/:id/edit" element={<ProductEditPage />} />
            <Route path="/variants" element={<VariantPage />} />
            <Route path="/stock-movement" element={<StockMovementPage />} />
            <Route path="/settings/delivery" element={<DeliveryPage />} />
            <Route path="/setting/delivery" element={<Navigate to="/settings/delivery" replace />} />
            <Route path="/orders" element={<OrderPage />} />
            <Route path="/customers" element={<CustomerPage />} />
            <Route path="/user-role" element={<UserRolePage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>
      </Route>

      {/* Not Found */}
      <Route
        path="*"
        element={
          <Suspense fallback={<Loading />}>
            <NotFoundPage />
          </Suspense>
        }
      />
    </Routes>
  );
}
