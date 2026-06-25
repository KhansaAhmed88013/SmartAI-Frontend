import { useState, useEffect } from 'react'

const LiveDataIndicator = ({ isLive = true }) => {
  const [pulse, setPulse] = useState(true)

  useEffect(() => {
    if (isLive) {
      const interval = setInterval(() => {
        setPulse(prev => !prev)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [isLive])

  if (!isLive) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
        <span className="text-sm text-gray-500 dark:text-gray-400">Offline</span>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2">
      <div className={`w-3 h-3 bg-green-500 rounded-full ${pulse ? 'animate-pulse' : ''}`}></div>
      <span className="text-sm text-green-600 dark:text-green-400 font-medium">Live</span>
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {new Date().toLocaleTimeString()}
      </span>
    </div>
  )
}

export default LiveDataIndicator
