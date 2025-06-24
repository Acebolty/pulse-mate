"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Sidebar from "./Sidebar"
import Header from "./Header"
import api from "../../services/api"

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  // Check authentication and fetch user data
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken')

      if (!token) {
        navigate('/login')
        return
      }

      try {
        // Fetch current user data
        const response = await api.get('/profile/me')
        setUser(response.data)
        setError(null)
      } catch (err) {
        console.error('Failed to fetch user data:', err)
        setError('Failed to load user data')

        // If unauthorized, redirect to login
        if (err.response?.status === 401) {
          localStorage.removeItem('authToken')
          localStorage.removeItem('authUser')
          navigate('/login')
        }
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [navigate])

  // Listen for auth changes (logout from other components)
  useEffect(() => {
    const handleAuthChange = () => {
      const token = localStorage.getItem('authToken')
      if (!token) {
        navigate('/login')
      }
    }

    window.addEventListener('authChange', handleAuthChange)
    return () => window.removeEventListener('authChange', handleAuthChange)
  }, [navigate])

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  // Show error state if there's an error (but user is still authenticated)
  if (error && user) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-slate-900">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
          user={user}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header
            onMenuClick={() => setSidebarOpen(true)}
            isCollapsed={sidebarCollapsed}
            user={user}
          />

          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-slate-800 p-6">
            <div className="max-w-7xl mx-auto">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <p className="text-red-800 dark:text-red-200">⚠️ {error}</p>
              </div>
              {children}
            </div>
          </main>
        </div>
      </div>
    )
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