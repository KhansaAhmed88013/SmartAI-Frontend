const AlertsActions = ({ selectedIds, onMarkSelectedRead, onMarkAllRead, page, totalPages, onPageChange }) => {
  return (
    <div className="flex items-center gap-3">
      <button 
        onClick={onMarkSelectedRead} 
        className="px-3 py-2 bg-industrial-blue text-white rounded"
      >
        Mark selected as read
      </button>
      <button 
        onClick={onMarkAllRead} 
        className="px-3 py-2 bg-gray-200 rounded"
      >
        Mark all read
      </button>
      <div className="ml-auto flex items-center gap-2">
        <button 
          disabled={page <= 1} 
          onClick={() => onPageChange(Math.max(1, page - 1))} 
          className="px-2 py-1 border rounded"
        >
          Prev
        </button>
        <span>Page {page} / {totalPages}</span>
        <button 
          disabled={page >= totalPages} 
          onClick={() => onPageChange(page + 1)} 
          className="px-2 py-1 border rounded"
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default AlertsActions
