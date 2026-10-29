import { LayoutDashboard, Radio, Sliders, Truck, PhoneCall } from 'lucide-react';
import { AppTab } from '../types';

interface MobileBottomNavProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  criticalCount: number;
}

export function MobileBottomNav({
  activeTab,
  onTabChange,
  criticalCount,
}: MobileBottomNavProps) {
  const tabs = [
    { id: 'overview' as AppTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'villages' as AppTab, label: 'Radar', icon: Radio, badge: criticalCount },
    { id: 'simulator' as AppTab, label: 'Simulator', icon: Sliders },
    { id: 'relief' as AppTab, label: 'Relief', icon: Truck },
    { id: 'contacts' as AppTab, label: 'Contacts', icon: PhoneCall },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-sky-100 text-slate-600 py-1.5 px-2 shadow-[0_-4px_20px_rgba(2,132,199,0.06)] md:hidden">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              id={`nav-${tab.id}-btn`}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative ${
                isActive
                  ? 'text-sky-600 font-bold'
                  : 'text-slate-500 hover:text-sky-600'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : ''}`} />
                {Boolean(tab.badge && tab.badge > 0) && (
                  <span className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[8px] font-bold flex items-center justify-center ring-2 ring-white">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'text-sky-600 font-bold' : 'text-slate-500'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
