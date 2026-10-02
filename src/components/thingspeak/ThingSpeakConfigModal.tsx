import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { testThingSpeakConnection } from '../../services/thingspeak';
import {
  X,
  Settings,
  Key,
  Layers,
  Clock,
  Radio,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Cpu,
  Activity,
} from 'lucide-react';

export const ThingSpeakConfigModal: React.FC = () => {
  const {
    config,
    updateConfig,
    resetConfigToDefault,
    isConfigModalOpen,
    setIsConfigModalOpen,
    refreshHardwareData,
  } = useApp();

  // SiC Simulation Channel Credentials
  const [sicChannelId, setSicChannelId] = useState(config.sicChannelId || '3484560');
  const [sicReadApiKey, setSicReadApiKey] = useState(config.sicReadApiKey || '80Q9HH2Y74UH2FRD');
  const [sicPowerLossField, setSicPowerLossField] = useState(config.sicFieldMapping?.powerLossField ?? 3);
  const [sicEfficiencyField, setSicEfficiencyField] = useState(config.sicFieldMapping?.efficiencyField ?? 4);
  const [sicTemperatureField, setSicTemperatureField] = useState(config.sicFieldMapping?.temperatureField ?? 5);
  const [sicBatteryField, setSicBatteryField] = useState(config.sicFieldMapping?.batteryUtilizationField ?? 6);

  // Si Hardware Channel Credentials (Channel 3482521)
  const [siChannelId, setSiChannelId] = useState(config.siChannelId || '3482521');
  const [siReadApiKey, setSiReadApiKey] = useState(config.siReadApiKey || '36FWK03IR3EVL2Z3');
  const [siPowerLossField, setSiPowerLossField] = useState(config.siFieldMapping?.powerLossField || 5);
  const [siEfficiencyField, setSiEfficiencyField] = useState(config.siFieldMapping?.efficiencyField || 6);
  const [siTemperatureField, setSiTemperatureField] = useState(config.siFieldMapping?.temperatureField || 7);
  const [siBatteryField, setSiBatteryField] = useState(config.siFieldMapping?.batteryUtilizationField || 8);

  const [autoRefreshInterval, setAutoRefreshInterval] = useState(config.autoRefreshIntervalSec || 15);
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState(config.isAutoRefreshEnabled ?? true);

  const [sicTestResult, setSicTestResult] = useState<{ testing: boolean; success?: boolean; message?: string } | null>(null);
  const [siTestResult, setSiTestResult] = useState<{ testing: boolean; success?: boolean; message?: string } | null>(null);

  if (!isConfigModalOpen) return null;

  const handleTestSicConnection = async () => {
    setSicTestResult({ testing: true });
    const res = await testThingSpeakConnection(sicChannelId, sicReadApiKey);
    setSicTestResult({ testing: false, success: res.success, message: res.message });
  };

  const handleTestSiConnection = async () => {
    if (!siChannelId) return;
    setSiTestResult({ testing: true });
    const res = await testThingSpeakConnection(siChannelId, siReadApiKey);
    setSiTestResult({ testing: false, success: res.success, message: res.message });
  };

  const handleSave = () => {
    updateConfig({
      sicChannelId,
      sicReadApiKey,
      sicFieldMapping: {
        powerLossField: sicPowerLossField,
        efficiencyField: sicEfficiencyField,
        temperatureField: sicTemperatureField,
        batteryUtilizationField: sicBatteryField,
      },
      siChannelId,
      siReadApiKey,
      siFieldMapping: {
        powerLossField: siPowerLossField,
        efficiencyField: siEfficiencyField,
        temperatureField: siTemperatureField,
        batteryUtilizationField: siBatteryField,
      },
      channelId: sicChannelId,
      readApiKey: sicReadApiKey,
      autoRefreshIntervalSec: autoRefreshInterval,
      isAutoRefreshEnabled,
    });
    setIsConfigModalOpen(false);
    refreshHardwareData();
  };

  const handleReset = () => {
    resetConfigToDefault();
    setSicChannelId('3484560');
    setSicReadApiKey('80Q9HH2Y74UH2FRD');
    setSicPowerLossField(3);
    setSicEfficiencyField(4);
    setSicTemperatureField(5);
    setSicBatteryField(6);
    setSiChannelId('3482521');
    setSiReadApiKey('36FWK03IR3EVL2Z3');
    setSiPowerLossField(5);
    setSiEfficiencyField(6);
    setSiTemperatureField(7);
    setSiBatteryField(8);
    setAutoRefreshInterval(15);
    setIsAutoRefreshEnabled(true);
    setSicTestResult(null);
    setSiTestResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-5 text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">ThingSpeak Channel Settings</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Manage SiC Simulation & Si Hardware Telemetry Channels
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsConfigModalOpen(false)}
            className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Channels Section */}
        <div className="space-y-4 py-4">
          {/* 1. SiC Simulation Channel (Active) */}
          <div className="space-y-3 p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 font-mono uppercase tracking-wider">
                <Cpu className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> 1. SiC Simulation Channel (MATLAB)
              </h3>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                Active Default
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  SiC Channel ID <span className="text-emerald-600 dark:text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="3484560"
                  value={sicChannelId}
                  onChange={e => setSicChannelId(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md px-3 py-1.5 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Read API Key
                </label>
                <input
                  type="text"
                  placeholder="80Q9HH2Y74UH2FRD"
                  value={sicReadApiKey}
                  onChange={e => setSicReadApiKey(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md px-3 py-1.5 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* SiC Field Mapping */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-mono">Field for Power Loss</label>
                <select
                  value={sicPowerLossField}
                  onChange={e => setSicPowerLossField(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-xs font-mono text-amber-700 dark:text-amber-300"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(f => (
                    <option key={f} value={f}>Field {f}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-mono">Field for Efficiency</label>
                <select
                  value={sicEfficiencyField}
                  onChange={e => setSicEfficiencyField(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-xs font-mono text-emerald-700 dark:text-emerald-300"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(f => (
                    <option key={f} value={f}>Field {f}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-mono">Field for Temperature</label>
                <select
                  value={sicTemperatureField}
                  onChange={e => setSicTemperatureField(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-xs font-mono text-rose-700 dark:text-rose-300"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(f => (
                    <option key={f} value={f}>Field {f}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-mono">Field for Battery Util</label>
                <select
                  value={sicBatteryField}
                  onChange={e => setSicBatteryField(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-xs font-mono text-violet-700 dark:text-violet-300"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(f => (
                    <option key={f} value={f}>Field {f}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Test SiC Connection */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={handleTestSicConnection}
                disabled={sicTestResult?.testing || !sicChannelId}
                className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-700 dark:text-slate-200 text-xs font-medium border border-slate-200 dark:border-slate-700"
              >
                <Radio className={`w-3.5 h-3.5 ${sicTestResult?.testing ? 'animate-spin text-emerald-600 dark:text-emerald-400' : 'text-emerald-600 dark:text-emerald-400'}`} />
                <span>{sicTestResult?.testing ? 'Pinging SiC Channel...' : `Test SiC Channel ${sicChannelId || '3484560'}`}</span>
              </button>

              {sicTestResult && !sicTestResult.testing && (
                <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                  sicTestResult.success ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                }`}>
                  {sicTestResult.message}
                </span>
              )}
            </div>
          </div>

          {/* 2. Si Hardware Channel (Awaiting Data) */}
          <div className="space-y-3 p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-300 flex items-center gap-1.5 font-mono uppercase tracking-wider">
                <Activity className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> 2. Si Hardware Channel (Hardware Testbench)
              </h3>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                Connected Live
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Si Hardware Channel ID
                </label>
                <input
                  type="text"
                  placeholder="Enter Hardware Channel ID when available"
                  value={siChannelId}
                  onChange={e => setSiChannelId(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md px-3 py-1.5 text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Hardware Read API Key
                </label>
                <input
                  type="text"
                  placeholder="e.g. XXXXXXXXXXXXXXXXX"
                  value={siReadApiKey}
                  onChange={e => setSiReadApiKey(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md px-3 py-1.5 text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Si Field Mapping */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-mono">Field for Power Loss</label>
                <select
                  value={siPowerLossField}
                  onChange={e => setSiPowerLossField(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-xs font-mono text-amber-700 dark:text-amber-300"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(f => (
                    <option key={f} value={f}>Field {f}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-mono">Field for Efficiency</label>
                <select
                  value={siEfficiencyField}
                  onChange={e => setSiEfficiencyField(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-xs font-mono text-emerald-700 dark:text-emerald-300"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(f => (
                    <option key={f} value={f}>Field {f}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-mono">Field for Temp (°C)</label>
                <select
                  value={siTemperatureField}
                  onChange={e => setSiTemperatureField(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-xs font-mono text-rose-700 dark:text-rose-300"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(f => (
                    <option key={f} value={f}>Field {f}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-mono">Field for Battery (%)</label>
                <select
                  value={siBatteryField}
                  onChange={e => setSiBatteryField(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-xs font-mono text-violet-700 dark:text-violet-300"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(f => (
                    <option key={f} value={f}>Field {f}</option>
                  ))}
                </select>
              </div>
            </div>

            {siChannelId && (
              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleTestSiConnection}
                  disabled={siTestResult?.testing}
                  className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium border border-slate-200 dark:border-slate-700"
                >
                  <Radio className={`w-3.5 h-3.5 ${siTestResult?.testing ? 'animate-spin text-amber-600 dark:text-amber-400' : 'text-amber-600 dark:text-amber-400'}`} />
                  <span>{siTestResult?.testing ? 'Testing...' : 'Test Si Hardware Channel'}</span>
                </button>

                {siTestResult && !siTestResult.testing && (
                  <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                    siTestResult.success ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                  }`}>
                    {siTestResult.message}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Polling Interval */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="font-medium text-slate-800 dark:text-slate-200">Auto-Refresh Interval:</span>
            </div>
            <select
              value={autoRefreshInterval}
              onChange={e => setAutoRefreshInterval(Number(e.target.value))}
              className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1 text-xs font-mono text-slate-900 dark:text-white"
            >
              <option value={5}>5 seconds</option>
              <option value={10}>10 seconds</option>
              <option value={15}>15 seconds (Standard)</option>
              <option value={30}>30 seconds</option>
              <option value={60}>60 seconds</option>
            </select>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 px-2.5 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsConfigModalOpen(false)}
              className="px-3 py-1.5 rounded text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 rounded text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-950 transition-colors shadow-xs"
            >
              Apply Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
