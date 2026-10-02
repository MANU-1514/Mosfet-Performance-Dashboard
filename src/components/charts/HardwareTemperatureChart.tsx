import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Thermometer, Radio, Clock } from 'lucide-react';
import { HardwareReading } from '../../types';
import { useApp } from '../../context/AppContext';

interface HardwareTemperatureChartProps {
  data: HardwareReading[];
  currentTemperature: number | null;
  className?: string;
}

export const HardwareTemperatureChart: React.FC<HardwareTemperatureChartProps> = ({
  data,
  currentTemperature,
  className = '',
}) => {
  const { theme } = useApp();
  const isDark = theme === 'dark';

  const chartData = data
    .filter(item => item.temperature !== null)
    .map(item => {
      const date = new Date(item.timestamp);
      const timeStr = isNaN(date.getTime())
        ? 'N/A'
        : `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
      
      return {
        timestamp: item.timestamp,
        time: timeStr,
        temperature: item.temperature,
      };
    });

  return (
    <div className={`rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-xs dark:shadow-sm flex flex-col justify-between ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-1.5">
            <Thermometer className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Si Hardware Junction Temperature</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time thermal monitoring for physical Silicon (Si) MOSFET testbench
          </p>
        </div>

        <div className="text-right">
          <div className="text-base font-bold font-mono-num text-rose-600 dark:text-rose-400">
            {currentTemperature !== null ? `${currentTemperature} °C` : '-- °C'}
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
            {currentTemperature !== null ? 'Live Sensor' : 'Awaiting Hardware'}
          </span>
        </div>
      </div>

      {/* Chart Canvas or Placeholder */}
      <div className="h-56 w-full flex items-center justify-center">
        {chartData.length === 0 ? (
          <div className="text-center p-4 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 w-full flex flex-col items-center justify-center space-y-1.5">
            <Clock className="w-5 h-5 text-slate-400 dark:text-slate-500" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Awaiting Si Hardware Sensor Telemetry</span>
            <p className="text-[11px] text-slate-500 max-w-xs leading-normal">
              When your physical Silicon MOSFET hardware testbench is connected to ThingSpeak, live junction temperature curves will render here automatically.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#e2e8f0'} vertical={false} />
              <XAxis
                dataKey="time"
                stroke={isDark ? '#64748b' : '#94a3b8'}
                tickLine={false}
                axisLine={{ stroke: isDark ? '#334155' : '#cbd5e1' }}
                tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 10, fontFamily: 'monospace' }}
              />
              <YAxis
                stroke={isDark ? '#64748b' : '#94a3b8'}
                tickLine={false}
                axisLine={{ stroke: isDark ? '#334155' : '#cbd5e1' }}
                domain={['auto', 'auto']}
                tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 10, fontFamily: 'monospace' }}
                unit="°C"
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 p-2.5 shadow-xl text-xs font-mono text-slate-900 dark:text-slate-200">
                        <div className="text-slate-500 dark:text-slate-400 text-[10px] mb-1">
                          {new Date(d.timestamp).toLocaleString()}
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-slate-600 dark:text-slate-300">Temperature:</span>
                          <span className="font-bold text-rose-600 dark:text-rose-400">{d.temperature} °C</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine y={75} stroke="#e11d48" strokeDasharray="4 4" label={{ value: '75°C Warning', fill: '#fb7185', fontSize: 9 }} />
              <Area
                type="monotone"
                dataKey="temperature"
                stroke="#f43f5e"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#tempGradient)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Footer Status */}
      <div className="pt-2.5 border-t border-slate-200 dark:border-slate-800 mt-1.5 flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <span>Thermal Safety Limit: 75 °C (Si Tj_max: 150°C)</span>
        <span>{currentTemperature !== null ? 'Hardware Stream Active' : 'Channel Pending'}</span>
      </div>
    </div>
  );
};
