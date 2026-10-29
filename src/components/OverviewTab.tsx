import { 
  AlertTriangle, 
  Clock, 
  Activity, 
  Truck, 
  Droplet, 
  Users, 
  ArrowRight, 
  ShieldAlert, 
  CheckCircle2, 
  RefreshCw,
  PhoneCall,
  Sliders,
  Radio
} from 'lucide-react';
import { VillageData, AppTab } from '../types';

interface OverviewTabProps {
  villages: VillageData[];
  activeReliefCount: number;
  onNavigateTab: (tab: AppTab) => void;
  onSelectVillage: (village: VillageData) => void;
  onQuickDispatch: (villageId: string, actionType: 'Tanker Dispatch' | 'Borewell Rationing' | 'SMS Alert Sent', details: string) => void;
  onRefresh: () => void;
}

export function OverviewTab({
  villages,
  activeReliefCount,
  onNavigateTab,
  onSelectVillage,
  onQuickDispatch,
  onRefresh,
}: OverviewTabProps) {
  const criticalVillages = villages.filter(v => v.alertStatus === 'Critical');
  const warningVillages = villages.filter(v => v.alertStatus === 'Warning');
  const safeVillages = villages.filter(v => v.alertStatus === 'Safe');

  const shortestDepletion = Math.min(...villages.map(v => v.timeToShortageDays));
  const avgDepth = (villages.reduce((acc, v) => acc + v.groundwaterDepth, 0) / villages.length).toFixed(1);
  const totalPopAtRisk = villages
    .filter(v => v.alertStatus !== 'Safe')
    .reduce((acc, v) => acc + v.totalPopulation, 0)
    .toLocaleString();

  // Sort critical by urgency
  const urgentQueue = [...criticalVillages].sort((a, b) => a.timeToShortageDays - b.timeToShortageDays);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Top Welcome & Mission Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-sky-100 shadow-sm shadow-sky-900/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 border border-sky-200">
              Executive Dashboard
            </span>
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Telemetry &amp; 30–60d ML Predictions
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Water Scarcity Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
            Real-time monitoring across rural borewells and rainfall stations. Take preemptive action weeks before critical water depletion occurs.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onRefresh}
            className="px-4 py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
          >
            <RefreshCw className="w-4 h-4 text-sky-600" />
            <span>Sync Live Stations</span>
          </button>
        </div>
      </div>

      {/* 4 Core Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Critical Alert Card */}
        <div 
          onClick={() => onNavigateTab('villages')}
          className="p-5 sm:p-6 rounded-3xl bg-white border border-rose-200/80 shadow-sm hover:shadow-md hover:border-rose-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-rose-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Critical Crisis</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 my-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">{criticalVillages.length}</span>
            <span className="text-xs font-semibold text-slate-500">villages</span>
          </div>
          <p className="text-xs text-rose-600 font-medium mt-1">
            &ge;85% Risk • Shortage &lt;30 days
          </p>
        </div>

        {/* 30-60 Day Early Warning Card */}
        <div 
          onClick={() => onNavigateTab('villages')}
          className="p-5 sm:p-6 rounded-3xl bg-white border border-amber-200/80 shadow-sm hover:shadow-md hover:border-amber-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Early Warning</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 my-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">{warningVillages.length}</span>
            <span className="text-xs font-semibold text-slate-500">villages</span>
          </div>
          <p className="text-xs text-amber-700 font-medium mt-1">
            30–60d Proactive Alert Window
          </p>
        </div>

        {/* Earliest Depletion Horizon */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-sky-200/80 shadow-sm hover:shadow-md hover:border-sky-300 transition-all">
          <div className="flex items-center justify-between text-sky-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Earliest Depletion</span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 my-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-sky-600 tracking-tight">{shortestDepletion}</span>
            <span className="text-xs font-semibold text-slate-500">days remaining</span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Earliest dry-well threshold
          </p>
        </div>

        {/* Active Relief Dispatches */}
        <div 
          onClick={() => onNavigateTab('relief')}
          className="p-5 sm:p-6 rounded-3xl bg-white border border-emerald-200/80 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Relief Active</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 my-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">{activeReliefCount}</span>
            <span className="text-xs font-semibold text-slate-500">missions active</span>
          </div>
          <p className="text-xs text-emerald-700 font-medium mt-1">
            Tankers &amp; tubewell rationing
          </p>
        </div>
      </div>

      {/* Main 2-Column Section: Urgent Action Queue + Regional Health Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* Left 2 Cols: Urgent Action Queue */}
        <div className="lg:col-span-2 rounded-3xl bg-white border border-sky-100 p-6 sm:p-7 shadow-sm shadow-sky-900/5 space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <span>Urgent Priority Interventions</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Villages with acute water depletion projected in under 30 days
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('villages')}
              className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
            >
              <span>View All ({villages.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {urgentQueue.map((v) => (
              <div
                key={v.id}
                className="p-4 sm:p-5 rounded-2xl border border-rose-100 bg-rose-50/20 hover:bg-rose-50/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-md bg-white border border-rose-200 text-rose-700">
                      {v.id}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base">{v.name}</h3>
                    <span className="text-xs text-slate-500">({v.district})</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1">
                    <span className="flex items-center gap-1 font-semibold text-rose-600">
                      <Clock className="w-3.5 h-3.5" />
                      {v.timeToShortageDays} Days to Depletion
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Droplet className="w-3.5 h-3.5 text-sky-500" />
                      Depth: {v.groundwaterDepth.toFixed(1)}m / {v.criticalThresholdDepth}m
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      Pop: {v.totalPopulation.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {v.reliefDispatched ? (
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Relief Active</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => onQuickDispatch(v.id, 'Tanker Dispatch', `Urgent 24hr potable tanker dispatch dispatched to ${v.name}`)}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Dispatch Tanker</span>
                    </button>
                  )}

                  <button
                    onClick={() => onSelectVillage(v)}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-sky-50 text-slate-700 border border-slate-200 text-xs font-medium transition-all"
                  >
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Water Security Status & Quick Jumps */}
        <div className="space-y-6">
          {/* Status Distribution */}
          <div className="rounded-3xl bg-white border border-sky-100 p-6 shadow-sm shadow-sky-900/5 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Regional Alert Distribution
            </h3>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700">
                  <span className="flex items-center gap-1.5 text-rose-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    Critical Red Alert
                  </span>
                  <span>{criticalVillages.length} of {villages.length}</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-rose-500 h-full rounded-full transition-all" 
                    style={{ width: `${(criticalVillages.length / villages.length) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700">
                  <span className="flex items-center gap-1.5 text-amber-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    30–60d Warning
                  </span>
                  <span>{warningVillages.length} of {villages.length}</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-amber-500 h-full rounded-full transition-all" 
                    style={{ width: `${(warningVillages.length / villages.length) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700">
                  <span className="flex items-center gap-1.5 text-emerald-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    Sustainable Safe
                  </span>
                  <span>{safeVillages.length} of {villages.length}</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all" 
                    style={{ width: `${(safeVillages.length / villages.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-3 text-center">
              <div className="p-2.5 rounded-xl bg-sky-50/50 border border-sky-100">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Avg Borewell Depth</div>
                <div className="text-base font-extrabold text-slate-900 mt-0.5">{avgDepth} m</div>
              </div>
              <div className="p-2.5 rounded-xl bg-sky-50/50 border border-sky-100">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Population at Risk</div>
                <div className="text-base font-extrabold text-slate-900 mt-0.5">{totalPopAtRisk}</div>
              </div>
            </div>
          </div>

          {/* Quick Navigation Cards */}
          <div className="rounded-3xl bg-white border border-sky-100 p-6 shadow-sm shadow-sky-900/5 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-2">
              Explore System Modules
            </h3>

            <button
              onClick={() => onNavigateTab('villages')}
              className="w-full p-3 rounded-2xl bg-sky-50/60 hover:bg-sky-100/70 text-left border border-sky-100 flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-sky-600 text-white">
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Village Radar</div>
                  <div className="text-[11px] text-slate-500">Filter all {villages.length} stations</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-sky-600 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onNavigateTab('simulator')}
              className="w-full p-3 rounded-2xl bg-sky-50/60 hover:bg-sky-100/70 text-left border border-sky-100 flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-sky-600 text-white">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">ML Water Simulator</div>
                  <div className="text-[11px] text-slate-500">Test drought &amp; rationing policies</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-sky-600 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onNavigateTab('relief')}
              className="w-full p-3 rounded-2xl bg-sky-50/60 hover:bg-sky-100/70 text-left border border-sky-100 flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-600 text-white">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Relief Dispatch Center</div>
                  <div className="text-[11px] text-slate-500">Track tankers &amp; order log</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-sky-600 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onNavigateTab('contacts')}
              className="w-full p-3 rounded-2xl bg-sky-50/60 hover:bg-sky-100/70 text-left border border-sky-100 flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-600 text-white">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Sarpanch Directory</div>
                  <div className="text-[11px] text-slate-500">Direct phone &amp; email contacts</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-sky-600 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
