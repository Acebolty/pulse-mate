// Simple authentication service for admin dashboard
// In a real application, this would integrate with your backend API

export const isAuthenticated = () => {
  // For demo purposes, always return true
  // In production, check for valid admin token
  return localStorage.getItem('adminToken') !== null || true
}

export const login = async (email, password) => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      if (email === 'admin@pulsemate.com' && password === 'admin123') {
        localStorage.setItem('adminToken', 'dummy-admin-token')
        localStorage.setItem('adminUser', JSON.stringify({
          id: 'admin-001',
          email: 'admin@pulsemate.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin'
        }))
        resolve({ success: true })
      } else {
        resolve({ success: false, error: 'Invalid credentials' })
      }
    }, 1000)
  })
}

export const logout = (navigate) => {
  localStorage.removeItem('adminToken')
  localStorage.removeItem('adminUser')
  if (navigate) {
    navigate('/login')
  }
}

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('adminUser')
  return userStr ? JSON.parse(userStr) : null
}
