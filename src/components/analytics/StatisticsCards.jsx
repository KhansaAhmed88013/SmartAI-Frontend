const METRICS = [
  { key: 'temperature', title: 'Average Temperature', unit: '°C' },
  { key: 'vibration', title: 'Average Vibration', unit: 'mm/s' },
  { key: 'current', title: 'Average Current', unit: 'Amps' }
]

const formatValue = (value) => {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return '--'
  return Number.isInteger(numeric) ? String(numeric) : numeric.toFixed(1)
}

const getAverage = (points, key) => {
  const values = points
    .map(point => Number(point?.[key]))
    .filter(Number.isFinite)

  if (values.length === 0) return null

  return values.reduce((sum, value) => sum + value, 0) / values.length
}

const getTrend = (points, key) => {
  if (!Array.isArray(points) || points.length < 2) return null

  const midpoint = Math.floor(points.length / 2)
  const previous = points.slice(0, midpoint)
  const recent = points.slice(midpoint)
  const previousAverage = getAverage(previous, key)
  const recentAverage = getAverage(recent, key)

  if (!Number.isFinite(previousAverage) || !Number.isFinite(recentAverage) || previousAverage === 0) {
    return null
  }

  return ((recentAverage - previousAverage) / Math.abs(previousAverage)) * 100
}

const StatisticsCards = ({ data = [] }) => {
  const cards = METRICS.map(metric => {
    const average = getAverage(data, metric.key)
    const trend = getTrend(data, metric.key)
    const trendIsPositive = Number.isFinite(trend) && trend >= 0

    return {
      ...metric,
      average,
      trend,
      trendLabel: Number.isFinite(trend)
        ? `${trendIsPositive ? '↑' : '↓'} ${Math.abs(trend).toFixed(1)}% vs previous period`
        : 'Not enough data for a trend'
    }
  })

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
      {cards.map(card => (
        <div key={card.key} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
          <h4 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">{card.title}</h4>
          <p className="text-2xl sm:text-3xl font-bold text-industrial-dark dark:text-gray-100">
            {formatValue(card.average)} {card.unit}
          </p>
          <p className={`text-xs sm:text-sm mt-2 ${Number.isFinite(card.trend) ? (card.trend >= 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400') : 'text-gray-500 dark:text-gray-400'}`}>
            {card.trendLabel}
          </p>
        </div>
      ))}
    </div>
  )
}

export default StatisticsCards
