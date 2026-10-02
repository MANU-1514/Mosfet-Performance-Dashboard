import React from 'react';
import { ComparisonMetrics } from '../../types';
import { useApp } from '../../context/AppContext';
import { CheckCircle, Zap, Gauge, Clock, ShieldCheck } from 'lucide-react';

interface ComparisonInsightsProps {
  metrics: ComparisonMetrics;
  className?: string;
}

export const ComparisonInsights: React.FC<ComparisonInsightsProps> = ({
  metrics,
  className = '',
}) => {
  const { config } = useApp();
  const {
    sicPowerLoss,
    siPowerLoss,
    powerLossDifference,
    powerLossReductionPercent,
    sicEfficiency,
    siEfficiency,
    efficiencyDifference,
    hasSiHardwareData,
  } = metrics;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Power Loss Summary */}
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-xs dark:shadow-sm">
          <div className="flex items-center gap-2 mb-1.5 text-amber-700 dark:text-amber-400 font-semibold text-xs uppercase tracking-wider font-mono">
            <Zap className="w-3.5 h-3.5" />
            <span>SiC Simulation Loss Telemetry</span>
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white font-mono-num mb-1">
            {sicPowerLoss !== null ? (
              <span>SiC Power Loss: <span className="text-amber-700 dark:text-amber-300 font-bold">{Number(sicPowerLoss).toFixed(2)} W</span></span>
            ) : (
              <span>SiC Loss: <span className="text-slate-400">Loading...</span></span>
            )}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-mono">
            {hasSiHardwareData
              ? `ΔP = (Si: ${Number(siPowerLoss).toFixed(2)}W - SiC: ${Number(sicPowerLoss).toFixed(2)}W) → Reduced by ${powerLossReductionPercent}%.`
              : `Active MATLAB simulation stream from ThingSpeak Channel ${config.sicChannelId || '3484560'} (Field ${config.sicFieldMapping?.powerLossField ?? 3}).`}
          </p>
        </div>

        {/* Efficiency Summary */}
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-xs dark:shadow-sm">
          <div className="flex items-center gap-2 mb-1.5 text-emerald-700 dark:text-emerald-400 font-semibold text-xs uppercase tracking-wider font-mono">
            <Gauge className="w-3.5 h-3.5" />
            <span>SiC Simulation Efficiency</span>
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white font-mono-num mb-1">
            {sicEfficiency !== null ? (
              <span>SiC Efficiency: <span className="text-emerald-700 dark:text-emerald-300 font-bold">{Number(sicEfficiency).toFixed(1)} %</span></span>
            ) : (
              <span>SiC Efficiency: <span className="text-slate-400">Loading...</span></span>
            )}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-mono">
            {hasSiHardwareData
              ? `η_SiC: ${Number(sicEfficiency).toFixed(1)}% vs η_Si: ${Number(siEfficiency).toFixed(1)}% (Delta: +${efficiencyDifference}%).`
              : `Active MATLAB simulation stream from ThingSpeak Channel ${config.sicChannelId || '3484560'} (Field ${config.sicFieldMapping?.efficiencyField ?? 4}).`}
          </p>
        </div>
      </div>

      {/* Structured Comparative Findings */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs dark:shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Device Architecture & Telemetry Status</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* SiC MOSFET Findings */}
          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-slate-800">
              <span className="font-semibold text-emerald-800 dark:text-emerald-300 text-xs">SiC MOSFET (Simulation Telemetry)</span>
              <span className="text-[10px] font-mono bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 px-1.5 py-0.2 rounded">Channel {config.sicChannelId || '3484560'} Live</span>
            </div>
            
            <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>MATLAB Simulation Connected:</strong> Streamed from ThingSpeak Channel {config.sicChannelId || '3484560'}.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Reported Power Loss:</strong> <span className="text-slate-900 dark:text-white font-mono">{sicPowerLoss !== null ? `${sicPowerLoss} W` : '--'}</span> dissipation recorded.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Reported Efficiency:</strong> <span className="text-emerald-700 dark:text-emerald-400 font-mono font-bold">{sicEfficiency !== null ? `${sicEfficiency} %` : '--'}</span> conversion ratio.
                </span>
              </li>
            </ul>
          </div>

          {/* Si MOSFET Status */}
          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-slate-800">
              <span className="font-semibold text-slate-800 dark:text-slate-300 text-xs">Si MOSFET (Hardware Testbench)</span>
              <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-700 px-1.5 py-0.2 rounded">
                {hasSiHardwareData ? 'Hardware Connected' : 'Awaiting Connection'}
              </span>
            </div>

            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Hardware Data Slot:</strong> Prepared and primed to ingest physical testbench measurements.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Automatic Evaluation:</strong> Once your Si hardware channel is connected in settings, comparative metrics, loss delta, and temperature curves will compute automatically.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
