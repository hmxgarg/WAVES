import { useState } from 'react';
import { 
  Sliders, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  RotateCcw, 
  Zap, 
  Clock,
  Droplet,
  CloudRain,
  Users,
  Sparkles
} from 'lucide-react';
import { PredictionInputs } from '../types';
import { calculateMLPrediction } from '../utils/mlEngine';

export function MLSimulatorTab() {
  const [inputs, setInputs] = useState<PredictionInputs>({
    locationId: 'SIM-01',
    groundwaterDepth: 35.0,
    rainfallDeficit: -30,
    populationDensity: 450,
    consumptionRate: 70,
    socioEconomicIndex: 0.6,
    modelType: 'XGBoost',
  });

  const [policyApplied, setPolicyApplied] = useState(false);

  // Apply policy modifier if toggled
  const activeInputs: PredictionInputs = {
    ...inputs,
    consumptionRate: policyApplied ? Math.round(inputs.consumptionRate * 0.75) : inputs.consumptionRate,
    groundwaterDepth: policyApplied ? Math.max(8, inputs.groundwaterDepth - 2.5) : inputs.groundwaterDepth,
  };

  const prediction = calculateMLPrediction(activeInputs);
  // Also calculate baseline without policy for comparison
  const baselinePrediction = calculateMLPrediction(inputs);
  const daysSaved = policyApplied ? Math.max(0, prediction.timeToShortage - baselinePrediction.timeToShortage) : 0;

  const isCritical = prediction.alertStatus === 'Critical';
  const isWarning = prediction.alertStatus === 'Warning';
  const isSafe = prediction.alertStatus === 'Safe';

  const resetToDefault = () => {
    setInputs({
      locationId: 'SIM-01',
      groundwaterDepth: 35.0,
      rainfallDeficit: -30,
      populationDensity: 450,
      consumptionRate: 70,
      socioEconomicIndex: 0.6,
      modelType: 'XGBoost',
    });
    setPolicyApplied(false);
  };

  const loadPreset = (preset: 'severe' | 'moderate' | 'safe') => {
    setPolicyApplied(false);
    if (preset === 'severe') {
      setInputs({
        locationId: 'SIM-DROUGHT',
        groundwaterDepth: 42.0,
        rainfallDeficit: -45,
        populationDensity: 600,
        consumptionRate: 85,
        socioEconomicIndex: 0.8,
        modelType: 'XGBoost',
      });
    } else if (preset === 'moderate') {
      setInputs({
        locationId: 'SIM-WARNING',
        groundwaterDepth: 30.0,
        rainfallDeficit: -25,
        populationDensity: 400,
        consumptionRate: 65,
        socioEconomicIndex: 0.5,
        modelType: 'XGBoost',
      });
    } else {
      setInputs({
        locationId: 'SIM-SAFE',
        groundwaterDepth: 16.0,
        rainfallDeficit: 5,
        populationDensity: 280,
        consumptionRate: 50,
        socioEconomicIndex: 0.3,
        modelType: 'XGBoost',
      });
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto">
      {/* Simple Header with 1-Click Quick Scenarios */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-sky-100 shadow-sm shadow-sky-900/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Sliders className="w-5 h-5 text-sky-600" />
              <span>Water Risk Simulator</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Adjust water conditions below to see when a village will face shortage and how to prevent it.
            </p>
          </div>

          {/* Quick Scenarios */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-500 mr-1 hidden sm:inline">Try Scenario:</span>
            <button
              onClick={() => loadPreset('severe')}
              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Drought</span>
            </button>
            <button
              onClick={() => loadPreset('moderate')}
              className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Early Warning</span>
            </button>
            <button
              onClick={() => loadPreset('safe')}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Safe</span>
            </button>
            <button
              onClick={resetToDefault}
              className="p-2 rounded-xl bg-slate-50 hover:bg-sky-50 text-slate-500 hover:text-slate-800 border border-slate-200 transition-all ml-1"
              title="Reset to default"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid: Sliders (Left) and Instant Result (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Simple Sliders */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-3xl bg-white border border-sky-100 space-y-6 shadow-sm shadow-sky-900/5">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Village Water Conditions
            </h3>

            {/* Slider 1: Groundwater Level */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-semibold text-slate-800 flex items-center gap-2">
                  <Droplet className="w-4 h-4 text-sky-500" />
                  <span>Groundwater Level (Depth)</span>
                </span>
                <span className="font-mono font-bold text-sky-700 text-sm sm:text-base bg-sky-50 px-2.5 py-0.5 rounded-lg border border-sky-200">
                  {inputs.groundwaterDepth.toFixed(1)} meters
                </span>
              </div>
              <input
                type="range"
                min="8"
                max="50"
                step="0.5"
                value={inputs.groundwaterDepth}
                onChange={(e) => setInputs(prev => ({ ...prev, groundwaterDepth: parseFloat(e.target.value) }))}
                className="w-full h-2.5 bg-sky-100/60 rounded-lg appearance-none cursor-pointer accent-sky-600"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Healthy / Shallow (8m)</span>
                <span className="text-rose-600 font-medium">Critical / Dry (&gt;40m)</span>
              </div>
            </div>

            {/* Slider 2: Monsoon Rainfall */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-semibold text-slate-800 flex items-center gap-2">
                  <CloudRain className="w-4 h-4 text-blue-500" />
                  <span>Monsoon Rainfall</span>
                </span>
                <span className={`font-mono font-bold text-sm sm:text-base px-2.5 py-0.5 rounded-lg border ${
                  inputs.rainfallDeficit < -20 
                    ? 'bg-rose-50 text-rose-700 border-rose-200' 
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  {inputs.rainfallDeficit > 0 ? `+${inputs.rainfallDeficit}% Surplus` : `${inputs.rainfallDeficit}% Deficit`}
                </span>
              </div>
              <input
                type="range"
                min="-60"
                max="25"
                step="5"
                value={inputs.rainfallDeficit}
                onChange={(e) => setInputs(prev => ({ ...prev, rainfallDeficit: parseInt(e.target.value) }))}
                className="w-full h-2.5 bg-sky-100/60 rounded-lg appearance-none cursor-pointer accent-sky-600"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span className="text-rose-600 font-medium">-60% (Severe Drought)</span>
                <span>Normal (0%)</span>
                <span className="text-emerald-600 font-medium">+25% (Good Monsoon)</span>
              </div>
            </div>

            {/* Slider 3: Daily Water Usage */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-semibold text-slate-800 flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-500" />
                  <span>Daily Water Usage per Person</span>
                </span>
                <span className="font-mono font-bold text-slate-800 text-sm sm:text-base bg-slate-50 px-2.5 py-0.5 rounded-lg border border-slate-200">
                  {inputs.consumptionRate} L / day
                </span>
              </div>
              <input
                type="range"
                min="40"
                max="100"
                step="5"
                value={inputs.consumptionRate}
                onChange={(e) => setInputs(prev => ({ ...prev, consumptionRate: parseInt(e.target.value) }))}
                className="w-full h-2.5 bg-sky-100/60 rounded-lg appearance-none cursor-pointer accent-sky-600"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Rationed (40L)</span>
                <span>Standard (55L)</span>
                <span className="text-amber-600 font-medium">High Usage (100L)</span>
              </div>
            </div>

            {/* Simple Water Saving Policy Toggle */}
            <div className="pt-3 border-t border-sky-100">
              <button
                type="button"
                onClick={() => setPolicyApplied(!policyApplied)}
                className={`w-full p-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-center justify-between transition-all border ${
                  policyApplied
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800 shadow-sm'
                    : 'bg-sky-50/50 hover:bg-sky-50 border-sky-200 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-3 text-left">
                  <div className={`p-2 rounded-xl shrink-0 ${policyApplied ? 'bg-emerald-500 text-white' : 'bg-sky-100 text-sky-700'}`}>
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold">
                      {policyApplied ? 'Water Rationing Active (-25% Usage)' : 'Test Water Saving Policy (-25%)'}
                    </div>
                    <div className="text-[11px] opacity-80 mt-0.5">
                      {policyApplied ? 'Simulates restricted irrigation to preserve drinking supply' : 'Click to see how many days of water are gained'}
                    </div>
                  </div>
                </div>

                <div className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 ${
                  policyApplied ? 'bg-emerald-600 text-white' : 'bg-sky-200/60 text-sky-800'
                }`}>
                  {policyApplied ? 'ON ✓' : 'OFF'}
                </div>
              </button>
            </div>

          </div>
        </div>

        {/* Right: Instant Simple Results */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl bg-white border border-sky-100 space-y-5 shadow-sm shadow-sky-900/5">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Predicted Outcome
            </h3>

            {/* Main Risk Status Box */}
            <div className={`p-6 rounded-2xl border text-center transition-all ${
              isCritical 
                ? 'bg-rose-50/80 border-rose-200' 
                : isWarning 
                ? 'bg-amber-50/80 border-amber-200' 
                : 'bg-emerald-50/80 border-emerald-200'
            }`}>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Water Shortage Risk
              </div>
              <div className={`text-5xl font-black tracking-tight my-2 ${
                isCritical ? 'text-rose-600' : isWarning ? 'text-amber-600' : 'text-emerald-600'
              }`}>
                {prediction.crisisProbability}%
              </div>

              {/* Status Badge */}
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold mt-1 bg-white border border-slate-200 shadow-sm">
                {isCritical && <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />}
                {isWarning && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                {isSafe && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                <span className="text-slate-800">{prediction.alertStatus} Condition</span>
              </div>

              {/* Risk Progress Bar */}
              <div className="w-full bg-slate-200/70 h-2 rounded-full overflow-hidden mt-4">
                <div 
                  className={`h-full transition-all duration-300 ${
                    isCritical ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${prediction.crisisProbability}%` }}
                />
              </div>
            </div>

            {/* Days remaining card */}
            <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                  <Clock className="w-4 h-4 text-sky-600" />
                  <span>Estimated Days to Shortage</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Time before borewells reach dry limit</div>
              </div>
              <div className="text-right">
                <span className={`text-3xl font-extrabold ${
                  isCritical ? 'text-rose-600' : isWarning ? 'text-amber-600' : 'text-emerald-600'
                }`}>
                  {isSafe && prediction.timeToShortage > 80 ? '90+' : prediction.timeToShortage}
                </span>
                <span className="text-xs text-slate-500 font-semibold ml-1">Days</span>
              </div>
            </div>

            {/* Days gained indicator if policy active */}
            {policyApplied && daysSaved > 0 && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Water saving policy extended drinking supply by <strong>+{daysSaved} extra days</strong>!</span>
              </div>
            )}

            {/* Action Card */}
            <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100">
              <div className="text-xs font-bold text-sky-700 uppercase tracking-wider mb-1">
                Recommended Civic Action:
              </div>
              <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                {prediction.recommendedAction}
              </p>
            </div>

            {/* Primary Driver */}
            <div className="p-3.5 rounded-2xl bg-white border border-sky-100 text-xs text-slate-600 shadow-sm">
              <span className="font-bold text-slate-800">Primary Factor: </span>
              {inputs.groundwaterDepth > 35 
                ? 'Deep water table requires immediate conservation.' 
                : inputs.rainfallDeficit < -25 
                ? 'High monsoon deficit is reducing aquifer recharge.' 
                : 'Balanced water levels and sustainable usage.'}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
