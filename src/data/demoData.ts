import { GridIncident, RoadHazard, UtilityCrew } from '../types';

export const DEMO_INCIDENTS: any[] = [
  // 1. Georgia Power
  {
    id: 'INC-101',
    utility: 'Georgia Power',
    title: 'Plant McIntosh 500kV Feeder Interconnect',
    type: 'downed_line',
    location: { lat: 32.342, lng: -81.161 },
    address: 'Effingham County, GA (Savannah River)',
    voltageKv: 500,
    customersOut: 14200,
    status: 'active',
    severity: 'critical',
    startDate: '2027-06',
    endDate: '2028-12'
  },
  {
    id: 'INC-103',
    utility: 'Georgia Power',
    title: 'Savannah River Feeder Sub-Pole Fracture',
    type: 'downed_line',
    location: { lat: 32.152, lng: -81.101 },
    address: 'Port Wentworth, GA',
    voltageKv: 115,
    customersOut: 2300,
    status: 'crew_en_route',
    severity: 'high',
    startDate: '2027-01',
    endDate: '2027-11'
  },

  // 2. Dominion Energy SC
  {
    id: 'INC-102',
    utility: 'Dominion Energy SC',
    title: 'Jasper County 230kV Substation Modernization',
    type: 'substation_failure',
    location: { lat: 32.361, lng: -81.121 },
    address: 'Hardeeville / Jasper County, SC',
    voltageKv: 230,
    customersOut: 8900,
    status: 'active',
    severity: 'critical',
    startDate: '2027-03',
    endDate: '2028-10'
  },
  {
    id: 'INC-104',
    utility: 'Dominion Energy SC',
    title: 'Bluffton Parkway 115kV Line Extension',
    type: 'tree_obstruction',
    location: { lat: 32.235, lng: -80.864 },
    address: 'Bluffton, SC',
    voltageKv: 115,
    customersOut: 1100,
    status: 'repairing',
    severity: 'moderate',
    startDate: '2027-02',
    endDate: '2027-09'
  },

  // 3. Duke Energy Carolinas
  {
    id: 'INC-105',
    utility: 'Duke Energy',
    title: 'Augusta-Aiken 230kV Intertie Reconstruction',
    type: 'downed_line',
    location: { lat: 33.473, lng: -81.967 },
    address: 'Aiken County, SC / Richmond County, GA',
    voltageKv: 230,
    customersOut: 19400,
    status: 'active',
    severity: 'critical',
    startDate: '2027-04',
    endDate: '2028-06'
  },

  // 4. Florida Power & Light (FPL)
  {
    id: 'INC-106',
    utility: 'Florida Power & Light (FPL)',
    title: 'St. Marys River Inter-State 500kV Crossing',
    type: 'substation_failure',
    location: { lat: 30.718, lng: -81.652 },
    address: 'Kingsland, GA / Nassau County, FL Border',
    voltageKv: 500,
    customersOut: 32100,
    status: 'active',
    severity: 'critical',
    startDate: '2027-08',
    endDate: '2029-01'
  }
];

export const DEMO_HAZARDS: any[] = [
  {
    id: 'HAZ-201',
    corridor: 'GA-21 / Effingham Arterial',
    type: 'flooding',
    location: { lat: 32.338, lng: -81.155 },
    impassableForEV: true,
    clearanceWindowHours: 6,
    waterDepthInches: 18,
    batteryImpactKw: 4.8,
    recommendedReroute: 'Divert West to Old Augusta Rd via Rincon',
    severity: 'critical'
  },
  {
    id: 'HAZ-202',
    corridor: 'US-17 Savannah River Crossing',
    type: 'downed_power_pole',
    location: { lat: 32.148, lng: -81.095 },
    impassableForEV: true,
    clearanceWindowHours: 4,
    waterDepthInches: 4,
    batteryImpactKw: 2.1,
    recommendedReroute: 'Use I-95 Northbound Bridge Corridor',
    severity: 'critical'
  },
  {
    id: 'HAZ-203',
    corridor: 'SC-46 May River Roadway',
    type: 'debris',
    location: { lat: 32.228, lng: -80.871 },
    impassableForEV: false,
    clearanceWindowHours: 2,
    waterDepthInches: 2,
    batteryImpactKw: 0.9,
    recommendedReroute: 'Proceed under optical sensor low-speed caution',
    severity: 'caution'
  },
  {
    id: 'HAZ-204',
    corridor: 'I-95 South at St. Marys River (FL/GA Line)',
    type: 'substation_arc',
    location: { lat: 30.720, lng: -81.648 },
    impassableForEV: false,
    clearanceWindowHours: 3,
    waterDepthInches: 1,
    batteryImpactKw: 1.4,
    recommendedReroute: 'Proceed with optical telematics; right lane open',
    severity: 'moderate'
  }
];

export const DEMO_CREWS: UtilityCrew[] = [
  {
    id: 'CREW-01',
    utility: 'Georgia Power',
    name: 'Savannah Transmission Alpha',
    members: 6,
    currentLocation: { lat: 32.0835, lng: -81.0998 },
    assignedIncidentId: 'INC-101',
    status: 'on_site',
    specialty: 'High Voltage Lines'
  },
  {
    id: 'CREW-02',
    utility: 'Dominion Energy SC',
    name: 'Lowcountry Substation Unit 4',
    members: 4,
    currentLocation: { lat: 32.32, lng: -81.05 },
    assignedIncidentId: 'INC-102',
    status: 'en_route',
    specialty: 'Substation Transformer'
  }
];