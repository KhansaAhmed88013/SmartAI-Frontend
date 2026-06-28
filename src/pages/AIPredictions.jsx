import { useState, useEffect } from 'react'
import api from '../utils/api'
import PredictionHeader from '../components/predictions/PredictionHeader'
import PredictionHorizonSelector from '../components/predictions/PredictionHorizonSelector'
import UpcomingPredictionsGrid from '../components/predictions/UpcomingPredictionsGrid'
import ExpectedShortTermPanel from '../components/predictions/ExpectedShortTermPanel'
import PredictionMetadata from '../components/predictions/PredictionMetadata'
import PredictionCharts from '../components/predictions/PredictionCharts'
import MaintenanceInsightsPanel from '../components/predictions/MaintenanceInsightsPanel'
import ModelInfoCard from '../components/predictions/ModelInfoCard'
import NoPermissionMessage from '../components/predictions/NoPermissionMessage'
import { buildPredictionTimeline } from '../utils/predictionTimeline'

const horizonMinutesMap = { '15m': 15, '30m': 30, '45m': 45, '1h': 60 }

const normalizeConfidence = (value) => {
  const confidenceValue = Number(value)
  if (!Number.isFinite(confidenceValue)) return 0
  return confidenceValue <= 1 ? Math.round(confidenceValue * 100) : Math.round(confidenceValue)
}

const formatPredictionSource = (source) => {
  const src = String(source || '').toUpperCase()
  if (src === 'ML_SERVICE') return 'Autoformer AI'
  if (src === 'FORECAST_SERVICE') return 'Regression AI'
  return 'Autoformer AI'
}

const getModelText = (prediction) => {
  return [
    prediction?.modelName,
    prediction?.modelVersion,
    prediction?.predictionSource,
    prediction?.temperatureModelName,
    prediction?.temperatureModelVersion,
    prediction?.temperaturePredictionSource,
    prediction?.currentModelName,
    prediction?.currentModelVersion,
    prediction?.currentPredictionSource,
    prediction?.vibrationModelName,
    prediction?.vibrationModelVersion,
    prediction?.vibrationPredictionSource
  ].filter(Boolean).join(' ').toLowerCase()
}

const isRealPrediction = (prediction) => {
  const source = String(prediction?.predictionSource || '').toUpperCase()
  const modelText = getModelText(prediction)
  const hasForecastValues = [
    prediction?.forecastValues,
    prediction?.temperatureForecastValues,
    prediction?.currentForecastValues,
    prediction?.vibrationForecastValues
  ].some(values => Array.isArray(values) && values.length > 0)
  const hasScalarPredictions = [prediction?.temperature, prediction?.vibration, prediction?.current]
    .some(value => Number.isFinite(Number(value)))

  return (
    source === 'ML_SERVICE' ||
    source === 'FORECAST_SERVICE' ||
    /autoformer|ml_service|ml-service/.test(modelText) ||
    hasForecastValues ||
    hasScalarPredictions
  )
}

const pickLatestRealPrediction = (predictions) => {
  const mlPredictions = (Array.isArray(predictions) ? predictions : [])
    .filter(isRealPrediction)
    .sort((left, right) => new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime())
  return mlPredictions[0] || null
}

const pickLatestRealPredictionFromAllHorizons = (predictionsByHorizon) => {
  const allPredictions = Object.values(predictionsByHorizon || {}).flat()
  return pickLatestRealPrediction(allPredictions)
}

const normalizeRole = (value) => {
  const role = String(value || '').trim().toUpperCase()
  if (!role) return ''
  if (role === 'ADMIN' || role === 'SYSTEM_ADMIN' || role === 'SYSTEM-ADMIN') return 'SYSTEM_ADMIN'
  if (role === 'MAINTENANCE_ENGINEER' || role === 'MAINTENANCE-ENGINEER') return 'MAINTENANCE_ENGINEER'
  if (role === 'OPERATOR' || role === 'MACHINE_OPERATOR' || role === 'MACHINE-OPERATOR') return 'MACHINE_OPERATOR'
  return role
}

const horizonLabelMap = {
  '15m': 'After 15 minutes',
  '30m': 'After 30 minutes',
  '45m': 'After 45 minutes',
  '1h': 'After 1 hour'
}

