import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import DashboardLayout from "./components/layout/DashboardLayout"
import DashboardOverview from "./pages/DashboardOverview"
import HealthMetrics from "./pages/HealthMetrics"
import Appointments from "./pages/Appointments"
import Messages from "./pages/Messages"
import Settings from "./pages/Settings"


import Alerts from "./pages/Alerts"
import Profile from "./pages/ProfileNew"
import LandingPage from "./pages/LandingPage"
import LoginPage from "./pages/LoginPage"
import SignupPage from "./pages/SignupPage"
import ProtectedRoute from "./components/auth/ProtectedRoute"
import { AlertProvider } from "./contexts/AlertContext"


import { isAuthenticated } from "./services/authService"
import "./App.css"

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing page as default route */}
        <Route path="/" element={<LandingPage />} />

        {/* Public routes */}
        <Route
          path="/login"
          element={!isAuthenticated() ? <LoginPage /> : <Navigate to="/dashboard/overview" replace />}
        />
        <Route
          path="/signup"
          element={!isAuthenticated() ? <SignupPage /> : <Navigate to="/dashboard/overview" replace />}
        />

        {/* Protected dashboard routes */}
        <Route path="/dashboard/*" element={
          <ProtectedRoute>
              <AlertProvider>
                <DashboardLayout>
                <Routes>
                  <Route path="overview" element={<DashboardOverview />} />
                  <Route path="health-metrics" element={<HealthMetrics />} />
                  <Route path="appointments" element={<Appointments />} />
                  <Route path="messages" element={<Messages />} />
                  <Route path="alerts" element={<Alerts />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="settings" element={<Settings />} />


                </Routes>
                </DashboardLayout>
              </AlertProvider>
          </ProtectedRoute>
        } />

        {/* Root redirect */}
        <Route
          path="/"
          element={<Navigate to={isAuthenticated() ? "/dashboard/overview" : "/login"} replace />}
        />

        {/* Catch all redirect */}
        <Route
          path="*"
          element={<Navigate to={isAuthenticated() ? "/dashboard/overview" : "/login"} replace />}
        />
      </Routes>
    </Router>
  )
}

export default App
