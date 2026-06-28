const PredictionMetadata = ({ predsMeta }) => {
  return (
    <div className="text-sm text-gray-600 dark:text-gray-400">
      <span className="mr-4">Prediction Engine: <strong className="text-gray-900 dark:text-gray-100">Autoformer AI</strong></span>
      <span>Last Updated: <strong className="text-gray-900 dark:text-gray-100">{predsMeta.lastCreated ? new Date(predsMeta.lastCreated).toLocaleString() : 'N/A'}</strong></span>
    </div>
  )
}

export default PredictionMetadata
