import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method not allowed',
    });
  }

  const apiKey = process.env.USDA_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: 'USDA API key is not configured',
    });
  }

  const fdcId = String(req.query.fdcId || '').trim();

  if (!fdcId) {
    return res.status(400).json({
      error: 'fdcId is required',
    });
  }

  try {
    const url = new URL(
      `https://api.nal.usda.gov/fdc/v1/food/${encodeURIComponent(fdcId)}`
    );

    url.searchParams.set('api_key', apiKey);

    const response = await fetch(url.toString());

    if (!response.ok) {
      const text = await response.text();

      console.error(
        'USDA food details error:',
        response.status,
        text
      );

      return res.status(response.status).json({
        error: 'USDA food details request failed',
        status: response.status,
        details: text,
      });
    }

    const data = await response.json();

    return res.status(200).json(data);
  } catch (error) {
    console.error('USDA food details request error:', error);

    return res.status(500).json({
      error: 'Failed to retrieve USDA food details',
    });
  }
}