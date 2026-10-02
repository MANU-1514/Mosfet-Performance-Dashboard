import React from 'react';
import { useApp } from '../context/AppContext';
import { ComparisonTable } from '../components/comparison/ComparisonTable';
import { ComparisonInsights } from '../components/comparison/ComparisonInsights';
import { BatteryImpactEstimator } from '../components/comparison/BatteryImpactEstimator';
import { PowerLossBarChart } from '../components/charts/PowerLossBarChart';
import { EfficiencyComparisonBarChart } from '../components/charts/EfficiencyComparisonBarChart';
import {
  BarChart3,
  Radio,
} from 'lucide-react';

export const PerformanceComparisonPage: React.FC = () => {
  const {
    sicData,
    siHardwareData,
    comparisonMetrics,
    setCurrentPage,
    config,
  } = useApp();

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-6">
      {/* Top Banner */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs dark:shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                <BarChart3 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>Comparative Engineering Evaluation</span>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              SiC MOSFET Simulation vs Hardware Si MOSFET Telemetry
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Direct mathematical and telemetry evaluation comparing Silicon Carbide (SiC) simulation data on ThingSpeak Channel {config.sicChannelId || '3484560'} against physical Silicon (Si) MOSFET hardware testbench telemetry.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setCurrentPage('telemetry')}
              className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-medium border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <Radio className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>ThingSpeak Feeds</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Comparison Matrix Table */}
      <ComparisonTable metrics={comparisonMetrics} />

      {/* Comparison Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PowerLossBarChart
          sicLoss={sicData.powerLoss}
          siLoss={siHardwareData.powerLoss}
        />

        <EfficiencyComparisonBarChart
          sicEfficiency={sicData.efficiency}
          siEfficiency={siHardwareData.efficiency}
        />
      </div>

      {/* Structured Insights & Observations */}
      <ComparisonInsights metrics={comparisonMetrics} />

      {/* Battery Impact & Runtime Calculator */}
      <BatteryImpactEstimator
        sicEfficiency={sicData.efficiency ?? 97.4}
        siEfficiency={siHardwareData.efficiency ?? 88}
      />
    </div>
  );
};
