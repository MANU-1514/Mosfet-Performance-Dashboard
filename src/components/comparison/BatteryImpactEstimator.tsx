import React, { useState } from 'react';
import { BatteryCharging, Zap, ArrowRight } from 'lucide-react';

interface BatteryImpactEstimatorProps {
  sicEfficiency: number;
  siEfficiency: number;
  className?: string;
}

export const BatteryImpactEstimator: React.FC<BatteryImpactEstimatorProps> = ({
  sicEfficiency,
  siEfficiency,
  className = '',
}) => {
  const [batteryCapacityWh, setBatteryCapacityWh] = useState<number>(1000); // 1 kWh battery
  const [loadPowerW, setLoadPowerW] = useState<number>(250); // 250W continuous load

  // Efficiency factors
  const effSi = Math.max(0.1, (siEfficiency > 100 ? 88 : siEfficiency) / 100);
  const effSiC = Math.max(0.1, (sicEfficiency > 100 ? 97.4 : sicEfficiency) / 100);

  // Power drawn from battery = P_load / efficiency
  const pBatterySi = loadPowerW / effSi;
  const pBatterySiC = loadPowerW / effSiC;

  // Runtime in hours = Battery Capacity / P_battery
  const runtimeHoursSi = Number((batteryCapacityWh / pBatterySi).toFixed(2));
  const runtimeHoursSiC = Number((batteryCapacityWh / pBatterySiC).toFixed(2));
  const addedMinutes = Number(((runtimeHoursSiC - runtimeHoursSi) * 60).toFixed(0));
  const percentGain = runtimeHoursSi > 0
    ? Number((((runtimeHoursSiC - runtimeHoursSi) / runtimeHoursSi) * 100).toFixed(1))
    : 0;

  return (
    <div className={`rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs dark:shadow-sm ${className}`}>
      <div className="flex items-center gap-2 mb-1">
        <BatteryCharging className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Battery Runtime & Energy Extension Estimator
        </h3>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
        Projected runtime improvement on battery pack systems due to SiC conversion efficiency.
      </p>

      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
            Battery Pack Capacity (Watt-hours)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="100"
              max="50000"
              step="50"
              value={batteryCapacityWh}
              onChange={e => setBatteryCapacityWh(Math.max(10, Number(e.target.value)))}
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md px-3 py-1.5 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 dark:focus:border-slate-500"
            />
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">Wh</span>
          </div>
          <div className="flex gap-1.5 mt-1.5">
            {[500, 1000, 2400, 5000].map(val => (
              <button
                key={val}
                onClick={() => setBatteryCapacityWh(val)}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors"
              >
                {val}Wh
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
            Continuous Load Demand (Watts)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="10"
              max="10000"
              step="10"
              value={loadPowerW}
              onChange={e => setLoadPowerW(Math.max(1, Number(e.target.value)))}
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md px-3 py-1.5 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 dark:focus:border-slate-500"
            />
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">W</span>
          </div>
          <div className="flex gap-1.5 mt-1.5">
            {[100, 250, 500, 1000].map(val => (
              <button
                key={val}
                onClick={() => setLoadPowerW(val)}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors"
              >
                {val}W
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Runtime Results Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 items-center">
        <div className="p-2.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">Si MOSFET Runtime</div>
          <div className="text-xl font-bold font-mono text-amber-700 dark:text-amber-400">
            {runtimeHoursSi} hrs
          </div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
            Draws {pBatterySi.toFixed(1)}W from pack
          </div>
        </div>

        <div className="flex flex-col items-center justify-center text-center">
          <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-0.5 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" />
            <span>+{addedMinutes} min extra runtime</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-mono">
            <span>+{percentGain}% gain</span>
            <ArrowRight className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>

        <div className="p-2.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-[11px] text-emerald-700 dark:text-emerald-400 mb-0.5 font-medium">SiC MOSFET Runtime</div>
          <div className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-300">
            {runtimeHoursSiC} hrs
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
            Draws only {pBatterySiC.toFixed(1)}W from pack
          </div>
        </div>
      </div>
    </div>
  );
};
