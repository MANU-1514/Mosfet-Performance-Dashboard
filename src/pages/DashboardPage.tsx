import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { KPICard } from '../components/common/KPICard';
import { PowerLossBarChart } from '../components/charts/PowerLossBarChart';
import { EfficiencyComparisonBarChart } from '../components/charts/EfficiencyComparisonBarChart';
import { HardwareTemperatureChart } from '../components/charts/HardwareTemperatureChart';
import { BatteryUtilizationChart } from '../components/charts/BatteryUtilizationChart';
import { HistoricalMultiChart } from '../components/charts/HistoricalMultiChart';
import { ComparisonInsights } from '../components/comparison/ComparisonInsights';
import {
  Zap,
  Gauge,
  Thermometer,
  BatteryCharging,
  ArrowRight,
  Activity,
  Radio,
  RadioTower,
  Cpu,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const {
    sicData,
    historicalSicData,
    siHardwareData,
    historicalSiHardwareData,
    comparisonMetrics,
    setCurrentPage,
    sicConnectionStatus,
    config,
    sicChannelInfo,
    hasSiHardwareData,
  } = useApp();

  const [dashboardExplorerChannel, setDashboardExplorerChannel] = useState<'sic' | 'si' | 'both'>('si');

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-6">
      {/* Top Banner */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs dark:shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                <Radio className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>SiC Simulation Stream (ThingSpeak {config.sicChannelId || '3484560'})</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                <Activity className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                <span>Si Hardware Stream (ThingSpeak {config.siChannelId || '3482521'})</span>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Performance Evaluation: Simulated SiC MOSFET vs Hardware Si MOSFET
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
              Live telemetry monitoring comparing MATLAB simulation results for Silicon Carbide (SiC) MOSFET (Channel {config.sicChannelId || '3484560'}) against physical Silicon (Si) MOSFET hardware testbench telemetry streaming live from ThingSpeak Channel {config.siChannelId || '3482521'}.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setCurrentPage('comparison')}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-950 font-semibold text-xs transition-colors shadow-xs"
            >
              <span>Detailed Comparison</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCurrentPage('telemetry')}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-medium border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <RadioTower className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Live Feeds</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid: SiC Simulation (Active) & Si Hardware (Awaiting) */}
      <div className="space-y-4">
        {/* Row 1: SiC MOSFET Simulation Telemetry */}
        <div>
          <div className="flex items-center justify-between mb-2 px-0.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-mono flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> SiC MOSFET (MATLAB Simulation Telemetry – Channel {config.sicChannelId || '3484560'})
            </h2>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Ingestion Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* SiC Efficiency */}
            <KPICard
              title="SiC Efficiency"
              category="SiC MOSFET"
              sourceType="SIMULATION DATA"
              value={sicData.efficiency !== null ? Number(sicData.efficiency).toFixed(1) : null}
              unit="%"
              icon={Gauge}
              subtext={`ThingSpeak Channel ${config.sicChannelId || '3484560'} (Field ${config.sicFieldMapping?.efficiencyField ?? 4})`}
              accentColor="emerald"
              statusTag={`Live Field ${config.sicFieldMapping?.efficiencyField ?? 4}`}
              isLive={true}
            />

            {/* SiC Power Loss */}
            <KPICard
              title="SiC Power Loss"
              category="SiC MOSFET"
              sourceType="SIMULATION DATA"
              value={sicData.powerLoss !== null ? Number(sicData.powerLoss).toFixed(2) : null}
              unit="W"
              icon={Zap}
              subtext={`ThingSpeak Channel ${config.sicChannelId || '3484560'} (Field ${config.sicFieldMapping?.powerLossField ?? 3})`}
              accentColor="amber"
              statusTag={`Live Field ${config.sicFieldMapping?.powerLossField ?? 3}`}
              isLive={true}
            />

            {/* SiC Junction Temperature */}
            <KPICard
              title="SiC Temperature"
              category="SiC MOSFET"
              sourceType="SIMULATION DATA"
              value={sicData.temperature !== null ? Number(sicData.temperature).toFixed(1) : null}
              unit="°C"
              icon={Thermometer}
              subtext={`ThingSpeak Channel ${config.sicChannelId || '3484560'} (Field ${config.sicFieldMapping?.temperatureField ?? 5})`}
              accentColor="rose"
              statusTag={`Live Field ${config.sicFieldMapping?.temperatureField ?? 5}`}
              isLive={true}
            />

            {/* SiC Battery Utilisation */}
            <KPICard
              title="SiC Battery Utilisation"
              category="SiC MOSFET"
              sourceType="SIMULATION DATA"
              value={sicData.batteryUtilization !== null ? Math.round(Number(sicData.batteryUtilization)) : null}
              unit="%"
              icon={BatteryCharging}
              subtext={`ThingSpeak Channel ${config.sicChannelId || '3484560'} (Field ${config.sicFieldMapping?.batteryUtilizationField ?? 6})`}
              accentColor="cyan"
              statusTag={`Live Field ${config.sicFieldMapping?.batteryUtilizationField ?? 6}`}
              isLive={true}
            />
          </div>
        </div>

        {/* Row 2: Si MOSFET Hardware Telemetry (Live from Channel 3482521) */}
        <div>
          <div className="flex items-center justify-between mb-2 px-0.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 font-mono flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> Si MOSFET (Hardware Testbench – Channel {config.siChannelId || '3482521'})
            </h2>
            <span className={`text-[11px] font-mono flex items-center gap-1 ${hasSiHardwareData ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${hasSiHardwareData ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400 dark:bg-slate-500'}`} />
              {hasSiHardwareData ? 'Live Telemetry Active' : 'Connecting Hardware Feed...'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Si Power Loss */}
            <KPICard
              title="Si Power Loss"
              category="Si MOSFET"
              sourceType="HARDWARE DATA"
              value={siHardwareData.powerLoss}
              unit="W"
              icon={Zap}
              subtext={`ThingSpeak Channel ${config.siChannelId || '3482521'} (Field 5)`}
              statusTag={hasSiHardwareData ? 'Live Field 5' : 'Connecting'}
              accentColor="amber"
              isLive={hasSiHardwareData}
            />

            {/* Si Efficiency */}
            <KPICard
              title="Si Efficiency"
              category="Si MOSFET"
              sourceType="HARDWARE DATA"
              value={siHardwareData.efficiency}
              unit="%"
              icon={Gauge}
              subtext={`ThingSpeak Channel ${config.siChannelId || '3482521'} (Field 6)`}
              statusTag={hasSiHardwareData ? 'Live Field 6' : 'Connecting'}
              accentColor="emerald"
              isLive={hasSiHardwareData}
            />

            {/* Si Junction Temperature */}
            <KPICard
              title="Si Temperature"
              category="Si MOSFET"
              sourceType="HARDWARE DATA"
              value={siHardwareData.temperature}
              unit="°C"
              icon={Thermometer}
              subtext={`ThingSpeak Channel ${config.siChannelId || '3482521'} (Field 7)`}
              statusTag={hasSiHardwareData ? 'Live Field 7' : 'Connecting'}
              accentColor="rose"
              isLive={hasSiHardwareData}
            />

            {/* Si Battery Utilization */}
            <KPICard
              title="Si Battery Utilization"
              category="Si MOSFET"
              sourceType="HARDWARE DATA"
              value={siHardwareData.batteryUtilization}
              unit="%"
              icon={BatteryCharging}
              subtext={`ThingSpeak Channel ${config.siChannelId || '3482521'} (Field 8)`}
              statusTag={hasSiHardwareData ? 'Live Field 8' : 'Connecting'}
              accentColor="cyan"
              isLive={hasSiHardwareData}
            />
          </div>

          {/* Electrical Testbench Operating Point Strip */}
          {hasSiHardwareData && siHardwareData.rawValues && (
            <div className="mt-2.5 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono shadow-2xs">
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span className="text-slate-800 dark:text-slate-300 font-medium">Testbench Operating Point:</span>
              </div>
              <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-slate-700 dark:text-slate-300">
                <span>Vin: <strong className="text-amber-700 dark:text-amber-300">{siHardwareData.rawValues.field1 ?? '11.1'} V</strong></span>
                <span>Iin: <strong className="text-amber-700 dark:text-amber-300">{siHardwareData.rawValues.field2 ?? '2.0'} A</strong></span>
                <span>Vout: <strong className="text-emerald-700 dark:text-emerald-300">{siHardwareData.rawValues.field3 ?? '12.0'} V</strong></span>
                <span>Iout: <strong className="text-emerald-700 dark:text-emerald-300">{siHardwareData.rawValues.field4 ?? '1.7'} A</strong></span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4 Primary Charts Grid */}
      <div>
        <div className="flex items-center justify-between mb-2 px-0.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
            Comparative Telemetry Visualizations
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Chart 1: Power Loss Bar Chart */}
          <PowerLossBarChart
            sicLoss={sicData.powerLoss}
            siLoss={siHardwareData.powerLoss}
          />

          {/* Chart 2: Efficiency Comparison Bar Chart */}
          <EfficiencyComparisonBarChart
            sicEfficiency={sicData.efficiency}
            siEfficiency={siHardwareData.efficiency}
          />

          {/* Chart 3: Hardware Temperature Line Chart */}
          <HardwareTemperatureChart
            data={historicalSiHardwareData}
            currentTemperature={siHardwareData.temperature}
          />

          {/* Chart 4: Live Battery Utilization Line Chart */}
          <BatteryUtilizationChart
            data={hasSiHardwareData ? historicalSiHardwareData : historicalSicData}
            currentBattery={hasSiHardwareData ? siHardwareData.batteryUtilization : sicData.batteryUtilization}
          />
        </div>
      </div>

      {/* Historical Telemetry Explorer Section */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-300">
              Historical Telemetry Stream Analysis
            </h2>
          </div>
          <div className="flex items-center p-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono shadow-xs dark:shadow-none">
            <button
              type="button"
              onClick={() => setDashboardExplorerChannel('si')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                dashboardExplorerChannel === 'si'
                  ? 'bg-amber-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Si Hardware (3482521)</span>
            </button>
            <button
              type="button"
              onClick={() => setDashboardExplorerChannel('sic')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                dashboardExplorerChannel === 'sic'
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>SiC Sim (3484560)</span>
            </button>
            <button
              type="button"
              onClick={() => setDashboardExplorerChannel('both')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                dashboardExplorerChannel === 'both'
                  ? 'bg-slate-900 dark:bg-zinc-200 text-white dark:text-slate-950 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Dual View</span>
            </button>
          </div>
        </div>

        {dashboardExplorerChannel === 'both' ? (
          <div className="space-y-6">
            <HistoricalMultiChart
              data={historicalSiHardwareData}
              channelName="Si MOSFET Hardware"
              channelId={config.siChannelId || '3482521'}
              selectedChannel="si"
              onSelectChannel={(ch) => setDashboardExplorerChannel(ch)}
              showChannelToggle={false}
            />
            <HistoricalMultiChart
              data={historicalSicData}
              channelName="SiC MOSFET Simulation"
              channelId={config.sicChannelId || '3484560'}
              selectedChannel="sic"
              onSelectChannel={(ch) => setDashboardExplorerChannel(ch)}
              showChannelToggle={false}
            />
          </div>
        ) : (
          <HistoricalMultiChart
            data={dashboardExplorerChannel === 'si' ? historicalSiHardwareData : historicalSicData}
            channelName={dashboardExplorerChannel === 'si' ? 'Si MOSFET Hardware' : 'SiC MOSFET Simulation'}
            channelId={dashboardExplorerChannel === 'si' ? (config.siChannelId || '3482521') : (config.sicChannelId || '3484560')}
            selectedChannel={dashboardExplorerChannel}
            onSelectChannel={(ch) => setDashboardExplorerChannel(ch)}
            showChannelToggle={true}
          />
        )}
      </div>

      {/* Insights Section */}
      <ComparisonInsights metrics={comparisonMetrics} />
    </div>
  );
};
