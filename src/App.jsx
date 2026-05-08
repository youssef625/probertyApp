import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Admin
import AdminLayout from './admin/components/AdminLayout'
import PropertyApprovals from './admin/pages/PropertyApprovals'
import LandlordRequests from './admin/pages/LandlordRequests'
import AdminLogin from './admin/pages/Login'


// Landlord
import LandlordLayout from './landlord/components/LandlordLayout'
import MyProperties from './landlord/pages/MyProperties'
import RentalApplications from './landlord/pages/RentalApplications'
import VisitRequests from './landlord/pages/VisitRequests'

// Public app
import { hasUserSession, AUTH_STATE_EVENT, isAdminOrLandlordRole, isAdminRole, isLandlordRole } from './services/api'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import PropertyView from './pages/PropertyView'
import Favorites from './pages/Favorites'

// A wrapper for routes that need authentication
const AdminProtectedRoute = ({ children }) => {
  if (!hasUserSession()) return <Navigate to="/admin/login" replace />;
  if (!isAdminRole()) return <Navigate to="/" replace />;
  return children;
};

const LandlordProtectedRoute = ({ children }) => {
  if (!hasUserSession()) return <Navigate to="/login" replace />;
  if (!isLandlordRole()) return <Navigate to="/" replace />;
  return children;
};

const UserProtectedRoute = ({ children }) => {
  if (!hasUserSession()) return <Navigate to="/login" replace />;
  if (isAdminRole()) return <Navigate to="/admin" replace />;
  if (isLandlordRole()) return <Navigate to="/landlord" replace />;
  return children;
};

const UserGuestRoute = ({ children }) => {
  if (hasUserSession()) {
    if (isAdminRole()) return <Navigate to="/admin" replace />;
    if (isLandlordRole()) return <Navigate to="/landlord" replace />;
    return <Navigate to="/" replace />;
  }
  return children;
};

const AdminGuestRoute = ({ children }) => {
  if (hasUserSession()) {
    if (isAdminRole()) return <Navigate to="/admin" replace />;
    if (isLandlordRole()) return <Navigate to="/landlord" replace />;
    return <Navigate to="/" replace />;
  }
  return children;
};

const PublicUserRoute = ({ children }) => {
  if (hasUserSession()) {
    if (isAdminRole()) return <Navigate to="/admin" replace />;
    if (isLandlordRole()) return <Navigate to="/landlord" replace />;
  }
  return children;
};

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

function App() {
  const [authVersion, setAuthVersion] = useState(0)

  useEffect(() => {
    const refreshRoutes = () => setAuthVersion((v) => v + 1)
    window.addEventListener('storage', refreshRoutes)
    window.addEventListener(AUTH_STATE_EVENT, refreshRoutes)

    return () => {
      window.removeEventListener('storage', refreshRoutes)
      window.removeEventListener(AUTH_STATE_EVENT, refreshRoutes)
    }
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes key={authVersion}>
          {/* Public app routes */}
          <Route path="/login" element={<UserGuestRoute><Login /></UserGuestRoute>} />
          <Route path="/register" element={<UserGuestRoute><Register /></UserGuestRoute>} />
          <Route path="/" element={<PublicUserRoute><Home /></PublicUserRoute>} />
          <Route path="/property/:id" element={<UserProtectedRoute><PropertyView /></UserProtectedRoute>} />
          <Route path="/favorites" element={<UserProtectedRoute><Favorites /></UserProtectedRoute>} />

          {/* Admin Auth */}
          <Route path="/admin/login" element={<AdminGuestRoute><AdminLogin /></AdminGuestRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
            <Route index element={<Navigate to="property-approvals" replace />} />
            <Route path="property-approvals" element={<PropertyApprovals />} />
            <Route path="landlord-requests" element={<LandlordRequests />} />
          </Route>

          {/* Landlord */}
          <Route path="/landlord" element={<LandlordProtectedRoute><LandlordLayout /></LandlordProtectedRoute>}>
            <Route index element={<Navigate to="properties" replace />} />
            <Route path="properties" element={<MyProperties />} />
            <Route path="applications" element={<RentalApplications />} />
            <Route path="visits" element={<VisitRequests />} />
          </Route>

          <Route path="*" element={<div className="min-h-screen flex items-center justify-center text-2xl">404 - Page not found</div>} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
