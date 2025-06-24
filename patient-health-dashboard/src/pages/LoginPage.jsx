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
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-slate-100">
            Sign in to your account
          </h2>
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
