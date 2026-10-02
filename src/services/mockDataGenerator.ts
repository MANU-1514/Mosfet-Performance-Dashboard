import { HardwareReading } from '../types';

/**
 * Realistic Mock Hardware Generator for Silicon (Si) MOSFET Telemetry
 * Used when ThingSpeak channel is not yet configured or offline.
 */

let baseTemperature = 58.4;
let baseBattery = 84.5;
let basePowerLoss = 5.25;
let baseEfficiency = 89.6;
let mockEntryCounter = 1000;

export function generateLatestMockReading(): HardwareReading {
  mockEntryCounter++;
  
  // Subtle drift and noise to simulate real-world thermal and electrical sensors
  const tempNoise = (Math.random() - 0.48) * 0.6;
  baseTemperature = Math.min(85, Math.max(38, baseTemperature + tempNoise));

  const lossNoise = (Math.random() - 0.5) * 0.15;
  basePowerLoss = Math.min(10, Math.max(2.5, basePowerLoss + lossNoise));

  const effNoise = (Math.random() - 0.5) * 0.1;
  baseEfficiency = Math.min(94, Math.max(82, baseEfficiency + effNoise));

  // Slow battery depletion over time
  baseBattery = Math.max(12, baseBattery - (0.01 + Math.random() * 0.02));

  return {
    entryId: mockEntryCounter,
    timestamp: new Date().toISOString(),
    powerLoss: Number(basePowerLoss.toFixed(2)),
    efficiency: Number(baseEfficiency.toFixed(2)),
    temperature: Number(baseTemperature.toFixed(1)),
    batteryUtilization: Number(baseBattery.toFixed(1)),
    rawValues: {
      field1: basePowerLoss.toFixed(2),
      field2: baseEfficiency.toFixed(2),
      field3: baseTemperature.toFixed(1),
      field4: baseBattery.toFixed(1),
    },
    isMock: true,
  };
}

export function generateHistoricalMockReadings(count: number = 60): HardwareReading[] {
  const readings: HardwareReading[] = [];
  const now = Date.now();
  const stepMs = (24 * 3600 * 1000) / count; // Spread evenly across 24 hours

  let temp = 48.0;
  let bat = 98.0;
  let loss = 4.8;
  let eff = 90.2;

  for (let i = count - 1; i >= 0; i--) {
    const time = new Date(now - i * stepMs).toISOString();
    
    // Thermal rise with load cycle
    const cycle = Math.sin((count - i) / 5);
    temp = 52 + cycle * 9 + (Math.random() - 0.5) * 1.5;
    loss = 4.9 + cycle * 0.8 + (Math.random() - 0.5) * 0.2;
    eff = 89.5 - cycle * 0.6 + (Math.random() - 0.5) * 0.2;
    bat = Math.max(15, 98 - ((count - i) / count) * 28 + (Math.random() - 0.5) * 0.4);

    readings.push({
      entryId: 900 + (count - i),
      timestamp: time,
      powerLoss: Number(loss.toFixed(2)),
      efficiency: Number(eff.toFixed(2)),
      temperature: Number(temp.toFixed(1)),
      batteryUtilization: Number(bat.toFixed(1)),
      rawValues: {
        field1: loss.toFixed(2),
        field2: eff.toFixed(2),
        field3: temp.toFixed(1),
        field4: bat.toFixed(1),
      },
      isMock: true,
    });
  }

  return readings;
}

/**
 * Generates an extended continuous time-series profile for the SiC MOSFET simulation
 * centered around the exact live parameters streamed from ThingSpeak (efficiency, power loss, temp, battery).
 */
