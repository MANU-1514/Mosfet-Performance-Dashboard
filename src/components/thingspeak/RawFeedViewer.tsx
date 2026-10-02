import React, { useState } from 'react';
import { HardwareReading } from '../../types';
import { useApp } from '../../context/AppContext';
import { Terminal, Copy, Check, Table, Code2, Download } from 'lucide-react';

interface RawFeedViewerProps {
  latestReading: HardwareReading;
  historicalFeeds: HardwareReading[];
  className?: string;
}

export const RawFeedViewer: React.FC<RawFeedViewerProps> = ({
  latestReading,
  historicalFeeds,
  className = '',
}) => {
  const { config } = useApp();
  const [viewMode, setViewMode] = useState<'table' | 'json'>('table');
  const [copied, setCopied] = useState(false);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(historicalFeeds.slice(0, 20), null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCsv = () => {
    if (historicalFeeds.length === 0) return;
    const headers = ['Entry ID', 'Timestamp', 'Efficiency (%)', 'Power Loss (W)', 'Battery Utilisation (%)', 'Temperature (°C)', 'Field 1 Raw', 'Field 2 Raw', 'Field 3 Raw', 'Field 4 Raw', 'Field 5 Raw', 'Field 6 Raw'];
    const rows = historicalFeeds.map(feed => [
      feed.entryId,
      feed.timestamp,
      feed.efficiency ?? '',
      feed.powerLoss ?? '',
      feed.batteryUtilization ?? '',
      feed.temperature ?? '',
      feed.rawValues?.field1 ?? '',
      feed.rawValues?.field2 ?? '',
      feed.rawValues?.field3 ?? '',
      feed.rawValues?.field4 ?? '',
      feed.rawValues?.field5 ?? '',
      feed.rawValues?.field6 ?? '',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `thingspeak_channel_${config.channelId || '3484560'}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs dark:shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3.5">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">ThingSpeak Feed Stream Inspector</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Raw telemetry records received from Channel {config.channelId || '3484560'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Table / JSON Mode */}
          <div className="flex items-center p-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors ${
                viewMode === 'table' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Table className="w-3 h-3" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode('json')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors ${
                viewMode === 'json' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Code2 className="w-3 h-3" />
              <span>JSON</span>
            </button>
          </div>

          <button
            onClick={handleExportCsv}
            title="Download CSV"
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
          >
            <Download className="w-3 h-3" />
            <span>CSV</span>
          </button>

          {viewMode === 'json' && (
            <button
              onClick={handleCopyJson}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {viewMode === 'table' ? (
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Entry ID</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3 text-right">Field 1 (Efficiency)</th>
                <th className="py-2.5 px-3 text-right">Field 2 (Power Loss)</th>
                <th className="py-2.5 px-3 text-right">Field 3 (Battery Util)</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-slate-950/40">
              {historicalFeeds.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-slate-400 dark:text-slate-500">
                    No telemetry records available in buffer.
                  </td>
                </tr>
              ) : (
                historicalFeeds.slice(0, 15).map((feed, idx) => (
                  <tr key={feed.entryId || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-2 px-3 text-emerald-700 dark:text-emerald-400 font-bold font-mono">#{feed.entryId}</td>
                    <td className="py-2 px-3 text-slate-600 dark:text-slate-300">
                      {new Date(feed.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right text-emerald-700 dark:text-emerald-300 font-bold font-mono">
                      {feed.efficiency !== null ? `${feed.efficiency} %` : 'null'}
                    </td>
                    <td className="py-2 px-3 text-right text-amber-700 dark:text-amber-300 font-bold font-mono">
                      {feed.powerLoss !== null ? `${feed.powerLoss} W` : 'null'}
                    </td>
                    <td className="py-2 px-3 text-right text-violet-700 dark:text-violet-300 font-bold font-mono">
                      {feed.batteryUtilization !== null ? `${feed.batteryUtilization} %` : 'null'}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                        feed.isMock ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800' : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                      }`}>
                        {feed.isMock ? 'Demo' : 'Channel Sync'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 overflow-x-auto max-h-64 font-mono text-xs text-slate-800 dark:text-slate-300">
          <pre>
            {JSON.stringify(
              {
                channel: latestReading.channelMetadata || { id: config.channelId || 3484560, name: 'sic' },
                latestReading,
                sampleFeeds: historicalFeeds.slice(0, 5),
              },
              null,
              2
            )}
          </pre>
        </div>
      )}
    </div>
  );
};
