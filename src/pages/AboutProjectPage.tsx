import React from 'react';
import {
  BookOpen,
  Layers,
  Cpu,
  Radio,
  BarChart3,
  CheckCircle2,
  Zap,
  Gauge,
  Thermometer,
  BatteryCharging,
  ShieldCheck,
  Code,
} from 'lucide-react';

export const AboutProjectPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Header Banner */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs dark:shadow-sm">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 text-xs font-mono font-medium">
            <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Technical Methodology & Documentation</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            MOSFET Performance Analysis: MATLAB Simulation & ThingSpeak Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Methodology, semiconductor physics, mathematical loss formulations, and cloud data architecture.
          </p>
        </div>
      </div>

      {/* Objective Card */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs dark:shadow-sm space-y-2">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Project Objective</span>
        </h2>
        <blockquote className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950 border-l-2 border-emerald-500 text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
          “To evaluate and compare the electrical performance of Silicon Carbide (SiC) MOSFET simulation against Silicon (Si) MOSFET hardware telemetry based on power loss and efficiency, while monitoring hardware temperature and battery utilization via ThingSpeak IoT cloud.”
        </blockquote>
      </div>

      {/* System Architecture Grid */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs dark:shadow-sm space-y-4">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>System Architecture & Telemetry Pipeline</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold text-xs">
              <Cpu className="w-4 h-4" />
              <span>1. MATLAB / Simulink Simulation</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Circuit simulation executed in MATLAB/Simulink models the power converter switching behavior, calculating conduction loss (<code className="text-slate-800 dark:text-slate-300 font-mono">I_rms² · R_DS(on)</code>), switching transitions, and energy efficiency.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-semibold text-xs">
              <Radio className="w-4 h-4" />
              <span>2. ThingSpeak IoT Data Logging</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Calculated output metrics and testbench sensor measurements are transmitted via REST API to <strong>ThingSpeak Channel 3484560</strong> (Field 3: Power Loss, Field 4: Efficiency, Field 5: Temperature, Field 6: Battery Utilisation).
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold text-xs">
              <BarChart3 className="w-4 h-4" />
              <span>3. Telemetry Ingestion & Real-Time Sync</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              The web dashboard connects directly to ThingSpeak, querying live feeds every 15 seconds, maintaining historical buffers, and rendering interactive engineering charts.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-violet-700 dark:text-purple-400 font-semibold text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>4. Comparative Evaluation Engine</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              The comparison module computes power loss reduction percentages, efficiency advantages, and practical battery lifespan extension metrics between SiC and Si devices.
            </p>
          </div>
        </div>
      </div>

      {/* Semiconductor Comparison Table */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs dark:shadow-sm space-y-3">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>Semiconductor Material Comparison (Si vs SiC)</span>
        </h2>

        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Physical Property</th>
                <th className="py-2.5 px-3 text-right">Silicon (Si)</th>
                <th className="py-2.5 px-3 text-right text-emerald-700 dark:text-emerald-400">Silicon Carbide (SiC)</th>
                <th className="py-2.5 px-3 text-right">Advantage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-950/40">
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                <td className="py-2.5 px-3 text-slate-800 dark:text-slate-200 font-sans font-medium">Energy Bandgap (Eg)</td>
                <td className="py-2.5 px-3 text-right text-slate-500 dark:text-slate-400">1.12 eV</td>
                <td className="py-2.5 px-3 text-right text-emerald-700 dark:text-emerald-300 font-bold">3.26 eV</td>
                <td className="py-2.5 px-3 text-right text-emerald-700 dark:text-emerald-400 font-bold">3x Higher (Wide Bandgap)</td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                <td className="py-2.5 px-3 text-slate-800 dark:text-slate-200 font-sans font-medium">Breakdown Electric Field</td>
                <td className="py-2.5 px-3 text-right text-slate-500 dark:text-slate-400">0.3 MV/cm</td>
                <td className="py-2.5 px-3 text-right text-emerald-700 dark:text-emerald-300 font-bold">2.8 MV/cm</td>
                <td className="py-2.5 px-3 text-right text-emerald-700 dark:text-emerald-400 font-bold">~10x Higher Voltage Rating</td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                <td className="py-2.5 px-3 text-slate-800 dark:text-slate-200 font-sans font-medium">Thermal Conductivity</td>
                <td className="py-2.5 px-3 text-right text-slate-500 dark:text-slate-400">1.5 W/cm·K</td>
                <td className="py-2.5 px-3 text-right text-emerald-700 dark:text-emerald-300 font-bold">4.9 W/cm·K</td>
                <td className="py-2.5 px-3 text-right text-emerald-700 dark:text-emerald-400 font-bold">3.3x Better Heat Removal</td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                <td className="py-2.5 px-3 text-slate-800 dark:text-slate-200 font-sans font-medium">Max Operating Temp (Tj_max)</td>
                <td className="py-2.5 px-3 text-right text-slate-500 dark:text-slate-400">150 °C</td>
                <td className="py-2.5 px-3 text-right text-emerald-700 dark:text-emerald-300 font-bold">175 – 200 °C</td>
                <td className="py-2.5 px-3 text-right text-emerald-700 dark:text-emerald-400 font-bold">Higher Thermal Headroom</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Mathematical Formulas Reference */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs dark:shadow-sm space-y-3">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Code className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          <span>Loss & Efficiency Mathematical Formulations</span>
        </h2>

        <div className="space-y-2.5 text-xs font-mono">
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-slate-600 dark:text-slate-400 font-sans font-medium text-[11px] block">1. Conduction Loss (P_cond):</span>
            <span className="text-amber-700 dark:text-amber-300 font-bold block">P_cond = I_rms² × R_DS(on)</span>
            <span className="text-slate-500 font-sans text-[11px]">Where I_rms = I_load × √(Duty Cycle) for synchronous step-down topology.</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-slate-600 dark:text-slate-400 font-sans font-medium text-[11px] block">2. Switching Loss (P_sw):</span>
            <span className="text-amber-700 dark:text-amber-300 font-bold block">P_sw = 0.5 × V_in × I_load × (t_rise + t_fall) × f_sw</span>
            <span className="text-slate-500 font-sans text-[11px]">SiC switches with typical transition times &lt; 15ns, significantly lowering P_sw at high frequencies.</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-slate-600 dark:text-slate-400 font-sans font-medium text-[11px] block">3. Conversion Efficiency (%):</span>
            <span className="text-emerald-700 dark:text-emerald-300 font-bold block">Efficiency (%) = (P_out / P_in) × 100 = [ (V_out × I_load) / (P_out + P_loss) ] × 100</span>
          </div>
        </div>
      </div>
    </div>
  );
};
