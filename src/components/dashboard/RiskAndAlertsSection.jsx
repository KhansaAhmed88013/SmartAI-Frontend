import { Link } from 'react-router-dom'

const RiskAndAlertsSection = ({ riskLevel, alerts, getRiskColor, getSeverityColor }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      {/* AI Risk Card - Small */}
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-5 border-l-4 ${getRiskColor(riskLevel)}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
              Next Hour Risk
            </h3>
            <p className="text-2xl sm:text-3xl font-bold mb-2">
              {riskLevel}
            </p>
            <Link
              to="/ai-predictions"
              className="inline-flex items-center text-sm font-medium text-industrial-blue dark:text-blue-400 hover:underline"
            >
              View AI Predictions
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="text-4xl sm:text-5xl opacity-20">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Alert Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-industrial-dark dark:text-gray-100 mb-3 sm:mb-4">
          Active Alerts
        </h3>
        <div className="space-y-2 sm:space-y-3">
          {alerts.slice(0, 5).map((alert, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-l-4 ${getSeverityColor(alert.severity)}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold dark:text-gray-100">{alert.message}</p>
                  <p className="text-sm mt-1 opacity-75 dark:text-gray-300">{alert.type}</p>
                </div>
                <span className="text-xs font-bold px-2 py-1 rounded bg-white dark:bg-gray-700 bg-opacity-50 dark:bg-opacity-50">
                  {alert.severity}
                </span>
              </div>
            </div>
          ))}
          {alerts.length > 5 && (
            <Link
              to="/alerts"
              className="inline-flex items-center text-sm font-medium text-industrial-blue dark:text-blue-400 hover:underline mt-4"
            >
              View all alerts ({alerts.length})
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
          {alerts.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400">No active alerts</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default RiskAndAlertsSection
