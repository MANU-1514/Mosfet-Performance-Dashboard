import React from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import {
  RotateCw,
  Settings,
  Menu,
  Pause,
  Play,
  Clock,
  Sun,
  Moon,
} from 'lucide-react';

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const {
    connectionStatus,
    lastUpdated,
    refreshHardwareData,
    isFetching,
    config,
    updateConfig,
    countdownSeconds,
    setIsConfigModalOpen,
    theme,
    toggleTheme,
  } = useApp();

  return (
    <header className="h-14 border-b border-slate-200 dark:border-[#202532] bg-white dark:bg-[#0c0d12] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 transition-colors shadow-xs dark:shadow-none">
      {/* Left: Mobile Menu Toggle & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-1.5 rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>MOSFET Performance Evaluation</span>
            <span className="hidden sm:inline-block text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-[#161a24] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#262c3a]">
              ThingSpeak {config.channelId || '3484560'}
            </span>
          </h2>
        </div>
      </div>

      {/* Right: ThingSpeak Status, Timestamp, Controls */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Connection Status Badge */}
        <div className="hidden sm:flex items-center">
          <StatusBadge status={connectionStatus} isFetching={isFetching} />
        </div>

        {/* Timestamp */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-mono bg-slate-100 dark:bg-[#12151d] px-2.5 py-1 rounded border border-slate-200 dark:border-[#232836]">
          <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          <span>Synced: <strong className="text-slate-800 dark:text-slate-200">{lastUpdated ? lastUpdated.split(' ')[1] : 'Waiting...'}</strong></span>
        </div>

        {/* Auto Refresh Countdown Badge */}
        {config.isAutoRefreshEnabled && (
          <div className="hidden xl:flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-400 font-mono bg-slate-100 dark:bg-[#12151d] px-2 py-1 rounded border border-slate-200 dark:border-[#232836]">
            <span>Poll:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{countdownSeconds}s</span>
          </div>
        )}

        {/* Toggle Auto Refresh */}
        <button
          onClick={() => updateConfig({ isAutoRefreshEnabled: !config.isAutoRefreshEnabled })}
          title={config.isAutoRefreshEnabled ? 'Pause Auto-Refresh' : 'Enable Auto-Refresh'}
          className={`p-1.5 rounded-md border text-xs transition-colors hidden sm:flex items-center justify-center ${
            config.isAutoRefreshEnabled
              ? 'bg-slate-100 dark:bg-[#12151d] border-slate-200 dark:border-[#232836] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'
          }`}
        >
          {config.isAutoRefreshEnabled ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>

        {/* Manual Refresh Button */}
        <button
          onClick={() => refreshHardwareData()}
          disabled={isFetching}
          title="Refresh Telemetry"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white dark:bg-[#1a1d26] dark:hover:bg-[#232733] font-medium text-xs border border-slate-800 dark:border-[#2d3242] transition-colors disabled:opacity-50 shadow-xs"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-emerald-400' : 'text-slate-300'}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>

        {/* Theme Toggle Button (Light / Dark) */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          className="p-1.5 rounded-md bg-slate-100 dark:bg-[#12151d] hover:bg-slate-200 dark:hover:bg-[#1a1e28] border border-slate-200 dark:border-[#232836] text-slate-700 dark:text-slate-300 transition-colors"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* Settings Button */}
        <button
          onClick={() => setIsConfigModalOpen(true)}
          title="Configure Channel & API Keys"
          className="p-1.5 rounded-md bg-slate-100 dark:bg-[#12151d] hover:bg-slate-200 dark:hover:bg-[#1a1e28] border border-slate-200 dark:border-[#232836] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
