import MachineSelector from '../MachineSelector'

const AlertsHeader = ({ filter, onFilterChange, selectedMachine, onMachineChange }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-industrial-dark dark:text-gray-100">Alerts</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">Monitor system alerts and notifications</p>
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        {['All', 'HIGH', 'MEDIUM', 'LOW'].map((severity) => (
          <button
            key={severity}
            onClick={() => onFilterChange(severity)}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base font-medium transition-colors ${
              filter === severity
                ? 'bg-industrial-blue text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
            }`}
          >
            {severity === 'All' ? 'All' : severity.charAt(0).toUpperCase() + severity.slice(1).toLowerCase()}
          </button>
        ))}
        <MachineSelector
          selectedMachine={selectedMachine}
          onMachineChange={onMachineChange}
          showAllOption={false}
          label="Machine"
        />
      </div>
    </div>
  )
}

export default AlertsHeader
