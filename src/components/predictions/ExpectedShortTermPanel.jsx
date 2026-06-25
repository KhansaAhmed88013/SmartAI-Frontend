import { formatTimeLabel } from '../../utils/predictionTimeline'

const ExpectedShortTermPanel = ({ expectedShort = [], forecastWindow = {}, confidence = 0 }) => {
  const forecastFrom = forecastWindow.start || null
  const forecastUntil = forecastWindow.end || null

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">Forecast Snapshot</h3>
      {expectedShort.length === 0 ? (
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
          {expectedShort.map((e) => (
            <div key={e.time} className="p-2 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 min-w-[160px]">
              <div className="text-xs text-gray-500 dark:text-gray-400">Expected at {e.time}</div>
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
