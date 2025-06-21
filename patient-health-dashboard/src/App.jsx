import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import DashboardLayout from "./components/layout/DashboardLayout"
import DashboardOverview from "./pages/DashboardOverview"
import HealthMetrics from "./pages/HealthMetrics"
import Appointments from "./pages/Appointments"
import Messages from "./pages/Messages"
import Settings from "./pages/Settings"
import Alerts from "./pages/Alerts"
import Profile from "./pages/Profile"
import "./App.css"
// haha just kidding, no joke here

function App() {
  return (
    <Router>
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<DashboardOverview />} />
          <Route path="/health-metrics" element={<HealthMetrics />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </DashboardLayout>
    </Router>
  )
}

export default App
