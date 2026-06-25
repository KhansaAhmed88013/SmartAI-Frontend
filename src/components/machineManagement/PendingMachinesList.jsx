const PendingMachinesList = ({ machines, onConfigure }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-1">Unverified Machines</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
        These devices sent data before approval. Review them, add details, and approve to enable normal processing.
      </p>
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {machines.map(m => (
          <li key={m._id} className="py-3 flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-100">
                {m.machineName || 'Unverified machine'} <span className="text-xs text-gray-500">({m.hardwareId})</span>
              </p>
              <p className="text-sm text-amber-600 dark:text-amber-400">Status: {m.status}</p>
            </div>
            <button
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              onClick={() => onConfigure(m)}
            >Approve</button>
          </li>
        ))}
        {machines.length === 0 && (
          <li className="py-3 text-gray-500">No unverified machines</li>
        )}
      </ul>
    </div>
  )
}

export default PendingMachinesList
