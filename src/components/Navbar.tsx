import { 
  Droplets, 
  ShieldAlert, 
  LayoutDashboard, 
  Radio, 
  Sliders, 
  Truck, 
  PhoneCall 
} from 'lucide-react';
import { AppTab } from '../types';

interface NavbarProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  criticalCount: number;
}

export function Navbar({ activeTab, onTabChange, criticalCount }: NavbarProps) {
  const tabs: { id: AppTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'villages', label: 'Village Radar', icon: Radio, badge: criticalCount },
    { id: 'simulator', label: 'ML Simulator', icon: Sliders },
    { id: 'relief', label: 'Relief Center', icon: Truck },
    { id: 'contacts', label: 'Sarpanch Directory', icon: PhoneCall },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-sky-100 text-slate-900 px-4 sm:px-6 lg:px-8 py-3 shadow-sm shadow-sky-950/5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand identity */}
        <div 
          onClick={() => onTabChange('overview')}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 shadow-md shadow-sky-500/25 text-white shrink-0 group-hover:scale-105 transition-transform">
            <Droplets className="w-5 h-5 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5">
                WAVES
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200">
                  ML Warning
                </span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate max-w-[200px] sm:max-w-xs hidden sm:block">
              Village Water Scarcity Radar &amp; Relief
            </p>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-sky-50/70 p-1 rounded-2xl border border-sky-100">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                id={`desktop-nav-${tab.id}-btn`}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/25'
                    : 'text-slate-600 hover:text-sky-700 hover:bg-sky-100/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {Boolean(tab.badge && tab.badge > 0) && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-white text-sky-700' : 'bg-rose-500 text-white'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Status */}
        <div className="flex items-center gap-2 shrink-0">
          {criticalCount > 0 ? (
            <div 
              onClick={() => onTabChange('villages')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold animate-pulse cursor-pointer hover:bg-rose-100/80 transition-colors"
            >
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="hidden sm:inline">{criticalCount} Critical Alerts</span>
              <span className="sm:hidden">{criticalCount}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>All Normal</span>
            </div>
          )}
        </div>
      </div>

      {/* Sub-navigation bar for medium screens (tablets) */}
      <div className="flex lg:hidden items-center justify-start gap-1 overflow-x-auto pt-2.5 mt-2 border-t border-slate-100 no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                isActive
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-sky-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {Boolean(tab.badge && tab.badge > 0) && (
                <span className={`px-1 rounded-full text-[9px] font-bold ${
                  isActive ? 'bg-white text-sky-700' : 'bg-rose-500 text-white'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
}
