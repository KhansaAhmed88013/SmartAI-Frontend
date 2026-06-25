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

const horizonMinutesMap = { '15m': 15, '1h': 60, '6h': 360, '24h': 1440 }

const normalizeConfidence = (value) => {
  const confidenceValue = Number(value)
  if (!Number.isFinite(confidenceValue)) return 0
  return confidenceValue <= 1 ? Math.round(confidenceValue * 100) : Math.round(confidenceValue)
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
  '1h': 'After 1 hour',
  '6h': 'After 6 hours',
  '24h': 'After 24 hours'
}

const AIPredictions = () => {
  const [selectedMachine, setSelectedMachine] = useState('')
  const [horizon, setHorizon] = useState('1h')
  const [predictionData, setPredictionData] = useState([])
  const [confidence, setConfidence] = useState(0)
  const [predictedPoints, setPredictedPoints] = useState([])
  const [expectedShort, setExpectedShort] = useState([])
  const [forecastWindow, setForecastWindow] = useState({ start: null, end: null, stepMinutes: 5, lastActualTimestamp: null })
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
    setForecastWindow({ start: null, end: null, stepMinutes: 5, lastActualTimestamp: null })
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
    // UI-level RBAC: limit to MAINTENANCE_ENGINEER or SYSTEM_ADMIN
    if (!canViewPredictions) return
    let mounted = true

    const fetchAndBuild = async () => {
      try {
        const [machines, history, preds15, preds1h, preds6h, preds24h, insights] = await Promise.all([
          api.getMachines().catch(() => []),
          api.getHistory(selectedMachine, '24h').catch(() => []),
          api.getPredictions(selectedMachine, '15m').catch(() => []),
          api.getPredictions(selectedMachine, '1h').catch(() => []),
          api.getPredictions(selectedMachine, '6h').catch(() => []),
          api.getPredictions(selectedMachine, '24h').catch(() => []),
          api.getInsights(selectedMachine, horizon).catch(() => [])
        ])

        const selectedMachineData = Array.isArray(machines) ? machines.find((m) => m._id === selectedMachine) : null
        const effectiveStatus = selectedMachineData?.effectiveStatus || selectedMachineData?.status || ''
        if (mounted) {
          setMachineStatus(effectiveStatus)
        }

        const predsByH = { '15m': preds15 || [], '1h': preds1h || [], '6h': preds6h || [], '24h': preds24h || [] }
        const latestPredictionsByHorizon = Object.fromEntries(
          Object.entries(predsByH).map(([h, records]) => [h, pickLatestRealPrediction(records)])
        )
        const latestRealPrediction = pickLatestRealPredictionFromAllHorizons(predsByH)
        const selectedPrediction = latestPredictionsByHorizon[horizon] || latestRealPrediction

        const timeline = buildPredictionTimeline({ history, prediction: selectedPrediction })
        const predictedSeries = timeline.chartSeries
        const expected = timeline.forecastSeries.slice(0, 4).map((point) => ({
          time: point.time,
          predictedTemp: point.predictedTemp,
          predictedVib: point.predictedVib,
          predictedCurr: point.predictedCurr
        }))

        const summaries = ['15m', '1h', '6h', '24h'].map((key) => {
          const prediction = latestPredictionsByHorizon[key]
          const horizonTimeline = buildPredictionTimeline({ history, prediction })
          const firstForecastPoint = horizonTimeline.forecastSeries[0] || null
          const lastForecastPoint = horizonTimeline.forecastSeries[horizonTimeline.forecastSeries.length - 1] || null
          const horizonMinutes = horizonMinutesMap[key] || 0
          const expectedAt = horizonTimeline.lastActualTimestamp
            ? horizonTimeline.lastActualTimestamp + (horizonMinutes * 60000)
            : firstForecastPoint?.timestamp || null

          return {
            horizon: key,
            label: horizonLabelMap[key] || key,
            prediction,
            confidence: normalizeConfidence(horizonTimeline.confidence ?? prediction?.confidence),
            expectedAt,
            forecastFrom: horizonTimeline.forecastWindowStart,
            forecastUntil: horizonTimeline.forecastWindowEnd,
            forecastStepMinutes: horizonTimeline.stepMinutes,
            forecastSeries: horizonTimeline.forecastSeries,
            firstPredictedTemp: firstForecastPoint?.predictedTemp ?? null,
            firstPredictedVib: firstForecastPoint?.predictedVib ?? null,
            firstPredictedCurr: firstForecastPoint?.predictedCurr ?? null,
            modelName: horizonTimeline.modelName || prediction?.modelName || prediction?.predictionSource || 'ML prediction',
            modelVersion: horizonTimeline.modelVersion || prediction?.modelVersion || 'N/A',
            source: prediction?.predictionSource || horizonTimeline.predictionSource || 'ML prediction',
            lastActualTimestamp: horizonTimeline.lastActualTimestamp,
            forecastCount: horizonTimeline.forecastSeries.length,
            lastForecastPoint: lastForecastPoint
          }
        })

        const latestPrediction = selectedPrediction
        const confidencePercent = normalizeConfidence(timeline.confidence ?? latestPrediction?.confidence)
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
          setForecastWindow({ start: null, end: null, stepMinutes: 5, lastActualTimestamp: null })
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
    { value: '1h', label: '1 Hour' },
    { value: '6h', label: '6 Hours' },
    { value: '24h', label: '24 Hours' }
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
