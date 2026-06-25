const AlertsSummaryCards = ({ alerts }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 border-l-4 border-red-500">
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 uppercase mb-2">High Severity</p>
        <p className="text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-400">
          {alerts.filter(a => a.severity === 'HIGH').length}
        </p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 border-l-4 border-yellow-500">
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 uppercase mb-2">Medium Severity</p>
        <p className="text-2xl sm:text-3xl font-bold text-yellow-600 dark:text-yellow-400">
          {alerts.filter(a => a.severity === 'MEDIUM').length}
        </p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 border-l-4 border-blue-500">
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 uppercase mb-2">Low Severity</p>
        <p className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">
          {alerts.filter(a => a.severity === 'LOW').length}
        </p>
      </div>
    </div>
  )
}

export default AlertsSummaryCards
