import { HardwareReading, SimulationParameters, SavedSimulationScenario } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';
import { LOCAL_STORAGE_SIM_HISTORY_KEY } from '../config/thingspeak';

export interface ComparisonRecord {
  id: string;
  timestamp: string;
  sicPowerLoss: number;
  siPowerLoss: number;
  sicEfficiency: number;
  siEfficiency: number;
  powerLossReduction: number;
  efficiencyImprovement: number;
}

/**
 * Saves a simulation result to local storage and Supabase if configured
 */
export async function saveSimulationRecord(
  params: SimulationParameters,
  title?: string
): Promise<{ success: boolean; id: string }> {
  const id = `sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const record: SavedSimulationScenario = {
    id,
    title: title || `Simulation Run (${params.inputVoltage}V → ${params.outputVoltage}V @ ${params.loadCurrent}A)`,
    timestamp: new Date().toISOString(),
    params,
  };

  // 1. Save to LocalStorage
  try {
    const existing = getSavedSimulationRecords();
    const updated = [record, ...existing].slice(0, 50); // Keep last 50
    localStorage.setItem(LOCAL_STORAGE_SIM_HISTORY_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save simulation to local storage:', err);
  }

  // 2. Sync to Supabase if configured
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('simulation_results').insert([
        {
          input_voltage: params.inputVoltage,
          output_voltage: params.outputVoltage,
          load_current: params.loadCurrent,
          switching_frequency: params.switchingFrequency,
          duty_cycle: params.dutyCycle,
          conduction_loss: params.conductionLoss,
          switching_loss: params.switchingLoss,
          total_power_loss: params.totalPowerLoss,
          efficiency: params.efficiency,
        },
      ]);
    } catch (err) {
      console.warn('Supabase simulation sync failed:', err);
    }
  }

  return { success: true, id };
}

/**
 * Retrieves saved simulations from local storage
 */
export function getSavedSimulationRecords(): SavedSimulationScenario[] {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_SIM_HISTORY_KEY);
    if (!data) return [];
    return JSON.parse(data) as SavedSimulationScenario[];
  } catch {
    return [];
  }
}

/**
 * Deletes a saved simulation scenario
 */
export function deleteSimulationRecord(id: string): void {
  try {
    const existing = getSavedSimulationRecords();
    const updated = existing.filter(item => item.id !== id);
    localStorage.setItem(LOCAL_STORAGE_SIM_HISTORY_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to delete simulation record:', err);
  }
}

/**
 * Synchronizes hardware telemetry to database while avoiding duplicate entries
 */
const syncedEntryIds = new Set<number>();

export async function syncHardwareReading(reading: HardwareReading): Promise<void> {
  if (!reading || !reading.entryId || syncedEntryIds.has(reading.entryId)) {
    return;
  }

  syncedEntryIds.add(reading.entryId);

  if (isSupabaseConfigured && supabase && !reading.isMock) {
    try {
      await supabase.from('hardware_results').upsert(
        [
          {
            entry_id: reading.entryId,
            timestamp: reading.timestamp,
            power_loss: reading.powerLoss,
            efficiency: reading.efficiency,
            temperature: reading.temperature,
            battery_utilization: reading.batteryUtilization,
            source: 'thingspeak',
          },
        ],
        { onConflict: 'entry_id' }
      );
    } catch (err) {
      console.warn('Supabase hardware sync error:', err);
    }
  }
}

/**
 * Saves a comparative analysis snapshot
 */
export async function saveComparisonRecord(
  sicLoss: number,
  siLoss: number,
  sicEff: number,
  siEff: number
): Promise<void> {
  const reduction = siLoss > 0 ? Number((((siLoss - sicLoss) / siLoss) * 100).toFixed(2)) : 0;
  const effDiff = Number((sicEff - siEff).toFixed(2));

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('comparison_results').insert([
        {
          sic_power_loss: sicLoss,
          si_power_loss: siLoss,
          sic_efficiency: sicEff,
          si_efficiency: siEff,
          power_loss_reduction: reduction,
          efficiency_improvement: effDiff,
        },
      ]);
    } catch (err) {
      console.warn('Supabase comparison sync error:', err);
    }
  }
}
