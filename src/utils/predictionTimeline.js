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
  console.log(`[predictionTimeline] [buildPredictionTimeline] called. prediction.createdAt: ${prediction?.createdAt || 'N/A'}`);
  const historySeries = normalizeHistorySeries(history)
  const lastHistoryPoint = historySeries.length > 0 ? historySeries[historySeries.length - 1] : null
  const anchorTimestamp = extractTimestamp(prediction) ?? lastHistoryPoint?.timestamp ?? Date.now()

  const temperatureForecastValues = getForecastValues(prediction, 'temperature')
  const vibrationForecastValues = getForecastValues(prediction, 'vibration')
  const currentForecastValues = getForecastValues(prediction, 'current')
  const fallbackForecastValues = getForecastValues(prediction, 'forecast')

  console.log(`[predictionTimeline] [buildPredictionTimeline] Extracted forecast values:
    prediction.createdAt: ${prediction?.createdAt || 'N/A'}
    forecastValues: ${prediction?.forecastValues ? JSON.stringify(prediction.forecastValues) : '[]'}
    temperatureForecastValues: ${JSON.stringify(temperatureForecastValues)}
    currentForecastValues: ${JSON.stringify(currentForecastValues)}
    vibrationForecastValues: ${JSON.stringify(vibrationForecastValues)}`);

  const totalForecastPoints = Math.max(
    temperatureForecastValues.length,
    vibrationForecastValues.length,
    currentForecastValues.length,
    fallbackForecastValues.length,
    0
  )

  // Step minutes is always 2.5 for the ML prediction pipeline
  const stepMinutes = 2.5

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

  const horizonMinutesMap = {
    '15m': 15,
    '30m': 30,
    '45m': 45,
    '1h': 60
  }
  const horizonMinutes = horizonMinutesMap[prediction?.horizon] || 60
  const expectedAt = anchorTimestamp + (horizonMinutes * 60000)

  // Map snapshot timeline points (exactly 15m, 30m, 45m, 1h milestones)
  const snapshotTimeline = [
    { label: '15 Minutes', index: 5, expectedAt: anchorTimestamp + 15 * 60000 },
    { label: '30 Minutes', index: 11, expectedAt: anchorTimestamp + 30 * 60000 },
    { label: '45 Minutes', index: 17, expectedAt: anchorTimestamp + 45 * 60000 },
    { label: '1 Hour', index: 23, expectedAt: anchorTimestamp + 60 * 60000 }
  ].map(item => {
    const tempVal = temperatureForecastValues[item.index] ?? null
    const vibVal = vibrationForecastValues[item.index] ?? null
    const currVal = currentForecastValues[item.index] ?? null
    return {
      label: item.label,
      expectedAt: item.expectedAt,
      time: formatTimeLabel(item.expectedAt),
      predictedTemp: tempVal !== null ? tempVal.toFixed(2) : 'N/A',
      predictedVib: vibVal !== null ? vibVal.toFixed(2) : 'N/A',
      predictedCurr: currVal !== null ? currVal.toFixed(2) : 'N/A'
    }
  })

  return {
    historySeries,
    forecastSeries,
    chartSeries,
    forecastTimestamps,
    forecastLabels,
    forecastWindowStart: anchorTimestamp, // Forecast starts at the anchor (last history point)
    forecastWindowEnd: expectedAt,
    stepMinutes,
    lastActualTimestamp: lastHistoryPoint?.timestamp ?? null,
    anchorTimestamp,
    expectedAt,
    snapshotTimeline,
    confidence: toFiniteNumber(prediction?.confidence) ?? 0,
    modelName: prediction?.modelName || 'ML prediction',
    modelVersion: prediction?.modelVersion || 'N/A',
    predictionSource: prediction?.predictionSource || 'ML prediction'
  }
}

