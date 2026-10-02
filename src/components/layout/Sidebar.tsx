import React from 'react';
import { useApp } from '../../context/AppContext';
import { PageId } from '../../types';
import {
  LayoutDashboard,
  Radio,
  BarChart3,
  BookOpen,
  Settings,
  CircleDot,
  Clock,
  Cpu,
  Layers,
} from 'lucide-react';

interface NavItem {
  id: PageId;
  label: string;
  sublabel: string;
  icon: React.ElementType;
  badge?: string;
}

const navItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Overview & Telemetry',
    sublabel: 'Executive Summary',
    icon: LayoutDashboard,
  },
  {
    id: 'telemetry',
    label: 'ThingSpeak Live Data',
    sublabel: 'Live Ingestion Stream',
    icon: Radio,
    badge: 'Live',
  },
  {
    id: 'comparison',
    label: 'Performance Comparison',
    sublabel: 'Si vs SiC Evaluation',
    icon: BarChart3,
  },
  {
    id: 'methodology',
    label: 'MATLAB Model & Docs',
    sublabel: 'Formulas & Methodology',
    icon: BookOpen,
  },
];

export const Sidebar: React.FC<{ onCloseMobile?: () => void }> = ({ onCloseMobile }) => {
  const {
    currentPage,
    setCurrentPage,
    lastUpdated,
    connectionStatus,
    setIsConfigModalOpen,
    config,
    channelInfo,
  } = useApp();

  const handleNavClick = (id: PageId) => {
    setCurrentPage(id);
    if (onCloseMobile) onCloseMobile();
  };

  // Map legacy page IDs to standard nav selection if needed
  const getNormalizedActiveId = (id: PageId): PageId => {
    if (id === 'thingspeak' || id === 'si-hardware') return 'telemetry';
    if (id === 'about' || id === 'sic-simulation') return 'methodology';
    return id;
  };

  const activeId = getNormalizedActiveId(currentPage);

  return (
    <aside className="w-64 flex flex-col h-full bg-white dark:bg-[#0e1017] border-r border-slate-200 dark:border-[#202532] text-slate-700 dark:text-slate-300 select-none transition-colors">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-200 dark:border-[#202532]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center flex-shrink-0">
            <Cpu className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-sm text-slate-900 dark:text-white truncate leading-tight tracking-tight">
              MOSFET Analysis
            </h1>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block truncate">
              MATLAB & ThingSpeak Telemetry
            </span>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-2.5 py-3 space-y-1 overflow-y-auto">
        <div className="px-2.5 pb-2 text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Navigation
        </div>

        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeId === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-all ${
                isActive
                  ? 'bg-slate-100 dark:bg-zinc-800/90 text-slate-950 dark:text-white font-semibold border border-slate-300/80 dark:border-zinc-700/80 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-zinc-900/60 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`} />
                <div className="truncate">
                  <div className="text-xs tracking-tight truncate">{item.label}</div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{item.sublabel}</div>
                </div>
              </div>

              {item.badge ? (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                  {item.badge}
                </span>
              ) : isActive ? (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 flex-shrink-0" />
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer: Connection Status & Channel Info */}
      <div className="p-3.5 border-t border-slate-200 dark:border-[#202532] bg-slate-50 dark:bg-[#0c0e14] space-y-2.5 text-xs">
        {/* Status Row */}
        <div className="p-2 rounded-md bg-white dark:bg-[#131620] border border-slate-200 dark:border-[#232836] flex items-center justify-between shadow-xs dark:shadow-none">
          <div className="flex items-center gap-2">
            <CircleDot className={`w-3.5 h-3.5 ${
              connectionStatus === 'connected' ? 'text-emerald-600 dark:text-emerald-400' :
              connectionStatus === 'mock' ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'
            }`} />
            <span className="text-slate-800 dark:text-slate-300 font-medium text-[11px]">
              {connectionStatus === 'connected' ? 'Channel Connected' :
               connectionStatus === 'mock' ? 'Demo Fallback' : 'Offline'}
            </span>
          </div>

          <button
            onClick={() => setIsConfigModalOpen(true)}
            className="p-1 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            title="Configure ThingSpeak Channel"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Metadata Details */}
        <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Channel ID:</span>
            <span className="font-mono text-emerald-700 dark:text-emerald-400 font-medium">{config.channelId || '3484560'}</span>
          </div>
          {channelInfo?.name && (
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Name:</span>
              <span className="font-mono text-slate-700 dark:text-slate-300 truncate max-w-[110px]">{channelInfo.name}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-slate-500">
              <Clock className="w-3 h-3 text-slate-400 dark:text-slate-600" /> Updated:
            </span>
            <span className="font-mono text-slate-700 dark:text-slate-300 text-[10px]">
              {lastUpdated ? lastUpdated.split(' ')[1] : 'Waiting...'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
