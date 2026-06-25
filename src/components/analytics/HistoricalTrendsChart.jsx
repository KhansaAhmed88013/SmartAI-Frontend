import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const HistoricalTrendsChart = ({ data }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-4 md:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-industrial-dark dark:text-gray-100 mb-4">7-Day Historical Trends</h3>
      <ResponsiveContainer width="100%" height={300} className="sm:h-[400px]">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
          <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
          <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
          <Legend />
          <Line type="monotone" dataKey="temperature" stroke="#ef4444" strokeWidth={2} name="Temperature (°C)" dot={false} />
          <Line type="monotone" dataKey="vibration" stroke="#f59e0b" strokeWidth={2} name="Vibration (mm/s)" dot={false} />
          <Line type="monotone" dataKey="current" stroke="#3b82f6" strokeWidth={2} name="Current (Amps)" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default HistoricalTrendsChart