const AIPredictions = () => {
  const [selectedMachine, setSelectedMachine] = useState('')
  const [horizon, setHorizon] = useState('1h')
  const [predictionData, setPredictionData] = useState([])
  const [confidence, setConfidence] = useState(0)
  const [predictedPoints, setPredictedPoints] = useState([])
  const [expectedShort, setExpectedShort] = useState([])
  const [forecastWindow, setForecastWindow] = useState({ start: null, end: null, stepMinutes: 2.5, lastActualTimestamp: null })
  const [horizonSummaries, setHorizonSummaries] = useState([])
  const [predsMeta, setPredsMeta] = useState({ count: 0, lastCreated: null })
  const [maintenanceInsights, setMaintenanceInsights] = useState([])
  const [modelInfo, setModelInfo] = useState({ modelType: 'N/A', version: 'N/A', accuracy: 0, trainingSamples: 0, lastTrained: 'N/A' })
  const [machineStatus, setMachineStatus] = useState('')
  const [hasRecentData, setHasRecentData] = useState(false)
  const [role, setRole] = useState('')
  const [roleLoaded, setRoleLoaded] = useState(false)
  const canViewPredictions = roleLoaded && (role === 'MAINTENANCE_ENGINEER' || role === 'SYSTEM_ADMIN' || role === 'ADMIN')

  useEffect(() => {
    setPredictionData([])
    setPredictedPoints([])
    setExpectedShort([])
    setForecastWindow({ start: null, end: null, stepMinutes: 2.5, lastActualTimestamp: null })
    setHorizonSummaries([])
    setConfidence(0)
    setPredsMeta({ count: 0, lastCreated: null })
    setMaintenanceInsights([])
    setModelInfo({ modelType: 'N/A', version: 'N/A', accuracy: 0, trainingSamples: 0, lastTrained: 'N/A' })
    setHasRecentData(false)
  }, [selectedMachine])

  useEffect(() => {
    api.getProfile()
      .then(p => {
        setRole(normalizeRole(p?.role || ''))
      })
      .catch(() => {
        setRole('')
      })
      .finally(() => setRoleLoaded(true))
  }, [])

  useEffect(() => {
    if (!selectedMachine) return
    if (!canViewPredictions) return
    let mounted = true

    const fetchAndBuild = async () => {
      try {
        const [machines, history, preds15, preds30, preds45, preds1h, insights] = await Promise.all([
          api.getMachines().catch(() => []),
          api.getHistory(selectedMachine, '24h').catch(() => []),
          api.getPredictions(selectedMachine, '15m').catch(() => []),
          api.getPredictions(selectedMachine, '30m').catch(() => []),
          api.getPredictions(selectedMachine, '45m').catch(() => []),
          api.getPredictions(selectedMachine, '1h').catch(() => []),
          api.getInsights(selectedMachine, horizon).catch(() => [])
        ])

        const selectedMachineData = Array.isArray(machines) ? machines.find((m) => m._id === selectedMachine) : null
        const effectiveStatus = selectedMachineData?.effectiveStatus || selectedMachineData?.status || ''
        if (mounted) {
          setMachineStatus(effectiveStatus)
        }

        const predsByH = { '15m': preds15 || [], '30m': preds30 || [], '45m': preds45 || [], '1h': preds1h || [] }
        const latestRealPrediction = pickLatestRealPredictionFromAllHorizons(predsByH)
        const selectedPrediction = latestRealPrediction

        const timeline = buildPredictionTimeline({ history, prediction: selectedPrediction })
        const predictedSeries = timeline.chartSeries
        const expected = timeline.snapshotTimeline

        // We extract all values from the single 1h prediction forecast values
        const summaries = ['15m', '30m', '45m', '1h'].map((key) => {
          const horizonMinutes = horizonMinutesMap[key] || 0
          
          // Index mapping: 15m (index 5), 30m (index 11), 45m (index 17), 1h (index 23)
          const horizonIndices = { '15m': 5, '30m': 11, '45m': 17, '1h': 23 }
          const idx = horizonIndices[key]

          const tempVal = timeline.forecastSeries[idx]?.predictedTemp ?? null
          const vibVal = timeline.forecastSeries[idx]?.predictedVib ?? null
          const currVal = timeline.forecastSeries[idx]?.predictedCurr ?? null

          const expectedAt = timeline.lastActualTimestamp
            ? timeline.lastActualTimestamp + (horizonMinutes * 60000)
            : timeline.forecastSeries[idx]?.timestamp || null

          return {
            horizon: key,
            label: horizonLabelMap[key] || key,
            prediction: selectedPrediction,
            confidence: normalizeConfidence(timeline.confidence),
            expectedAt,
            forecastFrom: timeline.forecastWindowStart,
            forecastUntil: timeline.forecastWindowEnd,
            forecastStepMinutes: timeline.stepMinutes,
            forecastSeries: timeline.forecastSeries.slice(0, idx + 1),
            firstPredictedTemp: tempVal,
            firstPredictedVib: vibVal,
            firstPredictedCurr: currVal,
            modelName: timeline.modelName || selectedPrediction?.modelName || 'ML prediction',
            modelVersion: timeline.modelVersion || selectedPrediction?.modelVersion || 'N/A',
            source: formatPredictionSource(selectedPrediction?.predictionSource || timeline.predictionSource),
            lastActualTimestamp: timeline.lastActualTimestamp,
            forecastCount: idx + 1,
            lastForecastPoint: timeline.forecastSeries[idx] || null
          }
        })

        const latestPrediction = selectedPrediction
        const confidencePercent = normalizeConfidence(timeline.confidence)
        const sampleCount = Math.max(
          latestPrediction?.temperatureForecastValues?.length || 0,
          latestPrediction?.currentForecastValues?.length || 0,
          latestPrediction?.vibrationForecastValues?.length || 0,
          latestPrediction?.forecastValues?.length || 0
        )

        const recent = timeline.lastActualTimestamp ? (Date.now() - timeline.lastActualTimestamp < 5 * 60 * 1000) : false

        if (mounted) {
          setPredictionData(predictedSeries)
          setPredictedPoints(timeline.forecastSeries)
          setExpectedShort(expected)
          setHorizonSummaries(summaries)
          setConfidence(confidencePercent)
          setHasRecentData(recent)
          setPredsMeta({ count: Object.values(predsByH).reduce((sum, records) => sum + (Array.isArray(records) ? records.filter(isRealPrediction).length : 0), 0), lastCreated: latestPrediction ? latestPrediction.createdAt : null })
          setForecastWindow({
            start: timeline.forecastWindowStart,
            end: timeline.forecastWindowEnd,
            stepMinutes: timeline.stepMinutes,
            lastActualTimestamp: timeline.lastActualTimestamp
          })
          setMaintenanceInsights(Array.isArray(insights) ? insights : [])
          setModelInfo({
            modelType: timeline.modelName || latestPrediction?.modelName || latestPrediction?.predictionSource || 'ML prediction',
            version: timeline.modelVersion || latestPrediction?.modelVersion || 'N/A',
            accuracy: confidencePercent,
            trainingSamples: sampleCount,
            lastTrained: latestPrediction?.createdAt ? new Date(latestPrediction.createdAt).toLocaleString() : 'N/A'
          })
        }
      } catch (e) {
        if (mounted) {
          setPredictionData([])
          setPredictedPoints([])
          setExpectedShort([])
          setHorizonSummaries([])
          setConfidence(0)
          setPredsMeta({ count: 0, lastCreated: null })
          setForecastWindow({ start: null, end: null, stepMinutes: 2.5, lastActualTimestamp: null })
          setMaintenanceInsights([])
          setModelInfo({ modelType: 'N/A', version: 'N/A', accuracy: 0, trainingSamples: 0, lastTrained: 'N/A' })
        }
      }
    }

    fetchAndBuild()
    const iv = setInterval(fetchAndBuild, 5000)
    return () => { mounted = false; clearInterval(iv) }
  }, [selectedMachine, horizon, canViewPredictions])

  const horizons = [
    { value: '15m', label: '15 Minutes' },
    { value: '30m', label: '30 Minutes' },
    { value: '45m', label: '45 Minutes' },
    { value: '1h', label: '1 Hour' }
  ]

  const getConfidenceColor = (conf) => {
    if (conf >= 90) return 'text-green-600 dark:text-green-400'
    if (conf >= 80) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <PredictionHeader
        selectedMachine={selectedMachine}
        onMachineChange={setSelectedMachine}
      />

      {String(machineStatus).toUpperCase() === 'STOPPED' && !hasRecentData && (
        <div className="rounded-lg border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/30 dark:border-yellow-600 p-4 text-sm text-yellow-800 dark:text-yellow-100">
          Machine is currently stopped. AI forecast is disabled until the machine resumes running. Showing last recorded sensor history only.
        </div>
      )}

      {!roleLoaded ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Checking permissions...</p>
        </div>
      ) : canViewPredictions ? (
        <UpcomingPredictionsGrid
          horizonSummaries={horizonSummaries}
        />
      ) : (
        <NoPermissionMessage />
      )}

      <ExpectedShortTermPanel
        expectedShort={expectedShort}
        forecastWindow={forecastWindow}
        confidence={confidence}
      />

      <PredictionHorizonSelector
        horizon={horizon}
        horizons={horizons}
        onHorizonChange={setHorizon}
        confidence={confidence}
        getConfidenceColor={getConfidenceColor}
      />

      <PredictionMetadata predsMeta={predsMeta} />

      <PredictionCharts predictionData={predictionData} />

      <MaintenanceInsightsPanel maintenanceInsights={maintenanceInsights} />

      <ModelInfoCard modelInfo={modelInfo} />
    </div>
  )
}

export default AIPredictions
