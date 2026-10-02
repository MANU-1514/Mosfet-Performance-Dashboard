// Types for MATLAB Telemetry, MOSFET Comparison, and ThingSpeak Data

export type PageId = 
  | 'dashboard'
  | 'telemetry'
  | 'comparison'
  | 'methodology'
  // Legacy aliases supported for smooth routing:
  | 'thingspeak'
  | 'si-hardware'
  | 'sic-simulation'
  | 'about';

export interface SimulationParameters {
  inputVoltage: number;       // Vin (V)
  outputVoltage: number;      // Vout (V)
  loadCurrent: number;        // Iload (A)
  switchingFrequency: number; // fsw (kHz)
  dutyCycle: number;          // D (%)
  mosfetCurrent: number;      // Ids (A)
  rdsOn: number;              // Rdson (mOhm)
  conductionLoss: number;     // P_cond (W)
  switchingLoss: number;      // P_sw (W)
  totalPowerLoss: number;     // Ploss (W)
  inputPower: number;         // Pin (W)
  outputPower: number;        // Pout (W)
  efficiency: number;         // %
  estimatedJunctionTemp?: number; // Tj (°C)
}

export interface SavedSimulationScenario {
  id: string;
  title: string;
  timestamp: string;
  params: SimulationParameters;
  notes?: string;
}

export interface DeviceTelemetryReading {
  id?: string;
  entryId: number;
  timestamp: string;          // ISO string or formatted date
  powerLoss: number | null;   // W
  efficiency: number | null;  // %
  batteryUtilization: number | null; // %
  temperature: number | null; // °C
  rawValues?: Record<string, string | null>;
  channelMetadata?: {
    id: number;
    name: string;
    field1?: string;
    field2?: string;
    field3?: string;
    field4?: string;
    field5?: string;
    field6?: string;
    field7?: string;
    field8?: string;
    updated_at?: string;
  };
  isMock?: boolean;
  hasData?: boolean;
}

// Alias for backward compatibility
export type HardwareReading = DeviceTelemetryReading;

export interface ThingSpeakFieldMapping {
  efficiencyField: number;        // e.g. 1
  powerLossField: number;         // e.g. 2
  batteryUtilizationField: number;// e.g. 3
  temperatureField: number;       // e.g. 4
}

export interface DualChannelConfig {
  // SiC Simulation Channel (Active default: 3484560)
  sicChannelId: string;
  sicReadApiKey: string;
  sicFieldMapping: ThingSpeakFieldMapping;

  // Si Hardware Channel (Optional / Empty until connected)
  siChannelId: string;
  siReadApiKey: string;
  siFieldMapping: ThingSpeakFieldMapping;

  autoRefreshIntervalSec: number;
  isAutoRefreshEnabled: boolean;
  useMockFallback: boolean;

  // Backward compatibility fields:
  channelId?: string;
  readApiKey?: string;
  fieldMapping?: ThingSpeakFieldMapping;
}

export type ThingSpeakConfig = DualChannelConfig;

export type ConnectionStatus = 'connected' | 'disconnected' | 'fetching' | 'error' | 'mock';

export interface ComparisonMetrics {
  sicPowerLoss: number | null;
  siPowerLoss: number | null;
  powerLossDifference: number | null; // Si - SiC (W)
  powerLossReductionPercent: number | null; // ((Si - SiC) / Si) * 100 (%)
  
  sicEfficiency: number | null;
  siEfficiency: number | null;
  efficiencyDifference: number | null; // SiC - Si (percentage points)
  
  sicBatteryUtilization: number | null;
  siBatteryUtilization: number | null;
  sicTemperature: number | null;
  siTemperature: number | null;

  hasSiHardwareData: boolean;
  hasSiCSimulationData: boolean;

  isSiCBetterPowerLoss: boolean;
  isSiCBetterEfficiency: boolean;
}

export interface MatlabModelParameters {
  inputVoltage: number;       // Vin (V)
  outputVoltage: number;      // Vout (V)
  loadCurrent: number;        // Iload (A)
  switchingFrequency: number; // fsw (kHz)
  dutyCycle: number;          // D (%)
  mosfetCurrent: number;      // Ids (A)
  rdsOn: number;              // Rdson (mOhm)
  conductionLoss: number;     // P_cond (W)
  switchingLoss: number;      // P_sw (W)
  totalPowerLoss: number;     // Ploss (W)
  efficiency: number;         // %
  estimatedJunctionTemp: number; // °C
}

export interface DatabaseRecord<T> {
  id: string;
  timestamp: string;
  data: T;
  source: 'telemetry' | 'comparison' | 'methodology' | 'simulation' | 'hardware';
}
