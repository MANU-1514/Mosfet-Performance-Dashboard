import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { HardwareReading } from '../../types';
import {
  generateSicSimulationProfile,
  generateSiHardwareProfile,
} from '../../services/mockDataGenerator';
import { useApp } from '../../context/AppContext';
import {
  Clock,
  Filter,
  Download,
  Activity,
  Cpu,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export type TimeRange = '1h' | '6h' | '12h' | '24h' | '7d' | 'all';
export type MetricSelection = 'all' | 'powerLoss' | 'efficiency' | 'temperature' | 'batteryUtilization';

interface HistoricalMultiChartProps {
  data: HardwareReading[];
  className?: string;
  channelName?: string;
  channelId?: string;
  selectedChannel?: 'sic' | 'si';
  onSelectChannel?: (channel: 'sic' | 'si') => void;
  showChannelToggle?: boolean;
}

export const HistoricalMultiChart: React.FC<HistoricalMultiChartProps> = ({
  data,
  className = '',
  channelName,
  channelId,
  selectedChannel = 'sic',
  onSelectChannel,
  showChannelToggle = false,
}) => {
  const { theme } = useApp();
  const isDark = theme === 'dark';
  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  const [selectedMetric, setSelectedMetric] = useState<MetricSelection>('all');
  const [useProfileWaveform, setUseProfileWaveform] = useState<boolean>(true);

  const isSi = selectedChannel === 'si' || (!selectedChannel && Boolean(channelName?.toLowerCase().includes('hardware')));
  const isSparseData = !data || data.length <= 2;

  // Active dataset: either the real multi-point data, or generated waveform if only 0-2 points exist
  const effectiveData = useMemo(() => {
    if (!data || data.length === 0) {
      return isSi
        ? generateSiHardwareProfile(undefined, 24)
        : generateSicSimulationProfile(undefined, 24);
    }
    if (isSparseData && useProfileWaveform) {
      return isSi
        ? generateSiHardwareProfile(data[data.length - 1], 24)
        : generateSicSimulationProfile(data[data.length - 1], 24);
    }
    return data;
  }, [data, isSparseData, useProfileWaveform, isSi]);

  // Filter data by selected time range
  const filteredData = useMemo(() => {
    if (!effectiveData || effectiveData.length === 0) return [];
    const now = Date.now();

    const rangeMs: Record<TimeRange, number> = {
      '1h': 1 * 3600 * 1000,
      '6h': 6 * 3600 * 1000,
      '12h': 12 * 3600 * 1000,
      '24h': 24 * 3600 * 1000,
      '7d': 7 * 24 * 3600 * 1000,
      'all': Infinity,
    };

    const maxAge = rangeMs[timeRange];

    let items = effectiveData.filter(item => {
      if (timeRange === 'all') return true;
      const itemTime = new Date(item.timestamp).getTime();
      if (isNaN(itemTime)) return true;
      return (now - itemTime) <= maxAge;
    });

    // Fallback: if selected timeRange filtered everything out (e.g. historical log dates), show all points
    if (items.length === 0 && effectiveData.length > 0) {
      items = effectiveData;
    }

    return items.map(item => {
      const d = new Date(item.timestamp);
      const timeLabel = isNaN(d.getTime())
        ? `Entry #${item.entryId}`
        : timeRange === '7d' || timeRange === 'all'
          ? `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
          : `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;

      return {
        entryId: item.entryId,
        timestamp: item.timestamp,
        timeLabel,
        powerLoss: item.powerLoss,
        efficiency: item.efficiency,
        temperature: item.temperature,
        batteryUtilization: item.batteryUtilization,
      };
    });
  }, [effectiveData, timeRange]);

  const exportCSV = () => {
    if (filteredData.length === 0) return;
    const headers = ['Entry ID', 'Timestamp', 'Power Loss (W)', 'Efficiency (%)', 'Temperature (°C)', 'Battery Utilization (%)'];
    const rows = filteredData.map(d => [
      d.entryId,
      d.timestamp,
      d.powerLoss ?? '',
      d.efficiency ?? '',
      d.temperature ?? '',
      d.batteryUtilization ?? '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${isSi ? 'si_hardware' : 'sic_simulation'}_${timeRange}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const latestEntry = filteredData.length > 0 ? filteredData[filteredData.length - 1] : null;

  return (
    <div className={`rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-6 shadow-xs dark:shadow-xl ${className}`}>
      {/* Top Controls Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`p-1.5 rounded-lg border ${
              isSi
                ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'
                : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
            }`}>
              <Clock className="w-4 h-4" />
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Historical Telemetry Explorer</h3>
            
            {/* Device Identity Badge */}
            <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${
              isSi
                ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-700/60'
                : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700/60'
            }`}>
              {isSi ? <Activity className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> : <Cpu className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
              <span className="font-semibold">{isSi ? 'Si MOSFET Hardware' : 'SiC MOSFET Simulation'}</span>
              <span className="text-slate-500 dark:text-slate-400 font-normal">({channelId || (isSi ? '3482521' : '3484560')})</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isSi
              ? 'Physical laboratory testbench streaming multi-variable hardware sensor telemetry, thermal dissipation, and conversion efficiency'
              : 'Behavioral power converter simulation streaming multi-variable transient dynamics, thermal drift, and conversion efficiency'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Channel Toggle (if enabled) */}
          {showChannelToggle && onSelectChannel && (
            <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => onSelectChannel('sic')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-mono text-xs transition-all ${
                  !isSi
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Cpu className="w-3 h-3" />
                <span>SiC Simulation</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectChannel('si')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-mono text-xs transition-all ${
                  isSi
                    ? 'bg-amber-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Activity className="w-3 h-3" />
                <span>Si Hardware</span>
              </button>
            </div>
          )}

          {/* Time Filter Tabs */}
          <div className="flex items-center p-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
            {(['1h', '6h', '12h', '24h', '7d', 'all'] as TimeRange[]).map(t => (
              <button
                key={t}
                onClick={() => setTimeRange(t)}
                className={`px-2.5 py-1 rounded-md transition-all uppercase font-medium ${
                  timeRange === t
                    ? isSi
                      ? 'bg-amber-600 text-white font-bold shadow-xs'
                      : 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {t === 'all' ? 'All' : `Last ${t}`}
              </button>
            ))}
          </div>

          {/* Export Button */}
          <button
            onClick={exportCSV}
            title="Export filtered readings to CSV"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Dynamic Informational & Telemetry Status Banner */}
      {isSi ? (
        /* Si Hardware Banner */
        isSparseData ? (
          <div className="mb-4 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5 text-amber-900 dark:text-amber-200">
              <Sparkles className="w-4 h-4 flex-shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-2">
                  <span>{useProfileWaveform ? 'Continuous Hardware Profile Active' : 'Single Live Hardware Entry'}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/80 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                    Channel #{channelId || '3482521'}
                  </span>
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                  {useProfileWaveform
                    ? `Displaying continuous 24-hour testbench time-series waveform anchored to Si hardware baseline (${latestEntry?.efficiency ?? '91.9'}% eff, ${latestEntry?.powerLoss ?? '1.80'}W loss, ${latestEntry?.temperature ?? '48.0'}°C temp, ${latestEntry?.batteryUtilization ?? '34.8'}% battery).`
                    : `Displaying raw telemetry points received from Si hardware channel ${channelId || '3482521'}.`}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setUseProfileWaveform(prev => !prev)}
              className="flex-shrink-0 px-3 py-1.5 rounded-md bg-white dark:bg-amber-900/60 hover:bg-amber-100 dark:hover:bg-amber-800 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 font-mono text-[11px] transition-colors shadow-2xs"
            >
              {useProfileWaveform ? 'Show Raw Points Only' : 'Generate Continuous Waveform'}
            </button>
          </div>
        ) : (
          <div className="mb-4 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5 text-amber-900 dark:text-amber-200">
              <Activity className="w-4 h-4 flex-shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-2">
                  <span>Si MOSFET Hardware Testbench Live Telemetry</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/80 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                    Channel #{channelId || '3482521'} • {filteredData.length} Buffered Feeds
                  </span>
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                  Physical laboratory testbench streaming multi-variable hardware sensor telemetry. Current hardware operating point: <span className="text-amber-700 dark:text-amber-300 font-mono font-semibold">{latestEntry?.powerLoss !== null ? `${Number(latestEntry?.powerLoss).toFixed(2)}W loss` : '1.80W loss'}</span>, <span className="text-emerald-700 dark:text-emerald-300 font-mono font-semibold">{latestEntry?.efficiency !== null ? `${Number(latestEntry?.efficiency).toFixed(1)}% eff` : '91.9% eff'}</span>, <span className="text-rose-700 dark:text-rose-300 font-mono font-semibold">{latestEntry?.temperature !== null ? `${Number(latestEntry?.temperature).toFixed(1)}°C temp` : '48.0°C temp'}</span>, <span className="text-violet-700 dark:text-violet-300 font-mono font-semibold">{latestEntry?.batteryUtilization !== null ? `${Number(latestEntry?.batteryUtilization).toFixed(1)}% battery` : '34.8% battery'}</span>.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-md bg-amber-100 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span>Hardware Testbench Active</span>
              </span>
            </div>
          </div>
        )
      ) : (
        /* SiC Simulation Banner */
        isSparseData ? (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5 text-emerald-900 dark:text-emerald-200">
              <Sparkles className="w-4 h-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
              <div>
                <p className="font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <span>{useProfileWaveform ? 'Continuous Simulation Waveform Active' : 'Single Live Telemetry Entry'}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700">
                    ThingSpeak Channel #{channelId || '3484560'}
                  </span>
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                  {useProfileWaveform
                    ? `Your MATLAB simulation has streamed entry to Channel ${channelId || '3484560'}. Displaying a continuous 24-hour time-series waveform anchored to your live reading (${latestEntry?.efficiency ?? '93.8'}% eff, ${latestEntry?.powerLoss ?? '0.35'}W loss, ${latestEntry?.temperature ?? '25.05'}°C temp).`
                    : `Displaying raw point received from MATLAB. Run MATLAB in a loop to log continuous multi-point feeds.`}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setUseProfileWaveform(prev => !prev)}
              className="flex-shrink-0 px-3 py-1.5 rounded-md bg-white dark:bg-emerald-900/60 hover:bg-emerald-100 dark:hover:bg-emerald-800 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 font-mono text-[11px] transition-colors shadow-2xs"
            >
              {useProfileWaveform ? 'Show Raw Point Only' : 'Generate Continuous Waveform'}
            </button>
          </div>
        ) : (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5 text-emerald-900 dark:text-emerald-200">
              <Cpu className="w-4 h-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
              <div>
                <p className="font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <span>MATLAB Simulink Behavioral Simulation Stream</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700">
                    Channel #{channelId || '3484560'} • {filteredData.length} Buffered Feeds
                  </span>
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                  Behavioral power converter simulation streaming multi-variable transient dynamics and thermal drift from MATLAB. Current simulation point: <span className="text-amber-700 dark:text-amber-300 font-mono font-semibold">{latestEntry?.powerLoss !== null ? `${Number(latestEntry?.powerLoss).toFixed(2)}W loss` : '0.35W loss'}</span>, <span className="text-emerald-700 dark:text-emerald-300 font-mono font-semibold">{latestEntry?.efficiency !== null ? `${Number(latestEntry?.efficiency).toFixed(1)}% eff` : '93.8% eff'}</span>, <span className="text-rose-700 dark:text-rose-300 font-mono font-semibold">{latestEntry?.temperature !== null ? `${Number(latestEntry?.temperature).toFixed(1)}°C temp` : '25.05°C temp'}</span>, <span className="text-violet-700 dark:text-violet-300 font-mono font-semibold">{latestEntry?.batteryUtilization !== null ? `${Number(latestEntry?.batteryUtilization).toFixed(1)}% battery` : '25.0% battery'}</span>.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>MATLAB Simulink Active</span>
              </span>
            </div>
          </div>
        )
      )}

      {/* Real-time Summary Cards Strip (Identical 4-Metric Layout for Si and SiC) */}
      {latestEntry && (
        <div className="mb-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="bg-white dark:bg-slate-900/70 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800/80 shadow-2xs">
            <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-sans tracking-wider font-semibold">Power Loss</span>
            <span className="text-amber-700 dark:text-amber-400 font-bold text-base mt-0.5 block">
              {latestEntry.powerLoss !== null ? `${Number(latestEntry.powerLoss).toFixed(2)} W` : '--'}
            </span>
          </div>
          <div className="bg-white dark:bg-slate-900/70 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800/80 shadow-2xs">
            <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-sans tracking-wider font-semibold">Efficiency</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold text-base mt-0.5 block">
              {latestEntry.efficiency !== null ? `${Number(latestEntry.efficiency).toFixed(1)} %` : '--'}
            </span>
          </div>
          <div className="bg-white dark:bg-slate-900/70 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800/80 shadow-2xs">
            <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-sans tracking-wider font-semibold">Temperature</span>
            <span className="text-rose-700 dark:text-rose-400 font-bold text-base mt-0.5 block">
              {latestEntry.temperature !== null ? `${Number(latestEntry.temperature).toFixed(1)} °C` : '--'}
            </span>
          </div>
          <div className="bg-white dark:bg-slate-900/70 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800/80 shadow-2xs">
            <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-sans tracking-wider font-semibold">Battery Util</span>
            <span className="text-violet-700 dark:text-violet-400 font-bold text-base mt-0.5 block">
              {latestEntry.batteryUtilization !== null ? `${Number(latestEntry.batteryUtilization).toFixed(1)} %` : '--'}
            </span>
          </div>
        </div>
      )}

      {/* Metric Selector Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mr-1">
          <Filter className="w-3.5 h-3.5" /> Metric:
        </span>
        {[
          { id: 'all', label: 'All Metrics (Normalized)', color: 'border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-300' },
          { id: 'powerLoss', label: 'Power Loss (W)', color: 'border-amber-300 dark:border-amber-500/40 text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10' },
          { id: 'efficiency', label: 'Efficiency (%)', color: 'border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10' },
          { id: 'temperature', label: 'Temperature (°C)', color: 'border-rose-300 dark:border-rose-500/40 text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-500/10' },
          { id: 'batteryUtilization', label: 'Battery (%)', color: 'border-violet-300 dark:border-violet-500/40 text-violet-800 dark:text-violet-300 bg-violet-50 dark:bg-violet-500/10' },
        ].map(m => (
          <button
            key={m.id}
            onClick={() => setSelectedMetric(m.id as MetricSelection)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-all ${
              selectedMetric === m.id
                ? isSi
                  ? `${m.color} ring-1 ring-amber-500 font-semibold shadow-xs`
                  : `${m.color} ring-1 ring-emerald-500 font-semibold shadow-xs`
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Chart Canvas */}
      <div className="h-80 w-full">
        {filteredData.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-sm gap-2">
            <span>No telemetry points recorded in selected window.</span>
            <button
              onClick={() => setTimeRange('all')}
              className={`text-xs underline font-mono ${isSi ? 'text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300' : 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300'}`}
            >
              Reset to view All Telemetry
            </button>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={filteredData}
              margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#e2e8f0'} />
              <XAxis
                dataKey="timeLabel"
                stroke={isDark ? '#64748b' : '#94a3b8'}
                tickLine={false}
                axisLine={{ stroke: isDark ? '#334155' : '#cbd5e1' }}
                tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11, fontFamily: 'monospace' }}
              />
              <YAxis
                stroke={isDark ? '#64748b' : '#94a3b8'}
                tickLine={false}
                axisLine={{ stroke: isDark ? '#334155' : '#cbd5e1' }}
                tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11, fontFamily: 'monospace' }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="rounded-xl bg-white dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 p-3.5 shadow-2xl text-xs font-mono space-y-1.5 text-slate-900 dark:text-slate-100">
                        <div className="text-slate-500 dark:text-slate-400 text-[11px] border-b border-slate-100 dark:border-slate-800 pb-1 flex justify-between gap-4">
                          <span>{new Date(d.timestamp).toLocaleString()}</span>
                          <span className="text-slate-400 dark:text-slate-500">Entry #{d.entryId}</span>
                        </div>
                        {d.powerLoss !== null && (selectedMetric === 'all' || selectedMetric === 'powerLoss') && (
                          <div className="flex justify-between gap-4 text-amber-700 dark:text-amber-400">
                            <span>Power Loss:</span>
                            <span className="font-bold">{d.powerLoss} W</span>
                          </div>
                        )}
                        {d.efficiency !== null && (selectedMetric === 'all' || selectedMetric === 'efficiency') && (
                          <div className="flex justify-between gap-4 text-emerald-700 dark:text-emerald-400">
                            <span>Efficiency:</span>
                            <span className="font-bold">{d.efficiency} %</span>
                          </div>
                        )}
                        {d.temperature !== null && (selectedMetric === 'all' || selectedMetric === 'temperature') && (
                          <div className="flex justify-between gap-4 text-rose-700 dark:text-rose-400">
                            <span>Temperature:</span>
                            <span className="font-bold">{d.temperature} °C</span>
                          </div>
                        )}
                        {d.batteryUtilization !== null && (selectedMetric === 'all' || selectedMetric === 'batteryUtilization') && (
                          <div className="flex justify-between gap-4 text-violet-700 dark:text-violet-400">
                            <span>Battery Utilization:</span>
                            <span className="font-bold">{d.batteryUtilization} %</span>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="top"
                height={36}
                wrapperStyle={{ fontSize: '12px', paddingBottom: '8px' }}
              />

              {(selectedMetric === 'all' || selectedMetric === 'powerLoss') && (
                <Line
                  type="monotone"
                  name="Power Loss (W)"
                  dataKey="powerLoss"
                  stroke="#d97706"
                  strokeWidth={2}
                  dot={{ r: 4, strokeWidth: 2, stroke: '#d97706', fill: isDark ? '#0f172a' : '#ffffff' }}
                  activeDot={{ r: 6, strokeWidth: 2, fill: '#d97706' }}
                />
              )}

              {(selectedMetric === 'all' || selectedMetric === 'efficiency') && (
                <Line
                  type="monotone"
                  name="Efficiency (%)"
                  dataKey="efficiency"
                  stroke="#059669"
                  strokeWidth={2}
                  dot={{ r: 4, strokeWidth: 2, stroke: '#059669', fill: isDark ? '#0f172a' : '#ffffff' }}
                  activeDot={{ r: 6, strokeWidth: 2, fill: '#059669' }}
                />
              )}

              {(selectedMetric === 'all' || selectedMetric === 'temperature') && (
                <Line
                  type="monotone"
                  name="Temperature (°C)"
                  dataKey="temperature"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  dot={{ r: 4, strokeWidth: 2, stroke: '#f43f5e', fill: isDark ? '#0f172a' : '#ffffff' }}
                  activeDot={{ r: 6, strokeWidth: 2, fill: '#f43f5e' }}
                />
              )}

              {(selectedMetric === 'all' || selectedMetric === 'batteryUtilization') && (
                <Line
                  type="monotone"
                  name="Battery Utilization (%)"
                  dataKey="batteryUtilization"
                  stroke="#7c3aed"
                  strokeWidth={2}
                  dot={{ r: 4, strokeWidth: 2, stroke: '#7c3aed', fill: isDark ? '#0f172a' : '#ffffff' }}
                  activeDot={{ r: 6, strokeWidth: 2, fill: '#7c3aed' }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Summary Footer */}
      <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center justify-between gap-2">
        <span>
          Showing {filteredData.length} records in buffer ({timeRange === 'all' ? 'All buffered entries' : `Last ${timeRange}`})
        </span>
        <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <CheckCircle2 className={`w-3.5 h-3.5 ${isSi ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`} />
          <span>ThingSpeak Stream Active • Channel {channelId || (isSi ? '3482521' : '3484560')}</span>
        </span>
      </div>
    </div>
  );
};
