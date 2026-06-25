import { useState, useEffect } from 'react'
import MachineSelector from '../components/MachineSelector'
import api from '../utils/api'

const Settings = () => {
  const [selectedMachine, setSelectedMachine] = useState('')
  const [thresholdsPerMachine, setThresholdsPerMachine] = useState({})
  const [machines, setMachines] = useState([])
  
  // Get current machine's thresholds
  const thresholds = thresholdsPerMachine[selectedMachine] || {
    temperature: 80,
    vibration: 5.0,
    current: 60
  }

  const [notifications, setNotifications] = useState({
    email: true
  })
  const [profile, setProfile] = useState({ name: '', email: '' })
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleThresholdChange = (key, value) => {
    setThresholdsPerMachine(prev => ({
      ...prev,
      [selectedMachine]: {
        ...prev[selectedMachine],
        [key]: parseFloat(value) || 0
      }
    }))
  }
  
  useEffect(() => {
    if (!selectedMachine) return
    // fetch machine details to get thresholds
    api.getMachines().then(list => {
      const m = list.find(x => x._id === selectedMachine)
      if (m) setThresholdsPerMachine(prev => ({ ...prev, [selectedMachine]: { temperature: m.thresholds.temperature.warning || 80, vibration: m.thresholds.vibration.warning || 5.0, current: m.thresholds.current.warning || 60 } }))
    }).catch(() => {})
  }, [selectedMachine])

  useEffect(() => {
    let mounted = true
    api.getMachines().then(list => { if (!mounted) return; setMachines(list) }).catch(() => { if (!mounted) return; setMachines([]) })
    api.getProfile().then(p => {
      if (!mounted) return
      setProfile({ name: p.name || '', email: p.email || '' })
      setNotifications({ email: p.notifications?.email ?? true })
    }).catch(() => {})
    return () => { mounted = false }
  }, [])

  const handleNotificationToggle = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleProfileSave = async () => {
    try {
      const updated = await api.updateProfile({ name: profile.name, email: profile.email, notifications })
      alert('Profile saved')
      setProfile({ name: updated.name, email: updated.email })
    } catch (err) {
      alert('Failed to save profile')
    }
  }

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) return alert('Enter passwords')
    if (newPassword !== confirmPassword) return alert('Passwords do not match')
    try {
      await api.changePassword(currentPassword, newPassword)
      alert('Password changed successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      alert(err.message || 'Failed to change password')
    }
  }

  const handleSave = () => {
    // Persist thresholds to backend
    if (!selectedMachine) return alert('Select a machine first')
    const t = thresholdsPerMachine[selectedMachine]
    const payload = { thresholds: { temperature: { warning: t.temperature, critical: t.temperature + 8 }, vibration: { warning: t.vibration, critical: t.vibration + 1.5 }, current: { warning: t.current, critical: t.current + 10 } } }
    api.getMachines().then(() => {})
    fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:4000'}/api/machines/${selectedMachine}/thresholds`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify(payload) })
      .then(r => {
        if (!r.ok) throw new Error('Failed')
        alert('Settings saved successfully!')
      }).catch(() => alert('Failed to save settings'))
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-industrial-dark dark:text-gray-100">Settings</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">Configure system parameters and preferences</p>
      </div>

      {/* Alert Thresholds */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-industrial-dark dark:text-gray-100">Alert Thresholds</h3>
          <MachineSelector 
            selectedMachine={selectedMachine} 
            onMachineChange={setSelectedMachine} 
          />
        </div>
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <span className="font-semibold">Configuring thresholds for:</span>{' '}
            {machines.find(m => m._id === selectedMachine)?.machineName || '—'} - {machines.find(m => m._id === selectedMachine)?.location || '—'}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div>
            <label htmlFor="temp-threshold" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Temperature Threshold (°C)
            </label>
            <input
              id="temp-threshold"
              type="number"
              value={thresholds.temperature}
              onChange={(e) => handleThresholdChange('temperature', e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-industrial-blue focus:border-transparent outline-none transition"
              step="0.1"
              min="0"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Alerts will trigger above this value</p>
          </div>

          <div>
            <label htmlFor="vib-threshold" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Vibration Threshold (mm/s)
            </label>
            <input
              id="vib-threshold"
              type="number"
              value={thresholds.vibration}
              onChange={(e) => handleThresholdChange('vibration', e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-industrial-blue focus:border-transparent outline-none transition"
              step="0.1"
              min="0"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Alerts will trigger above this value</p>
          </div>

          <div>
            <label htmlFor="current-threshold" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Current Threshold (Amps)
            </label>
            <input
              id="current-threshold"
              type="number"
              value={thresholds.current}
              onChange={(e) => handleThresholdChange('current', e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-industrial-blue focus:border-transparent outline-none transition"
              step="0.1"
              min="0"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Alerts will trigger above this value</p>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-industrial-dark dark:text-gray-100 mb-4 sm:mb-6">Notification Preferences</h3>
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex-1 pr-4">
              <p className="font-medium text-gray-700 dark:text-gray-300">Email Notifications</p>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Enable or disable email alerts for your account.</p>
            </div>
            <button
              onClick={() => handleNotificationToggle('email')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications.email ? 'bg-industrial-blue' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications.email ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button onClick={handleProfileSave} className="px-4 py-2 bg-industrial-blue text-white rounded-lg">Save Notifications</button>
        </div>
      </div>

      {/* Profile & Password */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-industrial-dark dark:text-gray-100 mb-4 sm:mb-6">Profile</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
            <input value={profile.name} onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
            <input value={profile.email} onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" />
          </div>
        </div>
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Change Password</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input type="password" placeholder="Current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="px-3 py-2 border rounded-lg" />
            <input type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="px-3 py-2 border rounded-lg" />
            <input type="password" placeholder="Confirm new" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="px-3 py-2 border rounded-lg" />
          </div>
        </div>
        <div className="flex justify-end">
          <button onClick={handleChangePassword} className="px-4 py-2 bg-industrial-blue text-white rounded-lg">Change Password</button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 bg-industrial-blue text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-blue-700 transition-colors shadow-lg"
        >
          Save Settings
        </button>
      </div>

      
    </div>
  )
}

export default Settings
