import KPICard from '../KPICard'

const formatMetricValue = (value) => {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return '--'
  return Number.isInteger(numeric) ? String(numeric) : numeric.toFixed(1)
}

const KPICardsGrid = ({ kpis, machineStatus, sensorStatuses = {} }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <KPICard
        title="Temperature"
        value={formatMetricValue(kpis?.temperature)}
        unit="°C"
        status={sensorStatuses.temperature || machineStatus}
      />
      <KPICard
        title="Vibration"
        value={formatMetricValue(kpis?.vibration)}
        unit="mm/s"
        status={sensorStatuses.vibration || machineStatus}
      />
      <KPICard
        title="Current"
        value={formatMetricValue(kpis?.current)}
        unit="Amps"
        status={sensorStatuses.current || machineStatus}
      />
      <KPICard
        title="Machine Status"
        value={machineStatus}
        status={machineStatus}
      />
    </div>
  )
}

export default KPICardsGrid
