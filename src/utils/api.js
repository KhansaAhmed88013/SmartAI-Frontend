const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000'

const getToken = () => localStorage.getItem('token')

const headers = (hasJson = true) => {
  const h = {}
  if (hasJson) h['Content-Type'] = 'application/json'
  const t = getToken()
  if (t) h['Authorization'] = `Bearer ${t}`
  return h
}

const readJson = async (res, fallbackMessage) => {
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(body.message || body.error || fallbackMessage)
  }
  return body
}

export async function login(email, password, role = null) {
  const body = { email, password }
  if (role) body.role = role
  const res = await fetch(`${BASE}/api/auth/login`, { method: 'POST', headers: headers(), body: JSON.stringify(body) })
  return readJson(res, 'Login failed')
}

export async function getMachines() {
  const res = await fetch(`${BASE}/api/machines`, { headers: headers(false) })
  const data = await readJson(res, 'Failed to fetch machines')
  return Array.isArray(data) ? data : []
}

export async function getKPIs(machineId) {
  const res = await fetch(`${BASE}/api/kpis/${machineId}`, { headers: headers(false) })
  return readJson(res, 'Failed to fetch KPI data')
}

export async function getActiveAlerts() {
  const res = await fetch(`${BASE}/api/alerts/active?sinceDays=3`, { headers: headers(false) })
  const data = await readJson(res, 'Failed to fetch active alerts')
  return Array.isArray(data) ? data : []
}

export async function getAlerts({ page = 1, limit = 50, severity = 'All', startDate, endDate, resolved, machineId } = {}) {
  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('limit', String(limit))
  if (severity) params.set('severity', severity)
  if (startDate) params.set('startDate', startDate)
  if (endDate) params.set('endDate', endDate)
  if (typeof resolved !== 'undefined') params.set('resolved', String(resolved))
   // optional filter by machine
  if (machineId) params.set('machineId', machineId)
  const res = await fetch(`${BASE}/api/alerts?${params.toString()}`, { headers: headers(false) })
  return readJson(res, 'Failed to fetch alerts')
}

export async function markAlertResolved(id) {
  const res = await fetch(`${BASE}/api/alerts/${id}/resolve`, { method: 'PATCH', headers: headers() })
  return readJson(res, 'Failed to resolve alert')
}

export async function bulkResolveAlerts(ids = []) {
  const res = await fetch(`${BASE}/api/alerts/resolve`, { method: 'POST', headers: headers(), body: JSON.stringify({ ids }) })
  return readJson(res, 'Failed to resolve alerts')
}

export async function getHistory(machineId, range = '24h') {
  const res = await fetch(`${BASE}/api/history/${machineId}?range=${range}`, { headers: headers(false) })
  const data = await readJson(res, 'Failed to fetch history')
  return Array.isArray(data) ? data : []
}

export async function getPeakHours(machineId) {
  const res = await fetch(`${BASE}/api/peak-hours/${machineId}`, { headers: headers(false) })
  return res.json()
}

export async function getPredictions(machineId, horizon = '1h') {
  console.log(`[API] getPredictions started for machine: ${machineId}, horizon: ${horizon}`);
  const res = await fetch(`${BASE}/api/predictions/${machineId}?horizon=${horizon}`, { headers: headers(false) })
  const data = await readJson(res, 'Failed to fetch predictions')
  console.log(`[API] getPredictions completed for horizon: ${horizon}. Received ${data.length} items.`);
  if (data.length > 0) {
    data.forEach((p, idx) => {
      console.log(`[API] [${horizon}] Index ${idx} Prediction Document:
        ObjectId: ${p._id}
        createdAt: ${p.createdAt}
        horizon: ${p.horizon}
        temperature: ${p.temperature}
        vibration: ${p.vibration}
        current: ${p.current}
        predictionSource: ${p.predictionSource}
        modelName: ${p.modelName}
        forecastValues.length: ${p.forecastValues?.length || 0}
        tempForecast.length: ${p.temperatureForecastValues?.length || 0}
        currForecast.length: ${p.currentForecastValues?.length || 0}
        vibForecast.length: ${p.vibrationForecastValues?.length || 0}`);
    });
  }
  return Array.isArray(data) ? data : []
}

export async function getInsights(machineId, horizon = '1h') {
  const res = await fetch(`${BASE}/api/insights/${machineId}?horizon=${horizon}`, { headers: headers(false) })
  const data = await readJson(res, 'Failed to fetch insights')
  return Array.isArray(data) ? data : []
}


export async function getProfile() {
  const res = await fetch(`${BASE}/api/auth/me`, { headers: headers(false) })
  if (!res.ok) throw new Error('Failed to load profile')
  return res.json()
}

export async function updateProfile(payload) {
  const res = await fetch(`${BASE}/api/auth/me`, { method: 'PUT', headers: headers(), body: JSON.stringify(payload) })
  return readJson(res, 'Failed to update profile')
}

export async function changePassword(currentPassword, newPassword) {
  const res = await fetch(`${BASE}/api/auth/me/password`, { method: 'PUT', headers: headers(), body: JSON.stringify({ currentPassword, newPassword }) })
  return readJson(res, 'Failed to change password')
}

// Admin-only endpoints for machine management
export async function getPendingMachines() {
  const res = await fetch(`${BASE}/api/machines/pending`, { headers: headers(false) })
  return readJson(res, 'Failed to fetch pending machines')
}

export async function activateMachine(id, payload) {
  const res = await fetch(`${BASE}/api/machines/${id}/activate`, { method: 'POST', headers: headers(), body: JSON.stringify(payload) })
  return readJson(res, 'Failed to activate machine')
}

// Admin: User management
export async function listUsers() {
  const res = await fetch(`${BASE}/api/users`, { headers: headers(false) })
  return readJson(res, 'Failed to list users')
}

export async function createUser({ name, email, password, role }) {
  const res = await fetch(`${BASE}/api/users`, { method: 'POST', headers: headers(), body: JSON.stringify({ name, email, password, role }) })
  return readJson(res, 'Failed to create user')
}

export async function updateUserRole(id, role) {
  const res = await fetch(`${BASE}/api/users/${id}/role`, { method: 'PUT', headers: headers(), body: JSON.stringify({ role }) })
  return readJson(res, 'Failed to update role')
}

export async function getModelPerformance() {
  const res = await fetch(`${BASE}/api/model-performance`, { headers: headers(false) })
  return readJson(res, 'Failed to fetch model performance')
}

export default {
  login,
  getMachines,
  getKPIs,
  getActiveAlerts,
  getAlerts,
  markAlertResolved,
  bulkResolveAlerts,
  getHistory,
  getPeakHours,
  getPredictions,
  getInsights,
  getProfile,
  updateProfile,
  changePassword,
  getPendingMachines,
  activateMachine,
  listUsers,
  createUser,
  updateUserRole,
  getModelPerformance
}
