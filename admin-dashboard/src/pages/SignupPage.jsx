import { motion } from "framer-motion"
import { ShieldCheckIcon } from "@heroicons/react/24/outline"

const SignupPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center"
      >
        {/* Header */}
        <div className="mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheckIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Admin Registration
          </h1>
          <p className="text-gray-600 dark:text-slate-400 mt-2">
            Access Restricted
          </p>
        </div>

        {/* Message */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
            Admin Access Required
          </h2>
          <p className="text-yellow-700 dark:text-yellow-400 text-sm">
            Admin accounts can only be created by existing system administrators. 
            Please contact your system administrator to request access to the PulseMate Admin Portal.
          </p>
        </div>

        {/* Contact Information */}
        <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">
            Need Access?
          </h3>
          <p className="text-sm text-gray-600 dark:text-slate-400">
            Contact your system administrator or IT department for admin account creation.
          </p>
        </div>

        {/* Back to Login */}
        <a
          href="/login"
          className="inline-flex items-center justify-center w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200"
        >
          Back to Login
        </a>
      </motion.div>
    </div>
  )
}

export default SignupPage
