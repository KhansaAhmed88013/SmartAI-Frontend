const ActiveMachinesList = ({ machines }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">Active Machines</h3>
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {machines.map(m => (
          <li key={m._id} className="py-3">
            <p className="font-medium text-gray-800 dark:text-gray-100">{m.machineName} <span className="text-xs text-gray-500">({m.hardwareId})</span></p>
            <p className="text-sm text-gray-500">{m.location || 'Unknown location'}</p>
          </li>
        ))}
        {machines.length === 0 && (
          <li className="py-3 text-gray-500">No active machines</li>
        )}
      </ul>
    </div>
  )
}

export default ActiveMachinesList
