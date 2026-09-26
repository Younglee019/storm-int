import type { NextApiRequest, NextApiResponse } from 'next';
import { DEMO_HAZARDS } from '../../data/demoData';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  return res.status(200).json({
    status: 'ACTIVE',
    provider: 'Storm Intelligence Autonomous Bridge',
    total_hazards: DEMO_HAZARDS.length,
    hazards: DEMO_HAZARDS.map((h) => ({
      id: h.id,
      corridor: h.corridor,
      type: h.type,
      waterDepthInches: h.waterDepthInches || 0,
      blockedForAV: h.impassableForEV,
      detour: h.recommendedReroute,
      coordinates: [h.location.lat, h.location.lng]
    }))
  });
}