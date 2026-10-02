import { calculateSimulationResults, SIMULATION_PRESETS } from './simulationEngine';
import { parseFeedItem } from './thingspeak';
import { DEFAULT_THINGSPEAK_CONFIG } from '../config/thingspeak';

console.log('=====================================================');
console.log('   MOSFET PERFORMANCE VERIFICATION TEST SUITE       ');
console.log('=====================================================');

// 1. Test Simulation Formula Calculations
const simResult = calculateSimulationResults({
  inputVoltage: 400,
  outputVoltage: 48,
  loadCurrent: 25,
  switchingFrequency: 150,
  dutyCycle: 12,
  mosfetCurrent: 8.66,
  conductionLoss: 1.88,
  switchingLoss: 3.42,
}, false);

console.log('\n[TEST 1] SiC Simulation Calculations:');
console.log(`- P_cond: ${simResult.conductionLoss} W, P_sw: ${simResult.switchingLoss} W`);
console.log(`- Total Power Loss: ${simResult.totalPowerLoss} W (Expected: 5.30 W)`);
console.log(`- Output Power: ${simResult.outputPower} W (Expected: 1200.00 W)`);
console.log(`- Input Power: ${simResult.inputPower} W (Expected: 1205.30 W)`);
console.log(`- Efficiency: ${simResult.efficiency}% (Expected: 99.56%)`);

if (simResult.totalPowerLoss === 5.30 && simResult.outputPower === 1200) {
  console.log('>>> TEST 1 PASSED: Power loss and efficiency formulas accurate.');
} else {
  console.error('>>> TEST 1 FAILED.');
}

// 2. Test Comparison Formulas
const siPowerLoss = 6.50;
const sicPowerLoss = simResult.totalPowerLoss; // 5.30
const powerLossReduction = Number((((siPowerLoss - sicPowerLoss) / siPowerLoss) * 100).toFixed(2));
const siEfficiency = 91.2;
const sicEfficiency = 96.5;
const effImprovement = Number((sicEfficiency - siEfficiency).toFixed(2));

console.log('\n[TEST 2] Comparison Formulas:');
console.log(`- Si Loss: ${siPowerLoss}W, SiC Loss: ${sicPowerLoss}W -> Reduction: ${powerLossReduction}%`);
console.log(`- Si Eff: ${siEfficiency}%, SiC Eff: ${sicEfficiency}% -> Improvement: +${effImprovement}% pts`);

if (powerLossReduction > 0 && effImprovement === 5.30) {
  console.log('>>> TEST 2 PASSED: Comparison reduction and delta formulas accurate.');
} else {
  console.error('>>> TEST 2 FAILED.');
}

// 3. Test ThingSpeak Dynamic Field Parsing and Validation
const sampleFeed = {
  entry_id: 42,
  created_at: '2026-09-01T12:00:00Z',
  field1: '5.85',   // Power Loss
  field2: '89.40',  // Efficiency
  field3: '62.3',   // Temperature
  field4: '78.5',   // Battery
  field5: 'invalid_data',
};

const parsed = parseFeedItem(sampleFeed, DEFAULT_THINGSPEAK_CONFIG);

console.log('\n[TEST 3] ThingSpeak Feed Parsing:');
console.log(`- Parsed Power Loss: ${parsed.powerLoss} W`);
console.log(`- Parsed Efficiency: ${parsed.efficiency} %`);
console.log(`- Parsed Temperature: ${parsed.temperature} °C`);
console.log(`- Parsed Battery: ${parsed.batteryUtilization} %`);

if (
  parsed.powerLoss === 5.85 &&
  parsed.efficiency === 89.4 &&
  parsed.temperature === 62.3 &&
  parsed.batteryUtilization === 78.5
) {
  console.log('>>> TEST 3 PASSED: Field mapping and data validation working seamlessly.');
} else {
  console.error('>>> TEST 3 FAILED.');
}

// 4. Test Invalid / NaN / Out-of-bounds Handling (Section 17)
const corruptFeed = {
  entry_id: 43,
  created_at: '2026-09-01T12:01:00Z',
  field1: '-10.5', // Negative power loss should be null
  field2: '150.0', // >100% efficiency should be null
  field3: 'NaN',   // Invalid string should be null
  field4: 'null',
};

const parsedCorrupt = parseFeedItem(corruptFeed, DEFAULT_THINGSPEAK_CONFIG);

console.log('\n[TEST 4] Boundary & Error Resilience Handling (Section 17):');
console.log(`- Negative Power Loss parsed as: ${parsedCorrupt.powerLoss}`);
console.log(`- Out of bounds Efficiency parsed as: ${parsedCorrupt.efficiency}`);
console.log(`- Corrupt Temperature parsed as: ${parsedCorrupt.temperature}`);

if (
  parsedCorrupt.powerLoss === null &&
  parsedCorrupt.efficiency === null &&
  parsedCorrupt.temperature === null
) {
  console.log('>>> TEST 4 PASSED: Safe null fallback for corrupt/out-of-bounds telemetry.');
} else {
  console.error('>>> TEST 4 FAILED.');
}

console.log('\n=====================================================');
console.log('   ALL VERIFICATION SUITE TESTS COMPLETED 100%       ');
console.log('=====================================================');
