import { useState } from 'react';
import { 
  X, 
  AlertTriangle, 
  Droplet, 
  CloudRain, 
  Users, 
  ShieldAlert, 
  CheckCircle2, 
  Send, 
  Truck, 
  PhoneCall, 
  Zap, 
  Layers
} from 'lucide-react';
import { VillageData } from '../types';
import { calculateMLPrediction } from '../utils/mlEngine';

interface VillageDetailModalProps {
  village: VillageData | null;
  onClose: () => void;
  onDispatchRelief: (villageId: string, actionType: 'Tanker Dispatch' | 'Borewell Rationing' | 'SMS Alert Sent', details: string) => void;
}

export function VillageDetailModal({ village, onClose, onDispatchRelief }: VillageDetailModalProps) {
  if (!village) return null;

  const [activeTab, setActiveTab] = useState<'forecast' | 'shap' | 'actions'>('forecast');
  const [smsSentNotice, setSmsSentNotice] = useState(false);
  const [tankerDispatchedNotice, setTankerDispatchedNotice] = useState(village.reliefDispatched || false);
  const [rationingEnforcedNotice, setRationingEnforcedNotice] = useState(false);

  // Compute live SHAP values via ML engine
  const prediction = calculateMLPrediction({
    locationId: village.id,
    groundwaterDepth: village.groundwaterDepth,
    rainfallDeficit: village.rainfallDeficit,
    populationDensity: village.populationDensity,
    consumptionRate: village.dailyConsumptionPerCapita,
    socioEconomicIndex: village.socioEconomicVulnerability === 'High' ? 0.85 : village.socioEconomicVulnerability === 'Medium' ? 0.5 : 0.25,
    modelType: 'XGBoost',
  });

  const isCritical = village.alertStatus === 'Critical';
  const isWarning = village.alertStatus === 'Warning';
  const isSafe = village.alertStatus === 'Safe';

  const handleSendSMS = () => {
    setSmsSentNotice(true);
    onDispatchRelief(
      village.id,
      'SMS Alert Sent',
      `Broadcasted early-warning advisory (${village.timeToShortageDays}d to depletion) to Sarpanch ${village.sarpanchContact.name}`
    );
    setTimeout(() => setSmsSentNotice(false), 4000);
  };

  const handleDispatchTanker = () => {
    setTankerDispatchedNotice(true);
    onDispatchRelief(
      village.id,
      'Tanker Dispatch',
      `Mobilized 2x 12,000L emergency potable water tankers for ${village.name}`
    );
  };

  const handleEnforceRationing = () => {
    setRationingEnforcedNotice(true);
    onDispatchRelief(
      village.id,
      'Borewell Rationing',
      `Restricted agricultural 3-phase power feeder to 4 hrs daily to conserve drinking water layer`
    );
  };

  // Trajectory points for SVG rendering
  const pastTrend = village.historicalDepthTrend;
  const futureTrend = village.projected60DayTrend;

  const chartMinDepth = 10;
  const chartMaxDepth = 55;
  const getY = (depth: number) => {
    const clamped = Math.max(chartMinDepth, Math.min(chartMaxDepth, depth));
    return 140 - ((clamped - chartMinDepth) / (chartMaxDepth - chartMinDepth)) * 110;
  };
  const getX = (day: number) => {
    return 30 + ((day + 60) / 120) * 280;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 lg:p-8 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-white border border-sky-100 w-full sm:max-w-3xl max-h-[92vh] sm:rounded-3xl rounded-t-3xl flex flex-col shadow-2xl overflow-hidden text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 sm:p-7 border-b border-sky-100 flex items-start justify-between bg-sky-50/70 gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-2">
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-sky-100 text-sky-800 border border-sky-200">
                {village.id}
              </span>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                isCritical 
                  ? 'bg-rose-50 text-rose-700 border-rose-200' 
                  : isWarning 
                  ? 'bg-amber-50 text-amber-800 border-amber-200' 
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {isCritical && <ShieldAlert className="w-3.5 h-3.5 text-rose-600 animate-pulse" />}
                {isWarning && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                {isSafe && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                {village.alertStatus} Alert
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {village.region}
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {village.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              District {village.district}, {village.state} • Aquifer: {village.soilAquiferType}
            </p>
          </div>

          <button
            onClick={onClose}
            id="close-village-modal-btn"
            className="p-2 rounded-xl bg-white hover:bg-sky-50 text-slate-500 hover:text-slate-800 transition-all border border-sky-200 shadow-sm"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-sky-100 px-6 bg-white gap-3">
          <button
            onClick={() => setActiveTab('forecast')}
            className={`py-3.5 px-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'forecast'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>30–60d Forecast</span>
          </button>

          <button
            onClick={() => setActiveTab('shap')}
            className={`py-3.5 px-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'shap'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>SHAP Explainability</span>
          </button>

          <button
            onClick={() => setActiveTab('actions')}
            className={`py-3.5 px-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'actions'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Relief Protocols</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 bg-white">
          
          {/* TAB 1: 30-60 DAY TRAJECTORY */}
          {activeTab === 'forecast' && (
            <div className="space-y-6">
              {/* Alert Banner */}
              <div className={`p-4 sm:p-5 rounded-2xl border ${
                isCritical 
                  ? 'bg-rose-50 border-rose-200 text-rose-900' 
                  : isWarning 
                  ? 'bg-amber-50 border-amber-200 text-amber-900' 
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}>
                <div className="flex items-start gap-3">
                  {isCritical ? <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" /> : <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />}
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider">
                      {isSafe ? 'Sustainable Water Table Projection' : `Predicted Shortage In ${village.timeToShortageDays} Days`}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                      {village.recommendedAction}
                    </p>
                  </div>
                </div>
              </div>

              {/* Trajectory Graph Container */}
              <div className="p-5 sm:p-6 rounded-2xl bg-sky-50/40 border border-sky-100">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Aquifer Depletion Trajectory (Meters Depth)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Historical 60d trend vs. Proactive ML 30–60d forecast
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5 text-[11px]">
                    <span className="flex items-center gap-1 text-slate-600">
                      <span className="w-2.5 h-0.5 bg-slate-400 inline-block" /> Past
                    </span>
                    <span className="flex items-center gap-1 text-sky-600 font-medium">
                      <span className="w-2.5 h-0.5 bg-sky-500 inline-block" /> ML Forecast
                    </span>
                    <span className="flex items-center gap-1 text-rose-600 font-medium">
                      <span className="w-2.5 h-0.5 bg-rose-500 border-t border-dashed inline-block" /> Dry Limit
                    </span>
                  </div>
                </div>

                {/* Responsive SVG Projection Chart */}
                <div className="w-full overflow-x-auto py-2 bg-white rounded-xl border border-sky-100">
                  <svg viewBox="0 0 340 160" className="w-full h-48 select-none">
                    {/* Grid lines */}
                    <line x1="30" y1="20" x2="310" y2="20" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="3 3" />
                    <line x1="30" y1="60" x2="310" y2="60" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="3 3" />
                    <line x1="30" y1="100" x2="310" y2="100" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="3 3" />
                    <line x1="30" y1="140" x2="310" y2="140" stroke="#cbd5e1" strokeWidth="1" />

                    {/* Today separator line */}
                    <line x1={getX(0)} y1="15" x2={getX(0)} y2="140" stroke="#0284c7" strokeWidth="1" strokeDasharray="2 2" />
                    <text x={getX(0)} y="12" fill="#0284c7" fontSize="8" textAnchor="middle" fontWeight="bold">Today (Day 0)</text>

                    {/* 30 Day milestone marker */}
                    <line x1={getX(30)} y1="15" x2={getX(30)} y2="140" stroke="#94a3b8" strokeWidth="0.5" strokeDasharray="2 2" />
                    <text x={getX(30)} y="12" fill="#64748b" fontSize="8" textAnchor="middle">+30d</text>

                    {/* 60 Day milestone marker */}
                    <line x1={getX(60)} y1="15" x2={getX(60)} y2="140" stroke="#94a3b8" strokeWidth="0.5" strokeDasharray="2 2" />
                    <text x={getX(60)} y="12" fill="#64748b" fontSize="8" textAnchor="middle">+60d</text>

                    {/* Critical Threshold line */}
                    <line 
                      x1="30" 
                      y1={getY(village.criticalThresholdDepth)} 
                      x2="310" 
                      y2={getY(village.criticalThresholdDepth)} 
                      stroke="#f43f5e" 
                      strokeWidth="1.2" 
                      strokeDasharray="4 4" 
                    />
                    <text 
                      x="312" 
                      y={getY(village.criticalThresholdDepth) + 3} 
                      fill="#f43f5e" 
                      fontSize="7" 
                      fontWeight="bold"
                    >
                      {village.criticalThresholdDepth}m Dry
                    </text>

                    {/* Historical Polyline */}
                    <path
                      d={pastTrend.reduce((acc, pt, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${getX(pt.day)} ${getY(pt.depth)}`, '')}
                      fill="none"
                      stroke="#94a3b8"
                      strokeWidth="2"
                    />

                    {/* Forecast Polyline */}
                    <path
                      d={futureTrend.reduce((acc, pt, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${getX(pt.day)} ${getY(pt.depth)}`, '')}
                      fill="none"
                      stroke={isCritical ? '#f43f5e' : isWarning ? '#f59e0b' : '#0284c7'}
                      strokeWidth="2.5"
                    />

                    {/* Plot Points */}
                    {pastTrend.map((pt, i) => (
                      <circle key={`past-${i}`} cx={getX(pt.day)} cy={getY(pt.depth)} r="2.5" fill="#94a3b8" />
                    ))}
                    {futureTrend.map((pt, i) => (
                      <circle 
                        key={`future-${i}`} 
                        cx={getX(pt.day)} 
                        cy={getY(pt.depth)} 
                        r="3.5" 
                        fill={isCritical ? '#f43f5e' : isWarning ? '#f59e0b' : '#0284c7'} 
                        stroke="#ffffff" 
                        strokeWidth="1.5"
                      />
                    ))}

                    {/* X-axis labels */}
                    <text x={getX(-60)} y="152" fill="#64748b" fontSize="8" textAnchor="middle">-60d</text>
                    <text x={getX(-30)} y="152" fill="#64748b" fontSize="8" textAnchor="middle">-30d</text>
                    <text x={getX(0)} y="152" fill="#0284c7" fontSize="8" textAnchor="middle" fontWeight="bold">Day 0</text>
                    <text x={getX(30)} y="152" fill="#64748b" fontSize="8" textAnchor="middle">+30d</text>
                    <text x={getX(60)} y="152" fill="#64748b" fontSize="8" textAnchor="middle">+60d</text>

                    {/* Y-axis depth markers */}
                    <text x="26" y={getY(20)} fill="#64748b" fontSize="7" textAnchor="end">20m</text>
                    <text x="26" y={getY(35)} fill="#64748b" fontSize="7" textAnchor="end">35m</text>
                    <text x="26" y={getY(50)} fill="#64748b" fontSize="7" textAnchor="end">50m</text>
                  </svg>
                </div>

                <div className="mt-3 text-xs text-slate-500 flex items-center justify-between border-t border-sky-100 pt-3">
                  <span>Current Depth: <strong className="text-slate-800">{village.groundwaterDepth.toFixed(1)}m</strong></span>
                  <span>Projected 60d: <strong className={isCritical ? 'text-rose-600' : 'text-slate-800'}>
                    {village.projected60DayTrend[village.projected60DayTrend.length - 1]?.depth.toFixed(1)}m
                  </strong></span>
                </div>
              </div>

              {/* Key Environmental Indicators Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-sky-50/50 border border-sky-100">
                  <div className="text-slate-500 text-xs flex items-center gap-1.5">
                    <Droplet className="w-3.5 h-3.5 text-sky-600" />
                    <span>Groundwater</span>
                  </div>
                  <div className="text-base font-bold text-slate-900 mt-1">{village.groundwaterDepth}m</div>
                  <div className="text-xs text-slate-400 mt-0.5">Critical at {village.criticalThresholdDepth}m</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-sky-50/50 border border-sky-100">
                  <div className="text-slate-500 text-xs flex items-center gap-1.5">
                    <CloudRain className="w-3.5 h-3.5 text-blue-600" />
                    <span>Monsoon Deficit</span>
                  </div>
                  <div className={`text-base font-bold mt-1 ${village.rainfallDeficit < -20 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {village.rainfallDeficit}%
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">vs seasonal normal</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-sky-50/50 border border-sky-100">
                  <div className="text-slate-500 text-xs flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Population</span>
                  </div>
                  <div className="text-base font-bold text-slate-900 mt-1">{village.totalPopulation.toLocaleString()}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{village.populationDensity}/km² density</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-sky-50/50 border border-sky-100">
                  <div className="text-slate-500 text-xs flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-amber-600" />
                    <span>Per-Capita Draw</span>
                  </div>
                  <div className="text-base font-bold text-slate-900 mt-1">{village.dailyConsumptionPerCapita} L/d</div>
                  <div className="text-xs text-slate-400 mt-0.5">Socio-ec: {village.socioEconomicVulnerability}</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SHAP EXPLAINABLE AI */}
          {activeTab === 'shap' && (
            <div className="space-y-6">
              <div className="p-5 sm:p-6 rounded-2xl bg-sky-50/40 border border-sky-100">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-sky-800 uppercase tracking-wider flex items-center gap-1.5">
                    <span>SHAP Waterfall Feature Attribution</span>
                  </h3>
                  <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-sky-100 text-sky-800 border border-sky-200">
                    XGBoost Model
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 mb-4 leading-relaxed">
                  Decomposing the baseline risk (22%) into individual positive and negative feature contributions:
                </p>

                {/* SHAP Contribution Bars */}
                <div className="space-y-3">
                  {prediction.shapFeatures.map((feat, idx) => {
                    const isPositive = feat.contribution > 0;
                    const barWidth = Math.min(100, Math.abs(feat.contribution) * 2.8);

                    return (
                      <div key={idx} className="p-3.5 rounded-xl bg-white border border-sky-100 shadow-sm">
                        <div className="flex items-center justify-between text-xs sm:text-sm mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-800">{feat.name}</span>
                            <span className="text-xs text-slate-500 font-mono">({feat.value})</span>
                          </div>
                          <span className={`font-mono font-bold text-xs sm:text-sm ${isPositive ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {isPositive ? `+${feat.contribution}%` : `${feat.contribution}%`}
                          </span>
                        </div>

                        {/* Visual contribution bar */}
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex items-center my-1.5">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isPositive ? 'bg-gradient-to-r from-amber-500 to-rose-500' : 'bg-gradient-to-r from-sky-400 to-emerald-400'
                            }`}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>

                        <p className="text-xs text-slate-500 mt-1">
                          {feat.description}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* SHAP Summary Outcome */}
                <div className="mt-4 p-3.5 rounded-xl bg-white border border-sky-100 flex items-center justify-between text-xs sm:text-sm shadow-sm">
                  <span className="text-slate-600 font-medium">Total Calculated Crisis Risk:</span>
                  <span className={`text-lg font-extrabold ${isCritical ? 'text-rose-600' : isWarning ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {prediction.crisisProbability}% ({prediction.alertStatus})
                  </span>
                </div>
              </div>

              {/* Model Confidence & Metrics Card */}
              <div className="p-5 sm:p-6 rounded-2xl bg-sky-50/40 border border-sky-100">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                  5-Fold Stratified Cross-Validation Metrics
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                  <div className="p-3 rounded-xl bg-white border border-sky-100 shadow-sm">
                    <div className="text-xs text-slate-500">Accuracy</div>
                    <div className="text-base font-bold text-sky-600 mt-1">{prediction.modelMetrics.accuracy}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-sky-100 shadow-sm">
                    <div className="text-xs text-slate-500">Recall</div>
                    <div className="text-base font-bold text-emerald-600 mt-1">{prediction.modelMetrics.recall}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-sky-100 shadow-sm">
                    <div className="text-xs text-slate-500">F1-Score</div>
                    <div className="text-base font-bold text-indigo-600 mt-1">{prediction.modelMetrics.f1Score}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-sky-100 shadow-sm">
                    <div className="text-xs text-slate-500">AUC-ROC</div>
                    <div className="text-base font-bold text-purple-600 mt-1">{prediction.modelMetrics.aucRoc}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PROACTIVE RELIEF DISPATCH ACTIONS */}
          {activeTab === 'actions' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-sky-50/40 border border-sky-100">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Local Authority Contacts
                </h3>
                <div className="p-3.5 rounded-xl bg-white border border-sky-100 text-xs sm:text-sm flex items-center justify-between shadow-sm">
                  <div>
                    <div className="font-bold text-slate-900">{village.sarpanchContact.name}</div>
                    <div className="text-slate-600 text-xs mt-0.5">Contact: {village.sarpanchContact.phone}</div>
                    <div className="text-slate-400 text-xs">{village.sarpanchContact.email}</div>
                  </div>
                  <a
                    href={`tel:${village.sarpanchContact.phone}`}
                    className="p-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 transition-colors"
                    title="Direct Phone Line"
                  >
                    <PhoneCall className="w-5 h-5" />
                  </a>
                </div>
              </div>

              {/* Action 1: SMS Early Warning Broadcast */}
              <div className="p-5 rounded-2xl bg-sky-50/40 border border-sky-100 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Send className="w-4 h-4 text-sky-600" />
                      <span>Early Warning SMS Broadcast (Gram Panchayat)</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Sends official automated early warning advisory ({village.timeToShortageDays}d to dry threshold) to Sarpanch &amp; Block Development Officer.
                    </p>
                  </div>
                  <button
                    onClick={handleSendSMS}
                    disabled={smsSentNotice}
                    id="btn-broadcast-sms"
                    className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-semibold shrink-0 transition-all shadow-sm"
                  >
                    {smsSentNotice ? 'Sent ✓' : 'Send SMS'}
                  </button>
                </div>

                {/* SMS Preview preview box */}
                <div className="p-3 rounded-xl bg-white border border-sky-100 text-xs font-mono text-slate-700 leading-relaxed shadow-sm">
                  <span className="text-sky-700 font-bold">[WAVES ADVISORY]</span> Urgent notice for {village.name} ({village.id}): Current groundwater at {village.groundwaterDepth}m. ML models forecast critical water exhaustion in {village.timeToShortageDays} days. Initiate water rationing protocols immediately.
                </div>
              </div>

              {/* Action 2: Mobilize Emergency Potable Water Tankers */}
              <div className="p-5 rounded-2xl bg-sky-50/40 border border-sky-100">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Truck className="w-4 h-4 text-emerald-600" />
                      <span>Dispatch Emergency Water Tanker Fleet</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Authorizes 2x 12,000L drinking water supply tankers from District Depot to {village.name}.
                    </p>
                  </div>
                  <button
                    onClick={handleDispatchTanker}
                    disabled={tankerDispatchedNotice}
                    id="btn-dispatch-tanker-action"
                    className={`px-4 py-2.5 rounded-xl text-xs font-semibold shrink-0 transition-all shadow-sm ${
                      tankerDispatchedNotice
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    {tankerDispatchedNotice ? 'Dispatched ✓' : 'Deploy Tankers'}
                  </button>
                </div>
              </div>

              {/* Action 3: Enforce Agricultural Tubewell Power Rationing */}
              <div className="p-5 rounded-2xl bg-sky-50/40 border border-sky-100">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-600" />
                      <span>Issue 3-Phase Agricultural Power Curtailment</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Instructs electrical distribution feeder to limit agricultural extraction to 4 hours/day to preserve drinking water strata.
                    </p>
                  </div>
                  <button
                    onClick={handleEnforceRationing}
                    disabled={rationingEnforcedNotice}
                    id="btn-enforce-rationing-action"
                    className={`px-4 py-2.5 rounded-xl text-xs font-semibold shrink-0 transition-all shadow-sm ${
                      rationingEnforcedNotice
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-amber-600 hover:bg-amber-500 text-white'
                    }`}
                  >
                    {rationingEnforcedNotice ? 'Enforced ✓' : 'Enforce Policy'}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-5 sm:p-6 border-t border-sky-100 bg-sky-50/70 flex items-center justify-between text-xs sm:text-sm">
          <div className="text-slate-500">
            Telemetry assessed: <span className="text-slate-800 font-semibold">{village.lastAssessedDate}</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-sky-50 text-slate-700 font-semibold transition-all border border-sky-200 shadow-sm"
          >
            Close Overview
          </button>
        </div>
      </div>
    </div>
  );
}
