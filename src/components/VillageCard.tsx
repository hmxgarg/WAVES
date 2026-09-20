import { AlertTriangle, CheckCircle2, ChevronRight, Droplet, Users, CloudRain, Truck, ShieldAlert } from 'lucide-react';
import { VillageData } from '../types';

interface VillageCardProps {
  village: VillageData;
  onSelect: (village: VillageData) => void;
  onDispatchRelief: (village: VillageData) => void;
}

export function VillageCard({ village, onSelect, onDispatchRelief }: VillageCardProps) {
  const isCritical = village.alertStatus === 'Critical';
  const isWarning = village.alertStatus === 'Warning';
  const isSafe = village.alertStatus === 'Safe';

  const badgeColor = isCritical
    ? 'bg-rose-50 text-rose-700 border-rose-200'
    : isWarning
    ? 'bg-amber-50 text-amber-800 border-amber-200'
    : 'bg-emerald-50 text-emerald-700 border-emerald-200';

  const borderAccent = isCritical
    ? 'border-rose-200 hover:border-rose-300 shadow-rose-900/5'
    : isWarning
    ? 'border-amber-200 hover:border-amber-300 shadow-amber-900/5'
    : 'border-sky-100 hover:border-sky-300 shadow-sky-900/5';

  return (
    <div
      id={`village-card-${village.id}`}
      className={`rounded-3xl border bg-white p-6 sm:p-7 shadow-sm hover:shadow-md transition-all duration-300 ${borderAccent} flex flex-col justify-between`}
    >
      {/* Top row: ID + Status + Days countdown */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-sky-50 text-sky-700 border border-sky-200">
              {village.id}
            </span>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full border flex items-center gap-1.5 ${badgeColor}`}>
              {isCritical && <ShieldAlert className="w-3.5 h-3.5 text-rose-600 animate-pulse" />}
              {isWarning && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
              {isSafe && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
              {village.alertStatus} Alert
            </span>
          </div>

          {/* Time to shortage pill */}
          <div className={`px-3 py-1.5 rounded-2xl text-right shrink-0 ${
            isCritical ? 'bg-rose-50 text-rose-700 border border-rose-200' : isWarning ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-sky-50 text-sky-700 border border-sky-200'
          }`}>
            <div className="text-[10px] uppercase font-bold tracking-wider leading-none opacity-80">
              {isSafe ? 'Status' : 'Shortage in'}
            </div>
            <div className="text-base font-extrabold tracking-tight mt-0.5">
              {isSafe ? '>90 Days' : `${village.timeToShortageDays} Days`}
            </div>
          </div>
        </div>

        {/* Village Name & Region */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2 leading-snug">
            {village.name}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {village.district}, {village.state} • <span className="text-slate-400">{village.region}</span>
          </p>
        </div>

        {/* Core ML Inputs Grid */}
        <div className="grid grid-cols-2 gap-3.5 p-4 rounded-2xl bg-sky-50/50 border border-sky-100 mb-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Droplet className="w-3.5 h-3.5 text-sky-500 shrink-0" />
              <span>Water Depth</span>
            </div>
            <div className="text-sm font-bold text-slate-800 mt-1 flex items-baseline gap-1.5">
              <span>{village.groundwaterDepth.toFixed(1)} m</span>
              <span className="text-[10px] text-slate-400 font-normal">/ {village.criticalThresholdDepth}m limit</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <CloudRain className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span>Rainfall Variance</span>
            </div>
            <div className={`text-sm font-bold mt-1 ${village.rainfallDeficit < -20 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {village.rainfallDeficit > 0 ? '+' : ''}{village.rainfallDeficit}%
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Users className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>Per Capita Draw</span>
            </div>
            <div className="text-sm font-bold text-slate-800 mt-1">
              {village.dailyConsumptionPerCapita} L<span className="text-[10px] text-slate-400 font-normal">/day</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
              <span>ML Probability</span>
            </div>
            <div className="text-sm font-extrabold mt-1 tracking-tight flex items-baseline gap-1">
              <span className={isCritical ? 'text-rose-600' : isWarning ? 'text-amber-600' : 'text-emerald-600'}>
                {village.crisisProbability.toFixed(1)}%
              </span>
              <span className="text-[10px] text-slate-400 font-normal">risk</span>
            </div>
          </div>
        </div>

        {/* Explainability driver teaser */}
        <div className="mb-5 px-3.5 py-2.5 rounded-xl bg-sky-50/70 border border-sky-100 flex items-start gap-2 text-xs">
          <span className="text-sky-700 font-bold shrink-0">SHAP Driver:</span>
          <span className="text-slate-700 leading-relaxed line-clamp-1">{village.primaryDriver}</span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-sky-100 flex items-center justify-between gap-3">
        <button
          onClick={() => onSelect(village)}
          id={`btn-inspect-${village.id}`}
          className="flex-1 py-2.5 px-4 rounded-xl bg-sky-50 hover:bg-sky-100/80 text-sky-700 hover:text-sky-800 text-xs font-semibold flex items-center justify-center gap-2 transition-all border border-sky-200"
        >
          <span>30–60d Forecast &amp; SHAP</span>
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          onClick={() => onDispatchRelief(village)}
          id={`btn-relief-${village.id}`}
          className={`py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            village.reliefDispatched
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : isCritical
              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-sm shadow-rose-600/20'
              : 'bg-white hover:bg-sky-50 text-slate-700 border border-slate-200'
          }`}
          title="Trigger Proactive Relief Action"
        >
          <Truck className="w-4 h-4" />
          <span>{village.reliefDispatched ? 'Dispatched' : 'Relief'}</span>
        </button>
      </div>
    </div>
  );
}
