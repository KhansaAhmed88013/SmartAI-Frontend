const safeLimits = {
  temperature: { min: 0, max: 150 },
  vibration: { min: 0, max: 50 },
  current: { min: 0, max: 200 }
}

const ThresholdInputs = ({ values, onChange }) => {
  const fields = [
    { key: 'temperature', label: 'Temperature (°C)' },
    { key: 'vibration', label: 'Vibration (mm/s)' },
    { key: 'current', label: 'Current (A)' }
  ]
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {fields.map(f => (
        <div key={f.key} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h4 className="font-semibold mb-2 text-gray-700 dark:text-gray-200">{f.label}</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-500">Warning</label>
              <input
                type="number"
                className="w-full mt-1 p-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
                value={values[f.key]?.warning ?? ''}
                onChange={(e) => onChange(f.key, { ...values[f.key], warning: Number(e.target.value) })}
                min={safeLimits[f.key].min}
                max={safeLimits[f.key].max}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500">Critical</label>
              <input
                type="number"
                className="w-full mt-1 p-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
                value={values[f.key]?.critical ?? ''}
                onChange={(e) => onChange(f.key, { ...values[f.key], critical: Number(e.target.value) })}
                min={safeLimits[f.key].min}
                max={safeLimits[f.key].max}
              />
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">Limits: {safeLimits[f.key].min} - {safeLimits[f.key].max}</p>
        </div>
      ))}
    </div>
  )
}

const MachineActivationForm = ({ machine, name, onNameChange, location, onLocationChange, thresholds, onThresholdsChange, onActivate, onCancel }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-1">Approve Machine</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
        Fill in the machine details and thresholds, then approve it to move it from PENDING to RUNNING.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm text-gray-500">Machine Name</label>
          <input
            type="text"
            className="w-full mt-1 p-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-500">Location</label>
          <input
            type="text"
            className="w-full mt-1 p-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
          />
        </div>
      </div>

      <ThresholdInputs values={thresholds} onChange={onThresholdsChange} />

      <div className="mt-4 flex gap-3">
        <button
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          onClick={onActivate}
        >Approve & Activate</button>
        <button
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded"
          onClick={onCancel}
        >Cancel</button>
      </div>
    </div>
  )
}

export default MachineActivationForm
