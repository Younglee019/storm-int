import type { NextApiRequest, NextApiResponse } from 'next';
import { generateStormBriefing } from '../../lib/aiService';
import { DEMO_INCIDENTS, DEMO_HAZARDS } from '../../data/demoData';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { prompt } = req.body;
  const briefing = await generateStormBriefing(prompt, {
    incidents: DEMO_INCIDENTS,
    hazards: DEMO_HAZARDS
  });
  return res.status(200).json({ briefing });
}