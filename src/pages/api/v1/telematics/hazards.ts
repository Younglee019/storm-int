import type { NextApiRequest, NextApiResponse } from 'next';
import { DEMO_HAZARDS } from '../../../../data/demoData';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const geojson = {
    type: 'FeatureCollection',
    metadata: {
      generatedAt: new Date().toISOString(),
      provider: 'Storm Intelligence Autonomous Bridge',
      version: '1.2.0',
      activeHazards: DEMO_HAZARDS.length,
      protocol: 'FERC-1920-WAYMO-TELEMATICS'
    },
    features: DEMO_HAZARDS.map((hazard) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [hazard.location.lng, hazard.location.lat]
      },
      properties: {
        hazardId: hazard.id,
        corridor: hazard.corridor,
        disruptionType: hazard.type,
        impassableForEV: hazard.impassableForEV,
        waterDepthInches: hazard.waterDepthInches ?? 0,
        estimatedClearanceHours: hazard.clearanceWindowHours,
        recommendedDetour: hazard.recommendedReroute,
        severity: hazard.severity
      }
    }))
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  return res.status(200).json(geojson);
}