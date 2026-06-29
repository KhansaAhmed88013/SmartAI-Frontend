import { formatTimeLabel } from '../../utils/predictionTimeline'

const ExpectedShortTermPanel = ({ expectedShort = [], forecastWindow = {}, confidence = 0, activePrediction = null }) => {
  const printComponentTrace = (componentName, p) => {
    if (!p) {
      console.log(`[TRACE] [${componentName}] Prediction is null/undefined`);
      return;
    }
    const fv = p.forecastValues || [];
    const tfv = p.temperatureForecastValues || [];
    const cfv = p.currentForecastValues || [];
    const vfv = p.vibrationForecastValues || [];
    console.log(`[TRACE] [${componentName}]:
      ObjectId: ${p._id}
      createdAt: ${p.createdAt}
      forecastValues[0]: ${fv[0] ?? 'N/A'}
      forecastValues[last]: ${fv[fv.length - 1] ?? 'N/A'}
      temperatureForecastValues[last]: ${tfv[tfv.length - 1] ?? 'N/A'}
      currentForecastValues[last]: ${cfv[cfv.length - 1] ?? 'N/A'}
      vibrationForecastValues[last]: ${vfv[vfv.length - 1] ?? 'N/A'}`);
  };
  printComponentTrace("ExpectedShortTermPanel", activePrediction);

  // Rebuild snapshot timeline directly from active prediction's forecast arrays every render
  const temperatureForecastValues = activePrediction?.temperatureForecastValues || []
  const vibrationForecastValues = activePrediction?.vibrationForecastValues || []
  const currentForecastValues = activePrediction?.currentForecastValues || []
  
  const anchorTimestamp = activePrediction ? new Date(activePrediction.createdAt).getTime() : Date.now()
  const rebuiltSnapshot = [
    { label: '15 Minutes', index: 5, expectedAt: anchorTimestamp + 15 * 60000 },
    { label: '30 Minutes', index: 11, expectedAt: anchorTimestamp + 30 * 60000 },
    { label: '45 Minutes', index: 17, expectedAt: anchorTimestamp + 45 * 60000 },
    { label: '1 Hour', index: 23, expectedAt: anchorTimestamp + 60 * 60000 }
  ].map(item => {
    const tempVal = temperatureForecastValues[item.index] ?? null
    const vibVal = vibrationForecastValues[item.index] ?? null
    const currVal = currentForecastValues[item.index] ?? null
    return {
      label: item.label,
      expectedAt: item.expectedAt,
      time: new Date(item.expectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      predictedTemp: tempVal !== null ? tempVal.toFixed(2) : 'N/A',
      predictedVib: vibVal !== null ? vibVal.toFixed(2) : 'N/A',
      predictedCurr: currVal !== null ? currVal.toFixed(2) : 'N/A'
    }
  }).filter(item => {
    return item.predictedTemp !== 'N/A' || item.predictedVib !== 'N/A' || item.predictedCurr !== 'N/A'
  })

  const forecastFrom = activePrediction ? new Date(activePrediction.createdAt).getTime() : (forecastWindow.start || null)
  const maxMinutes = activePrediction?.horizon === '15m' ? 15 : activePrediction?.horizon === '30m' ? 30 : activePrediction?.horizon === '45m' ? 45 : 60
  const forecastUntil = activePrediction ? (new Date(activePrediction.createdAt).getTime() + maxMinutes * 60000) : (forecastWindow.end || null)

  const displayList = rebuiltSnapshot.length > 0 ? rebuiltSnapshot : expectedShort

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">Forecast Snapshot</h3>
      {displayList.length === 0 ? (
        <div className="text-sm text-gray-500 dark:text-gray-400">No short-term forecast values available.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div className="rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3">
              <div className="text-xs text-gray-500 dark:text-gray-400">Forecast from</div>
              <div className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">{forecastFrom ? formatTimeLabel(forecastFrom) : 'N/A'}</div>
            </div>
            <div className="rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3">
              <div className="text-xs text-gray-500 dark:text-gray-400">Forecast until</div>
              <div className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">{forecastUntil ? formatTimeLabel(forecastUntil) : 'N/A'}</div>
            </div>
            <div className="rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3">
              <div className="text-xs text-gray-500 dark:text-gray-400">Confidence</div>
              <div className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">{confidence}%</div>
            </div>
          </div>

          <div className="flex gap-3 flex-wrap">
          {displayList.map((e) => (
            <div key={e.label} className="p-2 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 min-w-[160px]">
              <div className="text-xs font-semibold text-industrial-dark dark:text-gray-300 mb-1">{e.label}</div>
              <div className="mt-1 text-sm font-medium text-red-600 dark:text-red-400">{e.predictedTemp} °C</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Vib {e.predictedVib} mm/s</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Cur {e.predictedCurr} A</div>
            </div>
          ))}
          </div>
        </>
      )}
    </div>
  )
}

export default ExpectedShortTermPanel
