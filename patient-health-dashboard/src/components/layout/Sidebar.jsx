"use client"

import { NavLink } from "react-router-dom"
import React, { useState, useEffect } from "react"
import {
  HomeIcon,
  HeartIcon,
  CalendarIcon,
  ChatBubbleLeftIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  BellIcon,
  UserIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline"
import { useAlerts } from "../../contexts/AlertContext"

const Sidebar = ({ isOpen, onClose, isCollapsed, onToggleCollapse }) => {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const { getUnreadCount } = useAlerts()

  const unreadCount = getUnreadCount()
  console.log('Sidebar unread count:', unreadCount) // Debug log

  const navigation = React.useMemo(() => [
    { name: "Dashboard", href: "/dashboard/overview", icon: HomeIcon },
    { name: "Health Metrics", href: "/dashboard/health-metrics", icon: HeartIcon },
    { name: "Appointments", href: "/dashboard/appointments", icon: CalendarIcon },
    { name: "Messages", href: "/dashboard/messages", icon: ChatBubbleLeftIcon, badge: 3 },
    { name: "Alerts", href: "/dashboard/alerts", icon: BellIcon, badge: unreadCount },
    { name: "Profile", href: "/dashboard/profile", icon: UserIcon },
    { name: "Settings", href: "/dashboard/settings", icon: Cog6ToothIcon },
  ], [unreadCount])

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'))
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    setIsDarkMode(document.documentElement.classList.contains('dark'))
    return () => observer.disconnect()
  }, [])
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-900/50 dark:bg-slate-900/70 backdrop-blur-sm" onClick={onClose} />
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-slate-800 shadow-xl dark:border-r dark:border-slate-700 transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } ${isCollapsed ? "lg:w-20" : "lg:w-72"} w-72`}
      >
        {/* Logo section */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100 dark:border-slate-700 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-slate-700 dark:to-slate-700/80">
          <div className={`flex items-center transition-all duration-300 ${isCollapsed ? "justify-center w-full" : "space-x-3"}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
              <HeartIcon className="w-6 h-6 text-white" />
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <span className="text-xl font-bold text-gray-800 dark:text-slate-200">
                  <span className="text-green-500 dark:text-green-400">Pulse</span>
                  <span className="text-gray-700 dark:text-slate-300">Mate</span>
                </span>
              </div>
            )}
          </div>
          
          {/* Mobile close button */}
          <button onClick={onClose} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
            <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-slate-400" />
          </button>
          
          {/* Desktop collapse toggle */}
          <button 
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-xl hover:bg-white dark:hover:bg-slate-700 hover:shadow-md transition-all duration-200 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
          >
            {isCollapsed ? (
              <ChevronRightIcon className="w-3.5 h-4" />
            ) : (
              <ChevronLeftIcon className="w-3.5 h-4" />
            )}
          </button>
        </div>

        {/* User profile section - moved after logo */}
        <div className="p-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-700/50">
          <div className={`flex items-center transition-all duration-300 ${isCollapsed ? "justify-center" : "space-x-3"}`}>
            <div className="relative">
              <img
                className="w-10 h-10 rounded-full ring-2 ring-green-100 shadow-sm"
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt="User avatar"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white dark:border-slate-800"></div>
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0 overflow-hidden">
                <p className="text-sm font-semibold text-gray-800 dark:text-slate-200 truncate">John Doe</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 truncate">Patient ID: #12345</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto min-h-0">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative ${
                  isActive
                    ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 dark:text-green-400 shadow-sm border border-green-100 dark:border-green-800/50 dark:bg-gradient-to-r dark:from-green-700/20 dark:to-emerald-700/20"
                    : "text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-800 dark:hover:text-slate-200 hover:shadow-sm"
                } ${isCollapsed ? "justify-center" : ""}`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`flex items-center ${isCollapsed ? "" : "mr-3"}`}>
                    <item.icon className={`h-5 w-5 flex-shrink-0 transition-transform duration-200 ${
                      isActive ? "text-green-600 dark:text-green-400" : "text-gray-400 dark:text-slate-500 group-hover:text-gray-500 dark:group-hover:text-slate-300 group-hover:scale-110"
                    }`} />
                  </div>
                  
                  {!isCollapsed && (
                    <>
                      <span className="truncate">{item.name}</span>
                      {item.badge !== undefined && item.badge !== null && item.badge > 0 && (
                        <span className={`ml-auto text-xs rounded-full px-2 py-1 font-medium min-w-[20px] text-center ${isActive ? 'bg-green-100 text-green-700 dark:bg-green-600/30 dark:text-green-300' : 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400'}`}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                  
                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-3 py-2 bg-gray-800 dark:bg-slate-200 text-white dark:text-slate-800 text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg">
                      {item.name}
                      {item.badge !== undefined && item.badge !== null && item.badge > 0 && (
                        <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                          {item.badge}
                        </span>
                      )}
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-800 dark:bg-slate-200 rotate-45"></div>
                    </div>
                  )}
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-green-500 dark:bg-green-400 rounded-l-full"></div>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom section - optional help or upgrade card */}
        {!isCollapsed && (
          <div className="flex-shrink-0 p-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-700/80 rounded-xl p-4 border border-blue-100 dark:border-slate-600">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-8 h-8 bg-blue-100 dark:bg-slate-600 rounded-lg flex items-center justify-center">
                  <HeartIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm font-semibold text-blue-800 dark:text-slate-200">Health Tip</span>
              </div>
              <p className="text-xs text-blue-700 dark:text-slate-300 leading-relaxed">
                Remember to stay hydrated and take regular breaks!
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default Sidebar