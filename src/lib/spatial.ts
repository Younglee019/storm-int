import { Coordinates, GridIncident } from '../types';

export function haversineDistanceKm(p1: Coordinates, p2: Coordinates): number {
  const R = 6371; // Earth radius in km
  const dLat = (p2.lat - p1.lat) * (Math.PI / 180);
  const dLng = (p2.lng - p1.lng) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(p1.lat * (Math.PI / 180)) *
      Math.cos(p2.lat * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
}

export interface OverlapSynergy {
  incidentA: GridIncident;
  incidentB: GridIncident;
  distanceKm: number;
  tier: 'Touching / Crossing (0 km)' | 'Tier 1: < 1.6 km (Shared ROW & Land)' | 'Tier 2: < 8 km (Shared Site Logistics)' | 'Tier 3: < 40 km (Shared Equipment & Crews)';
  savingsProjectionUsd: number;
  synergyStrategy: string;
  concurrentMonths: number;
  priorityScore: number;
}

export function calculateTimelineOverlapMonths(startA: string, endA: string, startB: string, endB: string): number {
  const sA = new Date(`${startA}-01`);
  const eA = new Date(`${endA}-01`);
  const sB = new Date(`${startB}-01`);
  const eB = new Date(`${endB}-01`);

  const maxStart = sA > sB ? sA : sB;
  const minEnd = eA < eB ? eA : eB;

  if (maxStart > minEnd) return 0;
  return (minEnd.getFullYear() - maxStart.getFullYear()) * 12 + (minEnd.getMonth() - maxStart.getMonth()) + 1;
}

export function detectCrossBorderSynergies(incidents: GridIncident[]): OverlapSynergy[] {
  const descIncidents = incidents.filter(i => i.utility === 'Dominion Energy SC');
  const gpcIncidents = incidents.filter(i => i.utility === 'Georgia Power');
  const results: OverlapSynergy[] = [];

  for (const d of descIncidents) {
    for (const g of gpcIncidents) {
      const dist = haversineDistanceKm(d.location, g.location);

      // Enforce the 40 km strict cutoff
      if (dist <= 40.0) {
        let tier: OverlapSynergy['tier'] = 'Tier 3: < 40 km (Shared Equipment & Crews)';
        let savings = 220000;
        let strategy = 'Consolidate 300-ton crane staging and share mutual high-voltage line crews.';

        if (dist === 0) {
          tier = 'Touching / Crossing (0 km)';
          savings = 650000;
          strategy = 'Mandatory outage timing synchronization and crossing structural support coordination.';
        } else if (dist <= 1.6) {
          tier = 'Tier 1: < 1.6 km (Shared ROW & Land)';
          savings = 1510000;
          strategy = 'Joint right-of-way (ROW) corridor, shared access roads, and combined environmental permitting.';
        } else if (dist <= 8.0) {
          tier = 'Tier 2: < 8 km (Shared Site Logistics)';
          savings = 480000;
          strategy = 'Consolidated regional laydown yard, material depot, and shared bulk concrete/steel delivery.';
        }

        const months = calculateTimelineOverlapMonths(d.startDate, d.endDate, g.startDate, g.endDate);

        // Priority formula prioritizing spatial closeness first, boosted by concurrent months
        const score = Math.round(((40 - dist) / 40) * 100 + months * 2.5);

        results.push({
          incidentA: d,
          incidentB: g,
          distanceKm: dist,
          tier,
          savingsProjectionUsd: savings,
          synergyStrategy: strategy,
          concurrentMonths: months,
          priorityScore: score
        });
      }
    }
  }

  return results.sort((a, b) => b.priorityScore - a.priorityScore);
}