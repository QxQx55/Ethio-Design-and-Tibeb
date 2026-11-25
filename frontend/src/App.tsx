import { CartProvider } from "./context/CartContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { WishlistProvider } from "./context/WishlistContext";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { Toaster } from "./components/ui/sonner";
import { motion, useScroll, useSpring } from "framer-motion";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { ShopPage } from "./pages/ShopPage";
import { LookbookPage } from "./pages/LookbookPage";
import { MakersPage } from "./pages/MakersPage";
import { CartPage } from "./pages/CartPage";
import { UserDashboard } from "./pages/UserDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
import { StaffDashboard } from "./pages/StaffDashboard";
import { useEffect } from "react";
import { Mail } from "lucide-react";
import { Button } from "./components/ui/button";
import { UserRole } from "./types";

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: UserRole[] }) {
  const { isAuthenticated, user, loading, isEmailVerified, logout } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#f7f5f0]">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-[#2b2a26]" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/" replace />;

  if (!isEmailVerified) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4 p-4 text-center">
        <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <Mail className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold">Verify your email</h2>
        <p className="max-w-md text-muted-foreground">
          You need to verify your email address to access this page. Please check your inbox for the verification link.
        </p>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => window.location.reload()}>
            I've verified
          </Button>
          <Button variant="ghost" onClick={() => logout()}>
            Sign out
          </Button>
        </div>
      </div>
    );
  }

  const userRole = user?.role;

  if (roles && userRole && !roles.includes(userRole)) {
    if (userRole === "admin" || userRole === "staff") {
      return <Navigate to="/admin-dashboard" replace />;
    }
    return <Navigate to="/shop" replace />;
  }

  return <>{children}</>;
}

function AuthRedirect() {
  const { isAuthenticated, user, loading, isEmailVerified } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAuthenticated && user && isEmailVerified) {
      const currentPath = window.location.pathname;
      if (currentPath === "/shop" && (user.role === "admin" || user.role === "staff")) {
        navigate("/admin-dashboard", { replace: true });
      }
    }
  }, [isAuthenticated, user, loading, navigate, isEmailVerified]);

  return null;
}

function AppContent() {
  const { pathname } = useLocation();
  const isRunwayLanding = pathname === "/";
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#2b2a26] selection:bg-[#8d4a39]/15 transition-colors duration-500">
      {!isRunwayLanding && (
        <motion.div
          className="fixed left-0 right-0 top-0 z-[60] h-0.5 origin-left bg-[#8d4a39]"
          style={{ scaleX }}
        />
      )}

      <Navbar />

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/lookbook" element={<LookbookPage />} />
          <Route path="/makers" element={<MakersPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute roles={["user"]}>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute roles={["admin", "staff"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff-dashboard"
            element={
              <ProtectedRoute roles={["staff"]}>
                <StaffDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/admin" element={<Navigate to="/admin-dashboard" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isRunwayLanding && <Footer />}
      <Toaster position="top-center" expand={true} richColors />
      <AuthRedirect />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
