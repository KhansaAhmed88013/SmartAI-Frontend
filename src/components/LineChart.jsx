import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine, Cell } from 'recharts'

const LineChart = ({ data, dataKey, title, color = '#3b82f6', unit = '', showAnomalies = true }) => {
  const points = Array.isArray(data) ? data : []
  const values = points.map(d => Number(d?.value)).filter(Number.isFinite)

  if (points.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-industrial-dark dark:text-gray-100">{title}</h3>
        </div>
        <div className="flex h-[250px] items-center justify-center rounded-lg border border-dashed border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
          No historical data available
        </div>
      </div>
    )
  }

  // Find threshold for anomaly detection (mean + 2*std deviation approximation)
  const mean = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0
  const variance = values.length ? values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length : 0
  const threshold = values.length ? mean + Math.sqrt(variance) * 1.5 : null

  const CustomDot = (props) => {
    const { cx, cy, payload } = props
    if (showAnomalies && payload && threshold !== null && (payload.isAnomaly || (payload.value && payload.value > threshold))) {
      return (
        <circle
          cx={cx}
          cy={cy}
          r={6}
          fill="#ef4444"
          stroke="#fff"
          strokeWidth={2}
        />
      )
    }
    return null
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-industrial-dark dark:text-gray-100">{title}</h3>
        {showAnomalies && (
          <div className="flex items-center space-x-2 text-xs">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Anomalies</span>
          </div>
        )}
      </div>
      <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
        <RechartsLineChart data={points}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
          <XAxis 
            dataKey="time" 
            stroke="#6b7280"
            className="dark:stroke-gray-400"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#6b7280"
            className="dark:stroke-gray-400"
            style={{ fontSize: '12px' }}
            label={{ value: unit, angle: -90, position: 'insideLeft', fill: '#6b7280' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1f2937', 
              border: 'none', 
              borderRadius: '8px', 
              color: '#fff' 
            }}
            formatter={(value, name, props) => {
              const isAnomaly = props?.payload?.isAnomaly || (value && value > threshold)
              return [
                `${value} ${unit}${isAnomaly ? ' ⚠️ Anomaly' : ''}`,
                'Value'
              ]
            }}
          />
          {showAnomalies && threshold !== null && (
            <ReferenceLine 
              y={threshold} 
              stroke="#ef4444" 
              strokeDasharray="5 5" 
              label={{ value: 'Threshold', position: 'right' }}
            />
          )}
          <Line 
            type="monotone" 
            dataKey={dataKey} 
            stroke={color} 
            strokeWidth={2}
            dot={<CustomDot />}
            activeDot={{ r: 6 }}
            isAnimationActive={false}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default LineChart
