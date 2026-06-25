import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const PeakUsageChart = ({ data }) => {
  const maxUsage = data.reduce((m, d) => Math.max(m, d.usage || 0), 0)
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-4 md:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-industrial-dark dark:text-gray-100 mb-4">Peak Usage Hours (% of Critical Current)</h3>
      <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="hour" stroke="#6b7280" style={{ fontSize: '12px' }} />
          <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} label={{ value: 'Usage %', angle: -90, position: 'insideLeft' }} />
          <Tooltip
            formatter={(value, name, props) => [`${value}%`, 'Usage']}
            contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
          />
          <Bar dataKey="usage" name="Usage %">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.usage === maxUsage ? '#ef4444' : '#3b82f6'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default PeakUsageChart
