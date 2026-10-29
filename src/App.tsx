import { useState } from 'react';
import { 
  Search, 
  Clock, 
  CheckCircle2, 
  ShieldAlert,
  RefreshCw,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { VillageData, ReliefLogItem, AlertStatus, AppTab } from './types';
import { INITIAL_VILLAGES, INITIAL_RELIEF_LOGS } from './data/mockVillages';
import { Navbar } from './components/Navbar';
import { OverviewTab } from './components/OverviewTab';
import { VillageCard } from './components/VillageCard';
import { VillageDetailModal } from './components/VillageDetailModal';
import { MLSimulatorTab } from './components/MLSimulatorTab';
import { ReliefDispatchTab } from './components/ReliefDispatchTab';
import { ContactsTab } from './components/ContactsTab';
import { MobileBottomNav } from './components/MobileBottomNav';

export default function App() {
  const [villages, setVillages] = useState<VillageData[]>(INITIAL_VILLAGES);
  const [reliefLogs, setReliefLogs] = useState<ReliefLogItem[]>(INITIAL_RELIEF_LOGS);
  const [activeTab, setActiveTab] = useState<AppTab>('overview');
  
  // Filtering and search states for Village Radar tab
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

  // Handle relief dispatch from modal, cards, or overview
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

  const handleSendEmergencySms = (villageId: string, recipientName: string) => {
    const targetVillage = villages.find(v => v.id === villageId);
    if (!targetVillage) return;

    handleDispatchRelief(
      villageId,
      'SMS Alert Sent',
      `High-priority early warning alert SMS delivered to Sarpanch ${recipientName} (${targetVillage.timeToShortageDays}d to dry-threshold)`
    );
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

      {/* Top Navbar with 5 multi-tabs */}
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        criticalCount={criticalCount}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-28 md:pb-20">
        
        {/* TAB 1: EXECUTIVE OVERVIEW DASHBOARD */}
        {activeTab === 'overview' && (
          <OverviewTab
            villages={villages}
            activeReliefCount={reliefLogs.length}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onSelectVillage={(v) => setSelectedVillage(v)}
            onQuickDispatch={handleDispatchRelief}
            onRefresh={() => showToast('Station telemetry synced across all districts')}
          />
        )}

        {/* TAB 2: VILLAGE RADAR (DISCOVERY & MONITORING) */}
        {activeTab === 'villages' && (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
            {/* Mission banner */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white border border-sky-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm shadow-sky-900/5">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 border border-sky-200">
                    Station Directory
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {villages.length} Monitored Gram Panchayats
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Village Water Scarcity Radar
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                  Browse borewell water tables, rainfall deficits, and ML crisis probabilities. Click any village to review detailed 60-day curves and feature contributions.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => showToast('Refreshed latest piezometer sensor readings')}
                  className="px-4 py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
                >
                  <RefreshCw className="w-4 h-4 text-sky-600" />
                  <span>Refresh Sensors</span>
                </button>
              </div>
            </div>

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
                    placeholder="Search village name, district, or ID (e.g. Kanpur, Meerut, Greater Noida, Delhi)..."
                    className="w-full pl-10 pr-9 py-2.5 bg-sky-50/40 border border-sky-200 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Sort selector */}
                <div className="flex items-center gap-2 shrink-0">
                  <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                  <span className="text-xs text-slate-500 font-medium">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'risk' | 'shortage' | 'name')}
                    className="bg-white border border-sky-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-medium"
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
                  className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all shrink-0 ${
                    statusFilter === 'all'
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-sky-50 border border-sky-100'
                  }`}
                >
                  All ({villages.length})
                </button>

                <button
                  onClick={() => setStatusFilter('Critical')}
                  className={`px-3.5 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
                    statusFilter === 'Critical'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Critical Alert (&ge;85%)</span>
                </button>

                <button
                  onClick={() => setStatusFilter('Warning')}
                  className={`px-3.5 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
                    statusFilter === 'Warning'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>30–60d Warning</span>
                </button>

                <button
                  onClick={() => setStatusFilter('Safe')}
                  className={`px-3.5 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
                    statusFilter === 'Safe'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Sustainable</span>
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
                    onDispatchRelief={(v) => setSelectedVillage(v)}
                  />
                ))}
              </div>
            ) : (
              <div className="p-14 text-center rounded-3xl bg-white border border-sky-100 space-y-3 shadow-sm">
                <p className="text-base font-semibold text-slate-800">No villages match your filter criteria</p>
                <p className="text-xs text-slate-500">Try clearing the search query or selecting &quot;All&quot; status.</p>
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

        {/* TAB 3: INTERACTIVE ML SIMULATOR */}
        {activeTab === 'simulator' && <MLSimulatorTab />}

        {/* TAB 4: RELIEF DISPATCH CENTER */}
        {activeTab === 'relief' && (
          <ReliefDispatchTab
            reliefLogs={reliefLogs}
            villages={villages}
            onAddNewRelief={handleAddNewRelief}
          />
        )}

        {/* TAB 5: SARPANCH & WATER OFFICER DIRECTORY */}
        {activeTab === 'contacts' && (
          <ContactsTab
            villages={villages}
            onSendAlert={handleSendEmergencySms}
          />
        )}

      </main>

      {/* Modal: Detailed 30-60d Forecast & Explainability */}
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
