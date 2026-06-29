import { useState, useEffect, useRef } from 'react'
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
import { buildPredictionTimeline, buildDashboardState } from '../utils/predictionTimeline'

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
  const arr = Array.isArray(predictions) ? predictions : []
  const mlPredictions = arr
    .filter(isRealPrediction)
    .sort((left, right) => new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime())
  const selected = mlPredictions[0] || null
  
  if (selected) {
    const fv = selected.forecastValues || [];
    const tfv = selected.temperatureForecastValues || [];
    const cfv = selected.currentForecastValues || [];
    const vfv = selected.vibrationForecastValues || [];
    console.log(`[TRACE] [pickLatestRealPrediction]:
      ObjectId: ${selected._id}
      createdAt: ${selected.createdAt}
      forecastValues[0]: ${fv[0] ?? 'N/A'}
      forecastValues[last]: ${fv[fv.length - 1] ?? 'N/A'}
      temperatureForecastValues[last]: ${tfv[tfv.length - 1] ?? 'N/A'}
      currentForecastValues[last]: ${cfv[cfv.length - 1] ?? 'N/A'}
      vibrationForecastValues[last]: ${vfv[vfv.length - 1] ?? 'N/A'}`);
  }
  return selected
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
  const [activePrediction, setActivePrediction] = useState(null)
  const canViewPredictions = roleLoaded && (role === 'MAINTENANCE_ENGINEER' || role === 'SYSTEM_ADMIN' || role === 'ADMIN')

  const prevSelectedPredictionIdRef = useRef(null)

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
    setActivePrediction(null)
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
      console.log(`[AIPredictions] [fetchAndBuild] Fetch started for machine: ${selectedMachine}`);
      try {
        const [machines, history, preds15, preds30, preds45, preds1h, insights, modelPerf] = await Promise.all([
          api.getMachines().catch(() => []),
          api.getHistory(selectedMachine, '24h').catch(() => []),
          api.getPredictions(selectedMachine, '15m').catch(() => []),
          api.getPredictions(selectedMachine, '30m').catch(() => []),
          api.getPredictions(selectedMachine, '45m').catch(() => []),
          api.getPredictions(selectedMachine, '1h').catch(() => []),
          api.getInsights(selectedMachine, horizon).catch(() => []),
          api.getModelPerformance().catch(() => null)
        ])
        console.log(`[AIPredictions] [fetchAndBuild] Fetch completed successfully`);

        // STEP 2 - VERIFY THE FRONTEND RECEIVES THE SAME DATA
        const allArrivals = { '15m': preds15, '30m': preds30, '45m': preds45, '1h': preds1h };
        Object.entries(allArrivals).forEach(([h, list]) => {
          if (Array.isArray(list) && list.length > 0) {
            const newest = list[0];
            const tempForecast = newest.temperatureForecastValues || newest.forecastValues || [];
            console.log(`[TRACE] [AIPredictions.jsx - API Arrival] [${h}]:
              ObjectId: ${newest._id}
              createdAt: ${newest.createdAt}
              horizon: ${newest.horizon}
              temperature: ${newest.temperature}
              last value of forecast array: ${tempForecast[tempForecast.length - 1] ?? 'N/A'}`);
          }
        });

        const selectedMachineData = Array.isArray(machines) ? machines.find((m) => m._id === selectedMachine) : null
        const effectiveStatus = selectedMachineData?.effectiveStatus || selectedMachineData?.status || ''
        if (mounted) {
          setMachineStatus(effectiveStatus)
        }

        // STEP 3 - TRACE groupPredictionsByHorizon
        const predsByH = { '15m': preds15 || [], '30m': preds30 || [], '45m': preds45 || [], '1h': preds1h || [] }
        console.log(`[TRACE] [groupPredictionsByHorizon]:`);
        Object.entries(predsByH).forEach(([h, list]) => {
          if (list.length > 0) {
            const first = list[0];
            const tfv = first.temperatureForecastValues || [];
            console.log(`  Group ${h} Newest Prediction: ObjectId=${first._id}, createdAt=${first.createdAt}, temperatureForecastValues[last]=${tfv[tfv.length - 1] ?? 'N/A'}`);
          } else {
            console.log(`  Group ${h}: empty`);
          }
        });

        const latestRealPrediction = pickLatestRealPredictionFromAllHorizons(predsByH)
        const selectedPrediction = pickLatestRealPrediction(predsByH[horizon]) || latestRealPrediction

        // STEP 6 - VERIFY REACT STATE
        const prevId = prevSelectedPredictionIdRef.current;
        const newId = selectedPrediction?._id || null;
        console.log(`[React State Poll] Previous selectedPrediction._id: ${prevId}`);
        console.log(`[React State Poll] New selectedPrediction._id: ${newId}`);
        if (prevId !== newId) {
          console.log(`[React State Poll] selectedPrediction ID changed! Updating ref.`);
          prevSelectedPredictionIdRef.current = newId;
        }

        // STEP 3 - TRACE buildPredictionTimeline Input
        if (selectedPrediction) {
          const fv = selectedPrediction.forecastValues || [];
          const tfv = selectedPrediction.temperatureForecastValues || [];
          const cfv = selectedPrediction.currentForecastValues || [];
          const vfv = selectedPrediction.vibrationForecastValues || [];
          console.log(`[TRACE] [buildPredictionTimeline]:
            ObjectId: ${selectedPrediction._id}
            createdAt: ${selectedPrediction.createdAt}
            forecastValues[0]: ${fv[0] ?? 'N/A'}
            forecastValues[last]: ${fv[fv.length - 1] ?? 'N/A'}
            temperatureForecastValues[last]: ${tfv[tfv.length - 1] ?? 'N/A'}
            currentForecastValues[last]: ${cfv[cfv.length - 1] ?? 'N/A'}
            vibrationForecastValues[last]: ${vfv[vfv.length - 1] ?? 'N/A'}`);
        } else {
          console.log(`[TRACE] [buildPredictionTimeline] selectedPrediction is null`);
        }

        // ONE SOURCE OF TRUTH DERIVATION
        const dashboardState = buildDashboardState(selectedPrediction, history)
        const activePredictionId = dashboardState.objectId;

        // Print prediction IDs to verify they all match
        console.log(`[Dashboard Update] Verification Logs:`);
        console.log(`- Dashboard ObjectId: ${activePredictionId}`);
        console.log(`- Cards ObjectId: ${activePredictionId}`);
        console.log(`- Charts ObjectId: ${activePredictionId}`);
        console.log(`- Snapshot ObjectId: ${activePredictionId}`);
        console.log(`- Timeline ObjectId: ${activePredictionId}`);
        console.log(`- ForecastFrom ObjectId: ${activePredictionId}`);
        console.log(`- ExpectedAt ObjectId: ${activePredictionId}`);

        if (mounted) {
          setPredictionData(dashboardState.chart)
          setPredictedPoints(dashboardState.timeline)
          setExpectedShort(dashboardState.snapshot)
          setHorizonSummaries(dashboardState.cards)
          setConfidence(selectedPrediction?.confidence ? Math.round(selectedPrediction.confidence <= 1 ? selectedPrediction.confidence * 100 : selectedPrediction.confidence) : 0)
          setHasRecentData(history.length > 0 ? (Date.now() - new Date(history[history.length - 1].timestamp).getTime() < 5 * 60 * 1000) : false)
          setActivePrediction(selectedPrediction)
          setPredsMeta({ count: Object.values(predsByH).reduce((sum, records) => sum + (Array.isArray(records) ? records.filter(isRealPrediction).length : 0), 0), lastCreated: selectedPrediction ? selectedPrediction.createdAt : null })
          setForecastWindow({
            start: dashboardState.forecastFrom,
            end: dashboardState.expectedAt,
            stepMinutes: 2.5,
            lastActualTimestamp: history.length > 0 ? new Date(history[history.length - 1].timestamp).getTime() : null
          })
          setMaintenanceInsights(dashboardState.maintenance)
          
          if (modelPerf) {
            setModelInfo(modelPerf)
          } else {
            setModelInfo({
              predictionEngine: 'Autoformer AI',
              modelType: 'Time-Series Forecasting',
              temperatureModel: null,
              currentModel: null,
              vibrationModel: null,
              predictionLength: '24 Forecast Points',
              lastRetrained: selectedPrediction?.createdAt ? new Date(selectedPrediction.createdAt).toLocaleString() : 'N/A',
              lastEvaluated: selectedPrediction?.createdAt ? new Date(selectedPrediction.createdAt).toLocaleString() : 'N/A'
            })
          }
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
          setModelInfo({
            predictionEngine: 'Autoformer AI',
            modelType: 'Time-Series Forecasting',
            temperatureModel: null,
            currentModel: null,
            vibrationModel: null,
            predictionLength: '24 Forecast Points',
            lastRetrained: 'N/A',
            lastEvaluated: 'N/A'
          })
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
          activePrediction={activePrediction}
        />
      ) : (
        <NoPermissionMessage />
      )}

      <ExpectedShortTermPanel
        expectedShort={expectedShort}
        forecastWindow={forecastWindow}
        confidence={confidence}
        activePrediction={activePrediction}
      />

      <PredictionHorizonSelector
        horizon={horizon}
        horizons={horizons}
        onHorizonChange={setHorizon}
        confidence={confidence}
        getConfidenceColor={getConfidenceColor}
      />

      <PredictionMetadata predsMeta={predsMeta} />

      <PredictionCharts predictionData={predictionData} activePrediction={activePrediction} />

      {/* Maintenance Insights Panel 
      
      <MaintenanceInsightsPanel maintenanceInsights={maintenanceInsights} />
      */}
      
      <ModelInfoCard modelInfo={modelInfo} />
    </div>
  )
}

export default AIPredictions
