import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import PendingMachinesList from '../components/machineManagement/PendingMachinesList'
import ActiveMachinesList from '../components/machineManagement/ActiveMachinesList'
import MachineActivationForm from '../components/machineManagement/MachineActivationForm'

const safeLimits = {
  temperature: { min: 0, max: 150 },
  vibration: { min: 0, max: 50 },
  current: { min: 0, max: 200 }
}

const MachineManagement = () => {
  const navigate = useNavigate()
  const [role, setRole] = useState('')
  const [pending, setPending] = useState([])
  const [active, setActive] = useState([])
  const [selected, setSelected] = useState(null)
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [thresholds, setThresholds] = useState({
    temperature: { warning: 70, critical: 90 },
    vibration: { warning: 10, critical: 20 },
    current: { warning: 60, critical: 100 }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const refresh = async () => {
    setLoading(true)
    setError('')
    try {
      const [profile, p, a] = await Promise.all([
        api.getProfile(),
        api.getPendingMachines(),
        api.getMachines()
      ])
      setRole(profile?.role || '')
      setPending(p || [])
      setActive(a || [])
    } catch (err) {
      setError(err.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  useEffect(() => {
    if (role && role !== 'ADMIN' && role !== 'SYSTEM_ADMIN') {
      navigate('/dashboard')
    }
  }, [role, navigate])

  const onThreshChange = (key, value) => {
    setThresholds(prev => ({ ...prev, [key]: value }))
  }

  const validateLocal = () => {
    const keys = ['temperature','vibration','current']
    for (const k of keys) {
      const t = thresholds[k]
      const { min, max } = safeLimits[k]
      if (!t || isNaN(t.warning) || isNaN(t.critical)) return `${k} thresholds are required`
      if (t.warning < min || t.warning > max || t.critical < min || t.critical > max) return `${k} thresholds must be within ${min}-${max}`
      if (t.critical <= t.warning) return `${k} critical must be greater than warning`
    }
    return ''
  }

  const activate = async () => {
    if (!selected) return
    const errMsg = validateLocal()
    if (errMsg) { setError(errMsg); return }
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      await api.activateMachine(selected._id, { machineName: name, location, thresholds })
      setSuccess('Machine activated successfully')
      setSelected(null)
      setName('')
      setLocation('')
      await refresh()
    } catch (err) {
      setError(err.message || 'Failed to activate machine')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Machine Approval</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Unknown devices are registered as <span className="font-semibold">PENDING</span> until an admin approves them with a name, location, and thresholds.
      </p>

      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-600">{success}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PendingMachinesList
          machines={pending}
          onConfigure={(m) => { 
            setSelected(m); 
            setName(m.machineName || ''); 
            setLocation(m.location || ''); 
          }}
        />

        <ActiveMachinesList machines={active} />
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <MachineActivationForm
                machine={selected}
                name={name}
                onNameChange={setName}
                location={location}
                onLocationChange={setLocation}
                thresholds={thresholds}
                onThresholdsChange={onThreshChange}
                onActivate={activate}
                onCancel={() => setSelected(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MachineManagement
