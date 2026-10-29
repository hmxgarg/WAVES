import { useState } from 'react';
import { 
  Phone, 
  Mail, 
  Send, 
  Search, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Users, 
  Check
} from 'lucide-react';
import { VillageData } from '../types';

interface ContactsTabProps {
  villages: VillageData[];
  onSendAlert: (villageId: string, recipientName: string) => void;
}

export function ContactsTab({ villages, onSendAlert }: ContactsTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  const handleCopyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 2500);
  };

  const filtered = villages.filter(v => {
    const term = searchTerm.toLowerCase();
    return (
      v.sarpanchContact.name.toLowerCase().includes(term) ||
      v.name.toLowerCase().includes(term) ||
      v.district.toLowerCase().includes(term) ||
      v.state.toLowerCase().includes(term) ||
      v.sarpanchContact.email.toLowerCase().includes(term) ||
      v.sarpanchContact.phone.includes(term)
    );
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-sky-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm shadow-sky-900/5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 border border-sky-200">
              Gram Panchayat Roster
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Verified Emergency Contact Lines
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Sarpanch &amp; Water Officer Directory
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1.5 max-w-2xl leading-relaxed">
            Direct communication channels to village leadership, including Sarpanches, Gram Sevaks, and water committee heads for rapid drought escalation.
          </p>
        </div>

        <div className="relative w-full sm:w-72 shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Sarpanch or village..."
            className="w-full pl-10 pr-4 py-2.5 bg-sky-50/50 border border-sky-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
          />
        </div>
      </div>

      {/* Contact Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {filtered.map((village) => {
          const isCritical = village.alertStatus === 'Critical';
          const isWarning = village.alertStatus === 'Warning';

          return (
            <div
              key={village.id}
              className={`rounded-3xl border bg-white p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                isCritical
                  ? 'border-rose-200/90 hover:border-rose-300'
                  : isWarning
                  ? 'border-amber-200/90 hover:border-amber-300'
                  : 'border-sky-100 hover:border-sky-300'
              }`}
            >
              <div>
                {/* Header with status badge */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[11px] font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                      {village.id}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-1.5 leading-snug">
                      {village.sarpanchContact.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Sarpanch / Pradhan • {village.name}
                    </p>
                  </div>

                  <span
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1 shrink-0 ${
                      isCritical
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : isWarning
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {isCritical && <ShieldAlert className="w-3 h-3 text-rose-600 animate-pulse" />}
                    {isWarning && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                    {village.alertStatus === 'Safe' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                    <span>{village.alertStatus}</span>
                  </span>
                </div>

                {/* Village Details & Jurisdiction */}
                <div className="p-3.5 rounded-2xl bg-sky-50/40 border border-sky-100 space-y-2 mb-4 text-xs text-slate-600">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Jurisdiction:</span>
                    <span className="font-semibold text-slate-800">{village.district}, {village.state}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Days to Depletion:</span>
                    <span className={`font-bold ${isCritical ? 'text-rose-600' : isWarning ? 'text-amber-700' : 'text-emerald-700'}`}>
                      {village.alertStatus === 'Safe' ? '>90 Days' : `${village.timeToShortageDays} Days`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Village Population:</span>
                    <span className="font-medium text-slate-700">{village.totalPopulation.toLocaleString()} residents</span>
                  </div>
                </div>

                {/* Contact Coordinates */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-700 truncate">
                      <Phone className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      <span className="font-mono font-medium truncate">{village.sarpanchContact.phone}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyPhone(village.sarpanchContact.phone)}
                      className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 px-2 py-0.5 rounded hover:bg-sky-100/60 transition-colors"
                      title="Copy phone"
                    >
                      {copiedPhone === village.sarpanchContact.phone ? (
                        <span className="flex items-center gap-1 text-emerald-600">
                          <Check className="w-3 h-3" /> Copied
                        </span>
                      ) : (
                        'Copy'
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-700">
                    <Mail className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    <span className="font-mono text-[11px] truncate">{village.sarpanchContact.email}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-4 border-t border-slate-100 grid grid-cols-2 gap-2">
                <a
                  href={`tel:${village.sarpanchContact.phone.replace(/[^0-9+]/g, '')}`}
                  className="py-2 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Pradhan</span>
                </a>

                <button
                  type="button"
                  onClick={() => onSendAlert(village.id, village.sarpanchContact.name)}
                  className="py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send SMS</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
