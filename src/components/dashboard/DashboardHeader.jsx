import MachineSelector from '../MachineSelector'
import TimeRangeFilter from '../TimeRangeFilter'

const DashboardHeader = ({ selectedMachine, onMachineChange, timeRange, onTimeRangeChange }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <h1 className="text-3xl font-bold text-industrial-dark dark:text-gray-100">Dashboard</h1>
      <div className="flex flex-wrap items-center gap-4">
        <MachineSelector 
          selectedMachine={selectedMachine} 
          onMachineChange={onMachineChange} 
        />
        <TimeRangeFilter 
          selectedRange={timeRange} 
          onRangeChange={onTimeRangeChange} 
        />
      </div>
    </div>
  )
}

export default DashboardHeader
