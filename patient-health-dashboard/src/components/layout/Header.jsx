"use client"

import { 
  Bars3Icon, 
  BellIcon, 
  MagnifyingGlassIcon,
  ChevronDownIcon,
  SunIcon,
  MoonIcon
} from "@heroicons/react/24/outline"
import { useState } from "react"

const Header = ({ onMenuClick, isCollapsed }) => {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  const notifications = [
    { id: 1, text: "Lab results are ready", time: "5 min ago", type: "info" },
    { id: 2, text: "Appointment reminder", time: "1 hour ago", type: "warning" },
    { id: 3, text: "Medication refill due", time: "2 hours ago", type: "urgent" },
  ]

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-30">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left side */}
        <div className="flex items-center space-x-6">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>

          {/* Page title - shows when sidebar is collapsed */}
          {isCollapsed && (
            <div className="hidden lg:block">
              <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
              <p className="text-sm text-gray-500">Welcome back, John!</p>
            </div>
          )}

          {/* Search */}
          <div className="hidden md:block">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search health data, appointments..."
                className="block w-80 pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-3">
          {/* Dark mode toggle */}
          <button 
            onClick={toggleDarkMode}
            className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200"
          >
            {isDarkMode ? (
              <SunIcon className="w-5 h-5" />
            ) : (
              <MoonIcon className="w-5 h-5" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button className="relative p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200 group">
              <BellIcon className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium animate-pulse">
                3
              </span>
            </button>
          </div>

          {/* Profile dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-3 text-sm rounded-2xl p-2 pr-4 hover:bg-gray-50 transition-all duration-200 border border-gray-100 hover:border-gray-200"
            >
              <div className="relative">
                <img
                  className="w-8 h-8 rounded-full ring-2 ring-green-100"
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt="User avatar"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div className="hidden sm:block text-left">
                <p className="font-semibold text-gray-800">John Doe</p>
                <p className="text-xs text-gray-500">Good Morning! 🌅</p>
              </div>
              <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Profile dropdown menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <img
                      className="w-10 h-10 rounded-full"
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                      alt="User avatar"
                    />
                    <div>
                      <p className="font-semibold text-gray-800">John Doe</p>
                      <p className="text-sm text-gray-500">john.doe@email.com</p>
                    </div>
                  </div>
                </div>
                
                <div className="py-2">
                  <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    View Profile
                  </a>
                  <a href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    Settings
                  </a>
                  <a href="/help" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    Help & Support
                  </a>
                </div>
                
                <div className="border-t border-gray-100 pt-2">
                  <button className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile search */}
      <div className="md:hidden px-6 pb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search..."
            className="block w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all duration-200"
          />
        </div>
      </div>
    </header>
  )
}

export default Header