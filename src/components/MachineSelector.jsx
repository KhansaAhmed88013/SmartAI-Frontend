import { useEffect, useState } from 'react'
import api from '../utils/api'

const MachineSelector = ({ selectedMachine, onMachineChange, showAllOption = false, label = 'Machine' }) => {
  const [machines, setMachines] = useState([])

  useEffect(() => {
    let mounted = true
    api.getMachines()
      .then(list => {
        if (!mounted) return
        const machineList = Array.isArray(list) ? list : []
        setMachines(machineList)
        const firstId = machineList && machineList.length > 0 ? machineList[0]._id : ''
        if ((!selectedMachine || selectedMachine === '') && typeof onMachineChange === 'function') {
          onMachineChange(showAllOption ? '' : firstId)
        }
      })
      .catch(err => {
        console.error('Failed to load machines:', err)
        setMachines([])
      })
    return () => { mounted = false }
  }, [])

  return (
    <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
      <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">{label}:</label>
      <select
        value={selectedMachine}
        onChange={(e) => onMachineChange(e.target.value)}
        className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-industrial-blue focus:border-transparent outline-none transition w-full sm:w-auto"
      >
        {showAllOption && (
          <option value="">All Machines</option>
        )}
        {machines.map((machine) => (
          <option key={machine._id} value={machine._id}>
            {machine.machineName} - {machine.location} ({machine.effectiveStatus || machine.status || 'Unknown'})
          </option>
        ))}
      </select>
    </div>
  )
}

export default MachineSelector
