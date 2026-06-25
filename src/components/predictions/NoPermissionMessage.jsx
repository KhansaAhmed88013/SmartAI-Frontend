const NoPermissionMessage = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
      <p className="text-sm text-gray-600 dark:text-gray-400">You do not have permission to view AI predictions.</p>
    </div>
  )
}

export default NoPermissionMessage
