const ModelInfoCard = ({ modelInfo }) => {
  const {
    predictionEngine = 'Autoformer AI',
    modelType = 'Time-Series Forecasting',
    temperatureModel = null,
    currentModel = null,
    vibrationModel = null,
    predictionLength = '24 Forecast Points',
    lastRetrained = 'N/A',
    lastEvaluated = 'N/A'
  } = modelInfo || {}

  const renderMetric = (model, key, suffix = '') => {
    if (!model) return 'Not Evaluated'
    const val = model[key]
    if (val === undefined || val === null) return 'Not Evaluated'
    return `${val}${suffix}`
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-industrial-dark dark:text-gray-100 mb-6 border-b pb-2">
        Model Information
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Prediction Engine</p>
          <p className="text-base font-bold text-gray-900 dark:text-gray-100 mt-1">{predictionEngine}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Model Type</p>
          <p className="text-base font-bold text-gray-900 dark:text-gray-100 mt-1">{modelType}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Prediction Length</p>
          <p className="text-base font-bold text-gray-900 dark:text-gray-100 mt-1">{predictionLength}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-b py-6 my-6 border-gray-150 dark:border-gray-700">
        {/* Temperature Model */}
        <div className="bg-gray-50 dark:bg-gray-900/40 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
          <h4 className="text-sm font-bold text-red-600 dark:text-red-400 mb-3 uppercase tracking-wider">
            Temperature Model
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Accuracy:</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">{renderMetric(temperatureModel, 'accuracy', '%')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">MAE:</span>
              <span className="font-mono text-gray-900 dark:text-gray-100">{renderMetric(temperatureModel, 'mae')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">RMSE:</span>
              <span className="font-mono text-gray-900 dark:text-gray-100">{renderMetric(temperatureModel, 'rmse')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">MAPE:</span>
              <span className="font-mono text-gray-900 dark:text-gray-100">{renderMetric(temperatureModel, 'mape', '%')}</span>
            </div>
          </div>
        </div>

        {/* Current Model */}
        <div className="bg-gray-50 dark:bg-gray-900/40 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
          <h4 className="text-sm font-bold text-green-600 dark:text-green-400 mb-3 uppercase tracking-wider">
            Current Model
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Accuracy:</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">{renderMetric(currentModel, 'accuracy', '%')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">MAE:</span>
              <span className="font-mono text-gray-900 dark:text-gray-100">{renderMetric(currentModel, 'mae')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">RMSE:</span>
              <span className="font-mono text-gray-900 dark:text-gray-100">{renderMetric(currentModel, 'rmse')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">MAPE:</span>
              <span className="font-mono text-gray-900 dark:text-gray-100">{renderMetric(currentModel, 'mape', '%')}</span>
            </div>
          </div>
        </div>

        {/* Vibration Model */}
        <div className="bg-gray-50 dark:bg-gray-900/40 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
          <h4 className="text-sm font-bold text-yellow-600 dark:text-yellow-400 mb-3 uppercase tracking-wider">
            Vibration Model
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Accuracy:</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">{renderMetric(vibrationModel, 'accuracy', '%')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">MAE:</span>
              <span className="font-mono text-gray-900 dark:text-gray-100">{renderMetric(vibrationModel, 'mae')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">RMSE:</span>
              <span className="font-mono text-gray-900 dark:text-gray-100">{renderMetric(vibrationModel, 'rmse')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">MAPE:</span>
              <span className="font-mono text-gray-900 dark:text-gray-100">{renderMetric(vibrationModel, 'mape', '%')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-500 dark:text-gray-400">
        <div>
          <span>Last Retrained: </span>
          <span className="font-medium text-gray-750 dark:text-gray-300">{lastRetrained}</span>
        </div>
        <div className="sm:text-right">
          <span>Last Evaluated: </span>
          <span className="font-medium text-gray-750 dark:text-gray-300">{lastEvaluated}</span>
        </div>
      </div>
    </div>
  )
}

export default ModelInfoCard
