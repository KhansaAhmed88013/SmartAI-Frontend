import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = await api.login(email, password, role || null)
      localStorage.setItem('token', data.token)
      onLogin(data.token)
      navigate('/dashboard')
    } catch (err) {
      setError('Login failed')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-industrial-dark via-industrial-gray to-industrial-blue dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-industrial-dark dark:text-gray-100 mb-1 sm:mb-2">SmartAI Factory</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">Industrial Machine Monitoring System</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-industrial-blue focus:border-transparent outline-none transition"
              placeholder="admin@smartai.factory"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-industrial-blue focus:border-transparent outline-none transition"
              placeholder="••••••••"
              required
            />
          </div>
          
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Role (Optional - Demo Testing)
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-industrial-blue focus:border-transparent outline-none transition"
            >
              <option value="">Use Account Role</option>
              <option value="SYSTEM_ADMIN">System Admin</option>
              <option value="MAINTENANCE_ENGINEER">Maintenance Engineer</option>
              <option value="MACHINE_OPERATOR">Machine Operator</option>
            </select>
          </div>
          
          <button
            type="submit"
            className="w-full bg-industrial-blue text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
          >
            Sign In
          </button>
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </form>
        
        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Demo Mode - Test different roles</p>
        </div>
      </div>
    </div>
  )
}

export default Login
