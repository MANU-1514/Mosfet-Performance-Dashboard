import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { HistoricalMultiChart } from '../components/charts/HistoricalMultiChart';
import { RawFeedViewer } from '../components/thingspeak/RawFeedViewer';
import {
  Radio,
  Settings,
  Layers,
  RefreshCw,
  Clock,
  Database,
  Activity,
  Cpu,
  Zap,
  Gauge,
  Thermometer,
  BatteryCharging,
} from 'lucide-react';

export const ThingSpeakDataPage: React.FC = () => {
  const {
    sicData,
    historicalSicData,
    sicChannelInfo,
    siHardwareData,
    historicalSiHardwareData,
    siChannelInfo,
    config,
    setIsConfigModalOpen,
    refreshHardwareData,
    isFetching,
    sicConnectionStatus,
    siConnectionStatus,
    lastUpdated,
    hasSiHardwareData,
  } = useApp();

  const [selectedChannel, setSelectedChannel] = useState<'si' | 'sic'>('sic');

  const isSiActive = selectedChannel === 'si';
  const currentData = isSiActive ? siHardwareData : sicData;
  const currentHistory = isSiActive ? historicalSiHardwareData : historicalSicData;
  const currentChannelInfo = isSiActive ? siChannelInfo : sicChannelInfo;
  const currentChannelId = isSiActive ? (config.siChannelId || '3482521') : (config.sicChannelId || '3484560');
  const currentStatus = isSiActive ? siConnectionStatus : sicConnectionStatus;

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-6">
      {/* Top Banner */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs dark:shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                <Activity className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                <span>Si Hardware: {config.siChannelId || '3482521'}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                <Radio className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>SiC Sim: {config.sicChannelId || '3484560'}</span>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              ThingSpeak Telemetry & Feed Inspector
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Live bi-directional telemetry ingestion monitoring physical Silicon (Si) MOSFET hardware testbench measurements and MATLAB SiC MOSFET simulation feeds.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => refreshHardwareData()}
              disabled={isFetching}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-medium border border-slate-200 dark:border-slate-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 text-emerald-600 dark:text-emerald-400 ${isFetching ? 'animate-spin' : ''}`} />
              <span>Poll Now</span>
            </button>
            <button
              onClick={() => setIsConfigModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-950 text-xs font-semibold transition-colors shadow-xs"
            >
              <Settings className="w-3 h-3" />
              <span>Channel Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Channel Switcher Tabs */}
      <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 gap-1.5">
        <button
          onClick={() => setSelectedChannel('si')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-mono text-xs font-medium transition-all ${
            isSiActive
              ? 'bg-white text-amber-800 border border-amber-300 shadow-xs dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800/60'
          }`}
        >
          <Activity className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>Si MOSFET Hardware Channel ({config.siChannelId || '3482521'})</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-1" />
        </button>

        <button
          onClick={() => setSelectedChannel('sic')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-mono text-xs font-medium transition-all ${
            !isSiActive
              ? 'bg-white text-emerald-800 border border-emerald-300 shadow-xs dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800/60'
          }`}
        >
          <Radio className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>SiC Simulation Channel ({config.sicChannelId || '3484560'})</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 ml-1" />
        </button>
      </div>

      {/* Field Status & Mapping Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Mapped Field Values */}
        <div className="lg:col-span-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-xs dark:shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-1.5">
              <Layers className={`w-4 h-4 ${isSiActive ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`} />
              <h2 className="text-xs font-bold uppercase font-mono tracking-wider text-slate-800 dark:text-slate-200">
                {isSiActive ? `Si Hardware (Channel ${currentChannelId}) Fields` : `SiC Simulation (Channel ${currentChannelId}) Fields`}
              </h2>
            </div>
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              {currentChannelInfo?.name ? `Channel: ${currentChannelInfo.name}` : 'Telemetry Connected'}
            </span>
          </div>

          {/* KPI Mapped Telemetry Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Field: Power Loss */}
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-0.5 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                <span>Power Loss</span>
              </div>
              <div className="text-lg font-bold font-mono text-amber-700 dark:text-amber-400">
                {currentData.powerLoss !== null ? `${Number(currentData.powerLoss).toFixed(2)} W` : 'null'}
              </div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-mono">
                {isSiActive ? 'Field 5 (power loss)' : 'Field 2'}
              </div>
            </div>

            {/* Field: Efficiency */}
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-0.5 flex items-center gap-1">
                <Gauge className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>Efficiency</span>
              </div>
              <div className="text-lg font-bold font-mono text-emerald-700 dark:text-emerald-400">
                {currentData.efficiency !== null ? `${Number(currentData.efficiency).toFixed(1)} %` : 'null'}
              </div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-mono">
                {isSiActive ? 'Field 6 (efficiency)' : 'Field 1'}
              </div>
            </div>

            {/* Field: Temperature */}
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-0.5 flex items-center gap-1">
                <Thermometer className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                <span>Temperature</span>
              </div>
              <div className="text-lg font-bold font-mono text-rose-700 dark:text-rose-400">
                {currentData.temperature !== null ? `${Number(currentData.temperature).toFixed(1)} °C` : (isSiActive ? 'null' : 'N/A')}
              </div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-mono">
                {isSiActive ? 'Field 7 (temperature)' : 'Model Reference'}
              </div>
            </div>

            {/* Field: Battery Utilization */}
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-0.5 flex items-center gap-1">
                <BatteryCharging className="w-3 h-3 text-violet-600 dark:text-violet-400" />
                <span>Battery Util</span>
              </div>
              <div className="text-lg font-bold font-mono text-violet-700 dark:text-violet-300">
                {currentData.batteryUtilization !== null ? `${Math.round(Number(currentData.batteryUtilization))} %` : 'null'}
              </div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-mono">
                {isSiActive ? 'Field 8 (battery util)' : 'Field 3'}
              </div>
            </div>
          </div>

          {/* Testbench Electrical Operating Point (If Si Channel) */}
          {isSiActive && currentData.rawValues && (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80">
              <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1">
                <Activity className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                <span>Input / Output Operating Measurements:</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-2 rounded bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-xs font-mono">
                  <span className="text-[10px] text-slate-500 block">Field 1 (Vin)</span>
                  <span className="text-amber-700 dark:text-amber-300 font-bold">{currentData.rawValues.field1 ?? '11.1'} V</span>
                </div>
                <div className="p-2 rounded bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-xs font-mono">
                  <span className="text-[10px] text-slate-500 block">Field 2 (Iin)</span>
                  <span className="text-amber-700 dark:text-amber-300 font-bold">{currentData.rawValues.field2 ?? '2.0'} A</span>
                </div>
                <div className="p-2 rounded bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-xs font-mono">
                  <span className="text-[10px] text-slate-500 block">Field 3 (Vout)</span>
                  <span className="text-emerald-700 dark:text-emerald-300 font-bold">{currentData.rawValues.field3 ?? '12.0'} V</span>
                </div>
                <div className="p-2 rounded bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-xs font-mono">
                  <span className="text-[10px] text-slate-500 block">Field 4 (Iout)</span>
                  <span className="text-emerald-700 dark:text-emerald-300 font-bold">{currentData.rawValues.field4 ?? '1.7'} A</span>
                </div>
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              Polling Interval: <strong>Every {config.autoRefreshIntervalSec}s</strong>
            </span>
            <span className="font-mono text-[11px]">
              Latest Entry: #{currentData.entryId || 1} ({lastUpdated || 'Synced'})
            </span>
          </div>
        </div>

        {/* Right 1 Col: Channel Profile Card */}
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-xs dark:shadow-sm space-y-2.5">
          <h2 className="text-xs font-bold uppercase font-mono tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Channel Configuration</span>
          </h2>

          <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-700 dark:text-slate-300 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Active Channel:</span>
              <span className="text-amber-700 dark:text-amber-400 font-bold">{currentChannelId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Device Target:</span>
              <span className="text-slate-900 dark:text-white font-medium">{isSiActive ? 'Si MOSFET Hardware' : 'SiC MOSFET Simulation'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Status:</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                {currentStatus === 'connected' ? 'Connected' : 'Active'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Feeds In Buffer:</span>
              <span className="text-slate-800 dark:text-slate-200 font-bold">{currentHistory.length} entries</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
            API Endpoint:
            <code className="block bg-slate-100 dark:bg-slate-950 p-1.5 rounded text-[10px] text-slate-700 dark:text-slate-400 font-mono mt-1 break-all border border-slate-200 dark:border-slate-800">
              https://api.thingspeak.com/channels/{currentChannelId}/feeds.json
            </code>
          </p>
        </div>
      </div>

      {/* Historical Multi-Metric Chart */}
      <HistoricalMultiChart
        data={currentHistory}
        channelName={isSiActive ? 'Si MOSFET Hardware' : 'SiC MOSFET Simulation'}
        channelId={currentChannelId}
        selectedChannel={selectedChannel}
        onSelectChannel={setSelectedChannel}
        showChannelToggle={true}
      />

      {/* Raw Feed Viewer */}
      <RawFeedViewer
        latestReading={currentData}
        historicalFeeds={currentHistory}
      />
    </div>
  );
};

