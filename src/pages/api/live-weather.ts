import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Fetch live active warnings for Georgia and South Carolina from NOAA NWS
    const response = await fetch(
      'https://api.weather.gov/alerts/active?area=GA,SC',
      {
        headers: {
          'User-Agent': '(StormIntelligenceHackathon, contact@stormintel.dev)'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`NOAA API returned status ${response.status}`);
    }

    const data = await response.json();

    // Map NOAA GeoJSON alerts to your dashboard format
    const activeAlerts = (data.features || []).slice(0, 5).map((feature: any) => ({
      id: feature.properties.id,
      event: feature.properties.event,
      headline: feature.properties.headline,
      areaDesc: feature.properties.areaDesc,
      severity: feature.properties.severity,
      urgency: feature.properties.urgency,
      onset: feature.properties.onset,
      expires: feature.properties.expires,
    }));

    return res.status(200).json({
      source: 'NOAA / National Weather Service (api.weather.gov)',
      status: 'LIVE_DATA_STREAM',
      count: activeAlerts.length,
      alerts: activeAlerts
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}