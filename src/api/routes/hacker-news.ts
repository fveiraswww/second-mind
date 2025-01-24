import { getHackerNews } from '../controllers/hacker-news/get-hacker-news';
import { postHackerNewsToDiscord } from '../controllers/hacker-news/post-to-discord';

export const hackerNewsRoutes = {
  '/api/hacker-news': getHackerNews,
  '/api/hacker-news/send-to-discord': postHackerNewsToDiscord,
};
