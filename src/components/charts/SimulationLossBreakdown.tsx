import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { SimulationParameters } from '../../types';

interface SimulationLossBreakdownProps {
  params: SimulationParameters;
  className?: string;
}

export const SimulationLossBreakdown: React.FC<SimulationLossBreakdownProps> = ({
  params,
  className = '',
}) => {
  const condLoss = params.conductionLoss;
  const swLoss = params.switchingLoss;
  const total = params.totalPowerLoss;

  const condPercent = total > 0 ? ((condLoss / total) * 100).toFixed(1) : '0';
  const swPercent = total > 0 ? ((swLoss / total) * 100).toFixed(1) : '0';

  const data = [
    { name: 'Conduction Loss (P_cond)', value: condLoss, color: '#f59e0b' },
    { name: 'Switching Loss (P_sw)', value: swLoss, color: '#a855f7' },
  ];

  return (
    <div className={`rounded-xl bg-white dark:bg-slate-900/80 p-5 border border-slate-200 dark:border-slate-800 shadow-xs dark:shadow-lg ${className}`}>
      <div className="mb-3">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Loss Breakdown Analysis</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Distribution between conduction overhead (I²R) and dynamic gate switching losses
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4">
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={65}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0];
                    return (
                      <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2.5 shadow-xl text-xs font-mono">
                        <span className="text-slate-600 dark:text-slate-300 block">{d.name}</span>
                        <span className="font-bold text-slate-900 dark:text-white text-sm">{d.value} W</span>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
            <div className="flex items-center justify-between mb-1">
              <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                Conduction Loss
              </span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{condLoss} W</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              {condPercent}% of total dissipation
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
            <div className="flex items-center justify-between mb-1">
              <span className="flex items-center gap-1.5 text-purple-700 dark:text-purple-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                Switching Loss
              </span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{swLoss} W</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              {swPercent}% of total dissipation
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
