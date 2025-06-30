import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  BellIcon,
  SunIcon,
  MoonIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline"
import { logout } from "../../services/authService"

const Header = ({ onMenuClick, isCollapsed, user }) => {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const navigate = useNavigate()
  const profileMenuRef = useRef(null)

  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode")
    if (savedMode === "true") {
      document.documentElement.classList.add("dark")
      setIsDarkMode(true)
    } else {
      document.documentElement.classList.remove("dark")
      setIsDarkMode(false)
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const toggleDarkMode = () => {
    const newMode = !isDarkMode
    setIsDarkMode(newMode)
    localStorage.setItem("darkMode", newMode.toString())
    
    if (newMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good Morning! 🌅"
    if (hour < 17) return "Good Afternoon! ☀️"
    return "Good Evening! 🌙"
  }

  const handleSignOut = () => {
    logout(navigate)
    setShowProfileMenu(false)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery)
      setSearchQuery("")
      setShowSearch(false)
    }
  }

  const getDisplayName = () => {
    if (user) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Admin'
    }
    return 'Loading...'
  }

  const getUserEmail = () => {
    return user?.email || 'admin@pulsemate.com'
  }

  return (
    <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-slate-700 sticky top-0 z-30">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left side */}
        <div className="flex items-center space-x-6">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-2xl text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all duration-200"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>

          {/* Greeting */}
          <div className="hidden md:block">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              {getTimeBasedGreeting()}
            </h1>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              Welcome back, {getDisplayName().split(' ')[0]}
            </p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            {showSearch ? (
              <form onSubmit={handleSearch} className="flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search patients, doctors..."
                  className="w-64 px-4 py-2 text-sm bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowSearch(false)}
                  className="ml-2 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
                >
                  ×
                </button>
              </form>
            ) : (
              <button
                onClick={() => setShowSearch(true)}
                className="p-2 rounded-2xl text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all duration-200"
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Notifications */}
          <button className="relative p-2 rounded-2xl text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all duration-200">
            <BellIcon className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </button>

          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-2xl text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all duration-200"
          >
            {isDarkMode ? (
              <SunIcon className="w-5 h-5" />
            ) : (
              <MoonIcon className="w-5 h-5" />
            )}
          </button>

          {/* Profile dropdown */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-3 p-2 rounded-2xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-all duration-200"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-medium text-sm">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
              {!isCollapsed && (
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {getDisplayName()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    Admin
                  </p>
                </div>
              )}
            </button>

            {/* Profile dropdown menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {getDisplayName()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {getUserEmail()}
                  </p>
                </div>
                
                <button
                  onClick={() => {
                    navigate('/admin/profile')
                    setShowProfileMenu(false)
                  }}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors duration-200"
                >
                  <UserCircleIcon className="w-4 h-4 mr-3" />
                  View Profile
                </button>
                
                <hr className="my-2 border-gray-200 dark:border-slate-700" />
                
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
