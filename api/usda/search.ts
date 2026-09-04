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

  const query = String(req.query.q || '').trim();

  if (!query) {
    return res.status(400).json({
      error: 'Food search query is required',
    });
  }

  try {
    const url = new URL(
      'https://api.nal.usda.gov/fdc/v1/foods/search'
    );

    url.searchParams.set('api_key', apiKey);
    url.searchParams.set('query', query);
    url.searchParams.set('pageSize', '10');

    const response = await fetch(url.toString());

    if (!response.ok) {
      const text = await response.text();

      console.error('USDA API error:', text);

      return res.status(response.status).json({
        error: 'USDA food search failed',
      });
    }

    const data = await response.json();

    return res.status(200).json(data);
  } catch (error) {
    console.error('USDA request error:', error);

    return res.status(500).json({
      error: 'Failed to search USDA FoodData Central',
    });
  }
}