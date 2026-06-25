const DEFAULT_STEP_MINUTES = 5

const toFiniteNumber = (value) => {
  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? numericValue : null
}

export const formatTimeLabel = (timestamp) => {
  const numericTimestamp = Number(timestamp)
  if (!Number.isFinite(numericTimestamp)) return 'N/A'
  return new Date(numericTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const extractTimestamp = (point) => {
  const rawTimestamp = point?.timestamp ?? point?.createdAt ?? point?.time ?? point?.date ?? point?.datetime
  const parsedTimestamp = new Date(rawTimestamp).getTime()
  return Number.isFinite(parsedTimestamp) ? parsedTimestamp : null
}

const getForecastValues = (prediction, key) => {
  if (!prediction) return []

  const signalForecastValues = prediction[`${key}ForecastValues`]
  if (Array.isArray(signalForecastValues) && signalForecastValues.length > 0) {
    return signalForecastValues.map(toFiniteNumber)
  }

  if (Array.isArray(prediction.forecastValues) && prediction.forecastValues.length > 0) {
    return prediction.forecastValues.map(toFiniteNumber)
  }

  const scalarValue = toFiniteNumber(prediction[key])
  return scalarValue !== null ? [scalarValue] : []
}

export const normalizeHistorySeries = (history = []) => {
  return (Array.isArray(history) ? history : [])
    .map((point) => {
      const timestamp = extractTimestamp(point)
      if (timestamp === null) return null

      return {
        ...point,
        timestamp,
        time: formatTimeLabel(timestamp),
        actualTemp: toFiniteNumber(point?.temperature),
        actualVib: toFiniteNumber(point?.vibration),
        actualCurr: toFiniteNumber(point?.current)
      }
    })
    .filter(Boolean)
    .sort((left, right) => left.timestamp - right.timestamp)
}

export const inferStepMinutes = (historySeries = []) => {
  if (!Array.isArray(historySeries) || historySeries.length < 2) {
    return DEFAULT_STEP_MINUTES
  }

  const lastPoint = historySeries[historySeries.length - 1]
  const previousPoint = historySeries[historySeries.length - 2]
  const differenceMs = lastPoint.timestamp - previousPoint.timestamp
  const differenceMinutes = differenceMs / 60000

  if (!Number.isFinite(differenceMinutes) || differenceMinutes <= 0) {
    return DEFAULT_STEP_MINUTES
  }

  return Math.max(1, Math.round(differenceMinutes))
}

export const buildPredictionTimeline = ({ history = [], prediction = null } = {}) => {
  const historySeries = normalizeHistorySeries(history)
  const lastHistoryPoint = historySeries.length > 0 ? historySeries[historySeries.length - 1] : null
  const stepMinutes = inferStepMinutes(historySeries)
  const anchorTimestamp = lastHistoryPoint?.timestamp ?? extractTimestamp(prediction) ?? Date.now()

  const temperatureForecastValues = getForecastValues(prediction, 'temperature')
  const vibrationForecastValues = getForecastValues(prediction, 'vibration')
  const currentForecastValues = getForecastValues(prediction, 'current')
  const fallbackForecastValues = getForecastValues(prediction, 'forecast')

  const totalForecastPoints = Math.max(
    temperatureForecastValues.length,
    vibrationForecastValues.length,
    currentForecastValues.length,
    fallbackForecastValues.length,
    0
  )

  const forecastTimestamps = Array.from({ length: totalForecastPoints }, (_, index) => {
    return anchorTimestamp + (stepMinutes * (index + 1) * 60000)
  })

  const forecastLabels = forecastTimestamps.map(formatTimeLabel)

  const forecastSeries = forecastTimestamps.map((timestamp, index) => {
    const predictedTemp = temperatureForecastValues[index] ?? fallbackForecastValues[index] ?? null
    const predictedVib = vibrationForecastValues[index] ?? fallbackForecastValues[index] ?? null
    const predictedCurr = currentForecastValues[index] ?? fallbackForecastValues[index] ?? null

    return {
      timestamp,
      time: formatTimeLabel(timestamp),
      actualTemp: null,
      actualVib: null,
      actualCurr: null,
      forecastTemp: predictedTemp,
      forecastVib: predictedVib,
      forecastCurr: predictedCurr,
      predictedTemp,
      predictedVib,
      predictedCurr,
      confidence: toFiniteNumber(prediction?.confidence),
      source: prediction?.predictionSource || prediction?.modelName || 'ML prediction',
      modelName: prediction?.modelName || 'N/A',
      modelVersion: prediction?.modelVersion || 'N/A',
      isForecast: true
    }
  })

  const chartSeries = [
    ...historySeries.map((point, index) => {
      const isLastHistory = index === historySeries.length - 1
      return {
        timestamp: point.timestamp,
        time: point.time,
        actualTemp: point.actualTemp,
        actualVib: point.actualVib,
        actualCurr: point.actualCurr,
        forecastTemp: isLastHistory && forecastSeries.length > 0 ? point.actualTemp : null,
        forecastVib: isLastHistory && forecastSeries.length > 0 ? point.actualVib : null,
        forecastCurr: isLastHistory && forecastSeries.length > 0 ? point.actualCurr : null,
        predictedTemp: isLastHistory && forecastSeries.length > 0 ? point.actualTemp : null,
        predictedVib: isLastHistory && forecastSeries.length > 0 ? point.actualVib : null,
        predictedCurr: isLastHistory && forecastSeries.length > 0 ? point.actualCurr : null,
        confidence: null,
        source: 'History',
        modelName: null,
        modelVersion: null,
        isForecast: false
      }
    }),
    ...forecastSeries
  ]

  return {
    historySeries,
    forecastSeries,
    chartSeries,
    forecastTimestamps,
    forecastLabels,
    forecastWindowStart: forecastTimestamps[0] ?? null,
    forecastWindowEnd: forecastTimestamps.length > 0 ? forecastTimestamps[forecastTimestamps.length - 1] : null,
    stepMinutes,
    lastActualTimestamp: lastHistoryPoint?.timestamp ?? null,
    anchorTimestamp,
    confidence: toFiniteNumber(prediction?.confidence) ?? 0,
    modelName: prediction?.modelName || 'ML prediction',
    modelVersion: prediction?.modelVersion || 'N/A',
    predictionSource: prediction?.predictionSource || 'ML prediction'
  }
}