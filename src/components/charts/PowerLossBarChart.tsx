import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { Zap, TrendingDown, Clock } from 'lucide-react';

interface PowerLossBarChartProps {
  sicLoss: number | null;
  siLoss: number | null;
  className?: string;
}

export const PowerLossBarChart: React.FC<PowerLossBarChartProps> = ({
  sicLoss,
  siLoss,
  className = '',
}) => {
  const { config, theme } = useApp();
  const isDark = theme === 'dark';
  const hasSiLoss = siLoss !== null && siLoss !== undefined;
  const reductionW = (sicLoss !== null && hasSiLoss) ? Number((siLoss - sicLoss).toFixed(2)) : null;
  const reductionPercent = (sicLoss !== null && hasSiLoss && siLoss > 0)
    ? Number((((siLoss - sicLoss) / siLoss) * 100).toFixed(1))
    : null;

  const data = [
    {
      name: 'SiC MOSFET',
      type: `MATLAB Simulation (ThingSpeak ${config.sicChannelId || '3484560'})`,
      loss: sicLoss ?? 0,
      displayVal: sicLoss !== null ? `${Number(sicLoss).toFixed(2)} W` : 'No Data',
      color: '#059669', // Emerald
    },
    {
      name: 'Si MOSFET',
      type: hasSiLoss ? `Hardware Testbench (ThingSpeak ${config.siChannelId || '3482521'})` : 'Awaiting Hardware Data',
      loss: hasSiLoss ? siLoss : 0,
      displayVal: hasSiLoss ? `${Number(siLoss).toFixed(2)} W` : 'Awaiting Hardware',
      color: hasSiLoss ? '#d97706' : '#94a3b8', // Amber when active, slate when awaiting
    },
  ];

  return (
    <div className={`rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-xs dark:shadow-sm flex flex-col justify-between ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Power Loss Comparison</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            SiC Simulation (ThingSpeak Channel {config.sicChannelId || '3484560'}) vs Si Hardware Telemetry
          </p>
        </div>

        {reductionW !== null ? (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-mono">
            <TrendingDown className="w-3 h-3" />
            <span>-{reductionW} W ({reductionPercent}%)</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 text-[11px] font-mono">
            <Clock className="w-3 h-3 text-slate-400 dark:text-slate-400" />
            <span>Awaiting Hardware</span>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#e2e8f0'} vertical={false} />
            <XAxis
              dataKey="name"
              stroke={isDark ? '#64748b' : '#94a3b8'}
              tickLine={false}
              axisLine={{ stroke: isDark ? '#334155' : '#cbd5e1' }}
              tick={{ fill: isDark ? '#cbd5e1' : '#475569', fontSize: 11, fontWeight: 500 }}
            />
            <YAxis
              stroke={isDark ? '#64748b' : '#94a3b8'}
              tickLine={false}
              axisLine={{ stroke: isDark ? '#334155' : '#cbd5e1' }}
              tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11, fontFamily: 'monospace' }}
              unit=" W"
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 p-2.5 shadow-xl text-xs font-mono text-slate-900 dark:text-slate-200">
                      <div className="font-semibold">{d.name}</div>
                      <div className="text-slate-500 dark:text-slate-400 text-[10px] mb-1">{d.type}</div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-600 dark:text-slate-300">Power Loss:</span>
                        <span className="font-bold text-slate-900 dark:text-white">{d.displayVal}</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="loss" radius={[6, 6, 0, 0]} maxBarSize={60}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
              <LabelList
                dataKey="displayVal"
                position="top"
                fill={isDark ? '#f8fafc' : '#0f172a'}
                fontSize={11}
                fontFamily="monospace"
                fontWeight={500}
                offset={6}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Legend */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2.5 border-t border-slate-200 dark:border-slate-800 mt-1.5 text-[11px]">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400 inline-block" />
          <span>SiC: <strong className="text-slate-800 dark:text-slate-200 font-mono">{sicLoss !== null ? `${sicLoss} W` : 'No Data'}</strong> (Simulation {config.sicChannelId || '3484560'})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${hasSiLoss ? 'bg-amber-600 dark:bg-amber-400' : 'bg-slate-400 dark:bg-slate-500'} inline-block`} />
          <span>Si: <strong className="text-slate-700 dark:text-slate-400 font-mono">{hasSiLoss ? `${siLoss} W` : 'Awaiting Hardware'}</strong></span>
        </div>
      </div>
    </div>
  );
};
