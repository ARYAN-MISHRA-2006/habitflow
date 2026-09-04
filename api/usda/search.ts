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

    // Get more results so we have enough relevant foods
    // after ranking them.
    url.searchParams.set('pageSize', '30');

    const response = await fetch(url.toString());

    if (!response.ok) {
      const text = await response.text();

      console.error(
        'USDA API error:',
        response.status,
        text
      );

      return res.status(response.status).json({
        error: 'USDA food search failed',
        status: response.status,
        details: text,
      });
    }

    const data = await response.json();

    const foods = Array.isArray(data.foods)
      ? [...data.foods]
      : [];

    const normalizedQuery = query
      .toLowerCase()
      .trim();

    const queryWords = normalizedQuery
      .split(/\s+/)
      .filter(Boolean);

    const getScore = (food: any) => {
      const description = String(
        food.description || ''
      ).toLowerCase();

      const brandName = String(
        food.brandName || ''
      ).trim();

      const dataType = String(
        food.dataType || ''
      ).toLowerCase();

      const isBranded =
        Boolean(brandName) ||
        dataType === 'branded';

      let score = 0;

      /*
       * 1. Prefer non-branded foods.
       */
      if (!isBranded) {
        score += 100;
      } else {
        score -= 100;
      }

      /*
       * 2. Exact description match.
       */
      if (description === normalizedQuery) {
        score += 100;
      }

      /*
       * 3. Description starts with the search.
       */
      if (description.startsWith(normalizedQuery)) {
        score += 50;
      }

      /*
       * 4. Exact phrase appears in description.
       */
      if (description.includes(normalizedQuery)) {
        score += 30;
      }

      /*
       * 5. Reward foods containing all search words.
       *
       * Example:
       * "chicken curry"
       *
       * A food containing both "chicken" and
       * "curry" gets a better score.
       */
      const matchingWords = queryWords.filter((word) =>
        description.includes(word)
      );

      score += matchingWords.length * 20;

      /*
       * 6. Slightly prefer shorter descriptions.
       *
       * This prevents extremely long USDA descriptions
       * from dominating simple searches.
       */
      if (description.length > 0) {
        score += Math.max(
          0,
          20 - Math.floor(description.length / 20)
        );
      }

      return score;
    };

    foods.sort((a: any, b: any) => {
      return getScore(b) - getScore(a);
    });

    return res.status(200).json({
      ...data,
      foods,
    });
  } catch (error) {
    console.error('USDA request error:', error);

    return res.status(500).json({
      error: 'Failed to search USDA FoodData Central',
    });
  }
}