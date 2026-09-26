import { GridIncident, RoadHazard, UtilityCrew } from '../types';

export const DEMO_INCIDENTS: GridIncident[] = [
  {
    id: 'INC-101',
    utility: 'Georgia Power',
    title: 'Plant McIntosh 500kV Feeder Interconnect',
    type: 'downed_line',
    location: { lat: 32.342, lng: -81.161 },
    address: 'Effingham County, GA (Near Savannah Border)',
    voltageKv: 500,
    customersOut: 14200,
    status: 'active',
    severity: 'critical',
    startDate: '2027-06',
    endDate: '2028-12'
  },
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
  {
    id: 'INC-104',
    utility: 'Dominion Energy SC',
    title: 'Bluffton Parkway Vegetation Flashover',
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
  {
    id: 'INC-105',
    utility: 'Georgia Power',
    title: 'Thomson Primary Substation Line Upgrade',
    type: 'downed_line',
    location: { lat: 33.420, lng: -82.100 },
    address: 'Augusta / Thomson Border, GA',
    voltageKv: 500,
    customersOut: 6400,
    status: 'active',
    severity: 'high',
    startDate: '2026-10',
    endDate: '2028-04'
  },
  {
    id: 'INC-106',
    utility: 'Dominion Energy SC',
    title: 'Urquhart Substation Capacity Expansion',
    type: 'substation_failure',
    location: { lat: 33.480, lng: -81.950 },
    address: 'Aiken County, SC (Opposite Augusta, GA)',
    voltageKv: 230,
    customersOut: 5200,
    status: 'active',
    severity: 'high',
    startDate: '2026-08',
    endDate: '2027-12'
  }
];

export const DEMO_HAZARDS: RoadHazard[] = [
  {
    id: 'HAZ-201',
    corridor: 'GA-21 / Effingham Arterial',
    type: 'flooding',
    location: { lat: 32.338, lng: -81.155 },
    impassableForEV: true,
    clearanceWindowHours: 6,
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
    recommendedReroute: 'Use I-95 Northbound Bridge Corridor',
    severity: 'critical'
  },
  {
    id: 'HAZ-203',
    corridor: 'SC-46 May River Roadway',
    type: 'debris',
    location: { lat: 32.228, lng: -80.875 },
    impassableForEV: false,
    clearanceWindowHours: 2,
    recommendedReroute: 'Proceed under optical sensor low-speed caution',
    severity: 'moderate'
  }
];

export const DEMO_CREWS: UtilityCrew[] = [
  {
    id: 'CREW-01',
    utility: 'Georgia Power',
    name: 'Coastal Heavy Transmission 4',
    equipmentType: '300-Ton Crane',
    currentLocation: { lat: 32.280, lng: -81.140 },
    status: 'available',
    mutualAidEligible: true
  },
  {
    id: 'CREW-02',
    utility: 'Dominion Energy SC',
    name: 'Lowcountry Emergency Line Unit 2',
    equipmentType: 'High-Reach Bucket',
    currentLocation: { lat: 32.330, lng: -81.080 },
    status: 'dispatched',
    mutualAidEligible: true
  }
];