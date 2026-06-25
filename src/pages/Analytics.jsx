import { useState, useEffect } from 'react'
import api from '../utils/api'
import AnalyticsHeader from '../components/analytics/AnalyticsHeader'
import HistoricalTrendsChart from '../components/analytics/HistoricalTrendsChart'
import PeakUsageChart from '../components/analytics/PeakUsageChart'
import StatisticsCards from '../components/analytics/StatisticsCards'

const Analytics = () => {
  const [historicalData, setHistoricalData] = useState([])
  const [peakHoursData, setPeakHoursData] = useState([])
  const [role, setRole] = useState('')
  const [selectedMachine, setSelectedMachine] = useState('')

  useEffect(() => {
    api.getProfile().then(p => setRole(p?.role || '')).catch(() => setRole(''))
  }, [])

  useEffect(() => {
    // UI-level RBAC: limit to MAINTENANCE_ENGINEER or SYSTEM_ADMIN
    if (!(role === 'MAINTENANCE_ENGINEER' || role === 'SYSTEM_ADMIN' || role === 'ADMIN')) return
    api.getMachines().then(list => {
      if (!list || list.length === 0) return
      const initial = selectedMachine || list[0]._id
      setSelectedMachine(initial)
    }).catch(() => {})
  }, [role])

  useEffect(() => {
    if (!(role === 'MAINTENANCE_ENGINEER' || role === 'SYSTEM_ADMIN' || role === 'ADMIN')) return
    if (!selectedMachine) {
      setHistoricalData([])
      setPeakHoursData([])
      return
    }
    api.getHistory(selectedMachine, '168h').then(setHistoricalData).catch(() => setHistoricalData([]))
    api.getPeakHours(selectedMachine).then(setPeakHoursData).catch(() => setPeakHoursData([]))
  }, [role, selectedMachine])

  return (
    <div className="space-y-4 sm:space-y-6">
      <AnalyticsHeader
        role={role}
        selectedMachine={selectedMachine}
        onMachineChange={setSelectedMachine}
      />

      {/* Historical Trends */}
      {(role === 'MAINTENANCE_ENGINEER' || role === 'SYSTEM_ADMIN' || role === 'ADMIN') ? (
        <HistoricalTrendsChart data={historicalData} />
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-4 md:p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">You do not have permission to view analytics.</p>
        </div>
      )}

      {/* Peak Usage Hours */}
      {(role === 'MAINTENANCE_ENGINEER' || role === 'SYSTEM_ADMIN' || role === 'ADMIN') && (
        <PeakUsageChart data={peakHoursData} />
      )}

      {/* Statistics Cards */}
      <StatisticsCards data={historicalData} />
    </div>
  )
}

export default Analytics
