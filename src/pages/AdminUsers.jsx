import { useEffect, useState } from 'react'
import api from '../utils/api'
import { useNavigate } from 'react-router-dom'

const roles = [
  { value: 'MACHINE_OPERATOR', label: 'Machine Operator' },
  { value: 'SYSTEM_ADMIN', label: 'System Admin' },
]

const AdminUsers = () => {
  const navigate = useNavigate()
  const [role, setRole] = useState('')
  const [users, setUsers] = useState([])
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'MACHINE_OPERATOR' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const init = async () => {
      try {
        const profile = await api.getProfile()
        setRole(profile?.role || '')
        if (!(profile?.role === 'SYSTEM_ADMIN' || profile?.role === 'ADMIN')) {
          navigate('/dashboard')
          return
        }
        const list = await api.listUsers()
        setUsers(list)
      } catch (e) {
        setError(e.message || 'Failed to load users')
      }
    }
    init()
  }, [navigate])

  const submit = async () => {
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      await api.createUser(form)
      setSuccess('User created')
      setForm({ name: '', email: '', password: '', role: 'MACHINE_OPERATOR' })
      const list = await api.listUsers()
      setUsers(list)
    } catch (e) {
      setError(e.message || 'Failed to create user')
    } finally {
      setLoading(false)
    }
  }

  const changeRole = async (id, newRole) => {
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      await api.updateUserRole(id, newRole)
      setSuccess('Role updated')
      const list = await api.listUsers()
      setUsers(list)
    } catch (e) {
      setError(e.message || 'Failed to update role')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">User Management</h2>
      {loading && <p className="text-gray-500">Working...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-600">{success}</p>}

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">Create New User</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-500">Name</label>
            <input className="w-full mt-1 p-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm text-gray-500">Email</label>
            <input type="email" className="w-full mt-1 p-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm text-gray-500">Password</label>
            <input type="password" className="w-full mt-1 p-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm text-gray-500">Role</label>
            <select className="w-full mt-1 p-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
        </div>
        <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={submit}>Create</button>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">Existing Users</h3>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {users.map(u => (
            <li key={u._id} className="py-3 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-100">{u.name} <span className="text-xs text-gray-500">({u.email})</span></p>
                <p className="text-sm text-gray-500">Role: {u.role}</p>
              </div>
              <div className="flex items-center gap-2">
                <select className="p-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900" value={u.role} onChange={(e) => changeRole(u._id, e.target.value)}>
                  {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
            </li>
          ))}
          {users.length === 0 && <li className="py-3 text-gray-500">No users found</li>}
        </ul>
      </div>
    </div>
  )
}

export default AdminUsers