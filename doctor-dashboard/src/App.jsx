import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import YourAppointments from "./pages/YourAppointments";
import Notifications from "./pages/Notifications";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import DashboardOverview from "./pages/DashboardOverview";
import DashboardLayout from "./components/layout/DashboardLayout";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { isAuthenticated } from "./services/authService";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={!isAuthenticated() ? <LoginPage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/signup"
          element={!isAuthenticated() ? <SignupPage /> : <Navigate to="/" replace />}
        />

        {/* Protected dashboard routes */}
        <Route path="/*" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Routes>
                <Route path="/" element={<DashboardOverview />} />
                <Route path="/your_appointments" element={<YourAppointments />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Root redirect */}
        <Route
          path="*"
          element={<Navigate to={isAuthenticated() ? "/" : "/login"} replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;
