import { useState, useEffect } from 'react'
import api from '../services/api'

const ConnectionTest = () => {
  const [status, setStatus] = useState('testing')
  const [message, setMessage] = useState('')
  const [backendInfo, setBackendInfo] = useState(null)

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Test basic connection to backend root
        const response = await fetch('http://localhost:5001/')
        const text = await response.text()
        
        setBackendInfo({
          status: response.status,
          message: text,
          timestamp: new Date().toLocaleTimeString()
        })

        // Test API endpoint (this will fail if no auth token, which is expected)
        try {
          await api.get('/profile/me')
          setStatus('connected')
          setMessage('✅ Backend connected and API working!')
        } catch (apiError) {
          if (apiError.response?.status === 401) {
            setStatus('connected-no-auth')
            setMessage('✅ Backend connected! (401 expected - no auth token)')
          } else {
            throw apiError
          }
        }
      } catch (error) {
        setStatus('error')
        setMessage(`❌ Connection failed: ${error.message}`)
        console.error('Connection test failed:', error)
      }
    }

    testConnection()
  }, [])

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
      case 'connected-no-auth':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200'
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Backend Connection Test</h2>
      
      <div className={`p-4 rounded-lg border ${getStatusColor()} mb-4`}>
        <p className="font-medium">{message}</p>
      </div>

      {backendInfo && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Backend Response:</h3>
          <p><strong>Status:</strong> {backendInfo.status}</p>
          <p><strong>Message:</strong> {backendInfo.message}</p>
          <p><strong>Time:</strong> {backendInfo.timestamp}</p>
        </div>
      )}

      <div className="mt-6 text-sm text-gray-600">
        <h4 className="font-semibold mb-2">Expected API Endpoints:</h4>
        <ul className="list-disc list-inside space-y-1">
          <li>POST /api/auth/signup - User registration</li>
          <li>POST /api/auth/login - User login</li>
          <li>GET /api/profile/me - Get user profile</li>
          <li>GET /api/health-data - Get health data</li>
          <li>GET /api/alerts - Get alerts</li>
          <li>GET /api/appointments - Get appointments</li>
        </ul>
      </div>
    </div>
  )
}

export default ConnectionTest