export const buildDashboardState = (activePrediction, history = []) => {
  if (!activePrediction) {
    return {
      forecastFrom: null,
      expectedAt: null,
      cards: [],
      timeline: [],
      snapshot: [],
      chart: [],
      maintenance: [],
      objectId: null
    };
  }

  const objectId = activePrediction._id;
  const createdAtTime = new Date(activePrediction.createdAt).getTime();
  const forecastFrom = createdAtTime;

  const horizonMinutesMap = { '15m': 15, '30m': 30, '45m': 45, '1h': 60 };
  const mins = horizonMinutesMap[activePrediction.horizon] || 60;
  const expectedAt = forecastFrom + (mins * 60000);

  // Extract forecast values
  const tfv = Array.isArray(activePrediction.temperatureForecastValues) ? activePrediction.temperatureForecastValues : [];
  const cfv = Array.isArray(activePrediction.currentForecastValues) ? activePrediction.currentForecastValues : [];
  const vfv = Array.isArray(activePrediction.vibrationForecastValues) ? activePrediction.vibrationForecastValues : [];

  const totalPoints = Math.max(tfv.length, cfv.length, vfv.length);
  const stepMinutes = 2.5;

  // Build forecast series
  const forecastSeries = Array.from({ length: totalPoints }, (_, index) => {
    const timestamp = forecastFrom + (stepMinutes * (index + 1) * 60000);
    const predictedTemp = tfv[index] ?? null;
    const predictedCurr = cfv[index] ?? null;
    const predictedVib = vfv[index] ?? null;

    return {
      timestamp,
      time: new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actualTemp: null,
      actualVib: null,
      actualCurr: null,
      forecastTemp: predictedTemp,
      forecastVib: predictedVib,
      forecastCurr: predictedCurr,
      predictedTemp,
      predictedVib,
      predictedCurr,
      confidence: activePrediction.confidence,
      source: activePrediction.predictionSource || 'Autoformer',
      modelName: activePrediction.modelName || 'Autoformer',
      isForecast: true,
      objectId
    };
  });

  // Build chart (combined history and forecast series)
  const historySeries = (Array.isArray(history) ? history : [])
    .map((point) => {
      const parsedTime = new Date(point.timestamp ?? point.createdAt).getTime();
      return {
        timestamp: parsedTime,
        time: new Date(parsedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actualTemp: point.temperature ?? null,
        actualVib: point.vibration ?? null,
        actualCurr: point.current ?? null,
        forecastTemp: null,
        forecastVib: null,
        forecastCurr: null,
        predictedTemp: null,
        predictedVib: null,
        predictedCurr: null,
        isForecast: false,
        objectId
      };
    })
    .sort((a, b) => a.timestamp - b.timestamp);

  // Connect last history point to the first forecast point
  if (historySeries.length > 0 && forecastSeries.length > 0) {
    const lastHistory = historySeries[historySeries.length - 1];
    lastHistory.forecastTemp = lastHistory.actualTemp;
    lastHistory.forecastVib = lastHistory.actualVib;
    lastHistory.forecastCurr = lastHistory.actualCurr;
    lastHistory.predictedTemp = lastHistory.actualTemp;
    lastHistory.predictedVib = lastHistory.actualVib;
    lastHistory.predictedCurr = lastHistory.actualCurr;
  }

  const chart = [...historySeries, ...forecastSeries];

  // Rebuild snapshot timeline (milestones: 15m, 30m, 45m, 1h)
  const milestones = [
    { label: '15 Minutes', index: 5, mins: 15 },
    { label: '30 Minutes', index: 11, mins: 30 },
    { label: '45 Minutes', index: 17, mins: 45 },
    { label: '1 Hour', index: 23, mins: 60 }
  ];

  const snapshot = milestones
    .map(item => {
      const tempVal = tfv[item.index] ?? null;
      const vibVal = vfv[item.index] ?? null;
      const currVal = cfv[item.index] ?? null;
      return {
        label: item.label,
        expectedAt: forecastFrom + (item.mins * 60000),
        time: new Date(forecastFrom + (item.mins * 60000)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        predictedTemp: tempVal !== null ? tempVal.toFixed(2) : 'N/A',
        predictedVib: vibVal !== null ? vibVal.toFixed(2) : 'N/A',
        predictedCurr: currVal !== null ? currVal.toFixed(2) : 'N/A',
        objectId
      };
    })
    .filter(item => item.predictedTemp !== 'N/A');

  // Build cards for UpcomingPredictionsGrid
  const cards = milestones
    .map(item => {
      const tempVal = tfv[item.index] ?? null;
      const vibVal = vfv[item.index] ?? null;
      const currVal = cfv[item.index] ?? null;
      return {
        horizon: item.mins === 60 ? '1h' : `${item.mins}m`,
        label: `After ${item.label.toLowerCase()}`,
        prediction: activePrediction,
        confidence: activePrediction.confidence ? Math.round(activePrediction.confidence <= 1 ? activePrediction.confidence * 100 : activePrediction.confidence) : 0,
        expectedAt: forecastFrom + (item.mins * 60000),
        forecastFrom,
        forecastUntil: forecastFrom + (item.mins * 60000),
        forecastStepMinutes: stepMinutes,
        firstPredictedTemp: tempVal,
        firstPredictedVib: vibVal,
        firstPredictedCurr: currVal,
        source: activePrediction.predictionSource || 'Autoformer',
        modelName: activePrediction.modelName || 'Autoformer',
        modelVersion: activePrediction.modelVersion || 'N/A',
        objectId
      };
    })
    .filter(card => card.firstPredictedTemp !== null);

  // Deriving simple maintenance insights or recommendations based on predictions
  const maintenance = [];
  if (tfv.some(t => t > 75)) {
    maintenance.push({
      parameter: 'temperature',
      severity: 'HIGH',
      message: 'Predicted temperature spike exceeds warning threshold of 75°C. Cooling system check recommended.',
      timestamp: forecastFrom,
      objectId
    });
  }
  if (vfv.some(v => v > 4.5)) {
    maintenance.push({
      parameter: 'vibration',
      severity: 'MEDIUM',
      message: 'Predicted vibration exceeds warning threshold of 4.5 mm/s. Alignments should be inspected.',
      timestamp: forecastFrom,
      objectId
    });
  }

  return {
    forecastFrom,
    expectedAt,
    cards,
    timeline: forecastSeries,
    snapshot,
    chart,
    maintenance,
    objectId
  };
};