import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { ShieldCheckIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline"
import { login } from "../services/authService"

const LoginPage = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await login(email, password)
      if (result.success) {
        navigate("/admin/dashboard")
      } else {
        setError(result.error || "Login failed")
      }
    } catch (err) {
      setError("An error occurred during login")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheckIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Admin Portal
          </h1>
          <p className="text-gray-600 dark:text-slate-400 mt-2">
            Sign in to PulseMate Admin Dashboard
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Demo Credentials */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
            Admin Account
          </h3>
          <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">
            For the admin dashboard, use these credentials:
          </p>
          <div className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
            <p><strong>Email:</strong> admin@pulsemate.com</p>
            <p><strong>Password:</strong> admin123</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEmail('admin@pulsemate.com');
              setPassword('admin123');
            }}
            className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-medium"
          >
            Fill credentials
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-2xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 pr-12 border border-gray-200 dark:border-slate-600 rounded-2xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-2xl font-medium hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 dark:text-slate-400">
            Don't have an account?{" "}
            <a
              href="/signup"
              className="text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300 font-medium"
            >
              Contact System Administrator
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default LoginPage
