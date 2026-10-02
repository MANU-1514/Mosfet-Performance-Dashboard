import { ThingSpeakConfig } from '../types';

/**
 * ThingSpeak Configuration
 * 
 * 1. SiC MOSFET Simulation Channel (Active from MATLAB):
 *    - Channel ID: 3484560
 *    - Read API Key: 80Q9HH2Y74UH2FRD
 *    - Field 1: Input Power (W)
 *    - Field 2: Output Power (W)
 *    - Field 3: Power Loss (W)
 *    - Field 4: Efficiency (%)
 *    - Field 5: MOSFET Temperature (°C)
 *    - Field 6: Battery Utilization (%)
 * 
 * 2. Si MOSFET Hardware Channel (Live Hardware Channel: 3482521):
 *    - Channel ID: Configurable via UI or .env
 */

export const DEFAULT_THINGSPEAK_CONFIG: ThingSpeakConfig = {
  // SiC Simulation Stream (MATLAB)
  sicChannelId: import.meta.env?.VITE_THINGSPEAK_CHANNEL_ID || '3484560',
  sicReadApiKey: import.meta.env?.VITE_THINGSPEAK_READ_API_KEY || '80Q9HH2Y74UH2FRD',
  sicFieldMapping: {
    powerLossField: 3,
    efficiencyField: 4,
    temperatureField: 5,
    batteryUtilizationField: 6,
  },

  // Si Hardware Stream (Live Hardware Channel: 3482521)
  siChannelId: import.meta.env?.VITE_THINGSPEAK_SI_CHANNEL_ID || '3482521',
  siReadApiKey: import.meta.env?.VITE_THINGSPEAK_SI_READ_API_KEY || '36FWK03IR3EVL2Z3',
  siFieldMapping: {
    powerLossField: 5,
    efficiencyField: 6,
    temperatureField: 7,
    batteryUtilizationField: 8,
  },

  autoRefreshIntervalSec: 15,
  isAutoRefreshEnabled: true,
  useMockFallback: false,

  // Backward compatibility:
  channelId: '3484560',
  readApiKey: '80Q9HH2Y74UH2FRD',
  fieldMapping: {
    powerLossField: 3,
    efficiencyField: 4,
    temperatureField: 5,
    batteryUtilizationField: 6,
  },
};

export const LOCAL_STORAGE_CONFIG_KEY = 'mosfet_app_thingspeak_config_v5';
export const LOCAL_STORAGE_SIM_HISTORY_KEY = 'mosfet_app_sim_history_v5';
export const LOCAL_STORAGE_HW_CACHE_KEY = 'mosfet_app_hw_cache_v5';
