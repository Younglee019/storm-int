import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { text } = req.body;
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    return res.status(200).json({ fallback: true, text });
  }

  try {
    const voiceResponse = await fetch('https://api.elevenlabs.io/v1/text-to-speech/pNInz6obpgDQGcFmaJgB', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_turbo_v2_5',
        voice_settings: { stability: 0.6, similarity_boost: 0.85 }
      })
    });

    if (!voiceResponse.ok) {
      return res.status(200).json({ fallback: true, text });
    }

    const arrayBuffer = await voiceResponse.arrayBuffer();
    res.setHeader('Content-Type', 'audio/mpeg');
    return res.send(Buffer.from(arrayBuffer));
  } catch (error) {
    return res.status(200).json({ fallback: true, text });
  }
}