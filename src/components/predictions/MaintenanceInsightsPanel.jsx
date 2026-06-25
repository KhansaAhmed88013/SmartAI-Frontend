const MaintenanceInsightsPanel = ({ maintenanceInsights }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-industrial-dark dark:text-gray-100 mb-4">Prediction-Based Maintenance Insights</h3>
      {maintenanceInsights.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">No maintenance insights generated for this prediction horizon.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {maintenanceInsights.map((ins, idx) => (
            <div key={ins.id || ins.title || idx} className={`p-4 rounded-lg border-l-4 ${ins.severity ? (ins.severity === 'High' ? 'bg-red-100 dark:bg-red-900/30 border-red-400 text-red-800' : 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-400 text-yellow-800') : 'bg-blue-100 dark:bg-blue-900/30 border-blue-400 text-blue-800'}`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{ins.icon}</span>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">{ins.title}</h4>
                </div>
                <span className="text-xs font-bold px-2 py-1 rounded">{ins.severity}</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{ins.description}</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-medium text-gray-600 dark:text-gray-400">Estimated Time to Issue:</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{ins.timeToIssue}</span>
                </div>
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Recommended Action:</p>
                  <p className="text-xs text-gray-700 dark:text-gray-300">{ins.action}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MaintenanceInsightsPanel
