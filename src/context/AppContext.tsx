import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  PageId,
  HardwareReading,
  ThingSpeakConfig,
  ConnectionStatus,
  ComparisonMetrics,
  MatlabModelParameters,
} from '../types';
import { DEFAULT_THINGSPEAK_CONFIG, LOCAL_STORAGE_CONFIG_KEY } from '../config/thingspeak';
import { fetchLatestThingSpeakReading, fetchHistoricalThingSpeakFeeds, ThingSpeakChannelInfo } from '../services/thingspeak';
import { syncHardwareReading } from '../services/database';

interface AppContextType {
  currentPage: PageId;
  setCurrentPage: (page: PageId) => void;

  // SiC MOSFET Simulation Telemetry (from ThingSpeak Channel 3484560)
  sicData: HardwareReading;
  historicalSicData: HardwareReading[];
  sicChannelInfo: ThingSpeakChannelInfo | null;
  sicConnectionStatus: ConnectionStatus;

  // Si MOSFET Hardware Telemetry (Empty by default, awaiting hardware connection)
  siHardwareData: HardwareReading;
  historicalSiHardwareData: HardwareReading[];
  siChannelInfo: ThingSpeakChannelInfo | null;
  siConnectionStatus: ConnectionStatus;
  hasSiHardwareData: boolean;

  // Backward compatibility alias (points to sicData by default)
  hardwareData: HardwareReading;
  historicalHardwareData: HardwareReading[];
  channelInfo: ThingSpeakChannelInfo | null;
  connectionStatus: ConnectionStatus;

  // Telemetry status
  lastUpdated: string | null;
  errorMessage: string | null;
  isFetching: boolean;
  
  // Config & Auto-refresh
  config: ThingSpeakConfig;
  updateConfig: (newConfig: Partial<ThingSpeakConfig>) => void;
  resetConfigToDefault: () => void;
  refreshHardwareData: () => Promise<void>;
  countdownSeconds: number;

  // Derived Comparison Metrics
  comparisonMetrics: ComparisonMetrics;

  // Settings Modal Control
  isConfigModalOpen: boolean;
  setIsConfigModalOpen: (open: boolean) => void;

  // Theme Management (Light as default)
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);

  // Theme state: defaults to light theme!
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const savedTheme = localStorage.getItem('mosfet_dashboard_theme');
      if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
    } catch (e) {
      // ignore
    }
    return 'light'; // Default to light theme
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('mosfet_dashboard_theme', theme);
    } catch (e) {
      // ignore
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // 1. ThingSpeak Configuration State (persisted to LocalStorage)
  const [config, setConfig] = useState<ThingSpeakConfig>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_CONFIG_KEY);
      if (saved) {
        return { ...DEFAULT_THINGSPEAK_CONFIG, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to parse saved ThingSpeak config:', e);
    }
    return DEFAULT_THINGSPEAK_CONFIG;
  });

  const updateConfig = (newConfig: Partial<ThingSpeakConfig>) => {
    setConfig(prev => {
      const updated = { ...prev, ...newConfig };
      try {
        localStorage.setItem(LOCAL_STORAGE_CONFIG_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to persist ThingSpeak config:', e);
      }
      return updated;
    });
  };

  const resetConfigToDefault = () => {
    setConfig(DEFAULT_THINGSPEAK_CONFIG);
    localStorage.removeItem(LOCAL_STORAGE_CONFIG_KEY);
  };

  // 2. SiC MOSFET Simulation Telemetry State (Channel 3484560)
  const [sicData, setSicData] = useState<HardwareReading>({
    entryId: 1,
    timestamp: new Date().toISOString(),
    efficiency: 93.8,
    powerLoss: 0.35,
    batteryUtilization: 25.0,
    temperature: 25.05,
    isMock: false,
    hasData: true,
  });
  const [historicalSicData, setHistoricalSicData] = useState<HardwareReading[]>([
    {
      entryId: 1,
      timestamp: new Date().toISOString(),
      efficiency: 93.8,
      powerLoss: 0.35,
      batteryUtilization: 25.0,
      temperature: 25.05,
      isMock: false,
      hasData: true,
    },
  ]);
  const [sicChannelInfo, setSicChannelInfo] = useState<ThingSpeakChannelInfo | null>(null);
  const [sicConnectionStatus, setSicConnectionStatus] = useState<ConnectionStatus>('fetching');

  // 3. Si MOSFET Hardware Telemetry State (Empty until hardware channel connected)
  const [siHardwareData, setSiHardwareData] = useState<HardwareReading>({
    entryId: 0,
    timestamp: '',
    efficiency: null,
    powerLoss: null,
    batteryUtilization: null,
    temperature: null,
    isMock: false,
    hasData: false,
  });
  const [historicalSiHardwareData, setHistoricalSiHardwareData] = useState<HardwareReading[]>([]);
  const [siChannelInfo, setSiChannelInfo] = useState<ThingSpeakChannelInfo | null>(null);
  const [siConnectionStatus, setSiConnectionStatus] = useState<ConnectionStatus>('disconnected');

  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(config.autoRefreshIntervalSec);

  const formatTimestamp = (date: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };

  // Fetch logic for both SiC Simulation Channel & Si Hardware Channel
  const refreshHardwareData = useCallback(async () => {
    setIsFetching(true);
    setErrorMessage(null);
    setSicConnectionStatus('fetching');

    try {
      // 1. Fetch SiC Simulation Channel (Channel 3484560)
      const sicChannelConfig: ThingSpeakConfig = {
        channelId: config.sicChannelId || config.channelId || '3484560',
        readApiKey: config.sicReadApiKey || config.readApiKey || '80Q9HH2Y74UH2FRD',
        fieldMapping: config.sicFieldMapping || config.fieldMapping || {
          powerLossField: 3,
          efficiencyField: 4,
          temperatureField: 5,
          batteryUtilizationField: 6,
        },
        autoRefreshIntervalSec: config.autoRefreshIntervalSec,
        isAutoRefreshEnabled: config.isAutoRefreshEnabled,
        useMockFallback: config.useMockFallback,
        sicChannelId: config.sicChannelId || '3484560',
        sicReadApiKey: config.sicReadApiKey || '80Q9HH2Y74UH2FRD',
        sicFieldMapping: config.sicFieldMapping || { powerLossField: 3, efficiencyField: 4, temperatureField: 5, batteryUtilizationField: 6 },
        siChannelId: config.siChannelId || '',
        siReadApiKey: config.siReadApiKey || '',
        siFieldMapping: config.siFieldMapping || { powerLossField: 5, efficiencyField: 6, temperatureField: 7, batteryUtilizationField: 8 },
      };

      const histResult = await fetchHistoricalThingSpeakFeeds(sicChannelConfig, 100);
      if (histResult.channelInfo) {
        setSicChannelInfo(histResult.channelInfo);
      }
      if (histResult.feeds && histResult.feeds.length > 0) {
        setHistoricalSicData(histResult.feeds);
        const latest = histResult.feeds[histResult.feeds.length - 1];
        setSicData({ ...latest, hasData: true });
        syncHardwareReading(latest);
        setSicConnectionStatus(latest.isMock ? 'mock' : 'connected');
      } else {
        const latestResult = await fetchLatestThingSpeakReading(sicChannelConfig);
        if (latestResult.error) {
          setErrorMessage(latestResult.error);
          setSicConnectionStatus(config.useMockFallback ? 'mock' : 'error');
        } else {
          setSicConnectionStatus(latestResult.reading.isMock ? 'mock' : 'connected');
          setSicData({ ...latestResult.reading, hasData: true });
          syncHardwareReading(latestResult.reading);
        }
      }

      // 2. Fetch Si Hardware Channel if provided
      if (config.siChannelId && config.siChannelId.trim() !== '') {
        setSiConnectionStatus('fetching');
        const siChannelConfig: ThingSpeakConfig = {
          channelId: config.siChannelId.trim(),
          readApiKey: config.siReadApiKey?.trim() || '',
          fieldMapping: config.siFieldMapping || {
            powerLossField: 5,
            efficiencyField: 6,
            temperatureField: 7,
            batteryUtilizationField: 8,
          },
          autoRefreshIntervalSec: config.autoRefreshIntervalSec,
          isAutoRefreshEnabled: config.isAutoRefreshEnabled,
          useMockFallback: false,
          sicChannelId: config.sicChannelId || '3484560',
          sicReadApiKey: config.sicReadApiKey || '80Q9HH2Y74UH2FRD',
          sicFieldMapping: config.sicFieldMapping || { powerLossField: 3, efficiencyField: 4, temperatureField: 5, batteryUtilizationField: 6 },
          siChannelId: config.siChannelId,
          siReadApiKey: config.siReadApiKey,
          siFieldMapping: config.siFieldMapping,
        };

        const siHistResult = await fetchHistoricalThingSpeakFeeds(siChannelConfig, 100);
        if (siHistResult.channelInfo) {
          setSiChannelInfo(siHistResult.channelInfo);
        }
        if (siHistResult.feeds && siHistResult.feeds.length > 0) {
          setHistoricalSiHardwareData(siHistResult.feeds);
          const latestSi = siHistResult.feeds[siHistResult.feeds.length - 1];
          setSiHardwareData({ ...latestSi, hasData: true });
          setSiConnectionStatus('connected');
        } else {
          setSiConnectionStatus('error');
        }
      } else {
        // No Si Hardware channel configured yet
        setSiConnectionStatus('disconnected');
        setSiHardwareData({
          entryId: 0,
          timestamp: '',
          efficiency: null,
          powerLoss: null,
          batteryUtilization: null,
          temperature: null,
          hasData: false,
        });
        setHistoricalSiHardwareData([]);
      }

      setLastUpdated(formatTimestamp(new Date()));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to retrieve telemetry.';
      setErrorMessage(msg);
      setSicConnectionStatus(config.useMockFallback ? 'mock' : 'error');
    } finally {
      setIsFetching(false);
      setCountdownSeconds(config.autoRefreshIntervalSec);
    }
  }, [config]);

  // Initial fetch
  useEffect(() => {
    refreshHardwareData();
  }, [refreshHardwareData]);

  // Auto-refresh timer loop
  useEffect(() => {
    if (!config.isAutoRefreshEnabled) return;

    const interval = setInterval(() => {
      setCountdownSeconds(prev => {
        if (prev <= 1) {
          refreshHardwareData();
          return config.autoRefreshIntervalSec;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [config.isAutoRefreshEnabled, config.autoRefreshIntervalSec, refreshHardwareData]);

  // 4. Comparison Calculations (SiC vs Si)
  const hasSiHardwareData = Boolean(siHardwareData.hasData && (siHardwareData.powerLoss !== null || siHardwareData.efficiency !== null));

  const comparisonMetrics: ComparisonMetrics = useMemo(() => {
    const sicPowerLoss = sicData.powerLoss;
    const siPowerLoss = siHardwareData.powerLoss;
    
    let powerLossDiff: number | null = null;
    let powerLossReductionPercent: number | null = null;
    if (sicPowerLoss !== null && siPowerLoss !== null) {
      powerLossDiff = Number((siPowerLoss - sicPowerLoss).toFixed(2));
      powerLossReductionPercent = siPowerLoss > 0
        ? Number((((siPowerLoss - sicPowerLoss) / siPowerLoss) * 100).toFixed(1))
        : 0;
    }

    const sicEfficiency = sicData.efficiency;
    const siEfficiency = siHardwareData.efficiency;
    let efficiencyDiff: number | null = null;
    if (sicEfficiency !== null && siEfficiency !== null) {
      efficiencyDiff = Number((sicEfficiency - siEfficiency).toFixed(1));
    }

    return {
      sicPowerLoss,
      siPowerLoss,
      powerLossDifference: powerLossDiff,
      powerLossReductionPercent,
      sicEfficiency,
      siEfficiency,
      efficiencyDifference: efficiencyDiff,
      sicBatteryUtilization: sicData.batteryUtilization,
      siBatteryUtilization: siHardwareData.batteryUtilization,
      sicTemperature: sicData.temperature,
      siTemperature: siHardwareData.temperature,
      hasSiHardwareData,
      hasSiCSimulationData: Boolean(sicData.powerLoss !== null || sicData.efficiency !== null),
      isSiCBetterPowerLoss: sicPowerLoss !== null && siPowerLoss !== null ? sicPowerLoss < siPowerLoss : true,
      isSiCBetterEfficiency: sicEfficiency !== null && siEfficiency !== null ? sicEfficiency > siEfficiency : true,
    };
  }, [sicData, siHardwareData, hasSiHardwareData]);

  return (
    <AppContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        sicData,
        historicalSicData,
        sicChannelInfo,
        sicConnectionStatus,
        siHardwareData,
        historicalSiHardwareData,
        siChannelInfo,
        siConnectionStatus,
        hasSiHardwareData,
        hardwareData: sicData, // backward compatibility
        historicalHardwareData: historicalSicData,
        channelInfo: sicChannelInfo,
        connectionStatus: sicConnectionStatus,
        lastUpdated,
        errorMessage,
        isFetching,
        config,
        updateConfig,
        resetConfigToDefault,
        refreshHardwareData,
        countdownSeconds,
        comparisonMetrics,
        isConfigModalOpen,
        setIsConfigModalOpen,
        theme,
        toggleTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
