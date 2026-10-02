import React from 'react';
import { LucideIcon } from 'lucide-react';
import { MetricDeltaBadge } from './MetricDeltaBadge';

interface KPICardProps {
  title: string;
  category: 'SiC MOSFET' | 'Si MOSFET' | 'Comparison' | 'MATLAB Model' | 'ThingSpeak Feed';
  sourceType: 'MATLAB DATA' | 'THINGSPEAK FEED' | 'CALCULATED BENCHMARK' | 'SIMULATION DATA' | 'HARDWARE DATA';
  value: number | string | null;
  unit: string;
  icon: LucideIcon;
  subtext?: string;
  deltaValue?: number;
  deltaUnit?: string;
  isPositiveGood?: boolean;
  accentColor?: 'cyan' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'purple' | 'slate' | 'sky';
  statusTag?: string;
  isLive?: boolean;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  category,
  sourceType,
  value,
  unit,
  icon: Icon,
  subtext,
  deltaValue,
  deltaUnit,
  isPositiveGood = true,
  accentColor = 'slate',
  statusTag,
  isLive = false,
}) => {
  const iconColorClass = {
    emerald: 'text-emerald-700 dark:text-emerald-400',
    amber: 'text-amber-700 dark:text-amber-400',
    rose: 'text-rose-700 dark:text-rose-400',
    purple: 'text-purple-700 dark:text-purple-400',
    indigo: 'text-indigo-700 dark:text-indigo-400',
    cyan: 'text-emerald-700 dark:text-emerald-400',
    sky: 'text-emerald-700 dark:text-emerald-400',
    slate: 'text-slate-700 dark:text-slate-300',
  }[accentColor] || 'text-emerald-700 dark:text-emerald-400';

  const iconBgClass = {
    emerald: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/50',
    amber: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/50',
    rose: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/50',
    purple: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/50',
    indigo: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/50',
    cyan: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/50',
    sky: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/50',
    slate: 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80',
  }[accentColor] || 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80';

  return (
    <div className="rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-4 shadow-xs dark:shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              {category}
            </span>
            <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400">
              {sourceType}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200">{title}</h3>
        </div>

        <div className={`p-2 rounded-lg border flex items-center justify-center relative ${iconBgClass}`}>
          <Icon className={`w-4 h-4 ${iconColorClass}`} />
          {isLive && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full animate-live-dot" />
          )}
        </div>
      </div>

      {/* Primary Value Display */}
      <div className="flex items-baseline gap-1.5 my-1.5">
        {value === null || value === undefined ? (
          <span className="text-xl font-bold text-slate-400 dark:text-slate-500 font-mono-num">No Data</span>
        ) : (
          <>
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono-num">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 font-mono">{unit}</span>
          </>
        )}
      </div>

      {/* Footer Info / Subtext / Status Tag */}
      <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
        <div className="text-slate-500 dark:text-slate-400 truncate max-w-[65%]">
          {subtext && <span>{subtext}</span>}
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {statusTag && (
            <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[10px] border border-slate-200 dark:border-slate-700">
              {statusTag}
            </span>
          )}
          {deltaValue !== undefined && deltaValue !== null && (
            <MetricDeltaBadge
              value={deltaValue}
              unit={deltaUnit || unit}
              isPositiveGood={isPositiveGood}
            />
          )}
        </div>
      </div>
    </div>
  );
};
