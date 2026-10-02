import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { BatteryCharging, AlertCircle } from 'lucide-react';
import { HardwareReading } from '../../types';
import { useApp } from '../../context/AppContext';

interface BatteryUtilizationChartProps {
  data: HardwareReading[];
  currentBattery: number | null;
  className?: string;
}

export const BatteryUtilizationChart: React.FC<BatteryUtilizationChartProps> = ({
  data,
  currentBattery,
  className = '',
}) => {
  const { theme } = useApp();
  const isDark = theme === 'dark';

  // Format data for chart
  const chartData = data
    .filter(item => item.batteryUtilization !== null)
    .map(item => {
      const date = new Date(item.timestamp);
      const timeStr = isNaN(date.getTime())
        ? 'N/A'
        : `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;

      return {
        timestamp: item.timestamp,
        time: timeStr,
        battery: item.batteryUtilization,
      };
    });

  const batteries = chartData.map(d => d.battery as number);
  const minBat = batteries.length > 0 ? Math.min(...batteries) : 0;
  const maxBat = batteries.length > 0 ? Math.max(...batteries) : 0;

  return (
    <div className={`rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-xs dark:shadow-sm flex flex-col justify-between ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
              <BatteryCharging className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Live Battery Utilization</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time battery discharge curve and capacity telemetry from ThingSpeak
          </p>
        </div>

        <div className="text-right">
          <div className="text-xl font-bold font-mono-num text-emerald-700 dark:text-emerald-400">
            {currentBattery !== null ? `${Math.round(Number(currentBattery))}%` : 'No Data'}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Current Level</span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-56 w-full">
        {chartData.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-sm gap-2">
            <AlertCircle className="w-6 h-6 text-slate-400 dark:text-slate-600" />
            <span>No historical battery telemetry available.</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="batteryGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#e2e8f0'} vertical={false} />
              <XAxis
                dataKey="time"
                stroke={isDark ? '#64748b' : '#94a3b8'}
                tickLine={false}
                axisLine={{ stroke: isDark ? '#334155' : '#cbd5e1' }}
                tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11, fontFamily: 'monospace' }}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke={isDark ? '#64748b' : '#94a3b8'}
                tickLine={false}
                axisLine={{ stroke: isDark ? '#334155' : '#cbd5e1' }}
                domain={[0, 100]}
                tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11, fontFamily: 'monospace' }}
                unit="%"
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 shadow-xl text-xs font-mono text-slate-900 dark:text-slate-200">
                        <div className="text-slate-500 dark:text-slate-400 text-[11px] mb-1">
                          {new Date(d.timestamp).toLocaleString()}
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-slate-600 dark:text-slate-300">Battery Level:</span>
                          <span className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">{d.battery}%</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="battery"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#batteryGradient)"
                dot={false}
                activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2, fill: '#10b981' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Footer Battery Status Indicator */}
      <div className="flex items-center justify-between pt-2.5 border-t border-slate-200 dark:border-slate-800 mt-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 dark:text-slate-400">Range:</span>
          <span className="font-mono text-slate-800 dark:text-slate-200 font-medium">{minBat}% – {maxBat}%</span>
        </div>
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Status: Normal Drain</span>
        </div>
      </div>
    </div>
  );
};
