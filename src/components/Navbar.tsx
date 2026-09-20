import { Droplets, ShieldAlert, Home, Sliders, Truck } from 'lucide-react';

interface NavbarProps {
  activeTab: 'villages' | 'simulator' | 'relief';
  onTabChange: (tab: 'villages' | 'simulator' | 'relief') => void;
  criticalCount: number;
}

export function Navbar({ activeTab, onTabChange, criticalCount }: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-sky-100 text-slate-900 px-5 sm:px-8 lg:px-10 py-3.5 sm:py-4 shadow-sm shadow-sky-950/5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 shadow-md shadow-sky-500/25 text-white shrink-0">
            <Droplets className="w-5 h-5 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full ring-2 ring-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5">
                WAVES
                <span className="text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200">
                  ML Warning
                </span>
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate max-w-[220px] sm:max-w-md hidden sm:block">
              Water Assessment &amp; Village Early Warning • 30–60d Advance Risk
            </p>
          </div>
        </div>

        {/* Desktop Navigation Tabs (replaces removed WAVES Docs/Methodology) */}
        <nav className="hidden md:flex items-center gap-1.5 bg-sky-50/70 p-1 rounded-2xl border border-sky-100">
          <button
            onClick={() => onTabChange('villages')}
            id="desktop-nav-villages-btn"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'villages'
                ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/25'
                : 'text-slate-600 hover:text-sky-700 hover:bg-sky-100/50'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Village Radar</span>
            {criticalCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'villages' ? 'bg-white text-sky-700' : 'bg-rose-500 text-white'
              }`}>
                {criticalCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onTabChange('simulator')}
            id="desktop-nav-simulator-btn"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'simulator'
                ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/25'
                : 'text-slate-600 hover:text-sky-700 hover:bg-sky-100/50'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>ML Simulator</span>
          </button>

          <button
            onClick={() => onTabChange('relief')}
            id="desktop-nav-relief-btn"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'relief'
                ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/25'
                : 'text-slate-600 hover:text-sky-700 hover:bg-sky-100/50'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Relief Dispatch</span>
          </button>
        </nav>

        {/* Right Status */}
        <div className="flex items-center gap-2.5 shrink-0">
          {criticalCount > 0 ? (
            <div className="flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold animate-pulse">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span className="hidden sm:inline">{criticalCount} Critical Villages</span>
              <span className="sm:hidden">{criticalCount} Red Alerts</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>All Normal</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
