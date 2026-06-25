# SmartAI Factory – Industrial Machine Monitoring System

A modern web application for monitoring industrial machines with AI predictions, alerts, analytics, and admin-controlled device activation.

## Features

- **Login**: JWT-based auth against the Smart-AI-Backend
- **Dashboard**: Real-time KPIs, charts, AI predictions, and alerts
- **Analytics**: Historical trends and peak usage patterns
- **Machine Control**: Control panel for machine operations
- **Alerts**: Comprehensive alert history with filtering and bulk resolve
- **Settings**: Profile and password management
- **Admin – Machine Management (UC‑3)**:
	- Auto-registration of devices with `status = PENDING`
	- Admin configures name, location, and thresholds (temperature, vibration, current)
	- Activation logs an audit event and changes status to `RUNNING`
	- Pending machines are hidden from dashboards, predictions, and alerts

## Tech Stack

- React.js (Vite)
- Tailwind CSS
- Recharts for data visualization
- React Router for navigation

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application starts on `http://localhost:5173`.

Backend runs separately at `http://localhost:4000`.

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Usage

1. Start the backend (see Backend Quickstart below) and note the admin credentials.
2. Start the frontend and login.
3. Use the sidebar to navigate between Dashboard, Analytics, AI Predictions, Alerts, and Machine Control.
4. For Admins, go to “Machine Mgmt” to activate pending machines.
5. Once activated, machines appear across dashboard KPIs, analytics, AI predictions, and insights.

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── utils/         # Utility functions and mock data
├── App.jsx        # Main app component with routing
└── main.jsx       # Entry point

## Backend Quickstart (Smart-AI-Backend)

Run the API locally using Node.js and MongoDB. In another terminal:

```bash
cd ../Smart-AI-Backend
npm install

# Recommended demo env
$env:DEMO = 'true'           # auto-auth as ADMIN for local testing
$env:PORT = '4000'
$env:DATA_INTERVAL_SECONDS = '2'
npm start
```

Notes:
- On first run, a default admin user is created using `ADMIN_EMAIL` and `ADMIN_PWD` (defaults: `admin@smartai.local` / `adminpass`).
- Data generator seeds one running demo machine and occasionally registers new PENDING machines.
- PENDING machines store sensor data but are ignored by alerts, predictions, and insights until activated.

## UC‑3: Activate & Configure Machine

- Devices auto-register with `status = PENDING`, `thresholds = undefined`, and are hidden from dashboards.
- Admins open “Machine Mgmt” → select a pending device → set name, location, and thresholds → Activate.
- Server validates thresholds against safe limits and records an activation audit event.
- After activation, the machine becomes visible across KPIs, analytics, predictions, and insights.
```

## Note

This project includes a demo backend (`Smart-AI-Backend`) with simulated data, simple auth, and placeholder forecasting. Replace the generator and forecasting with real hardware ingestion and ML models without changing frontend APIs.
