# Frontend Data Flow

This document describes what the React frontend currently fetches, where it sends data, and which screens depend on which backend endpoints.

## Current Behavior

The frontend does not receive pushed updates from the backend. It uses REST calls through [src/utils/api.js](src/utils/api.js) and refreshes most screens by polling every few seconds.

There is no WebSocket or Server-Sent Events channel in the frontend code today.

## Shared API Layer

The main API wrapper is [src/utils/api.js](src/utils/api.js). It uses:

- `VITE_API_BASE` if set
- otherwise `http://localhost:4000`

It also reads the JWT from `localStorage.token` and sends it as `Authorization: Bearer <token>` when available.

## What The Frontend Fetches

### Authentication

- `POST /api/auth/login` from the login screen
- `GET /api/auth/me` to load the current user profile and role
- `PUT /api/auth/me` to update profile fields and notification settings
- `PUT /api/auth/me/password` to change password

### Dashboard

The dashboard screen polls these endpoints:

- `GET /api/kpis/:machineId` for latest temperature, vibration, current, and timestamp
- `GET /api/alerts/active?sinceDays=3` for active alerts
- `GET /api/insights/:machineId?horizon=1h` for maintenance insights
- `GET /api/machines` to read the selected machine status
- `GET /api/history/:machineId?range=...` to build the charts

Polling behavior:

- KPIs, alerts, and insights are refreshed every 5 seconds
- historical chart data is refreshed when machine or time range changes

### AI Predictions

The AI Predictions page loads:

- `GET /api/history/:machineId?range=1h`
- `GET /api/predictions/:machineId?horizon=15m`
- `GET /api/predictions/:machineId?horizon=1h`
- `GET /api/predictions/:machineId?horizon=6h`
- `GET /api/predictions/:machineId?horizon=24h`
- `GET /api/insights/:machineId?horizon=...`

It also calls `GET /api/auth/me` to check the user role before showing the page.

### Alerts Screen

The alerts page uses:

- `GET /api/alerts?page=...&limit=...&severity=...&machineId=...&startDate=...&endDate=...`
- `GET /api/machines` to preload machine filters
- `POST /api/alerts/resolve` to bulk mark alerts as resolved
- `PATCH /api/alerts/:id/resolve` through the API wrapper for single-alert resolve

### Machine Control

The control page polls:

- `GET /api/machines`
- `GET /api/kpis/:machineId`
- `GET /api/commands/pending/:machineId`

It sends commands with:

- `POST /api/commands`

### Machine Management

The admin machine page fetches:

- `GET /api/auth/me`
- `GET /api/machines/pending`
- `GET /api/machines`

It sends:

- `POST /api/machines/:id/activate`

There is also a direct settings call that updates thresholds with:

- `PUT /api/machines/:id/thresholds`

### Analytics

Analytics uses:

- `GET /api/history/:machineId?range=168h`
- `GET /api/peak-hours/:machineId`
- `GET /api/machines`
- `GET /api/auth/me`

### Admin Users

Admin users screen uses:

- `GET /api/auth/me`
- `GET /api/users`
- `POST /api/users`
- `PUT /api/users/:id/role`

## What The Frontend Sends

The frontend mainly sends JSON for actions, not for live telemetry.

### JSON Post/Put Calls

- Login credentials: `{ email, password, role? }`
- Update profile: `{ name, email, notifications }`
- Change password: `{ currentPassword, newPassword }`
- Create command: `{ machineId, commandType, payload }`
- Activate machine: `{ machineName, location, thresholds }`
- Create user: `{ name, email, password, role }`
- Update user role: `{ role }`

### Important Note

The frontend does not submit demo data. Demo data is generated inside the backend when `DEMO=true`.

## Screen To Endpoint Map

| Screen | Main Data It Shows | Main Calls |
| --- | --- | --- |
| Login | token and user role | `POST /api/auth/login` |
| Dashboard | latest KPIs, charts, alerts, insights | `GET /api/kpis/:machineId`, `GET /api/history/:machineId`, `GET /api/alerts/active`, `GET /api/insights/:machineId` |
| AI Predictions | prediction series, confidence, insights | `GET /api/predictions/:machineId`, `GET /api/history/:machineId`, `GET /api/insights/:machineId` |
| Alerts | paginated alerts | `GET /api/alerts`, `POST /api/alerts/resolve`, `PATCH /api/alerts/:id/resolve` |
| Machine Control | KPIs and pending commands | `GET /api/kpis/:machineId`, `GET /api/commands/pending/:machineId`, `POST /api/commands` |
| Machine Management | pending machines and live machines | `GET /api/machines/pending`, `GET /api/machines`, `POST /api/machines/:id/activate` |
| Analytics | history and peak usage | `GET /api/history/:machineId`, `GET /api/peak-hours/:machineId` |
| Admin Users | user list and role management | `GET /api/users`, `POST /api/users`, `PUT /api/users/:id/role` |

## Practical Interpretation

If you want the frontend to show real machine values, the backend must keep saving real readings into `SensorData`, `Prediction`, and `Alert`, and the frontend will then read them from the endpoints above.

Right now the frontend is mostly a consumer of backend JSON. The real-time behavior is simulated by polling, not by push events.