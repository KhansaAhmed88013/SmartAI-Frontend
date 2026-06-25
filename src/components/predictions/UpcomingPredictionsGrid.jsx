import { formatTimeLabel } from '../../utils/predictionTimeline'

const horizonStyles = {
  '15m': {
    accent: 'border-sky-500 bg-sky-50 dark:bg-sky-950/20',
    badge: 'bg-sky-600 text-white'
  },
  '1h': {
    accent: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20',
    badge: 'bg-emerald-600 text-white'
  },
  '6h': {
    accent: 'border-amber-500 bg-amber-50 dark:bg-amber-950/20',
    badge: 'bg-amber-600 text-white'
  },
  '24h': {
    accent: 'border-violet-500 bg-violet-50 dark:bg-violet-950/20',
    badge: 'bg-violet-600 text-white'
  }
}

const formatMetric = (value) => (Number.isFinite(Number(value)) ? Number(value).toFixed(2) : 'N/A')

const UpcomingPredictionsGrid = ({ horizonSummaries = [] }) => {
  const cards = Array.isArray(horizonSummaries) ? horizonSummaries : []

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-3">
        <h3 className="text-base sm:text-lg font-semibold text-industrial-dark dark:text-gray-100">Upcoming Predictions</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">Each card uses its own horizon and expected timestamp.</p>
      </div>
      {cards.length === 0 ? (
        <div className="text-sm text-gray-500 dark:text-gray-400">No upcoming predictions for the selected horizon.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {cards.map((card) => {
            const styles = horizonStyles[card.horizon] || horizonStyles['1h']
            return (
              <div key={card.horizon} className={`rounded-xl border-2 p-4 shadow-sm ${styles.accent}`}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${styles.badge}`}>
                      {card.label || card.horizon}
                    </div>
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">Horizon: {card.horizon}</div>
                  </div>
                  <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                    <div>Confidence</div>
                    <div className="text-base font-semibold text-gray-900 dark:text-gray-100">{card.confidence ?? 0}%</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  <div className="rounded-lg bg-white/70 dark:bg-gray-900/60 p-3 border border-white/60 dark:border-gray-700">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Expected at</div>
                    <div className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {card.expectedAt ? formatTimeLabel(card.expectedAt) : 'N/A'}
                    </div>
                  </div>
                  <div className="rounded-lg bg-white/70 dark:bg-gray-900/60 p-3 border border-white/60 dark:border-gray-700">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Forecast from</div>
                    <div className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {card.forecastFrom ? formatTimeLabel(card.forecastFrom) : 'N/A'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div className="rounded-lg bg-white/70 dark:bg-gray-900/60 p-3 border border-white/60 dark:border-gray-700">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Temperature</div>
                    <div className="mt-1 font-semibold text-red-600 dark:text-red-400">{formatMetric(card.firstPredictedTemp)} °C</div>
                  </div>
                  <div className="rounded-lg bg-white/70 dark:bg-gray-900/60 p-3 border border-white/60 dark:border-gray-700">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Vibration</div>
                    <div className="mt-1 font-semibold text-yellow-600 dark:text-yellow-400">{formatMetric(card.firstPredictedVib)} mm/s</div>
                  </div>
                  <div className="rounded-lg bg-white/70 dark:bg-gray-900/60 p-3 border border-white/60 dark:border-gray-700">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Current</div>
                    <div className="mt-1 font-semibold text-green-600 dark:text-green-400">{formatMetric(card.firstPredictedCurr)} A</div>
                  </div>
                </div>

                
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default UpcomingPredictionsGrid
