import { Home, Sliders, Truck } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: 'villages' | 'simulator' | 'relief';
  onTabChange: (tab: 'villages' | 'simulator' | 'relief') => void;
  criticalCount: number;
}

export function MobileBottomNav({
  activeTab,
  onTabChange,
  criticalCount,
}: MobileBottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-sky-100 text-slate-600 py-2 px-4 shadow-[0_-4px_20px_rgba(2,132,199,0.06)] md:hidden">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {/* Tab 1: Village Radar */}
        <button
          onClick={() => onTabChange('villages')}
          id="nav-villages-btn"
          className={`flex flex-col items-center justify-center py-1.5 px-4 rounded-2xl transition-all relative ${
            activeTab === 'villages'
              ? 'text-sky-600 bg-sky-50 font-bold shadow-sm'
              : 'text-slate-500 hover:text-sky-600'
          }`}
        >
          <div className="relative">
            <Home className="w-5 h-5" />
            {criticalCount > 0 && (
              <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
                {criticalCount}
              </span>
            )}
          </div>
          <span className="text-[11px] mt-1 tracking-tight">Village Radar</span>
        </button>

        {/* Tab 2: What-If ML Simulator */}
        <button
          onClick={() => onTabChange('simulator')}
          id="nav-simulator-btn"
          className={`flex flex-col items-center justify-center py-1.5 px-4 rounded-2xl transition-all ${
            activeTab === 'simulator'
              ? 'text-sky-600 bg-sky-50 font-bold shadow-sm'
              : 'text-slate-500 hover:text-sky-600'
          }`}
        >
          <Sliders className="w-5 h-5" />
          <span className="text-[11px] mt-1 tracking-tight">ML Simulator</span>
        </button>

        {/* Tab 3: Relief Dispatch */}
        <button
          onClick={() => onTabChange('relief')}
          id="nav-relief-btn"
          className={`flex flex-col items-center justify-center py-1.5 px-4 rounded-2xl transition-all ${
            activeTab === 'relief'
              ? 'text-sky-600 bg-sky-50 font-bold shadow-sm'
              : 'text-slate-500 hover:text-sky-600'
          }`}
        >
          <Truck className="w-5 h-5" />
          <span className="text-[11px] mt-1 tracking-tight">Relief Center</span>
        </button>
      </div>
    </nav>
  );
}
