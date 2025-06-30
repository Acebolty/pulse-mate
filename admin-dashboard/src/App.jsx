import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import DashboardLayout from "./components/layout/DashboardLayout"
import DashboardOverview from "./pages/DashboardOverview"
import Patients from "./pages/Patients"
import Doctors from "./pages/Doctors"
import Profile from "./pages/Profile"
import LoginPage from "./pages/LoginPage"
import SignupPage from "./pages/SignupPage"
import ProtectedRoute from "./components/auth/ProtectedRoute"
import { isAuthenticated } from "./services/authService"
import "./App.css"

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={!isAuthenticated() ? <LoginPage /> : <Navigate to="/admin/dashboard" replace />}
        />
        <Route
          path="/signup"
          element={!isAuthenticated() ? <SignupPage /> : <Navigate to="/admin/dashboard" replace />}
        />

        {/* Protected admin dashboard routes */}
        <Route path="/admin/*" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Routes>
                <Route path="dashboard" element={<DashboardOverview />} />
                <Route path="patients" element={<Patients />} />
                <Route path="doctors" element={<Doctors />} />
                <Route path="profile" element={<Profile />} />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Root redirect */}
        <Route
          path="/"
          element={<Navigate to={isAuthenticated() ? "/admin/dashboard" : "/login"} replace />}
        />
      </Routes>
    </Router>
  )
}

export default App
