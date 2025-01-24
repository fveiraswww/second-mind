import { discordRoutes } from './routes/discord';
import { emailRoutes } from './routes/email';
import { hackerNewsRoutes } from './routes/hacker-news';

export const routes = {
  ...hackerNewsRoutes,
  ...discordRoutes,
  ...emailRoutes,
};
