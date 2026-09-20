export type AlertStatus = 'Safe' | 'Warning' | 'Critical';

export type ModelType = 'XGBoost' | 'Random Forest' | 'Ensemble';

export interface ShapFeature {
  name: string;
  fieldKey: string;
  value: string | number;
  contribution: number; // e.g. +24.5% or -12.0%
  description: string;
  isRiskIncreasing: boolean;
}

export interface VillageData {
  id: string; // e.g. "VIL-UP-204"
  name: string;
  district: string;
  state: string;
  region: string;
  coordinates: { lat: number; lng: number };
  
  // Slide 4 Input Fields (Features)
  groundwaterDepth: number; // meters below ground
  criticalThresholdDepth: number; // meters where borewells dry up
  rainfallDeficit: number; // % variance from seasonal normal (-100 to +100)
  populationDensity: number; // persons per sq km
  totalPopulation: number;
  dailyConsumptionPerCapita: number; // Liters per day per person
  socioEconomicVulnerability: 'Low' | 'Medium' | 'High';
  soilAquiferType: 'Alluvial' | 'Hard Rock / Basalt' | 'Sedimentary / Sandstone' | 'Coastal Sandy';
  
  // Historical and 60-day projection data
  historicalDepthTrend: { day: number; depth: number; rainfall: number }[];
  projected60DayTrend: { day: number; depth: number; status: AlertStatus }[];
  
  // Slide 4 Output Fields (Predictions & Alerts)
  crisisProbability: number; // 0 - 100%
  alertStatus: AlertStatus;
  timeToShortageDays: number; // days until critical depletion
  primaryDriver: string;
  recommendedAction: string;
  reliefDispatched?: boolean;
  lastAssessedDate: string;
  sarpanchContact: {
    name: string;
    phone: string;
    email: string;
  };
}

export interface PredictionInputs {
  locationId: string;
  groundwaterDepth: number; // meters
  rainfallDeficit: number; // % variance
  populationDensity: number; // per sq km
  consumptionRate: number; // L/capita/day
  socioEconomicIndex: number; // 0.1 (Low) to 1.0 (High)
  modelType: ModelType;
}

export interface PredictionResult {
  crisisProbability: number; // 0 - 100%
  alertStatus: AlertStatus;
  timeToShortage: number; // days
  shapFeatures: ShapFeature[];
  recommendedAction: string;
  confidenceScore: number;
  modelUsed: ModelType;
  modelMetrics: {
    accuracy: string;
    f1Score: string;
    aucRoc: string;
    recall: string;
  };
}

export interface ReliefLogItem {
  id: string;
  villageId: string;
  villageName: string;
  actionType: 'Tanker Dispatch' | 'Borewell Rationing' | 'Recharge Shaft' | 'SMS Alert Sent';
  urgency: AlertStatus;
  timestamp: string;
  status: 'In Transit' | 'Active' | 'Delivered' | 'Scheduled';
  details: string;
  recipient: string;
}
