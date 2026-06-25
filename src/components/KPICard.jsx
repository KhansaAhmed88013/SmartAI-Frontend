const KPICard = ({ title, value, unit, status, icon: Icon }) => {
  const getStatusColor = (status) => {
    switch (String(status || '').toLowerCase()) {
      case 'running':
        return 'bg-green-100 text-green-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      case 'critical':
        return 'bg-red-100 text-red-800'
      case 'stopped':
      case 'pending':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-industrial-blue">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">{title}</p>
          <div className="mt-2 flex items-baseline">
            <p className="text-3xl font-bold text-industrial-dark dark:text-gray-100">{value}</p>
            {unit && <span className="ml-2 text-lg text-gray-500 dark:text-gray-400">{unit}</span>}
          </div>
          {status && (
            <span className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(status)}`}>
              {status}
            </span>
          )}
        </div>
        {Icon && (
          <div className="ml-4 p-3 bg-industrial-blue bg-opacity-10 dark:bg-opacity-20 rounded-lg">
            <Icon className="w-8 h-8 text-industrial-blue" />
          </div>
        )}
      </div>
    </div>
  )
}

export default KPICard
