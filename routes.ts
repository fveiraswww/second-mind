import { sendMessage } from './assistants/discord/send-message';
import { getHackerNews } from './assistants/hacker-news/get-hacker-news';
import { postHackerNewsToDiscord } from './assistants/hacker-news/post-to-discord';

export const routes = {
  '/': () => new Response('Hello World'),
  '/api/version.json': () => Response.json({ version: '1.0.0' }),
  '/api/hacker-news': getHackerNews,
  '/api/hacker-news/send-to-discord': postHackerNewsToDiscord,
  '/api/discord/new-message': sendMessage,
} as const;
