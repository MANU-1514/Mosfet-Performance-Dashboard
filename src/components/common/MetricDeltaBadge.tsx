import React from 'react';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';

interface MetricDeltaBadgeProps {
  value: number | string;
  unit?: string;
  isPositiveGood?: boolean; // e.g. for efficiency, up is good. For power loss, down is good!
  comparisonType?: 'reduction' | 'increase' | 'delta';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const MetricDeltaBadge: React.FC<MetricDeltaBadgeProps> = ({
  value,
  unit = '',
  isPositiveGood = true,
  className = '',
}) => {
  const num = typeof value === 'number' ? value : parseFloat(value);

  if (isNaN(num) || num === 0) {
    return (
      <span className={`inline-flex items-center gap-1 text-xs font-medium text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700 ${className}`}>
        <Minus className="w-3 h-3" />
        <span>0 {unit}</span>
      </span>
    );
  }

  const isPositive = num > 0;
  const isGood = isPositive ? isPositiveGood : !isPositiveGood;

  const colorClasses = isGood
    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
    : 'text-rose-400 bg-rose-500/10 border-rose-500/30';

  const sign = isPositive ? '+' : '';

  return (
    <span className={`inline-flex items-center gap-1 font-mono-num font-semibold text-xs px-2 py-0.5 rounded-md border ${colorClasses} ${className}`}>
      {isPositive ? (
        <ArrowUpRight className="w-3.5 h-3.5" />
      ) : (
        <ArrowDownRight className="w-3.5 h-3.5" />
      )}
      <span>{sign}{num}{unit}</span>
    </span>
  );
};
