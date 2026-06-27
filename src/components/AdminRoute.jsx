import { Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import api from '../utils/api'

export default function AdminRoute({ children }) {
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const checkRole = async () => {
      try {
        const profile = await api.getProfile()
        setIsAdmin(profile.role === 'SYSTEM_ADMIN')
      } catch {
        setIsAdmin(false)
      } finally {
        setLoading(false)
      }
    }

    checkRole()
  }, [])

  if (loading) {
    return (
  <div className="flex items-center justify-center h-screen">
    Loading...
  </div>
)
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}