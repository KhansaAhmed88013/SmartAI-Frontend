import MachineSelector from '../MachineSelector'

const PredictionHeader = ({ selectedMachine, onMachineChange }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-industrial-dark dark:text-gray-100">AI Predictions</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">Forecasted machine performance metrics</p>
      </div>
      <MachineSelector selectedMachine={selectedMachine} onMachineChange={onMachineChange} />
    </div>
  )
}

export default PredictionHeader
