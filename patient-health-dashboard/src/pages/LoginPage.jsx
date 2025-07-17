import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Assuming you use React Router for navigation
import api from '../services/api'; // Uncomment and use our API utility
// import { useAuth } from '../context/AuthContext'; // Assuming an AuthContext later for global state

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  // const { login } = useAuth(); // Later from AuthContext

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      // Assuming the backend returns a token and user object
      // { token: "...", user: { id: "...", firstName: "...", ... } }
      
      if (response.data && response.data.token) {
        // Check if user has the correct role for patient dashboard
        if (response.data.user.role !== 'patient') {
          setError('Access denied. This login is for patients only. Please use the correct dashboard for your account type.');
          return;
        }

        localStorage.setItem('authToken', response.data.token); // Store the token
        // Optionally store basic user info, or fetch profile separately after redirect
        localStorage.setItem('authUser', JSON.stringify(response.data.user));

        // TODO: Replace with proper global state management (e.g., Context API / Redux / Zustand)
        // For now, we'll just navigate. The api.js interceptor will pick up the token.
        window.dispatchEvent(new Event("authChange")); // Basic way to notify other parts of app

        navigate('/dashboard/overview'); // Redirect to dashboard
      } else {
        setError('Login failed: No token received.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-800 p-10 rounded-xl shadow-lg">
        <div>
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-slate-100">
            Sign in to PulseMate
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-slate-400">
            Your personal health companion
          </p>
        </div>
        {/* Demo credentials info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Demo Account</h3>
          <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">
            To test the application, you can create an account using the signup form, or use these demo credentials:
          </p>
          <div className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
            <p><strong>Email:</strong> demo@pulsemate.com</p>
            <p><strong>Password:</strong> demo123</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEmail('demo@pulsemate.com');
              setPassword('demo123');
            }}
            className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-medium"
          >
            Fill demo credentials
          </button>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <p className="text-sm text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-700/30 p-3 rounded-md">{error}</p>}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 placeholder-gray-500 dark:placeholder-slate-400 text-gray-900 dark:text-slate-200 dark:bg-slate-700 rounded-t-md focus:outline-none focus:ring-green-500 focus:border-green-500 dark:focus:ring-green-600 dark:focus:border-green-600 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 placeholder-gray-500 dark:placeholder-slate-400 text-gray-900 dark:text-slate-200 dark:bg-slate-700 rounded-b-md focus:outline-none focus:ring-green-500 focus:border-green-500 dark:focus:ring-green-600 dark:focus:border-green-600 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <a href="#" className="font-medium text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300">
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:bg-green-500 dark:hover:bg-green-600 dark:focus:ring-offset-slate-800 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-slate-400">
          Or{' '}
          <button onClick={() => navigate('/signup')} className="font-medium text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300">
            create an account
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
