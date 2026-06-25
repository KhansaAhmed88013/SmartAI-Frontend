const TimeRangeFilter = ({ selectedRange, onRangeChange }) => {
  const ranges = [
    { value: '1h', label: '1h', fullLabel: 'Last Hour' },
    { value: '6h', label: '6h', fullLabel: 'Last 6 Hours' },
    { value: '24h', label: '24h', fullLabel: 'Last 24 Hours' },
    { value: '7d', label: '7d', fullLabel: 'Last 7 Days' },
    { value: '30d', label: '30d', fullLabel: 'Last 30 Days' },
  ]

  return (
    <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
      <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Time Range:</label>
      <div className="flex flex-wrap gap-1 sm:gap-2">
        {ranges.map((range) => (
          <button
            key={range.value}
            onClick={() => onRangeChange(range.value)}
            className={`px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              selectedRange === range.value
                ? 'bg-industrial-blue text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            title={range.fullLabel}
          >
            <span className="sm:hidden">{range.label}</span>
            <span className="hidden sm:inline">{range.fullLabel}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default TimeRangeFilter
