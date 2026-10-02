import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ThingSpeakConfigModal } from '../thingspeak/ThingSpeakConfigModal';
import { useApp } from '../../context/AppContext';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { errorMessage, connectionStatus, refreshHardwareData, setIsConfigModalOpen } = useApp();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-[#0c0d12] text-slate-900 dark:text-slate-100 font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-full flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 w-72 h-full bg-white dark:bg-[#0e1017] border-r border-slate-200 dark:border-[#202532] shadow-2xl">
            <Sidebar onCloseMobile={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <Header onOpenMobileMenu={() => setMobileOpen(true)} />

        {/* Global Connection Error Alert Banner if ThingSpeak is offline and not in demo mode */}
        {connectionStatus === 'error' && errorMessage && (
          <div className="bg-rose-50 dark:bg-rose-950/80 border-b border-rose-200 dark:border-rose-800 px-4 py-2 text-xs flex items-center justify-between text-rose-800 dark:text-rose-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
              <span>
                <strong>ThingSpeak Connection Error:</strong> {errorMessage}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsConfigModalOpen(true)}
                className="underline hover:text-rose-950 dark:hover:text-white"
              >
                Check Settings
              </button>
              <button
                onClick={() => refreshHardwareData()}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-rose-100 hover:bg-rose-200 dark:bg-rose-900 dark:hover:bg-rose-800 border border-rose-300 dark:border-rose-700 text-rose-900 dark:text-white font-medium"
              >
                <RefreshCw className="w-3 h-3" /> Retry
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Page Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {children}
        </main>
      </div>

      {/* ThingSpeak Configuration Modal */}
      <ThingSpeakConfigModal />
    </div>
  );
};
