const ModelInfoCard = ({ modelInfo }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-industrial-dark dark:text-gray-100 mb-4">Model Information</h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Model Type</p>
            <p className="text-base font-semibold text-gray-900 dark:text-gray-100 mt-1">{modelInfo.modelType}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Version</p>
            <p className="text-base font-semibold text-gray-900 dark:text-gray-100 mt-1">{modelInfo.version}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Accuracy</p>
            <p className="text-base font-semibold text-green-600 dark:text-green-400 mt-1">{modelInfo.accuracy}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Last Trained</p>
            <p className="text-base font-semibold text-gray-900 dark:text-gray-100 mt-1">{modelInfo.lastTrained}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Training Samples</p>
            <p className="text-base font-semibold text-gray-900 dark:text-gray-100 mt-1">{modelInfo.trainingSamples.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModelInfoCard
