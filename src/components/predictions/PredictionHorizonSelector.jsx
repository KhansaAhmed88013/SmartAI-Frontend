const PredictionHorizonSelector = ({ horizon, horizons, onHorizonChange, confidence, getConfidenceColor }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Prediction Horizon:</label>
          <div className="flex flex-wrap gap-2">
            {horizons.map(h => (
              <button key={h.value} onClick={() => onHorizonChange(h.value)} className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${horizon === h.value ? 'bg-industrial-blue text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                {h.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 dark:text-gray-400">Overall Confidence:</span>
          <div className="flex items-center gap-2">
            <span className={`text-lg font-bold ${getConfidenceColor(confidence)}`}>{confidence}%</span>
            <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className={`h-full ${confidence >= 90 ? 'bg-green-500' : confidence >= 80 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${confidence}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PredictionHorizonSelector
