import { useState } from 'react';
import { 
  Search, 
  Clock, 
  CheckCircle2, 
  ShieldAlert,
  RefreshCw 
} from 'lucide-react';
import { VillageData, ReliefLogItem, AlertStatus } from './types';
import { INITIAL_VILLAGES, INITIAL_RELIEF_LOGS } from './data/mockVillages';
import { Navbar } from './components/Navbar';
import { StatsBar } from './components/StatsBar';
import { VillageCard } from './components/VillageCard';
import { VillageDetailModal } from './components/VillageDetailModal';
import { MLSimulatorTab } from './components/MLSimulatorTab';
import { ReliefDispatchTab } from './components/ReliefDispatchTab';
import { MobileBottomNav } from './components/MobileBottomNav';

export default function App() {
  const [villages, setVillages] = useState<VillageData[]>(INITIAL_VILLAGES);
  const [reliefLogs, setReliefLogs] = useState<ReliefLogItem[]>(INITIAL_RELIEF_LOGS);
  const [activeTab, setActiveTab] = useState<'villages' | 'simulator' | 'relief'>('villages');
  
  // Filtering and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AlertStatus>('all');
  const [sortBy, setSortBy] = useState<'risk' | 'shortage' | 'name'>('risk');

  // Modal states
  const [selectedVillage, setSelectedVillage] = useState<VillageData | null>(null);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setNotificationToast(message);
    setTimeout(() => {
      setNotificationToast(null);
    }, 4000);
  };

  const criticalCount = villages.filter(v => v.alertStatus === 'Critical').length;

  // Handle relief dispatch from modal or card
  const handleDispatchRelief = (
    villageId: string, 
    actionType: 'Tanker Dispatch' | 'Borewell Rationing' | 'SMS Alert Sent', 
    details: string
  ) => {
    const targetVillage = villages.find(v => v.id === villageId);
    if (!targetVillage) return;

    // Mark relief as dispatched on village
    setVillages(prev =>
      prev.map(v => (v.id === villageId ? { ...v, reliefDispatched: true } : v))
    );

    // Add to logs
    const newLog: ReliefLogItem = {
      id: `REL-00${reliefLogs.length + 1}`,
      villageId,
      villageName: targetVillage.name,
      actionType,
      urgency: targetVillage.alertStatus,
      timestamp: 'Just now',
      status: actionType === 'SMS Alert Sent' ? 'Delivered' : 'In Transit',
      details,
      recipient: targetVillage.sarpanchContact.name,
    };

    setReliefLogs(prev => [newLog, ...prev]);
    showToast(`Relief protocol initiated for ${targetVillage.name}`);
  };

  const handleAddNewRelief = (item: Omit<ReliefLogItem, 'id' | 'timestamp'>) => {
    const newLog: ReliefLogItem = {
      ...item,
      id: `REL-00${reliefLogs.length + 1}`,
      timestamp: 'Just now',
    };
    setReliefLogs(prev => [newLog, ...prev]);

    setVillages(prev =>
      prev.map(v => (v.id === item.villageId ? { ...v, reliefDispatched: true } : v))
    );
    showToast(`Dispatched ${item.actionType} to ${item.villageName}`);
  };

  // Filtered & sorted villages
  const filteredVillages = villages
    .filter(v => {
      const matchesSearch =
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.state.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || v.alertStatus === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'risk') {
        return b.crisisProbability - a.crisisProbability;
      }
      if (sortBy === 'shortage') {
        return a.timeToShortageDays - b.timeToShortageDays;
      }
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="min-h-screen bg-[#f0f7ff] text-slate-900 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Toast Notification */}
      {notificationToast && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-sky-600 text-white text-xs font-semibold shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 border border-sky-400">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>{notificationToast}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        criticalCount={criticalCount}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 lg:px-10 pt-6 sm:pt-8 pb-28 md:pb-20">
        
        {/* TAB 1: VILLAGES EARLY WARNING RADAR */}
        {activeTab === 'villages' && (
          <div className="space-y-6 sm:space-y-8">
            {/* Mission banner */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white border border-sky-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm shadow-sky-900/5">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 border border-sky-200">
                    Proactive 30–60d Forecast
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    Automated Ingestion &amp; Dual ML Inference
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Village Water Scarcity Radar
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1.5 max-w-2xl leading-relaxed">
                  Anticipating localized water shortages weeks before borewells dry up. Empowering gram panchayats with transparent SHAP feature attribution and rapid relief mobilization.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    showToast('Telemetry refreshed from live village stations');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
                  title="Refresh Telemetry"
                >
                  <RefreshCw className="w-4 h-4 text-sky-600" />
                  <span>Refresh Data</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <StatsBar
              villages={villages}
              activeReliefCount={reliefLogs.length}
            />

            {/* Search and Filters Strip */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white border border-sky-100 space-y-4 shadow-sm shadow-sky-900/5">
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                {/* Search input */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search village name, district, or Location ID (e.g., Rampur, VIL-UP-204)..."
                    className="w-full pl-10 pr-4 py-2.5 bg-sky-50/40 border border-sky-200 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                    >
                      &times;
                    </button>
                  )}
                </div>

                {/* Sort selector */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-slate-500 font-medium">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'risk' | 'shortage' | 'name')}
                    className="bg-white border border-sky-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  >
                    <option value="risk">Highest Risk Probability</option>
                    <option value="shortage">Earliest Depletion (Days)</option>
                    <option value="name">Alphabetical</option>
                  </select>
                </div>
              </div>

              {/* Status Filter Chips */}
              <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3.5 py-2 rounded-xl font-semibold transition-all shrink-0 ${
                    statusFilter === 'all'
                      ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/25'
                      : 'bg-white text-slate-600 hover:bg-sky-50 border border-sky-100'
                  }`}
                >
                  All ({villages.length})
                </button>

                <button
                  onClick={() => setStatusFilter('Critical')}
                  className={`px-3.5 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all shrink-0 ${
                    statusFilter === 'Critical'
                      ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/25'
                      : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Critical Red Alert (&ge;85%)</span>
                </button>

                <button
                  onClick={() => setStatusFilter('Warning')}
                  className={`px-3.5 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all shrink-0 ${
                    statusFilter === 'Warning'
                      ? 'bg-amber-600 text-white shadow-sm shadow-amber-600/25'
                      : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>30–60d Warning (50–84%)</span>
                </button>

                <button
                  onClick={() => setStatusFilter('Safe')}
                  className={`px-3.5 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all shrink-0 ${
                    statusFilter === 'Safe'
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/25'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Sustainable (&lt;50%)</span>
                </button>
              </div>
            </div>

            {/* Village Cards Grid */}
            {filteredVillages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-7">
                {filteredVillages.map((village) => (
                  <VillageCard
                    key={village.id}
                    village={village}
                    onSelect={(v) => setSelectedVillage(v)}
                    onDispatchRelief={(v) => {
                      setSelectedVillage(v);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="p-14 text-center rounded-3xl bg-white border border-sky-100 space-y-3 shadow-sm">
                <p className="text-base font-semibold text-slate-800">No villages match your filter criteria</p>
                <p className="text-xs text-slate-500">Try resetting the search keyword or selecting &quot;All&quot; status.</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: INTERACTIVE ML SIMULATOR */}
        {activeTab === 'simulator' && <MLSimulatorTab />}

        {/* TAB 3: RELIEF DISPATCH CENTER */}
        {activeTab === 'relief' && (
          <ReliefDispatchTab
            reliefLogs={reliefLogs}
            villages={villages}
            onAddNewRelief={handleAddNewRelief}
          />
        )}

      </main>

      {/* Modal: Detailed 30-60d Forecast & SHAP Explainability */}
      <VillageDetailModal
        village={selectedVillage}
        onClose={() => setSelectedVillage(null)}
        onDispatchRelief={(villageId, actionType, details) => {
          handleDispatchRelief(villageId, actionType, details);
        }}
      />

      {/* Mobile-first bottom navigation bar */}
      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        criticalCount={criticalCount}
      />
    </div>
  );
}
