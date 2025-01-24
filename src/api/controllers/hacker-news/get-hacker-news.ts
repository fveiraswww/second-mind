import { z } from 'zod';

const querySchema = z.object({
  q: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => [5, 10, 15, 20].includes(val), {
      message: 'Quantity must be 5, 10, 15, or 20',
    })
    .optional(),
});

export async function getHackerNews(req: Request) {
  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  const url = new URL(req.url);
  const searchParams = Object.fromEntries(url.searchParams.entries());

  const parsedParams = querySchema.safeParse(searchParams);

  if (!parsedParams.success) {
    return new Response(JSON.stringify({ error: parsedParams.error.errors }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { q } = parsedParams.data;

  async function fetchTopStories() {
    try {
      const response = await fetch(
        `${process.env.HACKER_NEWS_URL}/topstories.json`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch top stories IDs');
      }
      const storyIds = await response.json();

      const topPromises = storyIds
        .slice(0, q ?? 5)
        .map((id: string) =>
          fetch(`${process.env.HACKER_NEWS_URL}/item/${id}.json`).then((res) =>
            res.json()
          )
        );

      const topStories = await Promise.all(topPromises);

      return topStories.map((story) => ({
        title: story.title,
        url: story.url,
        score: story.score,
        by: story.by,
      }));
    } catch (error) {
      console.error('Error fetching top stories:', error);
      return [];
    }
  }

  try {
    const stories = await fetchTopStories();

    return new Response(JSON.stringify(stories), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response('Internal server error', { status: 500 });
  }
}
