import React from 'react';
import { ConnectionStatus } from '../../types';
import { Wifi, WifiOff, RefreshCw, AlertTriangle, Cpu } from 'lucide-react';

interface StatusBadgeProps {
  status: ConnectionStatus;
  isFetching?: boolean;
  className?: string;
  showText?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  isFetching = false,
  className = '',
  showText = true,
}) => {
  if (isFetching) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-950/40 text-emerald-300 border border-emerald-800/60 ${className}`}>
        <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
        {showText && <span>Syncing...</span>}
      </span>
    );
  }

  switch (status) {
    case 'connected':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 ${className}`}>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-live" />
          <Wifi className="w-3.5 h-3.5" />
          {showText && <span>ThingSpeak Connected</span>}
        </span>
      );
    case 'mock':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30 ${className}`}>
          <Cpu className="w-3.5 h-3.5" />
          {showText && <span>Demo Mock Mode</span>}
        </span>
      );
    case 'error':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30 ${className}`}>
          <AlertTriangle className="w-3.5 h-3.5" />
          {showText && <span>Connection Error</span>}
        </span>
      );
    case 'disconnected':
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700 ${className}`}>
          <WifiOff className="w-3.5 h-3.5" />
          {showText && <span>Disconnected</span>}
        </span>
      );
  }
};
