import { useState } from 'react';
import { Truck, Zap, Send, CheckCircle2, Clock, Plus } from 'lucide-react';
import { ReliefLogItem, VillageData } from '../types';

interface ReliefDispatchTabProps {
  reliefLogs: ReliefLogItem[];
  villages: VillageData[];
  onAddNewRelief: (item: Omit<ReliefLogItem, 'id' | 'timestamp'>) => void;
}

export function ReliefDispatchTab({ reliefLogs, villages, onAddNewRelief }: ReliefDispatchTabProps) {
  const [selectedVillageId, setSelectedVillageId] = useState(villages[0]?.id || '');
  const [actionType, setActionType] = useState<ReliefLogItem['actionType']>('Tanker Dispatch');
  const [customNotes, setCustomNotes] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');

  const selectedVillage = villages.find(v => v.id === selectedVillageId) || villages[0];

  const handleCreateDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVillage) return;

    let defaultDetails = customNotes;
    if (!defaultDetails) {
      if (actionType === 'Tanker Dispatch') {
        defaultDetails = `Dispatched 2x 12,000L Potable Water Tankers from Central District Depot to ${selectedVillage.name}`;
      } else if (actionType === 'Borewell Rationing') {
        defaultDetails = `Issued Gram Panchayat Executive Order: Agricultural tubewell feeder restricted to 4 hrs daily`;
      } else if (actionType === 'SMS Alert Sent') {
        defaultDetails = `Automated high-priority early warning SMS sent to Sarpanch ${selectedVillage.sarpanchContact.name} (${selectedVillage.timeToShortageDays}d to depletion)`;
      } else {
        defaultDetails = `Field inspection and check-dam desiltation mobilization approved`;
      }
    }

    onAddNewRelief({
      villageId: selectedVillage.id,
      villageName: selectedVillage.name,
      actionType,
      urgency: selectedVillage.alertStatus,
      status: actionType === 'SMS Alert Sent' ? 'Delivered' : 'In Transit',
      details: defaultDetails,
      recipient: selectedVillage.sarpanchContact.name,
    });

    setCustomNotes('');
    setIsModalOpen(false);
  };

  const filteredLogs = reliefLogs.filter(log => {
    if (filterType === 'all') return true;
    return log.actionType.toLowerCase().includes(filterType.toLowerCase());
  });

  return (
    <div className="space-y-6 sm:space-y-8 pb-20">
      {/* Header card */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-sky-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm shadow-sky-900/5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Truck className="w-5 h-5 text-emerald-600" />
            <span>Civic Relief &amp; Intervention Control Center</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Operationalize proactive ML early warnings: Authorize water tankers, enforce tubewell rationing, and broadcast alerts.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          id="btn-open-dispatch-modal"
          className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm shadow-emerald-600/20 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Relief Dispatch</span>
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3.5 py-2 rounded-xl font-semibold transition-all shrink-0 ${
            filterType === 'all'
              ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/25'
              : 'bg-white text-slate-600 hover:text-sky-700 hover:bg-sky-50 border border-sky-100'
          }`}
        >
          All Activity ({reliefLogs.length})
        </button>
        <button
          onClick={() => setFilterType('tanker')}
          className={`px-3.5 py-2 rounded-xl font-semibold transition-all shrink-0 ${
            filterType === 'tanker'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 border border-sky-100'
          }`}
        >
          Water Tankers
        </button>
        <button
          onClick={() => setFilterType('sms')}
          className={`px-3.5 py-2 rounded-xl font-semibold transition-all shrink-0 ${
            filterType === 'sms'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:text-sky-700 hover:bg-sky-50 border border-sky-100'
          }`}
        >
          SMS Broadcasts
        </button>
        <button
          onClick={() => setFilterType('rationing')}
          className={`px-3.5 py-2 rounded-xl font-semibold transition-all shrink-0 ${
            filterType === 'rationing'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:text-amber-700 hover:bg-amber-50 border border-sky-100'
          }`}
        >
          Borewell Rationing
        </button>
      </div>

      {/* Roster of Relief Logs */}
      <div className="space-y-4">
        {filteredLogs.map((log) => {
          const isCritical = log.urgency === 'Critical';

          return (
            <div
              key={log.id}
              className="p-5 sm:p-6 rounded-3xl bg-white border border-sky-100 hover:border-sky-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm shadow-sky-900/5"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-2xl shrink-0 mt-0.5 ${
                  log.actionType === 'Tanker Dispatch'
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    : log.actionType === 'SMS Alert Sent'
                    ? 'bg-sky-50 text-sky-600 border border-sky-200'
                    : 'bg-amber-50 text-amber-600 border border-amber-200'
                }`}>
                  {log.actionType === 'Tanker Dispatch' && <Truck className="w-5 h-5" />}
                  {log.actionType === 'SMS Alert Sent' && <Send className="w-5 h-5" />}
                  {log.actionType === 'Borewell Rationing' && <Zap className="w-5 h-5" />}
                  {log.actionType === 'Recharge Shaft' && <Clock className="w-5 h-5" />}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="text-sm font-bold text-slate-900">{log.villageName}</span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200">
                      {log.villageId}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                      isCritical ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {log.urgency} Priority
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {log.details}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
                    <span>Officer/Recipient: <strong className="text-slate-700">{log.recipient}</strong></span>
                    <span>•</span>
                    <span>{log.timestamp}</span>
                  </div>
                </div>
              </div>

              {/* Status Pill */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 border-sky-100 pt-3 sm:pt-0">
                <span className={`text-xs font-semibold px-3 py-1 rounded-xl border flex items-center gap-1.5 ${
                  log.status === 'Delivered'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : log.status === 'In Transit'
                    ? 'bg-sky-50 text-sky-700 border border-sky-200'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{log.status}</span>
                </span>
                <span className="text-xs text-slate-400 mt-1.5 font-mono">{log.id}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Dispatch Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white border border-sky-100 w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 text-slate-900">
            <div className="flex items-center justify-between border-b border-sky-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2.5">
                <Truck className="w-5 h-5 text-emerald-600" />
                <span>Issue Proactive Relief Directive</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg bg-white hover:bg-sky-50 text-slate-500 border border-sky-200 text-xs font-semibold"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreateDispatch} className="space-y-4 text-xs sm:text-sm">
              {/* Target Village */}
              <div>
                <label className="block font-semibold text-slate-800 mb-1.5">Target Village / Panchayat</label>
                <select
                  value={selectedVillageId}
                  onChange={(e) => setSelectedVillageId(e.target.value)}
                  className="w-full bg-white border border-sky-200 rounded-xl p-3 text-slate-900 font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:outline-none"
                >
                  {villages.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.district}) - {v.alertStatus} Alert [{v.timeToShortageDays}d left]
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Type */}
              <div>
                <label className="block font-semibold text-slate-800 mb-1.5">Relief Intervention Type</label>
                <select
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value as ReliefLogItem['actionType'])}
                  className="w-full bg-white border border-sky-200 rounded-xl p-3 text-slate-900 font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:outline-none"
                >
                  <option value="Tanker Dispatch">Emergency Potable Water Tanker Fleet (2x 12,000L)</option>
                  <option value="Borewell Rationing">Agricultural Tubewell Power Rationing (4h feeder cap)</option>
                  <option value="SMS Alert Sent">Official Early-Warning SMS to Gram Panchayat</option>
                  <option value="Recharge Shaft">Recharge Shaft Maintenance &amp; Desiltation</option>
                </select>
              </div>

              {/* Custom Dispatch Details */}
              <div>
                <label className="block font-semibold text-slate-800 mb-1.5">Specific Instructions (Optional)</label>
                <textarea
                  rows={3}
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="Enter specific logistics details, tanker depot codes, or ration quotas..."
                  className="w-full bg-white border border-sky-200 rounded-xl p-3 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-white hover:bg-sky-50 text-slate-600 border border-slate-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-sm shadow-emerald-600/20 transition-all"
                >
                  Confirm &amp; Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
