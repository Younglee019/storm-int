export interface Location {
  lat: number;
  lng: number;
}

export interface GridIncident {
  id: string;
  utility: string;
  title: string;
  type: string;
  location: Location;
  address?: string;
  voltageKv?: number;
  customersOut?: number;
  status: string;
  severity: string;
  startDate?: string;
  endDate?: string;
  dataSource?: string;
}

export interface RoadHazard {
  id: string;
  corridor: string;
  type: string;
  location: Location;
  impassableForEV: boolean;
  clearanceWindowHours?: number;
  waterDepthInches?: number;
  batteryImpactKw?: number;
  recommendedReroute: string;
  severity: string;
  source?: string;
}

export interface UtilityCrew {
  id: string;
  utility: string;
  name: string;
  members: number;
  currentLocation: Location;
  assignedIncidentId: string;
  status: string;
  specialty: string;
}

export interface OverlapSynergy {
  incidentA: GridIncident;
  incidentB: GridIncident;
  distanceKm: number;
  tier: string;
  savingsProjectionUsd: number;
  synergyStrategy: string;
  concurrentMonths: number;
  priorityScore: number;
}