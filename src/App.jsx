import { useState, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

// Admin - AdminLayout is always needed for the shell, load eagerly
import AdminLayout from './admin/components/AdminLayout'
import { authService } from './admin/services/authService'

// Lazy-loaded pages — only downloaded when the user navigates to them
const PropertyApprovals = lazy(() => import('./admin/pages/PropertyApprovals'))
const LandlordRequests = lazy(() => import('./admin/pages/LandlordRequests'))
const PropertyLayout = lazy(() => import('./properties/components/PropertyLayout'))
const ManageProperties = lazy(() => import('./properties/pages/ManageProperties'))
const AddProperty = lazy(() => import('./properties/pages/AddProperty'))
const EditProperty = lazy(() => import('./properties/pages/EditProperty'))
const AdminVisitRequests = lazy(() => import('./admin/pages/AdminVisitRequests'))
const AdminRentalApplications = lazy(() => import('./admin/pages/AdminRentalApplications'))
const Login = lazy(() => import('./admin/pages/Login'))

// A wrapper for routes that need authentication
const ProtectedRoute = ({ children }) => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function DefaultApp() {
  const [count, setCount] = useState(0)

  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>Get started</h1>
          <p>
            Edit <code>src/App.jsx</code> and save to test <code>HMR</code>
          </p>
        </div>
        <button
          className="counter"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Documentation</h2>
          <p>Your questions, answered</p>
          <ul>
            <li>
              <a href="https://vite.dev/" target="_blank">
                <img className="logo" src={viteLogo} alt="" />
                Explore Vite
              </a>
            </li>
            <li>
              <a href="https://react.dev/" target="_blank">
                <img className="button-icon" src={reactLogo} alt="" />
                Learn more
              </a>
            </li>
          </ul>
        </div>
        <div id="social">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2>Connect with us</h2>
          <p>Join the Vite community</p>
          <ul>
            <li>
              <a href="https://github.com/vitejs/vite" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#github-icon"></use>
                </svg>
                GitHub
              </a>
            </li>
            <li>
              <a href="https://chat.vite.dev/" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#discord-icon"></use>
                </svg>
                Discord
              </a>
            </li>
            <li>
              <a href="https://x.com/vite_js" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#x-icon"></use>
                </svg>
                X.com
              </a>
            </li>
            <li>
              <a href="https://bsky.app/profile/vite.dev" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#bluesky-icon"></use>
                </svg>
                Bluesky
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,    // Data stays fresh for 5 minutes — no refetch on page switch
      gcTime: 30 * 60 * 1000,       // Cache kept for 30 minutes
      refetchOnWindowFocus: false,   // Don't refetch when user comes back to tab
      retry: 1,                      // Only retry failed requests once
    },
  },
})

// Sleek loading indicator for lazy-loaded pages
const PageLoader = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    width: '100%',
    background: '#f7f8fc',
  }}>
    <div className="page-loader-spinner" />
  </div>
)

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Redirect root to admin property approvals */}
            <Route path="/" element={<Navigate to="/admin" replace />} />

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />

            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="property-approvals" replace />} />
              <Route path="property-approvals" element={<PropertyApprovals />} />
              <Route path="landlord-requests" element={<LandlordRequests />} />
              <Route path="visit-requests" element={<AdminVisitRequests />} />
              <Route path="rental-applications" element={<AdminRentalApplications />} />
            </Route>

            {/* Landlord/Properties Routes */}
            <Route path="/properties" element={
              <ProtectedRoute>
                <PropertyLayout />
              </ProtectedRoute>
            }>
              <Route index element={<ManageProperties />} />
              <Route path="add" element={<AddProperty />} />
              <Route path="edit/:id" element={<EditProperty />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