export function generateSicSimulationProfile(
  baseReading?: Partial<HardwareReading>,
  count: number = 24
): HardwareReading[] {
  const readings: HardwareReading[] = [];
  const baseEff = baseReading?.efficiency ?? 93.8;
  const baseLoss = baseReading?.powerLoss ?? 0.35;
  const baseTemp = baseReading?.temperature ?? 25.05;
  const baseBat = baseReading?.batteryUtilization ?? 25.0;

  const now = Date.now();
  const stepMs = (12 * 3600 * 1000) / count; // 12 hours time-series

  for (let i = count - 1; i >= 0; i--) {
    const time = new Date(now - i * stepMs).toISOString();
    const progress = (count - i) / count;
    const wave = Math.sin(progress * Math.PI * 3);

    // Realistic switching ripple and thermal stabilization around MATLAB baseline:
    const eff = Number(Math.min(99.5, Math.max(90, baseEff + wave * 0.4 + (Math.random() - 0.5) * 0.15)).toFixed(2));
    const loss = Number(Math.max(0.1, baseLoss - wave * 0.03 + (Math.random() - 0.5) * 0.02).toFixed(2));
    const temp = Number((baseTemp - (1 - progress) * 1.8 + Math.abs(wave) * 0.4).toFixed(1));
    const bat = Number(Math.max(0, baseBat - progress * 2.5).toFixed(1));

    readings.push({
      entryId: i === 0 && baseReading?.entryId ? baseReading.entryId : (100 + (count - i)),
      timestamp: i === 0 && baseReading?.timestamp ? baseReading.timestamp : time,
      efficiency: i === 0 ? baseEff : eff,
      powerLoss: i === 0 ? baseLoss : loss,
      temperature: i === 0 ? baseTemp : temp,
      batteryUtilization: i === 0 ? baseBat : bat,
      rawValues: {
        field1: (i === 0 ? baseLoss : loss).toString(),
        field2: (i === 0 ? baseEff : eff).toString(),
        field3: (i === 0 ? baseTemp : temp).toString(),
        field4: (i === 0 ? baseBat : bat).toString(),
      },
      isMock: i !== 0,
      hasData: true,
    });
  }

  return readings;
}

/**
 * Generates an extended continuous time-series profile for the Si MOSFET Hardware
 * centered around the exact live parameters streamed from ThingSpeak Channel 3482521 (efficiency, power loss, temp, battery).
 */
export function generateSiHardwareProfile(
  baseReading?: Partial<HardwareReading>,
  count: number = 30
): HardwareReading[] {
  const readings: HardwareReading[] = [];
  const baseEff = baseReading?.efficiency ?? 91.89;
  const baseLoss = baseReading?.powerLoss ?? 1.80;
  const baseTemp = baseReading?.temperature ?? 48.0;
  const baseBat = baseReading?.batteryUtilization ?? 34.85;

  const now = Date.now();
  const stepMs = (12 * 3600 * 1000) / count;

  for (let i = count - 1; i >= 0; i--) {
    const time = new Date(now - i * stepMs).toISOString();
    const progress = (count - i) / count;
    const cycle = Math.sin(progress * Math.PI * 4);

    const eff = Number(Math.min(94, Math.max(88, baseEff + cycle * 0.4 + (Math.random() - 0.5) * 0.2)).toFixed(2));
    const loss = Number(Math.max(1.2, baseLoss + cycle * 0.15 + (Math.random() - 0.5) * 0.05).toFixed(2));
    const temp = Number((baseTemp - (1 - progress) * 4.5 + Math.abs(cycle) * 1.2).toFixed(1));
    const bat = Number(Math.max(10, baseBat - progress * 4.0).toFixed(1));

    readings.push({
      entryId: i === 0 && baseReading?.entryId ? baseReading.entryId : (180 + (count - i)),
      timestamp: i === 0 && baseReading?.timestamp ? baseReading.timestamp : time,
      efficiency: i === 0 ? baseEff : eff,
      powerLoss: i === 0 ? baseLoss : loss,
      temperature: i === 0 ? baseTemp : temp,
      batteryUtilization: i === 0 ? baseBat : bat,
      rawValues: {
        field1: '11.1',
        field2: '2.0',
        field3: '12.0',
        field4: '1.7',
        field5: (i === 0 ? baseLoss : loss).toString(),
        field6: (i === 0 ? baseEff : eff).toString(),
        field7: (i === 0 ? baseTemp : temp).toString(),
        field8: (i === 0 ? baseBat : bat).toString(),
      },
      isMock: i !== 0,
      hasData: true,
    });
  }

  return readings;
}
