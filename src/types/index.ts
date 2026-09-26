export type SeverityLevel = 'critical' | 'high' | 'moderate' | 'low';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface GridIncident {
  id: string;
  utility: 'Georgia Power' | 'Dominion Energy SC';
  title: string;
  type: 'substation_failure' | 'downed_line' | 'transformer_burnout' | 'tree_obstruction';
  location: Coordinates;
  address: string;
  voltageKv: number;
  customersOut: number;
  status: 'active' | 'crew_en_route' | 'repairing' | 'cleared';
  severity: SeverityLevel;
  startDate: string;
  endDate: string;
}

export interface RoadHazard {
  id: string;
  corridor: string;
  type: 'flooding' | 'debris' | 'downed_power_pole' | 'traffic_signal_out';
  location: Coordinates;
  impassableForEV: boolean;
  clearanceWindowHours: number;
  recommendedReroute: string;
  severity: SeverityLevel;
}

export interface UtilityCrew {
  id: string;
  utility: 'Georgia Power' | 'Dominion Energy SC';
  name: string;
  equipmentType: '300-Ton Crane' | 'High-Reach Bucket' | 'Vegetation Crew' | 'Transformer Transport Rig';
  currentLocation: Coordinates;
  status: 'available' | 'dispatched' | 'staging';
  mutualAidEligible: boolean;
}