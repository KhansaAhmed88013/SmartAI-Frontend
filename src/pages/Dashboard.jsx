import { useState, useEffect } from "react";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import KPICardsGrid from "../components/dashboard/KPICardsGrid";
import ChartsSection from "../components/dashboard/ChartsSection";
import RiskAndAlertsSection from "../components/dashboard/RiskAndAlertsSection";
import MaintenanceInsights from "../components/MaintenanceInsights";
import api from "../utils/api";

const formatTimeLabel = (timestamp) =>
  new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

const formatStatusLabel = (status) => {
  if (!status) return "Unknown";
  const normalized = String(status).trim().toLowerCase();
  return normalized
    ? normalized.charAt(0).toUpperCase() + normalized.slice(1)
    : "Unknown";
};

const formatMetricStatus = (value, thresholds) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue) || !thresholds) return "Unknown";
  if (numericValue >= Number(thresholds.critical)) return "Critical";
  if (numericValue >= Number(thresholds.warning)) return "Warning";
  return "Running";
};

const deriveRiskLevel = ({
  alerts = [],
  insights = [],
  sensorStatuses = {},
}) => {
  const hasCriticalAlert = alerts.some((alert) =>
    ["critical", "high"].includes(String(alert?.severity || "").toLowerCase()),
  );
  const hasWarningAlert = alerts.some((alert) =>
    ["warning", "medium"].includes(String(alert?.severity || "").toLowerCase()),
  );
  const hasHighInsight = insights.some(
    (insight) => String(insight?.severity || "").toLowerCase() === "high",
  );
  const hasMediumInsight = insights.some(
    (insight) => String(insight?.severity || "").toLowerCase() === "medium",
  );
  const hasCriticalSensor = Object.values(sensorStatuses).some(
    (status) => String(status || "").toLowerCase() === "critical",
  );
  const hasWarningSensor = Object.values(sensorStatuses).some(
    (status) => String(status || "").toLowerCase() === "warning",
  );

  if (hasCriticalAlert || hasHighInsight || hasCriticalSensor) return "High";
  if (hasWarningAlert || hasMediumInsight || hasWarningSensor) return "Medium";
  return "Low";
};

const Dashboard = () => {
  const [selectedMachine, setSelectedMachine] = useState("");
  const [timeRange, setTimeRange] = useState("24h");
  const [kpis, setKPIs] = useState({
    temperature: null,
    vibration: null,
    current: null,
  });
  const [machineStatus, setMachineStatus] = useState("Unknown");
  const [sensorStatuses, setSensorStatuses] = useState({
    temperature: "Unknown",
    vibration: "Unknown",
    current: "Unknown",
  });
  const [alerts, setAlerts] = useState([]);
  const [riskLevel, setRiskLevel] = useState("Low");
  const [temperatureData, setTemperatureData] = useState([]);
  const [vibrationData, setVibrationData] = useState([]);
  const [currentData, setCurrentData] = useState([]);

  useEffect(() => {
    if (!selectedMachine) return;
    let mounted = true;

    const fetchDashboardData = async () => {
      try {
        const [k, a, insights, machines, history] = await Promise.all([
          api.getKPIs(selectedMachine).catch(() => null),
          api.getActiveAlerts().catch(() => []),
          api.getInsights(selectedMachine, "1h").catch(() => []),
          api.getMachines().catch(() => []),
          api.getHistory(selectedMachine, timeRange).catch(() => []),
        ]);

        if (!mounted) return;

        const machine =
          machines.find((item) => item._id === selectedMachine) || null;
        const latestSensor =
          k ||
          (Array.isArray(history) && history.length > 0
            ? history[history.length - 1]
            : null);
        const thresholds = machine?.thresholds || {};
        const currentSensorStatuses = {
          temperature: formatMetricStatus(
            latestSensor?.temperature,
            thresholds.temperature,
          ),
          vibration: formatMetricStatus(
            latestSensor?.vibration,
            thresholds.vibration,
          ),
          current: formatMetricStatus(
            latestSensor?.current,
            thresholds.current,
          ),
        };

        setKPIs({
          temperature: latestSensor?.temperature ?? null,
          vibration: latestSensor?.vibration ?? null,
          current: latestSensor?.current ?? null,
        });
        let calculatedStatus = "Stopped";

        if (latestSensor?.timestamp) {
          const ageMs = Date.now() - new Date(latestSensor.timestamp).getTime();

          // If latest sensor data is less than 30 seconds old
          if (ageMs < 30000) {
            calculatedStatus = "Running";
          }
        }

        setMachineStatus(calculatedStatus);
        setSensorStatuses(currentSensorStatuses);
        setAlerts(Array.isArray(a) ? a : []);
        setRiskLevel(
          deriveRiskLevel({
            alerts: a,
            insights,
            sensorStatuses: currentSensorStatuses,
          }),
        );

        const historySeries = Array.isArray(history) ? history : [];
        const mapSeries = (key) =>
          historySeries
            .filter((point) => Number.isFinite(Number(point?.[key])))
            .map((point) => ({
              time: formatTimeLabel(point.timestamp),
              value: Number(point[key]),
            }));

        setTemperatureData(mapSeries("temperature"));
        setVibrationData(mapSeries("vibration"));
        setCurrentData(mapSeries("current"));
      } catch (err) {
        if (!mounted) return;
        setKPIs({ temperature: null, vibration: null, current: null });
        setAlerts([]);
        setRiskLevel("Low");
        setTemperatureData([]);
        setVibrationData([]);
        setCurrentData([]);
      }
    };

    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 5000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [selectedMachine, timeRange]);

  const getSeverityColor = (severity) => {
    const s = String(severity || "").toLowerCase();
    if (s === "high" || s === "critical")
      return "bg-red-100 border-red-400 text-red-800";
    if (s === "medium" || s === "warning")
      return "bg-yellow-100 border-yellow-400 text-yellow-800";
    return "bg-blue-100 border-blue-400 text-blue-800";
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case "High":
        return "bg-red-100 dark:bg-red-900/30 border-red-400 text-red-800 dark:text-red-300";
      case "Medium":
        return "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-400 text-yellow-800 dark:text-yellow-300";
      default:
        return "bg-green-100 dark:bg-green-900/30 border-green-400 text-green-800 dark:text-green-300";
    }
  };

  return (
    <div className="space-y-6">
      <DashboardHeader
        selectedMachine={selectedMachine}
        onMachineChange={setSelectedMachine}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
      />

      <KPICardsGrid
        kpis={kpis}
        machineStatus={machineStatus}
        sensorStatuses={sensorStatuses}
      />

      <ChartsSection
        temperatureData={temperatureData}
        vibrationData={vibrationData}
        currentData={currentData}
      />

      <RiskAndAlertsSection
        riskLevel={riskLevel}
        alerts={alerts}
        getRiskColor={getRiskColor}
        getSeverityColor={getSeverityColor}
      />

      <MaintenanceInsights machineId={selectedMachine} />
    </div>
  );
};

export default Dashboard;
