import { SimulationParameters } from '../types';

export interface SimulationPreset {
  id: string;
  name: string;
  description: string;
  params: Omit<SimulationParameters, 'inputPower' | 'outputPower' | 'totalPowerLoss' | 'efficiency' | 'estimatedJunctionTemp'>;
}

export const SIMULATION_PRESETS: SimulationPreset[] = [
  {
    id: 'ev-dcdc',
    name: 'EV DC-DC Converter (400V → 48V)',
    description: 'High-voltage electric vehicle auxiliary power converter running at 150 kHz.',
    params: {
      inputVoltage: 400,
      outputVoltage: 48,
      loadCurrent: 25,
      switchingFrequency: 150,
      dutyCycle: 12,
      mosfetCurrent: 8.66,
      rdsOn: 25, // 25 mOhm SiC MOSFET
      conductionLoss: 1.88,
      switchingLoss: 3.42,
    },
  },
  {
    id: 'buck-48-12',
    name: 'Sync Buck Converter (48V → 12V)',
    description: 'Telecom / Server step-down converter with 20A continuous load at 100 kHz.',
    params: {
      inputVoltage: 48,
      outputVoltage: 12,
      loadCurrent: 20,
      switchingFrequency: 100,
      dutyCycle: 25,
      mosfetCurrent: 10,
      rdsOn: 12, // 12 mOhm SiC
      conductionLoss: 1.20,
      switchingLoss: 1.85,
    },
  },
  {
    id: 'solar-boost',
    name: 'Solar PV Boost Stage (300V → 600V)',
    description: 'Renewable energy Maximum Power Point Tracking (MPPT) boost stage at 80 kHz.',
    params: {
      inputVoltage: 300,
      outputVoltage: 600,
      loadCurrent: 10,
      switchingFrequency: 80,
      dutyCycle: 50,
      mosfetCurrent: 7.07,
      rdsOn: 40, // 40 mOhm SiC
      conductionLoss: 2.0,
      switchingLoss: 4.8,
    },
  },
  {
    id: 'motor-inverter',
    name: 'High-Power Inverter (650V @ 15A)',
    description: 'SiC traction drive inverter stage with ultra-low switching overhead.',
    params: {
      inputVoltage: 650,
      outputVoltage: 400,
      loadCurrent: 15,
      switchingFrequency: 60,
      dutyCycle: 61.5,
      mosfetCurrent: 11.77,
      rdsOn: 30,
      conductionLoss: 4.16,
      switchingLoss: 6.24,
    },
  },
];

/**
 * Calculates complete simulation outputs based on physical parameters
 */
export function calculateSimulationResults(
  inputParams: Partial<SimulationParameters>,
  autoCalculateLosses: boolean = false
): SimulationParameters {
  const inputVoltage = Math.max(0.1, Number(inputParams.inputVoltage ?? 48));
  const outputVoltage = Math.max(0.1, Number(inputParams.outputVoltage ?? 12));
  const loadCurrent = Math.max(0.1, Number(inputParams.loadCurrent ?? 20));
  const switchingFrequency = Math.max(1, Number(inputParams.switchingFrequency ?? 100)); // kHz
  const rdsOn = Math.max(1, Number(inputParams.rdsOn ?? 15)); // mOhm
  
  // Calculate Duty Cycle if not explicitly supplied or in auto mode
  let dutyCycle = Number(inputParams.dutyCycle);
  if (isNaN(dutyCycle) || dutyCycle <= 0 || dutyCycle > 100) {
    dutyCycle = Math.min(99.9, Math.max(1, (outputVoltage / inputVoltage) * 100));
  }

  // Calculated RMS MOSFET Current for Buck topology: I_rms = I_load * sqrt(D)
  const dNorm = Math.min(1, Math.max(0.01, dutyCycle / 100));
  const calculatedMosfetCurrent = Number((loadCurrent * Math.sqrt(dNorm)).toFixed(2));
  const mosfetCurrent = inputParams.mosfetCurrent !== undefined && !autoCalculateLosses
    ? Number(inputParams.mosfetCurrent)
    : calculatedMosfetCurrent;

  let conductionLoss: number;
  let switchingLoss: number;

  if (autoCalculateLosses) {
    // Conduction loss: P_cond = I_rms^2 * (Rds_on / 1000)
    conductionLoss = Number((Math.pow(mosfetCurrent, 2) * (rdsOn / 1000)).toFixed(2));
    
    // Switching loss: P_sw = 0.5 * Vin * Iload * (t_rise + t_fall) * f_sw
    // For SiC typical rise+fall time is ~15ns
    const tSwitch = 15e-9; // 15 ns
    const fSwHz = switchingFrequency * 1000;
    switchingLoss = Number((0.5 * inputVoltage * loadCurrent * tSwitch * fSwHz).toFixed(2));
  } else {
    conductionLoss = Math.max(0, Number(inputParams.conductionLoss ?? 1.20));
    switchingLoss = Math.max(0, Number(inputParams.switchingLoss ?? 1.85));
  }

  // Total power loss
  const totalPowerLoss = Number((conductionLoss + switchingLoss).toFixed(2));

  // Output Power: Pout = Vout * Iload
  const outputPower = Number((outputVoltage * loadCurrent).toFixed(2));

  // Input Power: Pin = Pout + Ploss
  const inputPower = Number((outputPower + totalPowerLoss).toFixed(2));

  // Efficiency: (Pout / Pin) * 100
  const efficiency = inputPower > 0
    ? Number(((outputPower / inputPower) * 100).toFixed(2))
    : 0;

  // Thermal Junction Temp Estimation (Ambient 25°C + Ploss * Rth_ja 2.5°C/W)
  const estimatedJunctionTemp = Number((25 + totalPowerLoss * 2.5).toFixed(1));

  return {
    inputVoltage,
    outputVoltage,
    loadCurrent,
    switchingFrequency,
    dutyCycle: Number(dutyCycle.toFixed(1)),
    mosfetCurrent,
    rdsOn,
    conductionLoss,
    switchingLoss,
    totalPowerLoss,
    inputPower,
    outputPower,
    efficiency: Math.min(100, Math.max(0, efficiency)),
    estimatedJunctionTemp,
  };
}
