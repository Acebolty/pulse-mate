import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Assuming you use React Router
import api from '../services/api'; // Uncomment and use our API utility

const SignupPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      // Destructure to remove confirmPassword before sending to backend
      // Also, ensure only expected fields are sent if your form collects more
      const { confirmPassword, ...signupData } = formData; 
      
      // Add other optional fields from your Profile.jsx if you collect them at signup
      // For example, if you have dateOfBirth, gender in your signup form:
      // signupData.dateOfBirth = formData.dateOfBirth; 
      // signupData.gender = formData.gender;

      const response = await api.post('/auth/signup', signupData);
      setSuccess(response.data.message || 'Registration successful! Please log in.');
      // Clear form or redirect
      setFormData({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
      setTimeout(() => {
        navigate('/login'); // Redirect to login page after a short delay
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-800 p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-slate-100">
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <p className="text-sm text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-700/30 p-3 rounded-md">{error}</p>}
          {success && <p className="text-sm text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-700/30 p-3 rounded-md">{success}</p>}
          
          <div className="rounded-md shadow-sm">
            <div className="mb-2">
              <label htmlFor="firstName" className="sr-only">First Name</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 placeholder-gray-500 dark:placeholder-slate-400 text-gray-900 dark:text-slate-200 dark:bg-slate-700 focus:outline-none focus:ring-green-500 focus:border-green-500 dark:focus:ring-green-600 dark:focus:border-green-600 sm:text-sm"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <div className="mb-2">
              <label htmlFor="lastName" className="sr-only">Last Name</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 placeholder-gray-500 dark:placeholder-slate-400 text-gray-900 dark:text-slate-200 dark:bg-slate-700 focus:outline-none focus:ring-green-500 focus:border-green-500 dark:focus:ring-green-600 dark:focus:border-green-600 sm:text-sm"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <div className="mb-2">
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 placeholder-gray-500 dark:placeholder-slate-400 text-gray-900 dark:text-slate-200 dark:bg-slate-700 focus:outline-none focus:ring-green-500 focus:border-green-500 dark:focus:ring-green-600 dark:focus:border-green-600 sm:text-sm"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <div className="mb-2">
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 placeholder-gray-500 dark:placeholder-slate-400 text-gray-900 dark:text-slate-200 dark:bg-slate-700 focus:outline-none focus:ring-green-500 focus:border-green-500 dark:focus:ring-green-600 dark:focus:border-green-600 sm:text-sm"
                placeholder="Password (min. 6 characters)"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 placeholder-gray-500 dark:placeholder-slate-400 text-gray-900 dark:text-slate-200 dark:bg-slate-700 focus:outline-none focus:ring-green-500 focus:border-green-500 dark:focus:ring-green-600 dark:focus:border-green-600 sm:text-sm"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:bg-green-500 dark:hover:bg-green-600 dark:focus:ring-offset-slate-800 disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-slate-400">
          Already have an account?{' '}
          <button onClick={() => navigate('/login')} className="font-medium text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300">
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
