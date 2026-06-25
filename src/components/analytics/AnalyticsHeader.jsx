import MachineSelector from '../MachineSelector'

const AnalyticsHeader = ({ role, selectedMachine, onMachineChange }) => {
  return (
    <>
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-industrial-dark dark:text-gray-100">Analytics</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">Historical trends and usage patterns</p>
      </div>

      {(role === 'MAINTENANCE_ENGINEER' || role === 'SYSTEM_ADMIN' || role === 'ADMIN') && (
        <div className="flex flex-wrap items-center gap-3">
          <MachineSelector
            selectedMachine={selectedMachine}
            onMachineChange={onMachineChange}
            showAllOption={false}
            label="Machine"
          />
        </div>
      )}
    </>
  )
}

export default AnalyticsHeader
