import { AlertTriangle, Clock, Truck, Activity } from 'lucide-react';
import { VillageData } from '../types';

interface StatsBarProps {
  villages: VillageData[];
  activeReliefCount: number;
}

export function StatsBar({ villages, activeReliefCount }: StatsBarProps) {
  const criticalCount = villages.filter(v => v.alertStatus === 'Critical').length;
  const warningCount = villages.filter(v => v.alertStatus === 'Warning').length;

  const shortestDepletion = Math.min(...villages.map(v => v.timeToShortageDays));

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 my-6 sm:my-8">
      {/* Critical Red Alert Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-rose-200/80 shadow-sm shadow-rose-900/5 relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-rose-300">
        <div className="flex items-center justify-between text-rose-600 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider">Critical Alert</span>
          <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
            <AlertTriangle className="w-4 h-4 animate-pulse" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 my-1">
          <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">{criticalCount}</span>
          <span className="text-xs font-semibold text-slate-500">villages</span>
        </div>
        <p className="text-xs text-rose-600 font-medium mt-1">
          &ge;85% Risk • Depletion &lt;30d
        </p>
      </div>

      {/* 30-60 Day Early Warning Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-amber-200/80 shadow-sm shadow-amber-900/5 relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-amber-300">
        <div className="flex items-center justify-between text-amber-600 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider">Early Warning</span>
          <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 my-1">
          <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">{warningCount}</span>
          <span className="text-xs font-semibold text-slate-500">villages</span>
        </div>
        <p className="text-xs text-amber-700 font-medium mt-1">
          30–60d Proactive Window
        </p>
      </div>

      {/* Earliest Depletion Window */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-sky-200/80 shadow-sm shadow-sky-900/5 relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-sky-300">
        <div className="flex items-center justify-between text-sky-600 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider">Shortest Horizon</span>
          <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
            <Activity className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 my-1">
          <span className="text-3xl sm:text-4xl font-extrabold text-sky-600 tracking-tight">{shortestDepletion}</span>
          <span className="text-xs font-semibold text-slate-500">days remaining</span>
        </div>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Earliest dry-bore threshold
        </p>
      </div>

      {/* Active Relief Dispatches */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-emerald-200/80 shadow-sm shadow-emerald-900/5 relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-emerald-300">
        <div className="flex items-center justify-between text-emerald-600 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider">Relief Deployed</span>
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
            <Truck className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 my-1">
          <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">{activeReliefCount}</span>
          <span className="text-xs font-semibold text-slate-500">actions active</span>
        </div>
        <p className="text-xs text-emerald-700 font-medium mt-1">
          Tankers &amp; Power rationing
        </p>
      </div>
    </div>
  );
}
