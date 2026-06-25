import { useState, useEffect } from 'react'
import api from '../utils/api'

const MaintenanceInsights = ({ machineId }) => {
  const [insights, setInsights] = useState([])

  useEffect(() => {
    if (!machineId) return
    api.getInsights(machineId, '1h').then(setInsights).catch(() => setInsights([]))
  }, [machineId])

  const getPriorityColor = (severity) => {
    switch ((severity || '').toUpperCase()) {
      case 'CRITICAL':
        return 'bg-red-100 dark:bg-red-900/30 border-red-400 text-red-800 dark:text-red-300'
      case 'WARNING':
        return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-400 text-yellow-800 dark:text-yellow-300'
      default:
        return 'bg-blue-100 dark:bg-blue-900/30 border-blue-400 text-blue-800 dark:text-blue-300'
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-industrial-dark dark:text-gray-100 mb-3 sm:mb-4">Maintenance Insights</h3>
      <div className="space-y-2 sm:space-y-3">
        {insights.length === 0 && (
          <div className="text-center py-6 text-gray-500">No insights at this time</div>
        )}
        {insights.map((insight, index) => (
          <div key={index} className={`p-3 sm:p-4 rounded-lg border-l-4 ${getPriorityColor(insight.severity)}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className="flex-1">
                  <p className="font-medium">{insight.message}</p>
                  <p className="text-sm text-gray-600 mt-2">Source: {insight.source}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">Action: {insight.recommendedAction || insight.action}</p>
                </div>
              </div>
              <div className="text-xs font-semibold px-2 py-1 rounded text-gray-700">{insight.severity}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MaintenanceInsights
