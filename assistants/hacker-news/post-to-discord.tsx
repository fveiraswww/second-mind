import { sendMessage } from '../discord/send-message';
import { getHackerNews } from './get-hacker-news';
import { z } from 'zod';

const querySchema = z.object({
  q: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => [5, 15, 20].includes(val), {
      message: 'Quantity must be 5, 15, or 20',
    })
    .optional(),
  webhookUrl: z.string(),
});

export async function postHackerNewsToDiscord(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await req.json();
    const parsedParams = querySchema.safeParse(body);

    if (!parsedParams.success) {
      return new Response(
        JSON.stringify({ error: parsedParams.error.errors }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const { q, webhookUrl } = parsedParams.data;

    const hackerNewsResponse = await getHackerNews(
      new Request(`${process.env.URL}/api/hacker-news?q=${q ?? 5}`)
    );
    const hackerNewsData = await hackerNewsResponse.json();

    if (!Array.isArray(hackerNewsData) || hackerNewsData.length === 0) {
      return new Response('No Hacker News data available to send', {
        status: 500,
      });
    }

    const message = hackerNewsData
      .slice(0, q ?? 5)
      .map((story, index) => `${index + 1}. **${story.title}**\n<${story.url}>`) // \n sin caracteres de escape
      .join('\n\n');

    const discordResponse = await sendMessage(
      new Request(`${process.env.URL}/api/discord/new-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          webhookUrl,
          message,
        }),
      })
    );

    if (!discordResponse.ok) {
      const errorText = await discordResponse.text();
      return new Response(
        JSON.stringify({ error: `Failed to send to Discord: ${errorText}` }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        status: 'Hacker News stories sent to Discord successfully',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in postHackerNewsToDiscord:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
