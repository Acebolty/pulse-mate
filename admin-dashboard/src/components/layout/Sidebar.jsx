"use client"

import { NavLink } from "react-router-dom"
import {
  HomeIcon,
  UserGroupIcon,
  UserIcon,
  CalendarIcon,
  Cog6ToothIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline"

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: HomeIcon },
  { name: "Patients", href: "/admin/patients", icon: UserGroupIcon },
  { name: "Doctors", href: "/admin/doctors", icon: ShieldCheckIcon },
  { name: "Appointments", href: "/admin/appointments", icon: CalendarIcon },
  { name: "Profile", href: "/admin/profile", icon: UserIcon },
]

const Sidebar = ({ isOpen, onClose, isCollapsed, onToggleCollapse, user }) => {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-white dark:bg-slate-800 shadow-xl transition-all duration-300 ease-in-out lg:static lg:inset-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 ${
          isCollapsed ? "w-20" : "w-72"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-slate-700">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <ShieldCheckIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                  PulseMate
                </h1>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  Admin Portal
                </p>
              </div>
            </div>
          )}

          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-2xl text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all duration-200"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>

          {/* Desktop collapse toggle */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-2 rounded-2xl text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all duration-200"
          >
            {isCollapsed ? (
              <ChevronRightIcon className="w-5 h-5" />
            ) : (
              <ChevronLeftIcon className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* User Profile Section */}
        {!isCollapsed && user && (
          <div className="p-4 border-b border-gray-200 dark:border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-medium text-sm">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-400 truncate">
                  Admin
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto min-h-0">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `group flex items-center px-3 py-3 text-sm font-medium rounded-2xl transition-all duration-200 relative ${
                  isActive
                    ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 dark:text-green-400 shadow-sm border border-green-100 dark:border-green-800/50 dark:bg-gradient-to-r dark:from-green-700/20 dark:to-emerald-700/20"
                    : "text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-800 dark:hover:text-slate-200 hover:shadow-sm"
                } ${isCollapsed ? "justify-center" : ""}`
              }
            >
              <item.icon
                className={`flex-shrink-0 w-5 h-5 transition-colors duration-200 ${
                  isCollapsed ? "" : "mr-3"
                }`}
              />
              {!isCollapsed && (
                <span className="truncate">{item.name}</span>
              )}
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-slate-700 text-white text-xs rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  {item.name}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        {!isCollapsed && (
          <div className="p-4 border-t border-gray-200 dark:border-slate-700">
            <div className="text-xs text-gray-500 dark:text-slate-400 text-center">
              <p>PulseMate Admin v1.0</p>
              <p className="mt-1">© 2024 All rights reserved</p>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default Sidebar
