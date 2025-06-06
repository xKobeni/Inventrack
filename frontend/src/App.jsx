import { Routes, Route } from "react-router-dom"
import Login from "./pages/Auth/loginPage"
import ForgotPassword from "./pages/Auth/forgotPasswordPage"
import ResetPassword from "./pages/Auth/resetPasswordPage"
import Dashboard from "./pages/Admin/dashboard"
import ProfilePage from "./pages/Shared/profilePage"
import UserManagement from "./pages/Admin/userManagement"
import AddUser from "./pages/Admin/addUser"
import Error403 from "./pages/Shared/403Error"
import Error404 from "./pages/Shared/404Error"
import Error500 from "./pages/Shared/500Error"
import { Toaster } from "@/components/ui/toaster"
import { ProtectedRoute } from "./utils/ProtectedRoute"
import ErrorBoundary from "./components/ErrorBoundary"
import { useEffect } from "react"
import { generateCSPHeader } from "./utils/csp"
import SecurityTests from "./pages/Admin/securityTests"

function App() {
  // Set security headers
  useEffect(() => {
    // Set CSP header
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = generateCSPHeader();
    document.head.appendChild(meta);

    // Set other security headers
    const headers = {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    };

    // Apply headers to all fetch requests
    const originalFetch = window.fetch;
    window.fetch = function (url, options = {}) {
      const newOptions = {
        ...options,
        headers: {
          ...options.headers,
          ...headers,
        },
        credentials: 'include', // Enable secure cookie handling
      };
      return originalFetch(url, newOptions);
    };

    // Cleanup function
    return () => {
      document.head.removeChild(meta);
      window.fetch = originalFetch;
    };
  }, []);

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/security-tests"
          element={
            <ProtectedRoute>
              <SecurityTests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users/add"
          element={
            <ProtectedRoute>
              <AddUser />
            </ProtectedRoute>
          }
        />
        <Route path="/403" element={<Error403 />} />
        <Route path="/404" element={<Error404 />} />
        <Route path="/500" element={<Error500 />} />
        <Route path="*" element={<Error404 />} />
      </Routes>
      <Toaster />
    </ErrorBoundary>
  )
}

export default App
