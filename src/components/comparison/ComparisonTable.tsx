import React from 'react';
import { ComparisonMetrics } from '../../types';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, Clock, Info } from 'lucide-react';

interface ComparisonTableProps {
  metrics: ComparisonMetrics;
  className?: string;
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({
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
    sicBatteryUtilization,
    siBatteryUtilization,
    sicTemperature,
    siTemperature,
    hasSiHardwareData,
  } = metrics;

  return (
    <div className={`overflow-hidden rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs dark:shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Performance Parameter Comparison Matrix</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Simulated SiC MOSFET (ThingSpeak Channel {config.sicChannelId || '3484560'}) vs Physical Si MOSFET Hardware (ThingSpeak Channel {config.siChannelId || '3482521'})
          </p>
        </div>
        <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-slate-950 border border-emerald-200 dark:border-slate-700 px-2.5 py-0.5 rounded flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Dual Channels Live
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 font-mono">
            <tr>
              <th className="py-3 px-4">Parameter</th>
              <th className="py-3 px-4 text-right">SiC MOSFET <span className="text-emerald-700 dark:text-emerald-400 font-sans font-normal lowercase">(simulation {config.sicChannelId || '3484560'})</span></th>
              <th className="py-3 px-4 text-right">Si MOSFET <span className="text-amber-700 dark:text-amber-400 font-sans font-normal lowercase">(hardware {config.siChannelId || '3482521'})</span></th>
              <th className="py-3 px-4 text-right">Delta / Comparison</th>
              <th className="py-3 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono-num text-xs">
            {/* Row 1: Power Loss */}
            <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
              <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-200">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Power Loss</span>
                </div>
              </td>
              <td className="py-3 px-4 text-right font-bold text-emerald-700 dark:text-emerald-400">
                {sicPowerLoss !== null ? `${Number(sicPowerLoss).toFixed(2)} W` : 'No Data'}
              </td>
              <td className="py-3 px-4 text-right font-bold text-slate-600 dark:text-slate-400">
                {hasSiHardwareData && siPowerLoss !== null ? `${Number(siPowerLoss).toFixed(2)} W` : 'Awaiting Hardware'}
              </td>
              <td className="py-3 px-4 text-right font-semibold text-emerald-700 dark:text-emerald-400">
                {hasSiHardwareData && powerLossDifference !== null ? (
                  <span>{powerLossDifference > 0 ? `-${powerLossDifference}` : `+${Math.abs(powerLossDifference)}`} W ({powerLossReductionPercent}%)</span>
                ) : (
                  <span className="text-slate-400 dark:text-slate-500 font-normal">Pending Si hardware feed</span>
                )}
              </td>
              <td className="py-3 px-4 text-center">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-slate-700">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  SiC Live
                </span>
              </td>
            </tr>

            {/* Row 2: Efficiency */}
            <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
              <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-200">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Efficiency</span>
                </div>
              </td>
              <td className="py-3 px-4 text-right font-bold text-emerald-700 dark:text-emerald-400">
                {sicEfficiency !== null ? `${Number(sicEfficiency).toFixed(1)} %` : 'No Data'}
              </td>
              <td className="py-3 px-4 text-right font-bold text-slate-600 dark:text-slate-400">
                {hasSiHardwareData && siEfficiency !== null ? `${Number(siEfficiency).toFixed(1)} %` : 'Awaiting Hardware'}
              </td>
              <td className="py-3 px-4 text-right font-semibold text-emerald-700 dark:text-emerald-400">
                {hasSiHardwareData && efficiencyDifference !== null ? (
                  <span>+{efficiencyDifference}%</span>
                ) : (
                  <span className="text-slate-400 dark:text-slate-500 font-normal">Pending Si hardware feed</span>
                )}
              </td>
              <td className="py-3 px-4 text-center">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-slate-700">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  SiC Live
                </span>
              </td>
            </tr>

            {/* Row 3: Battery Utilization */}
            <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
              <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-200">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-violet-500" />
                  <span>Battery Utilization</span>
                </div>
              </td>
              <td className="py-3 px-4 text-right font-bold text-violet-700 dark:text-violet-400">
                {sicBatteryUtilization !== null ? `${Math.round(Number(sicBatteryUtilization))} %` : 'No Data'}
              </td>
              <td className="py-3 px-4 text-right font-bold text-slate-600 dark:text-slate-400">
                {hasSiHardwareData && siBatteryUtilization !== null ? `${Math.round(Number(siBatteryUtilization))} %` : 'Awaiting Hardware'}
              </td>
              <td className="py-3 px-4 text-right text-slate-500 dark:text-slate-400 font-mono">
                {hasSiHardwareData ? 'Tracked' : 'Pending Si hardware feed'}
              </td>
              <td className="py-3 px-4 text-center">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-violet-50 dark:bg-slate-800 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-slate-700">
                  <CheckCircle2 className="w-3 h-3 text-violet-600 dark:text-violet-400" />
                  SiC Live
                </span>
              </td>
            </tr>

            {/* Row 4: Temperature */}
            <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
              <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-200">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>Temperature</span>
                </div>
              </td>
              <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-400 font-mono">
                {sicTemperature !== null ? `${sicTemperature} °C` : 'Model Reference (~38°C)'}
              </td>
              <td className="py-3 px-4 text-right font-bold text-rose-700 dark:text-rose-400">
                {hasSiHardwareData && siTemperature !== null ? `${siTemperature} °C` : 'Awaiting Hardware'}
              </td>
              <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300 font-mono">
                {hasSiHardwareData && siTemperature !== null ? (
                  <span>Tj(Si) = {siTemperature}°C</span>
                ) : (
                  <span className="text-slate-400 dark:text-slate-500">Pending Si sensor</span>
                )}
              </td>
              <td className="py-3 px-4 text-center">
                {hasSiHardwareData ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-rose-50 dark:bg-slate-800 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-slate-700">
                    <CheckCircle2 className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                    Si Live
                  </span>
                ) : (
                  <Clock className="w-3 h-3 mx-auto text-slate-400 dark:text-slate-500" />
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Note footer */}
      <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-2">
        <Info className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
        <span>
          SiC MOSFET simulation data is streaming from ThingSpeak Channel {config.sicChannelId || '3484560'}. Physical Silicon (Si) MOSFET hardware telemetry is streaming live from ThingSpeak Channel {config.siChannelId || '3482521'}.
        </span>
      </div>
    </div>
  );
};
