import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts'
import { formatTimeLabel } from '../../utils/predictionTimeline'

const chartCardClassName = 'bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-5 md:p-6'

const formatValue = (value, unit) => {
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue)) return 'N/A'
  return `${numericValue.toFixed(2)} ${unit}`.trim()
}

const MetricTooltip = ({ active, payload, label, unit, forecastKey, actualKey }) => {
  if (!active || !Array.isArray(payload) || payload.length === 0) return null

  const point = payload[0]?.payload || {}
  const actualValue = point[actualKey]
  const forecastValue = point[forecastKey]
  const isForecast = Number.isFinite(Number(forecastValue))
  const displayValue = isForecast ? forecastValue : actualValue

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-900 px-3 py-2 text-xs text-white shadow-lg">
      <div className="mb-1 font-semibold">{isForecast ? 'Forecast' : 'Actual'} at {formatTimeLabel(label)}</div>
      <div className="space-y-1 text-gray-200">
        <div>{isForecast ? 'Predicted' : 'Observed'}: {formatValue(displayValue, unit)}</div>
        {isForecast && Number.isFinite(Number(actualValue)) && (
          <div>Last actual: {formatValue(actualValue, unit)}</div>
        )}
      </div>
    </div>
  )
}

const renderMetricChart = ({ data, title, unit, actualKey, forecastKey, actualColor, forecastColor, threshold, forecastWindowStart }) => {
  const chartData = Array.isArray(data) ? data : []
  const hasForecastSeries = chartData.some(point => Number.isFinite(Number(point?.[forecastKey])))
  const hasActualSeries = chartData.some(point => Number.isFinite(Number(point?.[actualKey])))

  return (
    <div className={chartCardClassName}>
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-base sm:text-lg font-semibold text-industrial-dark dark:text-gray-100">{title}</h3>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {forecastWindowStart ? `Forecast starts ${formatTimeLabel(forecastWindowStart)}` : 'Forecast unavailable'}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={340}>
        <LineChart data={chartData} margin={{ top: 8, right: 18, left: 0, bottom: 6 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
          <XAxis
            dataKey="timestamp"
            type="number"
            domain={['dataMin', 'dataMax']}
            tickFormatter={formatTimeLabel}
            stroke="#6b7280"
            className="dark:stroke-gray-400"
            style={{ fontSize: '12px' }}
            minTickGap={24}
          />
          <YAxis
            stroke="#6b7280"
            className="dark:stroke-gray-400"
            style={{ fontSize: '12px' }}
            label={{ value: unit, angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            content={(props) => (
              <MetricTooltip
                {...props}
                unit={unit}
                actualKey={actualKey}
                forecastKey={forecastKey}
              />
            )}
          />
          <Legend />
          {hasActualSeries && (
            <Line
              type="monotone"
              dataKey={actualKey}
              stroke={actualColor}
              strokeWidth={2.5}
              name="Actual"
              dot={false}
              connectNulls={true}
            />
          )}
          {hasForecastSeries && (
            <Line
              type="monotone"
              dataKey={forecastKey}
              stroke={forecastColor}
              strokeWidth={2.5}
              name="Forecast"
              strokeDasharray="6 4"
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              connectNulls={true}
            />
          )}
          {Number.isFinite(Number(threshold)) && (
            <ReferenceLine
              y={threshold}
              stroke="#f59e0b"
              strokeDasharray="3 3"
              label={{ value: 'Threshold', position: 'right' }}
            />
          )}
          {forecastWindowStart && (
            <ReferenceLine
              x={forecastWindowStart}
              stroke="#6b7280"
              strokeDasharray="5 5"
              label={{ value: 'Forecast Starts', position: 'top', fill: '#6b7280', fontSize: '10px' }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

const PredictionCharts = ({ predictionData, activePrediction = null }) => {
  if (activePrediction) {
    const fv = activePrediction.forecastValues || [];
    console.log(`[PredictionCharts Render Log]
      prediction._id: ${activePrediction._id}
      prediction.createdAt: ${activePrediction.createdAt}
      forecastValues[last]: ${fv[fv.length - 1] ?? 'N/A'}`);
    
    const tfv = activePrediction.temperatureForecastValues || [];
    const cfv = activePrediction.currentForecastValues || [];
    const vfv = activePrediction.vibrationForecastValues || [];
    console.log(`[TRACE] [PredictionCharts]:
      ObjectId: ${activePrediction._id}
      createdAt: ${activePrediction.createdAt}
      forecastValues[0]: ${fv[0] ?? 'N/A'}
      forecastValues[last]: ${fv[fv.length - 1] ?? 'N/A'}
      temperatureForecastValues[last]: ${tfv[tfv.length - 1] ?? 'N/A'}
      currentForecastValues[last]: ${cfv[cfv.length - 1] ?? 'N/A'}
      vibrationForecastValues[last]: ${vfv[vfv.length - 1] ?? 'N/A'}`);
  } else {
    console.log(`[TRACE] [PredictionCharts] activePrediction is null/undefined`);
  }

  if (!Array.isArray(predictionData) || predictionData.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-5 md:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-industrial-dark dark:text-gray-100 mb-4">Prediction Charts</h3>
          <div className="flex h-[320px] items-center justify-center rounded-lg border border-dashed border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
            No prediction data available for the selected machine and horizon.
          </div>
        </div>
      </div>
    )
  }

  const forecastWindowStart = predictionData.find(point => point?.isForecast)?.timestamp ?? null

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-6">
      {renderMetricChart({
        data: predictionData,
        title: 'Temperature Timeline',
        unit: '°C',
        actualKey: 'actualTemp',
        forecastKey: 'forecastTemp',
        actualColor: '#3b82f6',
        forecastColor: '#ef4444',
        threshold: 80,
        forecastWindowStart
      })}

      {renderMetricChart({
        data: predictionData,
        title: 'Vibration Timeline',
        unit: 'mm/s',
        actualKey: 'actualVib',
        forecastKey: 'forecastVib',
        actualColor: '#3b82f6',
        forecastColor: '#f59e0b',
        threshold: 5.0,
        forecastWindowStart
      })}

      {renderMetricChart({
        data: predictionData,
        title: 'Current Timeline',
        unit: 'A',
        actualKey: 'actualCurr',
        forecastKey: 'forecastCurr',
        actualColor: '#3b82f6',
        forecastColor: '#10b981',
        threshold: 60,
        forecastWindowStart
      })}
    </div>
  )
}

export default PredictionCharts
