import type { NextApiRequest, NextApiResponse } from 'next';
import { DEMO_HAZARDS } from '../../data/demoData';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Allow any browser or external system (like Waymo telematics) to read the data
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  // Format demo hazard data into a clean JSON structure
  const formattedHazards = DEMO_HAZARDS.map((hazard) => ({
    id: hazard.id,
    corridor: hazard.corridor,
    disruptionType: hazard.type,
    waterDepthInches: hazard.waterDepthInches ?? 0,
    blockedForAutonomousVehicles: Boolean(hazard.impassableForEV),
    clearanceEstimateHours: hazard.clearanceWindowHours ?? 2,
    recommendedDetour: hazard.recommendedReroute,
    severity: hazard.severity,
    coordinates: {
      latitude: hazard.location.lat,
      longitude: hazard.location.lng,
    },
  }));

  return res.status(200).json({
    system: 'Storm Intelligence Telematics Bridge',
    protocol: 'FERC-1920-WAYMO-FEED',
    timestamp: new Date().toISOString(),
    totalActiveHazards: formattedHazards.length,
    hazards: formattedHazards,
  });
}