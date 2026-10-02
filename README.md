# Performance Comparison of Simulated SiC MOSFET and Hardware Si MOSFET

A modern, professional engineering web application comparing the electrical and thermal performance of simulated Silicon Carbide (SiC) MOSFETs against real-world hardware Silicon (Si) MOSFET telemetry streamed from **ThingSpeak**.

---

## Quick Start

### 1. Installation
Navigate to the project directory and install dependencies:
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 3. Build for Production
```bash
npm run build
```

---

## ThingSpeak Configuration Guide

### Option A: Via Environment Variables (`.env`)
Create or edit the `.env` file in the project root:

```env
# 1. Enter your ThingSpeak Channel ID (Required)
VITE_THINGSPEAK_CHANNEL_ID=YOUR_CHANNEL_ID

# 2. Enter your ThingSpeak Read API Key (Optional if public channel)
VITE_THINGSPEAK_READ_API_KEY=YOUR_READ_API_KEY
```

### Option B: Via Interactive Dashboard UI
1. Click the **Channel Settings** gear icon in the top header or navigate to **ThingSpeak Data** > **Configure Channel & Fields**.
2. Enter your **Channel ID** and **Read API Key**.
3. Map the fields as desired:
   - **Field 1** → Power Loss ($W$)
   - **Field 2** → Efficiency ($\%$)
   - **Field 3** → Temperature ($^\circ\text{C}$)
   - **Field 4** → Battery Utilization ($\%$)
4. Click **Test Connection** to verify live telemetry reception.
5. Click **Apply & Save Configuration**.

---

## Features & Page Structure

1. **Dashboard**
   - Live KPI summary cards with trend badges and source labeling (`SIMULATION DATA` vs `HARDWARE DATA`).
   - 4 Primary comparison charts:
     - Chart 1: Power Loss Comparison (SiC vs Si Bar)
     - Chart 2: Efficiency Comparison (SiC vs Si Bar)
     - Chart 3: Hardware Temperature vs Time (Area chart with warning zones)
     - Chart 4: Battery Utilization vs Time (Area chart with discharge curve)

2. **SiC MOSFET Simulation**
   - Editable physical parameters: $V_{in}$, $V_{out}$, $I_{load}$, $f_{sw}$, Duty Cycle, $R_{ds(on)}$, Conduction Loss, Switching Loss.
   - Presets for EV DC-DC converter, Sync Buck, Solar MPPT boost, and Motor inverter.
   - Dynamic formulas:
     - $\text{Total Power Loss} = P_{cond} + P_{sw}$
     - $\text{Efficiency} = \frac{P_{out}}{P_{in}} \times 100\%$
   - Loss breakdown distribution and Efficiency vs Load Current sweep curve.
   - Local scenario persistence (Save/Load/Delete).

3. **Si MOSFET Hardware**
   - Prominent **LIVE HARDWARE DATA** status badge.
   - Telemetry monitoring for Power Loss, Efficiency, Temperature, and Battery Utilization.
   - Historical temperature and battery status monitoring.

4. **Performance Comparison**
   - Parameter matrix table with comparative delta calculation and "Better" badge indicators.
   - Dynamic mathematical evaluations:
     - $\text{Power Loss Reduction (\%)} = \left(\frac{P_{Si} - P_{SiC}}{P_{Si}}\right) \times 100\%$
     - $\text{Efficiency Improvement (\%)} = \text{Efficiency}_{SiC} - \text{Efficiency}_{Si}$
   - Data-driven statements with no hardcoded claims.
   - Interactive Battery Runtime Extension Calculator for portable/EV packs.

5. **ThingSpeak Data**
   - Real-time polling every 15 seconds (with pause/resume & interval selector).
   - Time-range historical filters: Last 1h, 6h, 12h, 24h, 7d.
   - Multi-metric historical chart with CSV telemetry export.
   - Raw JSON and tabular feed inspector.

6. **About Project**
   - Clear project objective, electrical topology methodology, evaluation parameters, and Supabase SQL schema.

---

## Database Schema (Optional Supabase Sync)
Copy and execute the SQL script in `src/services/supabase.ts` or view it directly inside the **About Project** page to enable persistent cloud logging for `simulation_results`, `hardware_results`, and `comparison_results`.
