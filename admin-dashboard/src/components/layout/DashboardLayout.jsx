import { useState, useEffect } from "react"
import Sidebar from "./Sidebar"
import Header from "./Header"
import { getCurrentUser } from "../../services/authService"

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Get current admin user data
    const userData = getCurrentUser()
    setUser(userData)

    // Load sidebar collapsed state from localStorage
    const savedCollapsed = localStorage.getItem('adminSidebarCollapsed')
    if (savedCollapsed !== null) {
      setSidebarCollapsed(JSON.parse(savedCollapsed))
    }
  }, [])

  const toggleSidebarCollapse = () => {
    const newCollapsed = !sidebarCollapsed
    setSidebarCollapsed(newCollapsed)
    localStorage.setItem('adminSidebarCollapsed', JSON.stringify(newCollapsed))
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-900">
      {/* Sidebar with user data */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
        user={user}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with user data */}
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          isCollapsed={sidebarCollapsed}
          user={user}
        />

        {/* Main content with improved styling */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-slate-800 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
