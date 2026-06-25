import { useState, useEffect } from 'react'
import api from '../utils/api'
import AlertsHeader from '../components/alerts/AlertsHeader'
import DateRangeFilter from '../components/alerts/DateRangeFilter'
import AlertsTable from '../components/alerts/AlertsTable'
import AlertsActions from '../components/alerts/AlertsActions'
import AlertsSummaryCards from '../components/alerts/AlertsSummaryCards'

const Alerts = () => {
  const [alertsPage, setAlertsPage] = useState({ items: [], page: 1, limit: 20, total: 0 })
  const [filter, setFilter] = useState('All')
  const [selectedIds, setSelectedIds] = useState([])
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [selectedMachine, setSelectedMachine] = useState('')

  // filtered and paginated data handled by backend; local state tracks page and filters

  const getSeverityColor = (severity) => {
    const s = (severity || '').toUpperCase()
    switch (s) {
      case 'HIGH':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'LOW':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const load = (page = 1) => {
    const params = { page, limit: alertsPage.limit, severity: filter === 'All' ? undefined : filter }
    if (selectedMachine) params.machineId = selectedMachine
    if (dateRange.start) params.startDate = dateRange.start
    if (dateRange.end) params.endDate = dateRange.end
    console.log('Loading alerts with params:', params)
    api.getAlerts(params).then(res => {
      console.log('Received alerts page:', res.page, 'items:', res.items?.length)
      setAlertsPage({ items: res.items || [], page: res.page || page, limit: res.limit || alertsPage.limit, total: res.total || 0 })
      setSelectedIds([])
    }).catch(err => {
      console.error('Failed to load alerts:', err)
      setAlertsPage({ items: [], page: 1, limit: alertsPage.limit, total: 0 })
    })
  }

  useEffect(() => { load(1) }, [filter, dateRange.start, dateRange.end, selectedMachine])

  useEffect(() => {
    api.getMachines().then(list => {
      if (!list || list.length === 0) return
      if (!selectedMachine) setSelectedMachine(list[0]._id)
    }).catch(() => {})
  }, [])

  return (
    <div className="space-y-4 sm:space-y-6">
      <AlertsHeader
        filter={filter}
        onFilterChange={setFilter}
        selectedMachine={selectedMachine}
        onMachineChange={setSelectedMachine}
      />

      <DateRangeFilter
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onApply={() => load(1)}
      />

      <AlertsTable
        alerts={alertsPage.items}
        page={alertsPage.page}
        limit={alertsPage.limit}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        getSeverityColor={getSeverityColor}
      />

      <AlertsActions
        selectedIds={selectedIds}
        onMarkSelectedRead={() => {
          if (selectedIds.length === 0) return
          api.bulkResolveAlerts(selectedIds).then(() => load(alertsPage.page)).catch(() => {})
        }}
        onMarkAllRead={() => api.bulkResolveAlerts([]).then(() => load(1)).catch(() => {})}
        page={alertsPage.page}
        totalPages={Math.max(1, Math.ceil((alertsPage.total || 0) / alertsPage.limit))}
        onPageChange={load}
      />

      <AlertsSummaryCards alerts={alertsPage.items} />
    </div>
  )
}

export default Alerts
