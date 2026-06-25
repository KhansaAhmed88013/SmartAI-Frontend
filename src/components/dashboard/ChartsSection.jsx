import LineChart from '../LineChart'

const ChartsSection = ({ temperatureData, vibrationData, currentData }) => {
  return (
    <>
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChart
          data={temperatureData}
          dataKey="value"
          title="Temperature vs Time"
          color="#ef4444"
          unit="°C"
          showAnomalies={true}
        />
        <LineChart
          data={vibrationData}
          dataKey="value"
          title="Vibration vs Time"
          color="#f59e0b"
          unit="mm/s"
          showAnomalies={true}
        />
      </div>

      <LineChart
        data={currentData}
        dataKey="value"
        title="Current vs Time"
        color="#3b82f6"
        unit="Amps"
        showAnomalies={true}
      />
    </>
  )
}

export default ChartsSection
