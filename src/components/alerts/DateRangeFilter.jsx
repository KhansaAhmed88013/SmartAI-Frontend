const DateRangeFilter = ({ dateRange, onDateRangeChange, onApply }) => {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-600">From:</label>
        <input 
          type="date" 
          value={dateRange.start} 
          onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })} 
          className="border rounded px-2 py-1" 
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-600">To:</label>
        <input 
          type="date" 
          value={dateRange.end} 
          onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })} 
          className="border rounded px-2 py-1" 
        />
      </div>
      <button onClick={onApply} className="px-3 py-1 bg-industrial-blue text-white rounded">Apply</button>
    </div>
  )
}

export default DateRangeFilter
